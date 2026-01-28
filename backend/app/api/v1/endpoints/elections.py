"""
Election Funding API Endpoints

Data from the Federal Election Commission (FEC) and analysis of
structural barriers in the U.S. electoral system.

Note: This section includes editorial analysis alongside raw data.
The two-party system's structural advantages are documented facts.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.elections_service import FECElectionsService, ElectionsServiceError
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get("/rules")
async def get_public_funding_rules() -> Dict[str, Any]:
    """
    Get current public funding rules and thresholds.
    
    Returns FEC public funding rules including:
        - Major party general election grants
        - Minor/new party thresholds
        - Primary matching fund rules
        - Debate qualification criteria
    
    This is static regulatory data, no API key required.
    """
    service = FECElectionsService()
    return service.get_public_funding_rules()


@router.get("/history")
async def get_public_funding_history() -> List[Dict[str, Any]]:
    """
    Get historical public funding amounts by cycle.
    
    Shows:
        - Public funding grant amounts over time
        - Which candidates accepted/declined
    """
    service = FECElectionsService()
    return service.get_public_funding_history()


@router.get("/barriers")
async def get_structural_barriers() -> Dict[str, Any]:
    """
    Get analysis of structural barriers facing third parties.
    
    Documents the systematic disadvantages including:
        - 5% threshold for public funding (Catch-22)
        - 15% polling requirement for debates
        - Ballot access signature requirements
        - Media coverage disparities
    
    This endpoint includes editorial analysis alongside facts.
    """
    service = FECElectionsService()
    return service.get_structural_barriers()


@router.get("/candidates")
async def get_presidential_candidates(
    election_year: int = Query(2024, description="Election year")
) -> List[Dict[str, Any]]:
    """
    Get presidential candidates for an election cycle.
    
    Requires FEC API key to be configured.
    
    Returns candidates sorted by receipts (fundraising).
    """
    service = FECElectionsService()
    try:
        return await service.get_presidential_candidates(election_year)
    except ElectionsServiceError as e:
        logger.error(f"Candidates fetch error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/totals")
async def get_candidate_totals(
    election_year: int = Query(2024, description="Election year")
) -> Dict[str, Any]:
    """
    Get campaign finance totals for presidential candidates.
    
    Requires FEC API key to be configured.
    
    Returns receipts, disbursements, and other financial data.
    """
    service = FECElectionsService()
    try:
        return await service.get_candidate_totals(election_year)
    except ElectionsServiceError as e:
        logger.error(f"Totals fetch error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/parties")
async def get_party_finances(
    cycle: int = Query(2024, description="Election cycle")
) -> Dict[str, Any]:
    """
    Get national party committee finances.
    
    Requires FEC API key to be configured.
    
    Shows financial data for Democratic and Republican national committees.
    """
    service = FECElectionsService()
    try:
        return await service.get_party_committee_finances(cycle)
    except ElectionsServiceError as e:
        logger.error(f"Party finances error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        await service.close()


@router.get("/summary")
async def get_elections_summary() -> Dict[str, Any]:
    """
    Get comprehensive election funding summary.
    
    Combines:
        - Current funding rules
        - Historical funding data
        - Structural barrier analysis
    
    No API key required (uses static/analytical data).
    """
    service = FECElectionsService()
    
    return {
        "rules": service.get_public_funding_rules(),
        "history": service.get_public_funding_history(),
        "barriers": service.get_structural_barriers(),
        "editorial_note": (
            "The American electoral system contains structural barriers that make "
            "third-party success mathematically implausible. This is documented fact, "
            "not opinion. The data presented here comes from official FEC records, "
            "CPD rules, and state election boards."
        ),
    }
