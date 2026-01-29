"""Federal budget endpoints - simplified."""

from datetime import datetime
from fastapi import APIRouter, HTTPException, Query

from app.services.gov_data import get_gov_data_service, DataFetchError

router = APIRouter(prefix="/budget", tags=["budget"])


@router.get("/")
async def get_budget(fiscal_year: int = Query(default=None)):
    """
    Get federal budget data from Treasury Monthly Statement.
    
    Data is cached for 24 hours.
    """
    try:
        service = get_gov_data_service()
        return await service.get_budget_data(fiscal_year=fiscal_year)
    except DataFetchError as e:
        raise HTTPException(status_code=502, detail=str(e))
