"""
Housing Statistics API Endpoints

Provides access to FRED housing time-series data stored in Postgres.
Covers homeownership, vacancy, construction, prices, sales, and mortgages.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.housing.housing_service import get_housing_service
from app.services.housing.sync_service import HousingSyncService
from app.db.pool import get_pool
from app.utils.logger import get_logger

router = APIRouter(prefix="/housing", tags=["housing"])
logger = get_logger(__name__)

_DB_UNAVAILABLE = "Housing database is not available. Run sync_housing.py first."


def _check_pool():
    """Raise 503 early if the DB pool isn't initialised."""
    try:
        get_pool()
    except RuntimeError:
        raise HTTPException(status_code=503, detail=_DB_UNAVAILABLE)


@router.get("/categories")
async def list_categories():
    """List all housing data categories with series counts."""
    _check_pool()
    service = get_housing_service()
    try:
        return {
            "source": "FRED (Federal Reserve Economic Data)",
            "categories": await service.get_categories(),
        }
    except Exception as e:
        logger.error("categories error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/series")
async def list_series(
    category: Optional[str] = Query(None, description="Filter by category key"),
):
    """List available series, optionally filtered by category."""
    _check_pool()
    service = get_housing_service()
    try:
        series = await service.get_series_list(category=category)
        return {
            "source": "FRED (Federal Reserve Economic Data)",
            "count": len(series),
            "series": series,
        }
    except Exception as e:
        logger.error("series list error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/observations/{series_id}")
async def get_observations(
    series_id: str,
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
):
    """Get time-series observations for a single series."""
    _check_pool()
    service = get_housing_service()
    try:
        data = await service.get_observations(series_id, start_date=start_date, end_date=end_date)
        if not data["observations"]:
            raise HTTPException(status_code=404, detail=f"No data found for series {series_id}")
        return {
            "source": "FRED (Federal Reserve Economic Data)",
            **data,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("observations error for %s: %s", series_id, e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/compare")
async def compare_series(
    series_ids: str = Query(..., description="Comma-separated series IDs"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
):
    """Compare multiple series on the same time axis."""
    ids = [s.strip() for s in series_ids.split(",") if s.strip()]
    if not ids:
        raise HTTPException(status_code=400, detail="At least one series_id is required")
    if len(ids) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 series per comparison")

    _check_pool()
    service = get_housing_service()
    try:
        series = await service.get_compare(ids, start_date=start_date, end_date=end_date)
        return {
            "source": "FRED (Federal Reserve Economic Data)",
            "series": series,
        }
    except Exception as e:
        logger.error("compare error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard")
async def get_dashboard():
    """Get latest values for headline housing indicators."""
    _check_pool()
    service = get_housing_service()
    try:
        items = await service.get_dashboard()
        return {
            "source": "FRED (Federal Reserve Economic Data)",
            "indicators": items,
        }
    except Exception as e:
        logger.error("dashboard error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sync/status")
async def get_sync_status():
    """Get the status of the most recent data sync."""
    _check_pool()
    service = get_housing_service()
    try:
        status = await service.get_sync_status()
        if status is None:
            return {"status": "no_sync_runs", "message": "No sync has been run yet"}
        return status
    except Exception as e:
        logger.error("sync status error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync/trigger")
async def trigger_sync(
    full_backfill: bool = Query(False, description="Full history reload"),
):
    """Manually trigger a data sync (admin)."""
    _check_pool()
    try:
        pool = get_pool()
        sync_svc = HousingSyncService(pool)
        summary = await sync_svc.sync_all(full_backfill=full_backfill)
        await sync_svc.close()
        return summary
    except HTTPException:
        raise
    except Exception as e:
        logger.error("sync trigger error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
