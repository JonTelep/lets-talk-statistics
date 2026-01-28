"""
Federal Election Commission (FEC) Data Service

Fetches election and campaign finance data from the FEC API.
Documentation: https://api.open.fec.gov/developers/

Data includes:
- Presidential campaign receipts and disbursements
- Public funding amounts
- Candidate committees
- Party committee finances

API Key: Required (free) - Register at https://api.data.gov/signup/
"""

import asyncio
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx

from app.config import get_settings
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class ElectionsServiceError(Exception):
    """Custom exception for elections service errors."""
    pass


class FECElectionsService:
    """
    Service for fetching election data from FEC OpenFEC API.
    
    FEC OpenFEC API provides comprehensive campaign finance data.
    
    API Base URL: https://api.open.fec.gov/v1/
    Documentation: https://api.open.fec.gov/developers/
    API Key: Required (free registration at api.data.gov)
    
    Note: Many endpoints have rate limits. Be respectful of the API.
    """
    
    BASE_URL = "https://api.open.fec.gov/v1"
    TIMEOUT = 30  # seconds
    
    # Public funding constants (these change each cycle, update as needed)
    PUBLIC_FUNDING_2024 = {
        "major_party_general_grant": 123_500_000,
        "primary_matching_limit": 61_790_000,
        "state_spending_limit_min": 1_236_000,  # Wyoming
        "state_spending_limit_max": 30_176_500,  # California
        "third_party_threshold_percent": 5,
        "debate_polling_threshold_percent": 15,
    }
    
    # Historical public funding data
    PUBLIC_FUNDING_HISTORY = [
        {"year": 2024, "amount": 123_500_000, "accepted_by": "Neither major candidate"},
        {"year": 2020, "amount": 103_700_000, "accepted_by": "Neither major candidate"},
        {"year": 2016, "amount": 96_140_000, "accepted_by": "Neither major candidate"},
        {"year": 2012, "amount": 91_241_400, "accepted_by": "Neither major candidate"},
        {"year": 2008, "amount": 84_100_000, "accepted_by": "John McCain (R)"},
        {"year": 2004, "amount": 74_620_000, "accepted_by": "Both major candidates"},
        {"year": 2000, "amount": 67_560_000, "accepted_by": "Both major candidates"},
        {"year": 1996, "amount": 61_820_000, "accepted_by": "Both major candidates"},
    ]
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the FEC Elections service.
        
        Args:
            api_key: FEC/data.gov API key (register at https://api.data.gov/signup/)
        """
        self.api_key = api_key or getattr(settings, 'fec_api_key', None)
        self.client = None
        
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client."""
        if self.client is None:
            self.client = httpx.AsyncClient(
                timeout=self.TIMEOUT,
                headers={"Accept": "application/json"}
            )
        return self.client
    
    async def close(self):
        """Close the HTTP client."""
        if self.client:
            await self.client.aclose()
            self.client = None

    # =========================================================================
    # STATIC DATA (doesn't require API)
    # =========================================================================
    
    def get_public_funding_rules(self) -> Dict[str, Any]:
        """
        Get current public funding rules and thresholds.
        
        This is static data from FEC regulations.
        
        Returns:
            Public funding rules for 2024 cycle
        """
        return {
            "cycle": 2024,
            "rules": {
                "major_party_general_election": {
                    "amount": self.PUBLIC_FUNDING_2024["major_party_general_grant"],
                    "timing": "Upfront (after nomination)",
                    "requirement": "Accept spending limits, no private contributions",
                },
                "minor_party": {
                    "threshold": "5-25% in previous election",
                    "timing": "After current election (retroactive)",
                    "amount": "Proportional based on vote share",
                },
                "new_party": {
                    "threshold": "5%+ in current election",
                    "timing": "After current election (retroactive)",
                    "amount": "Proportional based on vote share",
                },
                "primary_matching": {
                    "limit": self.PUBLIC_FUNDING_2024["primary_matching_limit"],
                    "match_rate": "$1 for $1 up to $250 per contributor",
                    "requirement": "Raise $5,000 in each of 20 states",
                },
            },
            "debate_threshold": {
                "organization": "Commission on Presidential Debates",
                "requirement": f"{self.PUBLIC_FUNDING_2024['debate_polling_threshold_percent']}% in 5 national polls",
                "note": "Self-imposed rule by CPD, not law",
            },
            "source": "Federal Election Commission",
            "documentation": "https://www.fec.gov/introduction-campaign-finance/understanding-ways-support-federal-candidates/presidential-elections/public-funding-presidential-elections/",
        }
    
    def get_public_funding_history(self) -> List[Dict[str, Any]]:
        """
        Get historical public funding amounts.
        
        Returns:
            History of public funding grants
        """
        return self.PUBLIC_FUNDING_HISTORY
    
    def get_structural_barriers(self) -> Dict[str, Any]:
        """
        Get information about structural barriers to third parties.
        
        This is educational/analytical data, not raw FEC data.
        
        Returns:
            Analysis of barriers facing third party candidates
        """
        return {
            "public_funding": {
                "barrier": "5% threshold for any funding",
                "impact": "Must run underfunded campaign before receiving any support",
                "major_party_advantage": "$123.5M upfront vs $0",
            },
            "debate_access": {
                "barrier": "15% polling threshold",
                "impact": "Without debates, impossible to reach 15%; without 15%, no debates",
                "note": "CPD founded by former D/R party chairs",
            },
            "ballot_access": {
                "barrier": "Signature requirements vary by state",
                "impact": "$5-15M spent just to appear on ballots",
                "major_party_advantage": "Automatic ballot access",
                "total_signatures_needed": "~700,000 across all states",
            },
            "media_coverage": {
                "barrier": "Coverage follows polling/fundraising",
                "impact": "Self-reinforcing cycle of invisibility",
            },
            "sources": [
                "FEC Regulations",
                "CPD Rules",
                "State Election Boards",
                "Ballot Access News",
            ],
        }

    # =========================================================================
    # FEC API METHODS (require API key)
    # =========================================================================
    
    async def get_presidential_candidates(
        self,
        election_year: int = 2024,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get presidential candidates for an election cycle.
        
        API: GET /candidates/search/
        
        Args:
            election_year: Election year
            limit: Number of results
            
        Returns:
            List of presidential candidates
        """
        if not self.api_key:
            logger.warning("FEC API key not configured")
            return []
        
        url = f"{self.BASE_URL}/candidates/search/"
        params = {
            "api_key": self.api_key,
            "election_year": election_year,
            "office": "P",  # President
            "per_page": limit,
            "sort": "-receipts",
        }
        
        try:
            client = await self._get_client()
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            return data.get("results", [])
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch presidential candidates: {e}")
            raise ElectionsServiceError(f"Failed to fetch candidates: {e}")
    
    async def get_candidate_totals(
        self,
        election_year: int = 2024
    ) -> Dict[str, Any]:
        """
        Get total receipts/disbursements for presidential candidates.
        
        API: GET /presidential/
        
        Args:
            election_year: Election year
            
        Returns:
            Campaign finance totals by candidate
        """
        if not self.api_key:
            logger.warning("FEC API key not configured")
            return {}
        
        url = f"{self.BASE_URL}/presidential/"
        params = {
            "api_key": self.api_key,
            "election_year": election_year,
            "sort": "-receipts",
            "per_page": 50,
        }
        
        try:
            client = await self._get_client()
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            results = data.get("results", [])
            
            # Calculate totals
            total_receipts = sum(r.get("receipts", 0) or 0 for r in results)
            total_disbursements = sum(r.get("disbursements", 0) or 0 for r in results)
            
            return {
                "election_year": election_year,
                "candidates": results,
                "totals": {
                    "total_receipts": total_receipts,
                    "total_disbursements": total_disbursements,
                },
                "fetched_at": datetime.utcnow().isoformat(),
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch candidate totals: {e}")
            raise ElectionsServiceError(f"Failed to fetch totals: {e}")
    
    async def get_party_committee_finances(
        self,
        cycle: int = 2024
    ) -> Dict[str, Any]:
        """
        Get national party committee finances.
        
        API: GET /totals/party-presidential/
        
        Args:
            cycle: Election cycle
            
        Returns:
            Party committee financial data
        """
        if not self.api_key:
            logger.warning("FEC API key not configured")
            return {}
        
        url = f"{self.BASE_URL}/totals/party-presidential/"
        params = {
            "api_key": self.api_key,
            "cycle": cycle,
        }
        
        try:
            client = await self._get_client()
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            return response.json()
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch party finances: {e}")
            raise ElectionsServiceError(f"Failed to fetch party finances: {e}")


# =========================================================================
# MODULE-LEVEL CONVENIENCE FUNCTIONS
# =========================================================================

def get_election_barriers() -> Dict[str, Any]:
    """Get structural barriers analysis (no API needed)."""
    service = FECElectionsService()
    return service.get_structural_barriers()


def get_funding_rules() -> Dict[str, Any]:
    """Get public funding rules (no API needed)."""
    service = FECElectionsService()
    return service.get_public_funding_rules()
