"""
Immigration Statistics API Endpoints

Provides access to immigration and border crossing data.

Data Sources:
- Bureau of Transportation Statistics (BTS) - Border crossing counts
- DHS Immigration Statistics Yearbook - Historical enforcement data

Note: CBP/DHS enforcement data is from cached yearbook data since there
is no structured public API for encounter/apprehension statistics.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.immigration_service import (
    ImmigrationService,
    ImmigrationServiceError,
    get_immigration_service
)
from app.utils.logger import get_logger

router = APIRouter(prefix="/immigration", tags=["immigration"])
logger = get_logger(__name__)


@router.get("/")
async def get_immigration_overview():
    """
    Get an overview of immigration statistics.
    
    Returns summary stats, latest year data, and data source information.
    """
    service = get_immigration_service()
    
    try:
        summary = await service.get_summary_stats()
        categories = await service.get_immigration_by_category()
        countries = await service.get_top_source_countries(limit=5)
        
        return {
            "status": "success",
            "summary": summary,
            "categories": categories,
            "top_countries": countries,
            "data_sources": [
                {
                    "name": "DHS Immigration Statistics Yearbook",
                    "url": "https://ohss.dhs.gov/topics/immigration/yearbook",
                    "coverage": "Annual (fiscal year)"
                },
                {
                    "name": "Bureau of Transportation Statistics",
                    "url": "https://data.bts.gov/resource/keg4-3bc2.json",
                    "coverage": "Monthly border crossing data"
                },
                {
                    "name": "CBP Monthly Operational Updates",
                    "url": "https://www.cbp.gov/newsroom/stats",
                    "coverage": "Monthly (press releases, not API)"
                }
            ]
        }
    except ImmigrationServiceError as e:
        logger.error(f"Immigration overview error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_summary_stats():
    """
    Get summary immigration statistics for the latest available year.
    
    Includes:
    - Legal admissions (LPR/Green Cards)
    - Removals (deportations)
    - Border encounters
    - Admission-to-removal ratio
    """
    service = get_immigration_service()
    
    try:
        return await service.get_summary_stats()
    except ImmigrationServiceError as e:
        logger.error(f"Summary stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/historical")
async def get_historical_enforcement(
    start_year: Optional[int] = Query(None, description="Start fiscal year"),
    end_year: Optional[int] = Query(None, description="End fiscal year")
):
    """
    Get historical enforcement data.
    
    Data includes legal admissions, removals, and border encounters
    by fiscal year. Sourced from DHS yearbooks.
    
    Args:
        start_year: Filter to years >= start_year
        end_year: Filter to years <= end_year
    """
    service = get_immigration_service()
    
    try:
        return await service.get_historical_enforcement(
            start_year=start_year,
            end_year=end_year
        )
    except ImmigrationServiceError as e:
        logger.error(f"Historical enforcement error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories")
async def get_immigration_by_category():
    """
    Get immigration breakdown by admission category.
    
    Categories:
    - Family-Based
    - Employment-Based
    - Refugees & Asylees
    - Diversity Lottery
    - Other
    """
    service = get_immigration_service()
    
    try:
        return await service.get_immigration_by_category()
    except ImmigrationServiceError as e:
        logger.error(f"Categories error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/countries")
async def get_top_source_countries(
    limit: int = Query(10, ge=1, le=50, description="Number of countries to return")
):
    """
    Get top source countries for legal immigration.
    
    Returns countries ranked by number of legal admissions.
    """
    service = get_immigration_service()
    
    try:
        return await service.get_top_source_countries(limit=limit)
    except ImmigrationServiceError as e:
        logger.error(f"Countries error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/border-crossings")
async def get_border_crossings(
    border: Optional[str] = Query(
        None, 
        description="Filter by border: 'US-Mexico Border' or 'US-Canada Border'"
    ),
    measure: Optional[str] = Query(
        None,
        description="Filter by measure: 'Personal Vehicles', 'Trucks', 'Bus Passengers', etc."
    ),
    state: Optional[str] = Query(
        None,
        description="Filter by state (e.g., 'Texas', 'California')"
    ),
    year: Optional[int] = Query(
        None,
        description="Filter by year"
    ),
    limit: int = Query(1000, ge=1, le=10000, description="Max records")
):
    """
    Get border crossing data from BTS.
    
    This is actual traffic data (vehicles, trucks, passengers) crossing
    at official ports of entry - distinct from immigration enforcement data.
    
    Note: This data tracks lawful crossings at ports of entry,
    not unauthorized border crossings or immigration enforcement.
    """
    service = get_immigration_service()
    
    try:
        return await service.get_border_crossings(
            border=border,
            measure=measure,
            state=state,
            year=year,
            limit=limit
        )
    except ImmigrationServiceError as e:
        logger.error(f"Border crossings error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/border-crossings/monthly")
async def get_monthly_crossing_summary(
    months: int = Query(12, ge=1, le=60, description="Number of months to include")
):
    """
    Get monthly summary of border crossings.
    
    Aggregates all crossing types by month for both borders.
    """
    service = get_immigration_service()
    
    try:
        return await service.get_monthly_crossing_summary(months=months)
    except ImmigrationServiceError as e:
        logger.error(f"Monthly crossing summary error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
