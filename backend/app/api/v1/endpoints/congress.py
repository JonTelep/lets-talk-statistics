"""
Congress Trading Data API Endpoints

Serves congressional stock trading data from the capitol-trades project.
Data is sourced from official STOCK Act disclosures.
"""

from typing import Optional
from fastapi import APIRouter, Query

from app.services import congress_service

router = APIRouter(prefix="/congress", tags=["congress"])


@router.get("/stats")
async def get_stats():
    """
    Get summary statistics for congressional trading.
    
    Returns total trades, volume, unique traders, and date range.
    """
    return congress_service.get_congress_stats()


@router.get("/trades/recent")
async def get_recent_trades(
    limit: int = Query(default=10, ge=1, le=50, description="Number of trades to return")
):
    """
    Get most recent congressional stock trades.
    
    Returns trades sorted by disclosure date (newest first).
    """
    return congress_service.get_recent_trades(limit=limit)


@router.get("/trades")
async def get_all_trades(
    limit: int = Query(default=50, ge=1, le=200, description="Number of trades per page"),
    offset: int = Query(default=0, ge=0, description="Offset for pagination"),
    politician: Optional[str] = Query(default=None, description="Filter by politician name"),
    ticker: Optional[str] = Query(default=None, description="Filter by stock ticker"),
    type: Optional[str] = Query(default=None, description="Filter by transaction type (Buy/Sell)"),
    chamber: Optional[str] = Query(default=None, description="Filter by chamber (house/senate)"),
    party: Optional[str] = Query(default=None, description="Filter by party (R/D/I)")
):
    """
    Get all congressional trades with optional filters and pagination.
    
    Supports filtering by politician name, stock ticker, transaction type, chamber, and party.
    """
    return congress_service.get_all_transactions(
        limit=limit,
        offset=offset,
        politician=politician,
        ticker=ticker,
        tx_type=type,
        chamber=chamber,
        party=party
    )


@router.get("/traders")
async def get_top_traders(
    limit: int = Query(default=10, ge=1, le=50, description="Number of traders to return"),
    party: Optional[str] = Query(default=None, description="Filter by party (R/D/I)"),
    chamber: Optional[str] = Query(default=None, description="Filter by chamber (house/senate)")
):
    """
    Get politicians ranked by number of trades.
    
    Returns the most active congressional stock traders.
    Optionally filter by party (R/D/I) or chamber (house/senate).
    """
    return congress_service.get_top_traders(limit=limit, party=party, chamber=chamber)


@router.get("/tickers")
async def get_popular_tickers(
    limit: int = Query(default=10, ge=1, le=50, description="Number of tickers to return")
):
    """
    Get most traded stock tickers by Congress members.
    
    Returns tickers ranked by number of transactions.
    """
    return congress_service.get_popular_tickers(limit=limit)


@router.get("/tickers/{ticker}")
async def get_trades_by_ticker(ticker: str):
    """
    Get all congressional trades for a specific stock ticker.
    
    Returns all Buy and Sell transactions for the given ticker symbol.
    """
    return congress_service.get_trades_by_ticker(ticker)
