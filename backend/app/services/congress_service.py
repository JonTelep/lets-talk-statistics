"""
Congress Trading Data Service
Reads from capitol-trades repo data files and serves congressional stock trading data.
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Optional
from collections import defaultdict

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Path to capitol-trades data file
CAPITOL_TRADES_DATA = Path("/root/Projects/capitol-trades/data/all_transactions.json")


def _load_transactions() -> dict:
    """Load transactions from capitol-trades data file"""
    if not CAPITOL_TRADES_DATA.exists():
        logger.warning(f"Capitol trades data not found at {CAPITOL_TRADES_DATA}")
        return {"metadata": {}, "transactions": []}
    
    try:
        with open(CAPITOL_TRADES_DATA) as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading capitol trades data: {e}")
        return {"metadata": {}, "transactions": []}


def _normalize_transaction_type(tx_type: str) -> str:
    """Normalize transaction type to Buy/Sell"""
    tx_lower = tx_type.lower()
    if "purchase" in tx_lower or "buy" in tx_lower:
        return "Buy"
    elif "sale" in tx_lower or "sell" in tx_lower:
        return "Sell"
    elif "exchange" in tx_lower:
        return "Exchange"
    return tx_type


def _parse_amount_range(amount_text: str) -> tuple[int, int]:
    """Parse amount range like '$1,001 - $15,000' into min/max values"""
    try:
        # Remove $ and commas, split by -
        cleaned = amount_text.replace("$", "").replace(",", "")
        if " - " in cleaned:
            parts = cleaned.split(" - ")
            return int(parts[0].strip()), int(parts[1].strip())
        return 0, 0
    except:
        return 0, 0


def get_congress_stats() -> dict:
    """Get summary statistics for congressional trading"""
    data = _load_transactions()
    metadata = data.get("metadata", {})
    transactions = data.get("transactions", [])
    
    # Calculate volume estimate (midpoint of ranges)
    total_volume = 0
    for tx in transactions:
        amount_text = tx.get("transaction", {}).get("amount_text", "")
        min_amt, max_amt = _parse_amount_range(amount_text)
        total_volume += (min_amt + max_amt) // 2
    
    # Format volume
    if total_volume >= 1_000_000_000:
        volume_str = f"${total_volume / 1_000_000_000:.1f}B"
    elif total_volume >= 1_000_000:
        volume_str = f"${total_volume / 1_000_000:.1f}M"
    else:
        volume_str = f"${total_volume:,}"
    
    return {
        "total_trades": metadata.get("total_transactions", len(transactions)),
        "total_volume": volume_str,
        "traders_count": metadata.get("unique_politicians", 0),
        "date_range": metadata.get("date_range", {}),
        "last_updated": metadata.get("generated_at", ""),
        "by_type": metadata.get("by_type", {}),
        "by_politician": metadata.get("by_politician", {})
    }


def get_recent_trades(limit: int = 10) -> list[dict]:
    """Get most recent trades"""
    data = _load_transactions()
    transactions = data.get("transactions", [])
    
    recent = []
    for tx in transactions[:limit]:
        politician = tx.get("politician", {})
        transaction = tx.get("transaction", {})
        
        # Format name
        first_name = politician.get("first_name", "")
        last_name = politician.get("last_name", "")
        full_name = f"{first_name} {last_name}".strip()
        
        recent.append({
            "politician": full_name,
            "party": "",  # Not in current data, would need to add
            "chamber": politician.get("chamber", "Senate"),
            "ticker": transaction.get("ticker", "N/A"),
            "asset_name": transaction.get("asset_name", ""),
            "type": _normalize_transaction_type(transaction.get("type", "")),
            "amount": transaction.get("amount_text", ""),
            "date": transaction.get("date", ""),
            "disclosure_date": transaction.get("disclosure_date", ""),
            "filing_url": tx.get("filing", {}).get("url", "")
        })
    
    return recent


def get_top_traders(limit: int = 10) -> list[dict]:
    """Get politicians with most trades"""
    data = _load_transactions()
    metadata = data.get("metadata", {})
    by_politician = metadata.get("by_politician", {})
    
    # Sort by trade count
    sorted_traders = sorted(by_politician.items(), key=lambda x: x[1], reverse=True)
    
    return [
        {"name": name, "trades": count, "chamber": "Senate"}
        for name, count in sorted_traders[:limit]
    ]


def get_trades_by_ticker(ticker: str) -> list[dict]:
    """Get all trades for a specific stock ticker"""
    data = _load_transactions()
    transactions = data.get("transactions", [])
    
    results = []
    for tx in transactions:
        if tx.get("transaction", {}).get("ticker", "").upper() == ticker.upper():
            politician = tx.get("politician", {})
            transaction = tx.get("transaction", {})
            
            first_name = politician.get("first_name", "")
            last_name = politician.get("last_name", "")
            
            results.append({
                "politician": f"{first_name} {last_name}".strip(),
                "chamber": politician.get("chamber", ""),
                "type": _normalize_transaction_type(transaction.get("type", "")),
                "amount": transaction.get("amount_text", ""),
                "date": transaction.get("date", ""),
                "disclosure_date": transaction.get("disclosure_date", "")
            })
    
    return results


def get_all_transactions(
    limit: int = 100,
    offset: int = 0,
    politician: Optional[str] = None,
    ticker: Optional[str] = None,
    tx_type: Optional[str] = None
) -> dict:
    """Get paginated transactions with optional filters"""
    data = _load_transactions()
    transactions = data.get("transactions", [])
    
    # Apply filters
    filtered = transactions
    
    if politician:
        politician_lower = politician.lower()
        filtered = [
            tx for tx in filtered
            if politician_lower in f"{tx.get('politician', {}).get('first_name', '')} {tx.get('politician', {}).get('last_name', '')}".lower()
        ]
    
    if ticker:
        ticker_upper = ticker.upper()
        filtered = [
            tx for tx in filtered
            if tx.get("transaction", {}).get("ticker", "").upper() == ticker_upper
        ]
    
    if tx_type:
        tx_type_normalized = _normalize_transaction_type(tx_type)
        filtered = [
            tx for tx in filtered
            if _normalize_transaction_type(tx.get("transaction", {}).get("type", "")) == tx_type_normalized
        ]
    
    # Get page
    total = len(filtered)
    page = filtered[offset:offset + limit]
    
    # Transform for response
    results = []
    for tx in page:
        politician_data = tx.get("politician", {})
        transaction = tx.get("transaction", {})
        
        first_name = politician_data.get("first_name", "")
        last_name = politician_data.get("last_name", "")
        
        results.append({
            "politician": f"{first_name} {last_name}".strip(),
            "chamber": politician_data.get("chamber", ""),
            "ticker": transaction.get("ticker", "N/A"),
            "asset_name": transaction.get("asset_name", ""),
            "type": _normalize_transaction_type(transaction.get("type", "")),
            "amount": transaction.get("amount_text", ""),
            "date": transaction.get("date", ""),
            "disclosure_date": transaction.get("disclosure_date", ""),
            "filing_url": tx.get("filing", {}).get("url", "")
        })
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "transactions": results
    }


def get_popular_tickers(limit: int = 10) -> list[dict]:
    """Get most traded stock tickers"""
    data = _load_transactions()
    transactions = data.get("transactions", [])
    
    ticker_counts = defaultdict(lambda: {"count": 0, "name": ""})
    
    for tx in transactions:
        transaction = tx.get("transaction", {})
        ticker = transaction.get("ticker", "")
        if ticker and ticker != "N/A":
            ticker_counts[ticker]["count"] += 1
            if not ticker_counts[ticker]["name"]:
                ticker_counts[ticker]["name"] = transaction.get("asset_name", "")
    
    sorted_tickers = sorted(ticker_counts.items(), key=lambda x: x[1]["count"], reverse=True)
    
    return [
        {"ticker": ticker, "name": data["name"], "trades": data["count"]}
        for ticker, data in sorted_tickers[:limit]
    ]
