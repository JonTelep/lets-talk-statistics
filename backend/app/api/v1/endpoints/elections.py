"""Election/campaign finance endpoints - simplified."""

from datetime import datetime
from fastapi import APIRouter, HTTPException, Query

from app.services.gov_data import get_gov_data_service, DataFetchError

router = APIRouter(prefix="/elections", tags=["elections"])


@router.get("/candidates")
async def get_candidates(cycle: int = Query(default=None)):
    """
    Get candidate fundraising totals from FEC.
    
    Defaults to current election cycle.
    Data is cached for 24 hours.
    """
    try:
        service = get_gov_data_service()
        return await service.get_candidate_totals(cycle=cycle)
    except DataFetchError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/population")
async def get_population(year: int = Query(default=None)):
    """
    Get state population data from Census Bureau.
    
    Used for per-capita calculations.
    Data is cached for 24 hours.
    """
    try:
        service = get_gov_data_service()
        return await service.get_state_populations(year=year)
    except DataFetchError as e:
        raise HTTPException(status_code=502, detail=str(e))
