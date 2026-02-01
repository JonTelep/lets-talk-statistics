"""
Congress Trading Data Service
Reads from capitol-trades repo data files and serves congressional stock trading data.
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Optional
from collections import defaultdict

from app.config import get_settings
from app.utils.logger import get_logger

settings = get_settings()

logger = get_logger(__name__)

# Path to capitol-trades data file (unified format)
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
    if not tx_type:
        return "Unknown"
    tx_lower = tx_type.lower()
    if "purchase" in tx_lower or "buy" in tx_lower:
        return "Buy"
    elif "sale" in tx_lower or "sell" in tx_lower:
        return "Sell"
    elif "exchange" in tx_lower:
        return "Exchange"
    return tx_type.title()


def _parse_amount_range(amount_text: str) -> tuple[int, int]:
    """Parse amount range like '$1,001 - $15,000' into min/max values"""
    if not amount_text:
        return 0, 0
    try:
        # Remove $ and commas, split by -
        cleaned = amount_text.replace("$", "").replace(",", "")
        if " - " in cleaned:
            parts = cleaned.split(" - ")
            return int(parts[0].strip()), int(parts[1].strip())
        return 0, 0
    except:
        return 0, 0


def _calculate_party_stats(transactions: list) -> dict:
    """Calculate party breakdown statistics"""
    party_stats = {
        "R": {"trades": 0, "volume": 0, "buys": 0, "sells": 0},
        "D": {"trades": 0, "volume": 0, "buys": 0, "sells": 0},
        "I": {"trades": 0, "volume": 0, "buys": 0, "sells": 0},
        "Unknown": {"trades": 0, "volume": 0, "buys": 0, "sells": 0}
    }
    
    for tx in transactions:
        party = tx.get("party") or "Unknown"
        if party not in party_stats:
            party = "Unknown"
        
        party_stats[party]["trades"] += 1
        
        # Calculate volume
        if tx.get("amount_min") and tx.get("amount_max"):
            vol = (tx["amount_min"] + tx["amount_max"]) // 2
        else:
            min_amt, max_amt = _parse_amount_range(tx.get("amount_text", ""))
            vol = (min_amt + max_amt) // 2
        party_stats[party]["volume"] += vol
        
        # Track buys/sells
        tx_type = _normalize_transaction_type(tx.get("transaction_type", ""))
        if tx_type == "Buy":
            party_stats[party]["buys"] += 1
        elif tx_type == "Sell":
            party_stats[party]["sells"] += 1
    
    # Format volumes
    for party in party_stats:
        vol = party_stats[party]["volume"]
        if vol >= 1_000_000_000:
            party_stats[party]["volume_formatted"] = f"${vol / 1_000_000_000:.1f}B"
        elif vol >= 1_000_000:
            party_stats[party]["volume_formatted"] = f"${vol / 1_000_000:.1f}M"
        else:
            party_stats[party]["volume_formatted"] = f"${vol:,}"
    
    return party_stats


def get_congress_stats() -> dict:
    """Get summary statistics for congressional trading"""
    data = _load_transactions()
    metadata = data.get("metadata", {})
    transactions = data.get("transactions", [])
    
    # Calculate volume estimate (midpoint of ranges)
    total_volume = 0
    for tx in transactions:
        # Handle both direct amount_min/max and amount_text
        if tx.get("amount_min") and tx.get("amount_max"):
            total_volume += (tx["amount_min"] + tx["amount_max"]) // 2
        else:
            min_amt, max_amt = _parse_amount_range(tx.get("amount_text", ""))
            total_volume += (min_amt + max_amt) // 2
    
    # Format volume
    if total_volume >= 1_000_000_000:
        volume_str = f"${total_volume / 1_000_000_000:.1f}B"
    elif total_volume >= 1_000_000:
        volume_str = f"${total_volume / 1_000_000:.1f}M"
    else:
        volume_str = f"${total_volume:,}"
    
    # Get by_politician from metadata or calculate
    by_politician = metadata.get("top_traders", {})
    if not by_politician:
        by_politician = metadata.get("by_politician", {})
    
    # Calculate party breakdown
    party_stats = _calculate_party_stats(transactions)
    
    return {
        "total_trades": metadata.get("total_transactions", len(transactions)),
        "total_volume": volume_str,
        "traders_count": metadata.get("unique_politicians", 0),
        "date_range": metadata.get("date_range", {}),
        "last_updated": metadata.get("generated_at", ""),
        "by_type": metadata.get("by_type", {}),
        "by_chamber": metadata.get("by_chamber", {}),
        "by_party": party_stats,
        "by_politician": by_politician
    }


def get_recent_trades(limit: int = 10) -> list[dict]:
    """Get most recent trades"""
    data = _load_transactions()
    transactions = data.get("transactions", [])
    
    recent = []
    for tx in transactions[:limit]:
        # Handle unified flat format
        recent.append({
            "politician": tx.get("politician_name", "Unknown"),
            "party": tx.get("party", ""),
            "chamber": tx.get("chamber", "").title() if tx.get("chamber") else "Unknown",
            "state": tx.get("state", ""),
            "ticker": tx.get("ticker", "N/A") or "N/A",
            "asset_name": tx.get("asset_name", ""),
            "type": _normalize_transaction_type(tx.get("transaction_type", "")),
            "amount": tx.get("amount_text", ""),
            "date": tx.get("transaction_date", ""),
            "disclosure_date": tx.get("disclosure_date", ""),
            "filing_url": tx.get("filing_url", "")
        })
    
    return recent


def get_top_traders(
    limit: int = 10,
    party: Optional[str] = None,
    chamber: Optional[str] = None
) -> list[dict]:
    """Get politicians with most trades, optionally filtered by party/chamber"""
    data = _load_transactions()
    transactions = data.get("transactions", [])
    
    # Filter transactions if needed
    filtered = transactions
    if party:
        party_upper = party.upper()
        filtered = [tx for tx in filtered if (tx.get("party") or "").upper() == party_upper]
    if chamber:
        chamber_lower = chamber.lower()
        filtered = [tx for tx in filtered if tx.get("chamber", "").lower() == chamber_lower]
    
    # Calculate from filtered transactions
    trader_data = defaultdict(lambda: {"count": 0, "chamber": "", "party": "", "state": "", "buys": 0, "sells": 0, "volume": 0})
    
    for tx in filtered:
        name = tx.get("politician_name", "Unknown")
        trader_data[name]["count"] += 1
        
        if not trader_data[name]["chamber"]:
            trader_data[name]["chamber"] = tx.get("chamber", "").title()
        if not trader_data[name]["party"]:
            trader_data[name]["party"] = tx.get("party", "")
        if not trader_data[name]["state"]:
            trader_data[name]["state"] = tx.get("state", "")
        
        # Track buys/sells
        tx_type = _normalize_transaction_type(tx.get("transaction_type", ""))
        if tx_type == "Buy":
            trader_data[name]["buys"] += 1
        elif tx_type == "Sell":
            trader_data[name]["sells"] += 1
        
        # Track volume
        if tx.get("amount_min") and tx.get("amount_max"):
            trader_data[name]["volume"] += (tx["amount_min"] + tx["amount_max"]) // 2
        else:
            min_amt, max_amt = _parse_amount_range(tx.get("amount_text", ""))
            trader_data[name]["volume"] += (min_amt + max_amt) // 2
    
    sorted_traders = sorted(trader_data.items(), key=lambda x: x[1]["count"], reverse=True)
    return [
        {
            "name": name,
            "trades": data["count"],
            "chamber": data["chamber"],
            "party": data["party"],
            "state": data["state"],
            "buys": data["buys"],
            "sells": data["sells"],
            "volume": data["volume"]
        }
        for name, data in sorted_traders[:limit]
    ]


def get_trades_by_ticker(ticker: str) -> list[dict]:
    """Get all trades for a specific stock ticker"""
    data = _load_transactions()
    transactions = data.get("transactions", [])
    
    results = []
    for tx in transactions:
        if tx.get("ticker", "").upper() == ticker.upper():
            results.append({
                "politician": tx.get("politician_name", "Unknown"),
                "chamber": tx.get("chamber", "").title() if tx.get("chamber") else "",
                "state": tx.get("state", ""),
                "type": _normalize_transaction_type(tx.get("transaction_type", "")),
                "amount": tx.get("amount_text", ""),
                "date": tx.get("transaction_date", ""),
                "disclosure_date": tx.get("disclosure_date", "")
            })
    
    return results


def get_all_transactions(
    limit: int = 100,
    offset: int = 0,
    politician: Optional[str] = None,
    ticker: Optional[str] = None,
    tx_type: Optional[str] = None,
    chamber: Optional[str] = None,
    party: Optional[str] = None
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
            if politician_lower in tx.get("politician_name", "").lower()
        ]
    
    if ticker:
        ticker_upper = ticker.upper()
        filtered = [
            tx for tx in filtered
            if tx.get("ticker", "").upper() == ticker_upper
        ]
    
    if tx_type:
        tx_type_normalized = _normalize_transaction_type(tx_type)
        filtered = [
            tx for tx in filtered
            if _normalize_transaction_type(tx.get("transaction_type", "")) == tx_type_normalized
        ]
    
    if chamber:
        chamber_lower = chamber.lower()
        filtered = [
            tx for tx in filtered
            if tx.get("chamber", "").lower() == chamber_lower
        ]
    
    if party:
        party_upper = party.upper()
        filtered = [
            tx for tx in filtered
            if (tx.get("party") or "").upper() == party_upper
        ]
    
    # Get page
    total = len(filtered)
    page = filtered[offset:offset + limit]
    
    # Transform for response
    results = []
    for tx in page:
        results.append({
            "politician": tx.get("politician_name", "Unknown"),
            "chamber": tx.get("chamber", "").title() if tx.get("chamber") else "",
            "state": tx.get("state", ""),
            "party": tx.get("party", ""),
            "ticker": tx.get("ticker", "N/A") or "N/A",
            "asset_name": tx.get("asset_name", ""),
            "type": _normalize_transaction_type(tx.get("transaction_type", "")),
            "amount": tx.get("amount_text", ""),
            "date": tx.get("transaction_date", ""),
            "disclosure_date": tx.get("disclosure_date", ""),
            "filing_url": tx.get("filing_url", "")
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
        ticker = tx.get("ticker", "")
        if ticker and ticker != "N/A":
            ticker_counts[ticker]["count"] += 1
            if not ticker_counts[ticker]["name"]:
                ticker_counts[ticker]["name"] = tx.get("asset_name", "")
    
    sorted_tickers = sorted(ticker_counts.items(), key=lambda x: x[1]["count"], reverse=True)
    
    return [
        {"ticker": ticker, "name": data["name"], "trades": data["count"]}
        for ticker, data in sorted_tickers[:limit]
    ]
