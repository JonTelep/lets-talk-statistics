"""
USASpending.gov Federal Budget Data Service

Fetches federal spending data from the official USASpending.gov API.
Documentation: https://api.usaspending.gov/docs/

Data includes:
- Agency spending (outlays, obligations, budgetary resources)
- Spending by category (mandatory, discretionary)
- Historical fiscal year data

No API key required - public API.
"""

import asyncio
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional

import httpx

from app.config import get_settings
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class BudgetServiceError(Exception):
    """Custom exception for budget service errors."""
    pass


class USASpendingService:
    """
    Service for fetching federal budget data from USASpending.gov.
    
    USASpending.gov is the official source for federal spending data,
    mandated by the DATA Act of 2014 for government transparency.
    
    API Base URL: https://api.usaspending.gov/api/v2/
    Documentation: https://api.usaspending.gov/docs/
    """
    
    BASE_URL = "https://api.usaspending.gov/api/v2"
    TIMEOUT = 30  # seconds
    
    def __init__(self):
        """Initialize the USASpending service."""
        self.client = None
        
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client."""
        if self.client is None:
            self.client = httpx.AsyncClient(
                timeout=self.TIMEOUT,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            )
        return self.client
    
    async def close(self):
        """Close the HTTP client."""
        if self.client:
            await self.client.aclose()
            self.client = None

    # =========================================================================
    # AGENCY SPENDING
    # =========================================================================
    
    async def get_all_agencies(self, fiscal_year: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get a list of all federal agencies with their spending totals.
        
        API: GET /api/v2/agency/
        
        Args:
            fiscal_year: Fiscal year (defaults to current)
            
        Returns:
            List of agencies with spending data
        """
        fy = fiscal_year or self._current_fiscal_year()
        url = f"{self.BASE_URL}/references/toptier_agencies/"
        
        try:
            client = await self._get_client()
            params = {"fiscal_year": fy}
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            agencies = data.get("results", [])
            
            logger.info(f"Fetched {len(agencies)} agencies for FY{fy}")
            return agencies
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch agencies: {e}")
            raise BudgetServiceError(f"Failed to fetch agencies: {e}")
    
    async def get_agency_spending(
        self, 
        agency_code: str, 
        fiscal_year: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Get detailed spending for a specific agency.
        
        API: GET /api/v2/agency/{toptier_code}/
        
        Args:
            agency_code: Agency toptier code (e.g., "020" for Treasury)
            fiscal_year: Fiscal year
            
        Returns:
            Agency spending details
        """
        fy = fiscal_year or self._current_fiscal_year()
        url = f"{self.BASE_URL}/agency/{agency_code}/"
        
        try:
            client = await self._get_client()
            params = {"fiscal_year": fy}
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            return response.json()
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch agency {agency_code}: {e}")
            raise BudgetServiceError(f"Failed to fetch agency details: {e}")

    async def get_top_agencies_by_spending(
        self,
        fiscal_year: Optional[int] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get top agencies ranked by total spending.
        
        API: POST /api/v2/spending/
        
        Args:
            fiscal_year: Fiscal year
            limit: Number of agencies to return
            
        Returns:
            List of top agencies by spending
        """
        fy = fiscal_year or self._current_fiscal_year()
        url = f"{self.BASE_URL}/spending/"
        
        payload = {
            "fiscal_year": fy,
            "limit": limit,
            "order": "desc",
            "sort": "obligated_amount",
            "spending_type": "total"
        }
        
        try:
            client = await self._get_client()
            response = await client.post(url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            return data.get("results", [])
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch top agencies: {e}")
            raise BudgetServiceError(f"Failed to fetch top agencies: {e}")

    # =========================================================================
    # BUDGET OVERVIEW
    # =========================================================================
    
    async def get_budget_overview(
        self,
        fiscal_year: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Get high-level budget overview for a fiscal year.
        
        Combines multiple API calls to provide:
        - Total spending (outlays)
        - Total obligations
        - Budgetary resources
        - Spending by category
        
        Args:
            fiscal_year: Fiscal year
            
        Returns:
            Budget overview data
        """
        fy = fiscal_year or self._current_fiscal_year()
        
        try:
            # Fetch overall budget data
            totals = await self._get_budget_totals(fy)
            
            # Fetch spending by budget function
            by_function = await self.get_spending_by_budget_function(fy)
            
            return {
                "fiscal_year": fy,
                "totals": totals,
                "by_function": by_function,
                "fetched_at": datetime.utcnow().isoformat(),
                "source": "USASpending.gov"
            }
            
        except Exception as e:
            logger.error(f"Failed to get budget overview: {e}")
            raise BudgetServiceError(f"Failed to get budget overview: {e}")
    
    async def _get_budget_totals(self, fiscal_year: int) -> Dict[str, Any]:
        """Get total budget figures for a fiscal year."""
        url = f"{self.BASE_URL}/spending/summary/"
        
        payload = {
            "fiscal_year": fiscal_year,
            "spending_type": "total"
        }
        
        try:
            client = await self._get_client()
            response = await client.post(url, json=payload)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError:
            # Some endpoints may not exist, return empty
            return {}
    
    async def get_spending_by_budget_function(
        self,
        fiscal_year: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Get spending broken down by budget function (defense, healthcare, etc.).
        
        API: GET /api/v2/budget_functions/list_budget_functions/
        
        Args:
            fiscal_year: Fiscal year
            
        Returns:
            List of budget functions with spending amounts
        """
        fy = fiscal_year or self._current_fiscal_year()
        url = f"{self.BASE_URL}/budget_functions/list_budget_functions/"
        
        try:
            client = await self._get_client()
            params = {"fiscal_year": fy}
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            return data.get("results", [])
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch budget functions: {e}")
            raise BudgetServiceError(f"Failed to fetch budget functions: {e}")

    # =========================================================================
    # FEDERAL ACCOUNTS
    # =========================================================================
    
    async def get_federal_accounts(
        self,
        fiscal_year: Optional[int] = None,
        agency_id: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get federal accounts (where money is allocated).
        
        API: POST /api/v2/federal_accounts/
        
        Args:
            fiscal_year: Fiscal year
            agency_id: Filter by agency
            limit: Number of results
            
        Returns:
            List of federal accounts
        """
        fy = fiscal_year or self._current_fiscal_year()
        url = f"{self.BASE_URL}/federal_accounts/"
        
        payload = {
            "filters": {
                "fiscal_year": fy
            },
            "limit": limit,
            "sort": {
                "field": "budgetary_resources",
                "direction": "desc"
            }
        }
        
        if agency_id:
            payload["filters"]["agency_identifier"] = agency_id
        
        try:
            client = await self._get_client()
            response = await client.post(url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            return data.get("results", [])
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch federal accounts: {e}")
            raise BudgetServiceError(f"Failed to fetch federal accounts: {e}")

    # =========================================================================
    # SPENDING TRENDS
    # =========================================================================
    
    async def get_spending_over_time(
        self,
        start_year: int,
        end_year: Optional[int] = None,
        group_by: str = "fiscal_year"
    ) -> List[Dict[str, Any]]:
        """
        Get spending trends over multiple fiscal years.
        
        Args:
            start_year: Starting fiscal year
            end_year: Ending fiscal year (defaults to current)
            group_by: Group by fiscal_year or quarter
            
        Returns:
            List of spending by time period
        """
        end_fy = end_year or self._current_fiscal_year()
        url = f"{self.BASE_URL}/spending/spending_over_time/"
        
        payload = {
            "start_date": f"{start_year}-10-01",  # FY starts Oct 1
            "end_date": f"{end_fy}-09-30",        # FY ends Sep 30
            "group": group_by
        }
        
        try:
            client = await self._get_client()
            response = await client.post(url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            return data.get("results", [])
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch spending over time: {e}")
            raise BudgetServiceError(f"Failed to fetch spending trends: {e}")

    # =========================================================================
    # DEFICIT CALCULATION
    # =========================================================================
    
    async def get_deficit_data(
        self,
        fiscal_year: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Calculate deficit from spending and revenue data.
        
        Note: USASpending focuses on spending. For full revenue data,
        Treasury APIs are better. This provides spending side only.
        
        Args:
            fiscal_year: Fiscal year
            
        Returns:
            Spending totals (deficit requires revenue from Treasury)
        """
        fy = fiscal_year or self._current_fiscal_year()
        
        # Get total outlays
        url = f"{self.BASE_URL}/spending/"
        payload = {
            "fiscal_year": fy,
            "spending_type": "total",
            "limit": 1
        }
        
        try:
            client = await self._get_client()
            response = await client.post(url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "fiscal_year": fy,
                "total_spending": data.get("total", 0),
                "note": "Revenue data requires Treasury API for full deficit calculation",
                "source": "USASpending.gov"
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch deficit data: {e}")
            raise BudgetServiceError(f"Failed to fetch deficit data: {e}")

    # =========================================================================
    # UTILITIES
    # =========================================================================
    
    def _current_fiscal_year(self) -> int:
        """
        Get current fiscal year.
        
        Federal fiscal year runs Oct 1 - Sep 30.
        FY 2024 = Oct 1, 2023 - Sep 30, 2024
        """
        today = datetime.now()
        if today.month >= 10:  # Oct-Dec = next FY
            return today.year + 1
        return today.year
    
    def format_currency(self, amount: float) -> str:
        """Format large numbers for display."""
        if amount >= 1_000_000_000_000:  # Trillions
            return f"${amount / 1_000_000_000_000:.2f}T"
        elif amount >= 1_000_000_000:  # Billions
            return f"${amount / 1_000_000_000:.2f}B"
        elif amount >= 1_000_000:  # Millions
            return f"${amount / 1_000_000:.2f}M"
        else:
            return f"${amount:,.0f}"


# =========================================================================
# MODULE-LEVEL CONVENIENCE FUNCTIONS
# =========================================================================

async def get_budget_summary(fiscal_year: Optional[int] = None) -> Dict[str, Any]:
    """
    Convenience function to get a budget summary.
    
    Usage:
        from app.services.budget_service import get_budget_summary
        summary = await get_budget_summary(2024)
    """
    service = USASpendingService()
    try:
        return await service.get_budget_overview(fiscal_year)
    finally:
        await service.close()


async def get_agency_list(fiscal_year: Optional[int] = None) -> List[Dict[str, Any]]:
    """Convenience function to get all agencies."""
    service = USASpendingService()
    try:
        return await service.get_all_agencies(fiscal_year)
    finally:
        await service.close()
