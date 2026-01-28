"""National debt endpoints - simplified."""

from fastapi import APIRouter, HTTPException, Query

from app.services.gov_data import get_gov_data_service, DataFetchError

router = APIRouter(prefix="/debt", tags=["debt"])


@router.get("/")
async def get_debt(days: int = Query(default=365, ge=1, le=10000)):
    """
    Get national debt data from Treasury.
    
    Data is cached for 24 hours since historical debt data doesn't change.
    """
    try:
        service = get_gov_data_service()
        return await service.get_national_debt(days=days)
    except DataFetchError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/latest")
async def get_latest_debt():
    """Get the most recent debt figure."""
    try:
        service = get_gov_data_service()
        data = await service.get_national_debt(days=1)
        if data["data"]:
            latest = data["data"][0]
            return {
                "date": latest["date"],
                "total_debt": latest["total_debt"],
                "formatted": f"${latest['total_debt']:,.0f}",
                "source": data["source"]
            }
        raise HTTPException(status_code=404, detail="No debt data available")
    except DataFetchError as e:
        raise HTTPException(status_code=502, detail=str(e))
