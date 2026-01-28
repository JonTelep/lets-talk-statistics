"""
Federal Budget API Endpoints

Data from USASpending.gov - the official source for federal spending data.
Documentation: https://api.usaspending.gov/docs/
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.budget_service import USASpendingService, BudgetServiceError
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get("/overview")
async def get_budget_overview(
    fiscal_year: Optional[int] = Query(None, description="Fiscal year (defaults to current)")
) -> Dict[str, Any]:
    """
    Get federal budget overview for a fiscal year.
    
    Returns:
        - Total spending/obligations
        - Spending by budget function
        - Data source attribution
    """
    service = USASpendingService()
    try:
        result = await service.get_budget_overview(fiscal_year)
        return result
    except BudgetServiceError as e:
        logger.error(f"Budget overview error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/agencies")
async def get_agencies(
    fiscal_year: Optional[int] = Query(None, description="Fiscal year"),
    limit: int = Query(20, description="Number of agencies to return", ge=1, le=100)
) -> List[Dict[str, Any]]:
    """
    Get federal agencies with spending totals.
    
    Returns list of agencies sorted by spending amount.
    """
    service = USASpendingService()
    try:
        agencies = await service.get_all_agencies(fiscal_year)
        return agencies[:limit]
    except BudgetServiceError as e:
        logger.error(f"Agencies fetch error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/agencies/top")
async def get_top_agencies(
    fiscal_year: Optional[int] = Query(None, description="Fiscal year"),
    limit: int = Query(10, description="Number of top agencies", ge=1, le=50)
) -> List[Dict[str, Any]]:
    """
    Get top agencies by spending amount.
    
    Useful for the "Top Spending Agencies" section on the frontend.
    """
    service = USASpendingService()
    try:
        agencies = await service.get_top_agencies_by_spending(fiscal_year, limit)
        return agencies
    except BudgetServiceError as e:
        logger.error(f"Top agencies error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/agencies/{agency_code}")
async def get_agency_detail(
    agency_code: str,
    fiscal_year: Optional[int] = Query(None, description="Fiscal year")
) -> Dict[str, Any]:
    """
    Get detailed spending for a specific agency.
    
    Args:
        agency_code: Agency toptier code (e.g., "020" for Treasury)
    """
    service = USASpendingService()
    try:
        agency = await service.get_agency_spending(agency_code, fiscal_year)
        return agency
    except BudgetServiceError as e:
        logger.error(f"Agency detail error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/functions")
async def get_budget_functions(
    fiscal_year: Optional[int] = Query(None, description="Fiscal year")
) -> List[Dict[str, Any]]:
    """
    Get spending by budget function (defense, healthcare, education, etc.).
    
    Budget functions are broad categories of federal spending
    established by the Congressional Budget Act.
    """
    service = USASpendingService()
    try:
        functions = await service.get_spending_by_budget_function(fiscal_year)
        return functions
    except BudgetServiceError as e:
        logger.error(f"Budget functions error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/accounts")
async def get_federal_accounts(
    fiscal_year: Optional[int] = Query(None, description="Fiscal year"),
    agency_id: Optional[str] = Query(None, description="Filter by agency"),
    limit: int = Query(50, description="Number of accounts", ge=1, le=100)
) -> List[Dict[str, Any]]:
    """
    Get federal accounts (where money is allocated).
    
    Federal accounts are the primary units for tracking 
    budgetary resources and spending.
    """
    service = USASpendingService()
    try:
        accounts = await service.get_federal_accounts(fiscal_year, agency_id, limit)
        return accounts
    except BudgetServiceError as e:
        logger.error(f"Federal accounts error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/trends")
async def get_spending_trends(
    start_year: int = Query(..., description="Starting fiscal year"),
    end_year: Optional[int] = Query(None, description="Ending fiscal year")
) -> List[Dict[str, Any]]:
    """
    Get spending trends over multiple fiscal years.
    
    Useful for historical spending charts.
    """
    service = USASpendingService()
    try:
        trends = await service.get_spending_over_time(start_year, end_year)
        return trends
    except BudgetServiceError as e:
        logger.error(f"Spending trends error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/deficit")
async def get_deficit_data(
    fiscal_year: Optional[int] = Query(None, description="Fiscal year")
) -> Dict[str, Any]:
    """
    Get spending data for deficit calculation.
    
    Note: For complete deficit data (revenue), combine with Treasury API.
    This endpoint provides the spending side.
    """
    service = USASpendingService()
    try:
        deficit = await service.get_deficit_data(fiscal_year)
        return deficit
    except BudgetServiceError as e:
        logger.error(f"Deficit data error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()
