"""Healthcare statistics endpoints - Medicaid enrollment & DSH payment data."""

from fastapi import APIRouter, HTTPException

from app.services.healthcare_service import get_healthcare_service, HealthcareServiceError

router = APIRouter(prefix="/healthcare", tags=["healthcare"])


@router.get("/")
async def get_healthcare_overview():
    """
    Combined healthcare overview: Medicaid enrollment + DSH hospital payments.

    Sources: data.medicaid.gov (CMS) — free, no API key required.
    """
    try:
        service = get_healthcare_service()
        return await service.get_overview()
    except HealthcareServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/enrollment")
async def get_enrollment():
    """
    State-level Medicaid & CHIP enrollment data with national trends.

    10,000+ records covering 2013-present, all 50 states + DC + territories.
    Source: data.medicaid.gov
    """
    try:
        service = get_healthcare_service()
        return await service.get_enrollment_data()
    except HealthcareServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/dsh")
async def get_dsh_payments():
    """
    Disproportionate Share Hospital (DSH) payment records.

    Note: Currently limited dataset (California 2013).
    Source: data.medicaid.gov
    """
    try:
        service = get_healthcare_service()
        return await service.get_dsh_payments()
    except HealthcareServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))
