"""Employment/unemployment endpoints - simplified."""

from fastapi import APIRouter, HTTPException, Query

from app.services.gov_data import get_gov_data_service, DataFetchError

router = APIRouter(prefix="/employment", tags=["employment"])


@router.get("/unemployment")
async def get_unemployment(years: int = Query(default=5, ge=1, le=20)):
    """
    Get unemployment rate data from Bureau of Labor Statistics.
    
    Data is cached for 24 hours. BLS updates monthly.
    """
    try:
        service = get_gov_data_service()
        return await service.get_unemployment_rate(years=years)
    except DataFetchError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/unemployment/latest")
async def get_latest_unemployment():
    """Get the most recent unemployment rate."""
    try:
        service = get_gov_data_service()
        data = await service.get_unemployment_rate(years=1)
        if data["data"]:
            # Data comes in reverse chronological order
            latest = data["data"][0]
            return {
                "year": latest["year"],
                "month": latest["month"],
                "rate": latest["rate"],
                "formatted": f"{latest['rate']}%",
                "source": data["source"]
            }
        raise HTTPException(status_code=404, detail="No unemployment data available")
    except DataFetchError as e:
        raise HTTPException(status_code=502, detail=str(e))
