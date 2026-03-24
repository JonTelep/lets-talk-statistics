"""
Data export endpoints for Let's Talk Statistics.

Allows downloading government data in CSV or JSON format.
Useful for researchers, journalists, and data analysts.
"""

import csv
import io
import json
from datetime import datetime
from typing import Optional, Literal

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse

from app.services.gov_data import get_gov_data_service, DataFetchError
from app.services import congress_service

router = APIRouter(prefix="/export", tags=["export"])


def _json_response(data: dict, filename: str) -> StreamingResponse:
    """Return JSON data as a downloadable file."""
    content = json.dumps(data, indent=2, default=str)
    return StreamingResponse(
        io.BytesIO(content.encode()),
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


def _csv_response(rows: list[dict], filename: str) -> StreamingResponse:
    """Return CSV data as a downloadable file."""
    if not rows:
        raise HTTPException(status_code=404, detail="No data available for export")

    # Flatten nested dicts in rows
    flat_rows = []
    for row in rows:
        flat = {}
        for k, v in row.items():
            if isinstance(v, dict):
                for sub_k, sub_v in v.items():
                    flat[f"{k}_{sub_k}"] = sub_v
            else:
                flat[k] = v
        flat_rows.append(flat)

    # Collect all fieldnames across all rows
    fieldnames = []
    seen = set()
    for row in flat_rows:
        for k in row:
            if k not in seen:
                fieldnames.append(k)
                seen.add(k)

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(flat_rows)

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


@router.get("/formats")
async def list_export_formats():
    """List available data exports and their formats."""
    return {
        "description": "Download government data in CSV or JSON format",
        "attribution": "Data sourced from official U.S. government agencies. See letstalkstatistics.com/about for full methodology.",
        "datasets": {
            "debt": {
                "description": "National debt history from U.S. Treasury",
                "url": "/api/v1/export/debt",
                "params": {"days": "Number of days of history (default: 365)", "format": "csv or json"},
            },
            "employment": {
                "description": "Unemployment rates from Bureau of Labor Statistics",
                "url": "/api/v1/export/employment",
                "params": {"years": "Years of history (default: 10)", "format": "csv or json"},
            },
            "budget": {
                "description": "Federal budget data from U.S. Treasury",
                "url": "/api/v1/export/budget",
                "params": {"format": "csv or json"},
            },
            "congress": {
                "description": "Congressional stock trading data (STOCK Act)",
                "url": "/api/v1/export/congress",
                "params": {"limit": "Max trades (default: 500)", "politician": "Filter by name", "ticker": "Filter by symbol", "format": "csv or json"},
            },
        },
    }


@router.get("/debt")
async def export_debt(
    days: int = Query(365, ge=1, le=3650, description="Days of debt history"),
    format: Literal["csv", "json"] = Query("csv", description="Export format"),
):
    """Export national debt data from U.S. Treasury."""
    try:
        service = get_gov_data_service()
        result = await service.get_national_debt(days=days)
    except DataFetchError as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch debt data: {e}")

    data = result.get("data", []) if isinstance(result, dict) else result
    if not data:
        raise HTTPException(status_code=404, detail="No debt data available")

    timestamp = datetime.utcnow().strftime("%Y%m%d")
    filename = f"national_debt_{timestamp}.{format}"

    if format == "json":
        return _json_response(
            {
                "dataset": "national_debt",
                "source": "U.S. Treasury Fiscal Data API",
                "exported_at": datetime.utcnow().isoformat(),
                "records": len(data),
                "data": data,
            },
            filename,
        )

    rows = data if isinstance(data, list) else [data]
    return _csv_response(rows, filename)


@router.get("/employment")
async def export_employment(
    years: int = Query(10, ge=1, le=30, description="Years of employment history"),
    format: Literal["csv", "json"] = Query("csv", description="Export format"),
):
    """Export unemployment rate data from BLS."""
    try:
        service = get_gov_data_service()
        result = await service.get_unemployment_rate(years=years)
    except DataFetchError as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch employment data: {e}")

    data = result.get("data", []) if isinstance(result, dict) else result
    if not data:
        raise HTTPException(status_code=404, detail="No employment data available")

    timestamp = datetime.utcnow().strftime("%Y%m%d")
    filename = f"unemployment_rates_{timestamp}.{format}"

    if format == "json":
        return _json_response(
            {
                "dataset": "unemployment_rates",
                "source": "Bureau of Labor Statistics",
                "exported_at": datetime.utcnow().isoformat(),
                "records": len(data) if isinstance(data, list) else 1,
                "data": data,
            },
            filename,
        )

    rows = data if isinstance(data, list) else [data]
    return _csv_response(rows, filename)


@router.get("/budget")
async def export_budget(
    fiscal_year: Optional[int] = Query(None, description="Fiscal year (default: current)"),
    format: Literal["csv", "json"] = Query("csv", description="Export format"),
):
    """Export federal budget data from U.S. Treasury."""
    try:
        service = get_gov_data_service()
        result = await service.get_budget_data(fiscal_year=fiscal_year)
    except DataFetchError as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch budget data: {e}")

    if not result:
        raise HTTPException(status_code=404, detail="No budget data available")

    timestamp = datetime.utcnow().strftime("%Y%m%d")
    year_str = fiscal_year or "current"
    filename = f"federal_budget_{year_str}_{timestamp}.{format}"

    if format == "json":
        return _json_response(
            {
                "dataset": "federal_budget",
                "source": "U.S. Treasury Fiscal Data",
                "fiscal_year": fiscal_year,
                "exported_at": datetime.utcnow().isoformat(),
                "data": result,
            },
            filename,
        )

    # Flatten budget data
    if isinstance(result, dict):
        categories = result.get("categories", result.get("data", []))
        rows = categories if isinstance(categories, list) else [result]
    else:
        rows = result if isinstance(result, list) else [result]
    return _csv_response(rows, filename)


@router.get("/congress")
async def export_congress(
    limit: int = Query(500, ge=1, le=5000, description="Maximum trades to export"),
    politician: Optional[str] = Query(None, description="Filter by politician name"),
    ticker: Optional[str] = Query(None, description="Filter by ticker symbol"),
    format: Literal["csv", "json"] = Query("csv", description="Export format"),
):
    """Export congressional stock trading data (STOCK Act disclosures)."""
    try:
        result = await congress_service.get_all_transactions(
            limit=limit,
            offset=0,
            politician=politician,
            ticker=ticker,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch congressional trades: {e}")

    trades = result.get("data", []) if isinstance(result, dict) else result
    if not trades:
        raise HTTPException(status_code=404, detail="No congressional trade data available")

    timestamp = datetime.utcnow().strftime("%Y%m%d")
    filename = f"congressional_trades_{timestamp}.{format}"

    if format == "json":
        return _json_response(
            {
                "dataset": "congressional_stock_trades",
                "source": "STOCK Act Disclosures via Capitol Trades",
                "exported_at": datetime.utcnow().isoformat(),
                "filters": {"politician": politician, "ticker": ticker},
                "records": len(trades) if isinstance(trades, list) else 1,
                "data": trades,
            },
            filename,
        )

    rows = trades if isinstance(trades, list) else [trades]
    return _csv_response(rows, filename)
