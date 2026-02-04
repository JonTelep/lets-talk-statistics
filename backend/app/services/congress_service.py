"""
Congress Trading Data Service

Fetches congressional stock trading data from the Capitol Trades API.
API: https://trades.telep.io
"""

import os
import httpx
from typing import Optional
from collections import defaultdict

from app.utils.logger import get_logger

logger = get_logger(__name__)

# Capitol Trades API base URL
CAPITOL_TRADES_API = os.getenv("CAPITOL_TRADES_API", "https://trades.telep.io")


async def _fetch_trades(endpoint: str, params: dict = None) -> dict:
    """Fetch data from Capitol Trades API"""
    url = f"{CAPITOL_TRADES_API}/api{endpoint}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
    except httpx.RequestError as e:
        logger.error(f"Error fetching from Capitol Trades API: {e}")
        return {}
    except httpx.HTTPStatusError as e:
        logger.error(f"Capitol Trades API error: {e.response.status_code}")
        return {}


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
        
        min_amt, max_amt = _parse_amount_range(tx.get("amount_text", ""))
        vol = (min_amt + max_amt) // 2
        party_stats[party]["volume"] += vol
        
        tx_type = _normalize_transaction_type(tx.get("transaction_type", ""))
        if tx_type == "Buy":
            party_stats[party]["buys"] += 1
        elif tx_type == "Sell":
            party_stats[party]["sells"] += 1
    
    for party in party_stats:
        vol = party_stats[party]["volume"]
        if vol >= 1_000_000_000:
            party_stats[party]["volume_formatted"] = f"${vol / 1_000_000_000:.1f}B"
        elif vol >= 1_000_000:
            party_stats[party]["volume_formatted"] = f"${vol / 1_000_000:.1f}M"
        else:
            party_stats[party]["volume_formatted"] = f"${vol:,}"
    
    return party_stats


async def get_congress_stats() -> dict:
    """Get summary statistics for congressional trading"""
    # Fetch a large batch to calculate stats
    data = await _fetch_trades("/trades", {"per_page": 500})
    transactions = data.get("trades", [])
    total = data.get("total", 0)
    
    # Fetch politicians count
    politicians_data = await _fetch_trades("/politicians", {"per_page": 1})
    politicians_count = politicians_data.get("total", 0)
    
    # Calculate volume estimate
    total_volume = 0
    for tx in transactions:
        min_amt, max_amt = _parse_amount_range(tx.get("amount_text", ""))
        total_volume += (min_amt + max_amt) // 2
    
    # Extrapolate volume based on sample
    if len(transactions) > 0:
        avg_volume = total_volume / len(transactions)
        estimated_total_volume = int(avg_volume * total)
    else:
        estimated_total_volume = 0
    
    if estimated_total_volume >= 1_000_000_000:
        volume_str = f"${estimated_total_volume / 1_000_000_000:.1f}B"
    elif estimated_total_volume >= 1_000_000:
        volume_str = f"${estimated_total_volume / 1_000_000:.1f}M"
    else:
        volume_str = f"${estimated_total_volume:,}"
    
    party_stats = _calculate_party_stats(transactions)
    
    return {
        "total_trades": total,
        "total_volume": volume_str,
        "traders_count": politicians_count,
        "date_range": {},
        "last_updated": "",
        "by_type": {},
        "by_chamber": {},
        "by_party": party_stats,
        "by_politician": {}
    }


async def get_recent_trades(limit: int = 10) -> list[dict]:
    """Get most recent trades"""
    data = await _fetch_trades("/trades", {"per_page": limit, "sort_by": "transaction_date", "sort_order": "desc"})
    transactions = data.get("trades", [])
    
    recent = []
    for tx in transactions:
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


async def get_top_traders(
    limit: int = 10,
    party: Optional[str] = None,
    chamber: Optional[str] = None
) -> list[dict]:
    """Get politicians with most trades"""
    params = {"per_page": limit, "sort_by": "trade_count", "sort_order": "desc"}
    if party:
        params["party"] = party.upper()
    if chamber:
        params["chamber"] = chamber.lower()
    
    data = await _fetch_trades("/politicians", params)
    politicians = data.get("politicians", [])
    
    return [
        {
            "name": p.get("name", "Unknown"),
            "trades": p.get("trade_count", 0),
            "chamber": p.get("chamber", "").title() if p.get("chamber") else "",
            "party": p.get("party", ""),
            "state": p.get("state", ""),
            "buys": 0,
            "sells": 0,
            "volume": 0
        }
        for p in politicians
    ]


async def get_trades_by_ticker(ticker: str) -> list[dict]:
    """Get all trades for a specific stock ticker"""
    data = await _fetch_trades("/trades", {"ticker": ticker.upper(), "per_page": 200})
    transactions = data.get("trades", [])
    
    results = []
    for tx in transactions:
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


async def get_all_transactions(
    limit: int = 100,
    offset: int = 0,
    politician: Optional[str] = None,
    ticker: Optional[str] = None,
    tx_type: Optional[str] = None,
    chamber: Optional[str] = None,
    party: Optional[str] = None
) -> dict:
    """Get paginated transactions with optional filters"""
    page = (offset // limit) + 1
    
    params = {"per_page": limit, "page": page}
    if politician:
        params["politician"] = politician
    if ticker:
        params["ticker"] = ticker.upper()
    if chamber:
        params["chamber"] = chamber.lower()
    if party:
        params["party"] = party.upper()
    if tx_type:
        params["transaction_type"] = tx_type.lower()
    
    data = await _fetch_trades("/trades", params)
    transactions = data.get("trades", [])
    total = data.get("total", 0)
    
    results = []
    for tx in transactions:
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


async def get_popular_tickers(limit: int = 10) -> list[dict]:
    """Get most traded stock tickers"""
    data = await _fetch_trades("/trades/tickers")
    tickers = data.get("tickers", [])[:limit]
    
    # Need to get trade counts per ticker
    results = []
    for ticker in tickers:
        ticker_data = await _fetch_trades("/trades", {"ticker": ticker, "per_page": 1})
        results.append({
            "ticker": ticker,
            "name": "",
            "trades": ticker_data.get("total", 0)
        })
    
    return sorted(results, key=lambda x: x["trades"], reverse=True)
