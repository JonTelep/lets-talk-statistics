"""
Treasury Fiscal Data Service - National Debt

Fetches national debt data from the official Treasury Fiscal Data API.
Documentation: https://fiscaldata.treasury.gov/api-documentation/

Data includes:
- Total public debt outstanding (updated daily)
- Debt held by public vs. intragovernmental
- Historical debt data
- Debt to the penny

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


class DebtServiceError(Exception):
    """Custom exception for debt service errors."""
    pass


class TreasuryDebtService:
    """
    Service for fetching national debt data from Treasury Fiscal Data.
    
    Fiscal Data is the official U.S. Treasury source for federal financial data.
    
    API Base URL: https://api.fiscaldata.treasury.gov/services/api/fiscal_service/
    Documentation: https://fiscaldata.treasury.gov/api-documentation/
    """
    
    BASE_URL = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service"
    TIMEOUT = 30  # seconds
    
    # Key endpoints
    ENDPOINTS = {
        "debt_to_penny": "/v2/accounting/od/debt_to_penny",
        "debt_outstanding": "/v2/accounting/od/debt_outstanding",
        "monthly_treasury_statement": "/v1/accounting/mts/mts_table_5",
        "interest_expense": "/v2/accounting/od/interest_expense",
        "debt_by_holder": "/v2/accounting/od/schedules/debt_to_penny",
    }
    
    def __init__(self):
        """Initialize the Treasury Debt service."""
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
    # DEBT TO THE PENNY (Latest)
    # =========================================================================
    
    async def get_current_debt(self) -> Dict[str, Any]:
        """
        Get the most recent total public debt outstanding.
        
        API: /v2/accounting/od/debt_to_penny
        
        This endpoint provides:
        - Total public debt outstanding
        - Debt held by public
        - Intragovernmental holdings
        - Record date
        
        Returns:
            Current debt data
        """
        url = f"{self.BASE_URL}{self.ENDPOINTS['debt_to_penny']}"
        
        params = {
            "sort": "-record_date",
            "page[size]": 1,
            "format": "json"
        }
        
        try:
            client = await self._get_client()
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            records = data.get("data", [])
            
            if not records:
                raise DebtServiceError("No debt data returned from Treasury API")
            
            record = records[0]
            
            # Parse the debt values
            result = {
                "record_date": record.get("record_date"),
                "total_public_debt": self._parse_amount(record.get("tot_pub_debt_out_amt")),
                "debt_held_by_public": self._parse_amount(record.get("debt_held_public_amt")),
                "intragov_holdings": self._parse_amount(record.get("intragov_hold_amt")),
                "source": "Treasury Fiscal Data API",
                "endpoint": url,
                "fetched_at": datetime.utcnow().isoformat()
            }
            
            logger.info(f"Fetched current debt: ${result['total_public_debt']:,.0f}")
            return result
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch current debt: {e}")
            raise DebtServiceError(f"Failed to fetch debt data: {e}")
    
    # =========================================================================
    # HISTORICAL DEBT
    # =========================================================================
    
    async def get_historical_debt(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        frequency: str = "monthly"
    ) -> List[Dict[str, Any]]:
        """
        Get historical debt data.
        
        API: /v2/accounting/od/debt_to_penny
        
        Args:
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            frequency: "daily", "monthly", or "yearly"
            
        Returns:
            List of historical debt records
        """
        url = f"{self.BASE_URL}{self.ENDPOINTS['debt_to_penny']}"
        
        # Default to last 10 years of monthly data
        if not start_date:
            start_date = (datetime.now() - timedelta(days=3650)).strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        
        params = {
            "filter": f"record_date:gte:{start_date},record_date:lte:{end_date}",
            "sort": "-record_date",
            "page[size]": 10000,  # Max
            "format": "json"
        }
        
        try:
            client = await self._get_client()
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            records = data.get("data", [])
            
            # Process records
            results = []
            for record in records:
                results.append({
                    "record_date": record.get("record_date"),
                    "total_public_debt": self._parse_amount(record.get("tot_pub_debt_out_amt")),
                    "debt_held_by_public": self._parse_amount(record.get("debt_held_public_amt")),
                    "intragov_holdings": self._parse_amount(record.get("intragov_hold_amt")),
                })
            
            # Apply frequency filter
            if frequency == "monthly":
                results = self._filter_monthly(results)
            elif frequency == "yearly":
                results = self._filter_yearly(results)
            
            logger.info(f"Fetched {len(results)} historical debt records")
            return results
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch historical debt: {e}")
            raise DebtServiceError(f"Failed to fetch historical debt: {e}")
    
    async def get_debt_by_year(
        self,
        start_year: int = 2000,
        end_year: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Get debt snapshot at end of each fiscal year.
        
        Args:
            start_year: Starting year
            end_year: Ending year (defaults to current)
            
        Returns:
            Yearly debt snapshots
        """
        end_year = end_year or datetime.now().year
        
        historical = await self.get_historical_debt(
            start_date=f"{start_year}-01-01",
            frequency="yearly"
        )
        
        # Filter to fiscal year ends (Sep 30) or closest available date
        yearly_data = []
        for year in range(start_year, end_year + 1):
            # Find record closest to Sep 30 (fiscal year end)
            year_records = [r for r in historical 
                          if r["record_date"].startswith(str(year))]
            if year_records:
                # Get closest to end of September
                sep_records = [r for r in year_records 
                              if r["record_date"].startswith(f"{year}-09")]
                if sep_records:
                    yearly_data.append(sep_records[-1])
                else:
                    # Fall back to last record of year
                    yearly_data.append(year_records[0])
        
        return yearly_data

    # =========================================================================
    # INTEREST EXPENSE
    # =========================================================================
    
    async def get_interest_expense(
        self,
        fiscal_year: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Get interest expense on the national debt.
        
        API: /v2/accounting/od/interest_expense
        
        Args:
            fiscal_year: Fiscal year (defaults to current/previous)
            
        Returns:
            Interest expense data
        """
        url = f"{self.BASE_URL}{self.ENDPOINTS['interest_expense']}"
        
        fy = fiscal_year or self._current_fiscal_year()
        
        params = {
            "filter": f"record_fiscal_year:eq:{fy}",
            "sort": "-record_date",
            "page[size]": 100,
            "format": "json"
        }
        
        try:
            client = await self._get_client()
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            records = data.get("data", [])
            
            # Sum up interest for the fiscal year
            total_interest = sum(
                self._parse_amount(r.get("expense_amt", 0)) 
                for r in records
            )
            
            return {
                "fiscal_year": fy,
                "total_interest_expense": total_interest,
                "record_count": len(records),
                "source": "Treasury Fiscal Data API",
                "fetched_at": datetime.utcnow().isoformat()
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch interest expense: {e}")
            raise DebtServiceError(f"Failed to fetch interest expense: {e}")

    # =========================================================================
    # DEBT CALCULATIONS
    # =========================================================================
    
    async def get_debt_per_capita(
        self,
        population: int = 335_000_000  # ~US population
    ) -> Dict[str, Any]:
        """
        Calculate debt per capita figures.
        
        Args:
            population: US population estimate
            
        Returns:
            Per capita calculations
        """
        current = await self.get_current_debt()
        total_debt = current["total_public_debt"]
        
        # Estimate taxpayer population (~40% of total)
        taxpayer_population = int(population * 0.4)
        
        return {
            "total_debt": total_debt,
            "population": population,
            "debt_per_citizen": total_debt / population,
            "taxpayer_population": taxpayer_population,
            "debt_per_taxpayer": total_debt / taxpayer_population,
            "record_date": current["record_date"],
            "fetched_at": datetime.utcnow().isoformat()
        }
    
    async def get_debt_growth_rate(
        self,
        days: int = 365
    ) -> Dict[str, Any]:
        """
        Calculate daily/monthly debt growth rate.
        
        Args:
            days: Number of days to calculate over
            
        Returns:
            Growth rate statistics
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        historical = await self.get_historical_debt(
            start_date=start_date.strftime("%Y-%m-%d"),
            end_date=end_date.strftime("%Y-%m-%d"),
            frequency="daily"
        )
        
        if len(historical) < 2:
            raise DebtServiceError("Insufficient data for growth calculation")
        
        # Get first and last records
        latest = historical[0]["total_public_debt"]
        oldest = historical[-1]["total_public_debt"]
        
        total_growth = latest - oldest
        daily_growth = total_growth / days
        
        return {
            "start_date": historical[-1]["record_date"],
            "end_date": historical[0]["record_date"],
            "start_debt": oldest,
            "end_debt": latest,
            "total_growth": total_growth,
            "daily_average_growth": daily_growth,
            "monthly_average_growth": daily_growth * 30,
            "yearly_projected_growth": daily_growth * 365,
            "fetched_at": datetime.utcnow().isoformat()
        }

    # =========================================================================
    # DEBT SUMMARY
    # =========================================================================
    
    async def get_debt_summary(self) -> Dict[str, Any]:
        """
        Get comprehensive debt summary.
        
        Returns:
            Complete debt overview including:
            - Current debt totals
            - Per capita figures
            - Growth rates
            - Interest expense
        """
        try:
            current = await self.get_current_debt()
            per_capita = await self.get_debt_per_capita()
            growth = await self.get_debt_growth_rate(days=365)
            
            # Try to get interest (may not have current year data)
            try:
                interest = await self.get_interest_expense()
            except Exception:
                interest = {"total_interest_expense": None, "note": "Data not yet available"}
            
            return {
                "current": current,
                "per_capita": per_capita,
                "growth": growth,
                "interest": interest,
                "fetched_at": datetime.utcnow().isoformat(),
                "source": "Treasury Fiscal Data API"
            }
            
        except Exception as e:
            logger.error(f"Failed to get debt summary: {e}")
            raise DebtServiceError(f"Failed to get debt summary: {e}")

    # =========================================================================
    # UTILITIES
    # =========================================================================
    
    def _parse_amount(self, value: Any) -> float:
        """Parse monetary amount from API response."""
        if value is None:
            return 0.0
        if isinstance(value, (int, float)):
            return float(value)
        try:
            # Remove commas and convert
            return float(str(value).replace(",", ""))
        except (ValueError, TypeError):
            return 0.0
    
    def _current_fiscal_year(self) -> int:
        """Get current fiscal year (Oct 1 - Sep 30)."""
        today = datetime.now()
        if today.month >= 10:
            return today.year + 1
        return today.year
    
    def _filter_monthly(self, records: List[Dict]) -> List[Dict]:
        """Filter to one record per month (last of month)."""
        monthly = {}
        for record in records:
            date = record["record_date"]
            month_key = date[:7]  # YYYY-MM
            if month_key not in monthly:
                monthly[month_key] = record
        return list(monthly.values())
    
    def _filter_yearly(self, records: List[Dict]) -> List[Dict]:
        """Filter to one record per year (end of year)."""
        yearly = {}
        for record in records:
            date = record["record_date"]
            year_key = date[:4]  # YYYY
            if year_key not in yearly:
                yearly[year_key] = record
        return list(yearly.values())
    
    def format_debt(self, amount: float) -> str:
        """Format debt amount for display."""
        if amount >= 1_000_000_000_000:
            return f"${amount / 1_000_000_000_000:.2f} Trillion"
        elif amount >= 1_000_000_000:
            return f"${amount / 1_000_000_000:.2f} Billion"
        else:
            return f"${amount:,.0f}"


# =========================================================================
# MODULE-LEVEL CONVENIENCE FUNCTIONS
# =========================================================================

async def get_current_national_debt() -> Dict[str, Any]:
    """
    Convenience function to get current national debt.
    
    Usage:
        from app.services.debt_service import get_current_national_debt
        debt = await get_current_national_debt()
    """
    service = TreasuryDebtService()
    try:
        return await service.get_current_debt()
    finally:
        await service.close()


async def get_debt_overview() -> Dict[str, Any]:
    """Convenience function to get full debt summary."""
    service = TreasuryDebtService()
    try:
        return await service.get_debt_summary()
    finally:
        await service.close()
