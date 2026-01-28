"""
National Debt API Endpoints

Data from Treasury Fiscal Data API - the official source for federal debt data.
Documentation: https://fiscaldata.treasury.gov/api-documentation/
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.debt_service import TreasuryDebtService, DebtServiceError
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get("/current")
async def get_current_debt() -> Dict[str, Any]:
    """
    Get the most recent national debt figures.
    
    Returns:
        - Total public debt outstanding
        - Debt held by public
        - Intragovernmental holdings
        - Record date
    
    Data is typically updated daily by Treasury.
    """
    service = TreasuryDebtService()
    try:
        result = await service.get_current_debt()
        return result
    except DebtServiceError as e:
        logger.error(f"Current debt error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/summary")
async def get_debt_summary() -> Dict[str, Any]:
    """
    Get comprehensive debt summary.
    
    Combines multiple data points:
        - Current debt totals
        - Per capita figures
        - Growth rates
        - Interest expense (if available)
    """
    service = TreasuryDebtService()
    try:
        result = await service.get_debt_summary()
        return result
    except DebtServiceError as e:
        logger.error(f"Debt summary error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/historical")
async def get_historical_debt(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    frequency: str = Query("monthly", description="Data frequency: daily, monthly, yearly")
) -> List[Dict[str, Any]]:
    """
    Get historical national debt data.
    
    Args:
        start_date: Start of date range (defaults to 10 years ago)
        end_date: End of date range (defaults to today)
        frequency: How often to sample data (daily, monthly, yearly)
    
    Returns list of debt records over time.
    """
    if frequency not in ["daily", "monthly", "yearly"]:
        raise HTTPException(status_code=400, detail="Frequency must be daily, monthly, or yearly")
    
    service = TreasuryDebtService()
    try:
        result = await service.get_historical_debt(start_date, end_date, frequency)
        return result
    except DebtServiceError as e:
        logger.error(f"Historical debt error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/by-year")
async def get_debt_by_year(
    start_year: int = Query(2000, description="Starting year"),
    end_year: Optional[int] = Query(None, description="Ending year")
) -> List[Dict[str, Any]]:
    """
    Get debt snapshot at end of each fiscal year.
    
    Useful for year-over-year comparisons and historical charts.
    """
    service = TreasuryDebtService()
    try:
        result = await service.get_debt_by_year(start_year, end_year)
        return result
    except DebtServiceError as e:
        logger.error(f"Debt by year error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/per-capita")
async def get_debt_per_capita(
    population: int = Query(335_000_000, description="US population estimate")
) -> Dict[str, Any]:
    """
    Calculate debt per capita figures.
    
    Returns:
        - Debt per citizen
        - Debt per taxpayer (estimated)
    
    Note: Population can be adjusted for more accurate calculations.
    """
    service = TreasuryDebtService()
    try:
        result = await service.get_debt_per_capita(population)
        return result
    except DebtServiceError as e:
        logger.error(f"Per capita error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/growth")
async def get_debt_growth(
    days: int = Query(365, description="Number of days to calculate over", ge=30, le=3650)
) -> Dict[str, Any]:
    """
    Calculate debt growth rate.
    
    Returns:
        - Total growth over period
        - Daily average growth
        - Monthly average growth
        - Projected yearly growth
    """
    service = TreasuryDebtService()
    try:
        result = await service.get_debt_growth_rate(days)
        return result
    except DebtServiceError as e:
        logger.error(f"Debt growth error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/interest")
async def get_interest_expense(
    fiscal_year: Optional[int] = Query(None, description="Fiscal year")
) -> Dict[str, Any]:
    """
    Get interest expense on the national debt.
    
    Shows how much is spent just servicing the debt.
    """
    service = TreasuryDebtService()
    try:
        result = await service.get_interest_expense(fiscal_year)
        return result
    except DebtServiceError as e:
        logger.error(f"Interest expense error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()
