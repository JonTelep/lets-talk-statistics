"""
Employment Statistics API Endpoints

Data from Bureau of Labor Statistics (BLS) API.
Documentation: https://www.bls.gov/developers/
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.employment_service import BLSEmploymentService, EmploymentServiceError
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get("/summary")
async def get_employment_summary() -> Dict[str, Any]:
    """
    Get comprehensive employment summary.
    
    Returns:
        - Unemployment rate
        - Labor force size
        - Number employed/unemployed
        - Labor force participation rate
        - Nonfarm payroll employment
    """
    service = BLSEmploymentService()
    try:
        result = await service.get_employment_summary()
        return result
    except EmploymentServiceError as e:
        logger.error(f"Employment summary error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/report")
async def get_full_employment_report() -> Dict[str, Any]:
    """
    Get full employment report with all metrics.
    
    Combines:
        - Summary statistics
        - Unemployment trend
        - Demographics breakdown
        - Sector employment
        - Jobs added monthly
    
    This is a comprehensive endpoint for the employment page.
    """
    service = BLSEmploymentService()
    try:
        result = await service.get_full_employment_report()
        return result
    except EmploymentServiceError as e:
        logger.error(f"Full report error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/unemployment")
async def get_unemployment_rate(
    months: int = Query(12, description="Number of months of data", ge=1, le=120)
) -> List[Dict[str, Any]]:
    """
    Get national unemployment rate trend.
    
    Returns monthly unemployment rate data going back
    the specified number of months.
    """
    service = BLSEmploymentService()
    try:
        result = await service.get_unemployment_rate(months)
        return result
    except EmploymentServiceError as e:
        logger.error(f"Unemployment rate error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/unemployment/demographics")
async def get_unemployment_by_demographic() -> Dict[str, float]:
    """
    Get unemployment rates by demographic group.
    
    Returns rates for:
        - Adult men/women
        - Teenagers
        - White, Black, Asian, Hispanic populations
    """
    service = BLSEmploymentService()
    try:
        result = await service.get_unemployment_by_demographic()
        return result
    except EmploymentServiceError as e:
        logger.error(f"Demographics error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/unemployment/states")
async def get_state_unemployment() -> List[Dict[str, Any]]:
    """
    Get unemployment rates by state.
    
    Returns all 50 states + DC sorted by unemployment rate
    (lowest to highest).
    """
    service = BLSEmploymentService()
    try:
        result = await service.get_state_unemployment()
        return result
    except EmploymentServiceError as e:
        logger.error(f"State unemployment error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/sectors")
async def get_jobs_by_sector() -> List[Dict[str, Any]]:
    """
    Get employment numbers by industry sector.
    
    Returns:
        - Sector name
        - Total employment
        - Monthly change
        - Percent change
    
    Sectors include: mining, construction, manufacturing,
    trade, transportation, healthcare, government, etc.
    """
    service = BLSEmploymentService()
    try:
        result = await service.get_jobs_by_sector()
        return result
    except EmploymentServiceError as e:
        logger.error(f"Sectors error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/jobs-added")
async def get_jobs_added(
    months: int = Query(12, description="Number of months", ge=1, le=60)
) -> List[Dict[str, Any]]:
    """
    Get monthly jobs added (nonfarm payroll changes).
    
    This is the headline number from the monthly jobs report.
    
    Returns:
        - Month/year
        - Total nonfarm employment
        - Jobs added that month
    """
    service = BLSEmploymentService()
    try:
        result = await service.get_jobs_added(months)
        return result
    except EmploymentServiceError as e:
        logger.error(f"Jobs added error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()
