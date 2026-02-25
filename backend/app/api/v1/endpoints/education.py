"""Education endpoints - Department of Education data."""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.services.education_service import education_service, EducationServiceError

router = APIRouter(prefix="/education", tags=["education"])


@router.get("/")
async def get_education_overview():
    """
    Get comprehensive education statistics overview.
    
    Includes enrollment, spending, and outcomes data from Department of Education.
    Data is cached for 24 hours.
    """
    try:
        return await education_service.get_overview_stats()
    except EducationServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/enrollment")
async def get_enrollment_data(years: int = Query(default=5, ge=1, le=10)):
    """
    Get education enrollment statistics.
    
    Returns higher education enrollment data from College Scorecard API.
    """
    try:
        return await education_service.get_enrollment_statistics(years=years)
    except EducationServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/spending")
async def get_spending_data():
    """
    Get education spending and funding statistics.
    
    Returns federal education spending breakdown by program and category.
    """
    try:
        return await education_service.get_spending_statistics()
    except EducationServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/outcomes")
async def get_outcomes_data():
    """
    Get education outcomes and performance statistics.
    
    Returns graduation rates and post-graduation earnings from College Scorecard.
    """
    try:
        return await education_service.get_outcomes_statistics()
    except EducationServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))