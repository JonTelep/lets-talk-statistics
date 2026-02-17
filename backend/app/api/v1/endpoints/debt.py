"""National debt endpoints - simplified."""

from fastapi import APIRouter, HTTPException, Query

from app.services.gov_data import get_gov_data_service, DataFetchError
from app.services.base import ServiceError
from app.services.debt_deep_dive_service import get_debt_deep_dive_service

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


# =========================================================================
# Deep Dive endpoints (FRED + Treasury Fiscal Data + TIC)
# =========================================================================


@router.get("/holders")
async def get_holders():
    """Debt holders composition — who holds the national debt (quarterly FRED data)."""
    try:
        service = get_debt_deep_dive_service()
        return await service.get_holders_composition()
    except ServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/holders/history")
async def get_holders_history():
    """Debt holders composition over time (~10 years quarterly)."""
    try:
        service = get_debt_deep_dive_service()
        return await service.get_holders_history()
    except ServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/interest")
async def get_interest(fiscal_year: int = Query(default=None)):
    """Interest expense on the national debt (current + previous 5 fiscal years)."""
    try:
        service = get_debt_deep_dive_service()
        return await service.get_interest_expense(fiscal_year=fiscal_year)
    except ServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/rates")
async def get_rates():
    """Average interest rates by security type (latest month)."""
    try:
        service = get_debt_deep_dive_service()
        return await service.get_avg_interest_rates()
    except ServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/foreign-holders")
async def get_foreign_holders():
    """Top 20 foreign holders of U.S. Treasury securities (TIC data)."""
    try:
        service = get_debt_deep_dive_service()
        return await service.get_foreign_holders()
    except ServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/gdp-ratio")
async def get_gdp_ratio():
    """Federal debt as percent of GDP (annual FRED data)."""
    try:
        service = get_debt_deep_dive_service()
        return await service.get_debt_to_gdp()
    except ServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))
