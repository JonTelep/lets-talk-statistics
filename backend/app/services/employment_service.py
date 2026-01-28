"""
Bureau of Labor Statistics (BLS) Employment Data Service

Fetches employment statistics from the official BLS Public Data API.
Documentation: https://www.bls.gov/developers/

Data includes:
- Unemployment rate (national, state, demographic)
- Nonfarm payroll employment
- Labor force participation
- Employment by sector

API v2 registration (free): https://data.bls.gov/registrationEngine/
For higher rate limits, get an API key.
"""

import asyncio
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import httpx

from app.config import get_settings
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class EmploymentServiceError(Exception):
    """Custom exception for employment service errors."""
    pass


class BLSEmploymentService:
    """
    Service for fetching employment data from Bureau of Labor Statistics.
    
    BLS API provides time series data for various economic indicators.
    
    API Base URL: https://api.bls.gov/publicAPI/v2/
    Documentation: https://www.bls.gov/developers/api_signature_v2.htm
    
    Key Series IDs:
    - LNS14000000: Unemployment Rate (seasonally adjusted)
    - CES0000000001: Total Nonfarm Employment
    - LNS11300000: Labor Force Participation Rate
    - LNS12000000: Employment Level
    - LNS13000000: Unemployment Level
    """
    
    BASE_URL = "https://api.bls.gov/publicAPI/v2"
    TIMEOUT = 30  # seconds
    
    # Key Series IDs for employment data
    SERIES_IDS = {
        # National Unemployment Rate (Seasonally Adjusted)
        "unemployment_rate": "LNS14000000",
        
        # Total Nonfarm Payroll Employment
        "nonfarm_employment": "CES0000000001",
        
        # Civilian Labor Force Level
        "labor_force": "LNS11000000",
        
        # Labor Force Participation Rate
        "participation_rate": "LNS11300000",
        
        # Employment Level
        "employed": "LNS12000000",
        
        # Unemployment Level
        "unemployed": "LNS13000000",
        
        # Demographic Unemployment Rates
        "unemployment_men": "LNS14000001",      # Adult Men (20+)
        "unemployment_women": "LNS14000002",    # Adult Women (20+)
        "unemployment_teen": "LNS14000012",     # Teenagers (16-19)
        "unemployment_white": "LNS14000003",    # White
        "unemployment_black": "LNS14000006",    # Black or African American
        "unemployment_asian": "LNS14032183",    # Asian
        "unemployment_hispanic": "LNS14000009", # Hispanic or Latino
        
        # Industry Employment (Nonfarm)
        "mining": "CES1000000001",
        "construction": "CES2000000001",
        "manufacturing": "CES3000000001",
        "wholesale_trade": "CES4142000001",
        "retail_trade": "CES4200000001",
        "transportation": "CES4300000001",
        "information": "CES5000000001",
        "financial": "CES5500000001",
        "professional_services": "CES6000000001",
        "education_health": "CES6500000001",
        "leisure_hospitality": "CES7000000001",
        "government": "CES9000000001",
    }
    
    # State unemployment rate series (LAUST prefixes)
    STATE_CODES = {
        "AL": "01", "AK": "02", "AZ": "04", "AR": "05", "CA": "06",
        "CO": "08", "CT": "09", "DE": "10", "DC": "11", "FL": "12",
        "GA": "13", "HI": "15", "ID": "16", "IL": "17", "IN": "18",
        "IA": "19", "KS": "20", "KY": "21", "LA": "22", "ME": "23",
        "MD": "24", "MA": "25", "MI": "26", "MN": "27", "MS": "28",
        "MO": "29", "MT": "30", "NE": "31", "NV": "32", "NH": "33",
        "NJ": "34", "NM": "35", "NY": "36", "NC": "37", "ND": "38",
        "OH": "39", "OK": "40", "OR": "41", "PA": "42", "RI": "44",
        "SC": "45", "SD": "46", "TN": "47", "TX": "48", "UT": "49",
        "VT": "50", "VA": "51", "WA": "53", "WV": "54", "WI": "55",
        "WY": "56"
    }
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the BLS Employment service.
        
        Args:
            api_key: Optional BLS API key for higher rate limits
        """
        self.api_key = api_key or getattr(settings, 'bls_api_key', None)
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
    # CORE API METHODS
    # =========================================================================
    
    async def fetch_series(
        self,
        series_ids: List[str],
        start_year: Optional[int] = None,
        end_year: Optional[int] = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Fetch time series data from BLS API.
        
        API: POST /publicAPI/v2/timeseries/data/
        
        Args:
            series_ids: List of BLS series IDs
            start_year: Starting year
            end_year: Ending year
            
        Returns:
            Dict mapping series IDs to their data
        """
        url = f"{self.BASE_URL}/timeseries/data/"
        
        # Default to last 5 years
        end_year = end_year or datetime.now().year
        start_year = start_year or (end_year - 5)
        
        payload = {
            "seriesid": series_ids,
            "startyear": str(start_year),
            "endyear": str(end_year),
        }
        
        # Add API key if available (higher rate limits)
        if self.api_key:
            payload["registrationkey"] = self.api_key
        
        try:
            client = await self._get_client()
            response = await client.post(url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status") != "REQUEST_SUCCEEDED":
                raise EmploymentServiceError(f"BLS API error: {data.get('message', 'Unknown error')}")
            
            # Parse results into dict by series ID
            results = {}
            for series in data.get("Results", {}).get("series", []):
                series_id = series.get("seriesID")
                series_data = []
                
                for item in series.get("data", []):
                    series_data.append({
                        "year": int(item.get("year")),
                        "period": item.get("period"),  # M01-M12 for months
                        "value": float(item.get("value")),
                        "footnotes": item.get("footnotes", [])
                    })
                
                results[series_id] = series_data
            
            logger.info(f"Fetched {len(results)} BLS series")
            return results
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch BLS data: {e}")
            raise EmploymentServiceError(f"Failed to fetch BLS data: {e}")

    # =========================================================================
    # UNEMPLOYMENT DATA
    # =========================================================================
    
    async def get_unemployment_rate(
        self,
        months: int = 12
    ) -> List[Dict[str, Any]]:
        """
        Get national unemployment rate time series.
        
        Args:
            months: Number of months of data
            
        Returns:
            Monthly unemployment rate data
        """
        years_needed = (months // 12) + 2
        end_year = datetime.now().year
        start_year = end_year - years_needed
        
        data = await self.fetch_series(
            [self.SERIES_IDS["unemployment_rate"]],
            start_year,
            end_year
        )
        
        series = data.get(self.SERIES_IDS["unemployment_rate"], [])
        
        # Convert to standard format and limit
        result = []
        for item in series[:months]:
            month_num = int(item["period"][1:])  # M01 -> 1
            result.append({
                "year": item["year"],
                "month": month_num,
                "month_name": datetime(2000, month_num, 1).strftime("%B"),
                "unemployment_rate": item["value"],
            })
        
        return result
    
    async def get_unemployment_by_demographic(self) -> Dict[str, float]:
        """
        Get latest unemployment rates by demographic group.
        
        Returns:
            Dict of demographic group -> unemployment rate
        """
        demographic_series = {
            "Adult Men (20+)": self.SERIES_IDS["unemployment_men"],
            "Adult Women (20+)": self.SERIES_IDS["unemployment_women"],
            "Teenagers (16-19)": self.SERIES_IDS["unemployment_teen"],
            "White": self.SERIES_IDS["unemployment_white"],
            "Black or African American": self.SERIES_IDS["unemployment_black"],
            "Asian": self.SERIES_IDS["unemployment_asian"],
            "Hispanic or Latino": self.SERIES_IDS["unemployment_hispanic"],
        }
        
        series_ids = list(demographic_series.values())
        data = await self.fetch_series(series_ids)
        
        # Get most recent value for each
        result = {}
        for name, series_id in demographic_series.items():
            series_data = data.get(series_id, [])
            if series_data:
                result[name] = series_data[0]["value"]
        
        return result

    async def get_state_unemployment(self) -> List[Dict[str, Any]]:
        """
        Get unemployment rates by state.
        
        Note: BLS state data uses different series format.
        Uses LAUST (Local Area Unemployment Statistics).
        
        Returns:
            List of states with unemployment rates
        """
        # State unemployment series: LASST{state_code}0000000000003
        series_ids = []
        state_mapping = {}
        
        for state_abbr, state_code in self.STATE_CODES.items():
            series_id = f"LASST{state_code}0000000000003"
            series_ids.append(series_id)
            state_mapping[series_id] = state_abbr
        
        # BLS API limits to 50 series per request
        data = await self.fetch_series(series_ids[:50])
        
        results = []
        for series_id, series_data in data.items():
            if series_data:
                state_abbr = state_mapping.get(series_id, "Unknown")
                results.append({
                    "state": state_abbr,
                    "unemployment_rate": series_data[0]["value"],
                    "year": series_data[0]["year"],
                    "month": series_data[0]["period"]
                })
        
        # Sort by unemployment rate
        results.sort(key=lambda x: x["unemployment_rate"])
        
        return results

    # =========================================================================
    # EMPLOYMENT DATA
    # =========================================================================
    
    async def get_employment_summary(self) -> Dict[str, Any]:
        """
        Get comprehensive employment summary.
        
        Returns:
            Summary including unemployment rate, labor force, employed, etc.
        """
        series_ids = [
            self.SERIES_IDS["unemployment_rate"],
            self.SERIES_IDS["labor_force"],
            self.SERIES_IDS["employed"],
            self.SERIES_IDS["unemployed"],
            self.SERIES_IDS["participation_rate"],
            self.SERIES_IDS["nonfarm_employment"],
        ]
        
        data = await self.fetch_series(series_ids)
        
        def get_latest(series_id):
            series = data.get(series_id, [])
            return series[0] if series else None
        
        unemployment = get_latest(self.SERIES_IDS["unemployment_rate"])
        labor_force = get_latest(self.SERIES_IDS["labor_force"])
        employed = get_latest(self.SERIES_IDS["employed"])
        unemployed = get_latest(self.SERIES_IDS["unemployed"])
        participation = get_latest(self.SERIES_IDS["participation_rate"])
        nonfarm = get_latest(self.SERIES_IDS["nonfarm_employment"])
        
        return {
            "unemployment_rate": unemployment["value"] if unemployment else None,
            "labor_force": labor_force["value"] * 1000 if labor_force else None,  # BLS reports in thousands
            "employed": employed["value"] * 1000 if employed else None,
            "unemployed": unemployed["value"] * 1000 if unemployed else None,
            "participation_rate": participation["value"] if participation else None,
            "nonfarm_employment": nonfarm["value"] * 1000 if nonfarm else None,
            "period": {
                "year": unemployment["year"] if unemployment else None,
                "month": unemployment["period"] if unemployment else None,
            },
            "source": "Bureau of Labor Statistics",
            "fetched_at": datetime.utcnow().isoformat()
        }
    
    async def get_jobs_by_sector(self) -> List[Dict[str, Any]]:
        """
        Get employment numbers by industry sector.
        
        Returns:
            List of sectors with employment counts
        """
        sector_series = {
            "Mining and Logging": self.SERIES_IDS["mining"],
            "Construction": self.SERIES_IDS["construction"],
            "Manufacturing": self.SERIES_IDS["manufacturing"],
            "Wholesale Trade": self.SERIES_IDS["wholesale_trade"],
            "Retail Trade": self.SERIES_IDS["retail_trade"],
            "Transportation": self.SERIES_IDS["transportation"],
            "Information": self.SERIES_IDS["information"],
            "Financial Activities": self.SERIES_IDS["financial"],
            "Professional & Business Services": self.SERIES_IDS["professional_services"],
            "Education & Health Services": self.SERIES_IDS["education_health"],
            "Leisure & Hospitality": self.SERIES_IDS["leisure_hospitality"],
            "Government": self.SERIES_IDS["government"],
        }
        
        series_ids = list(sector_series.values())
        data = await self.fetch_series(series_ids)
        
        results = []
        for name, series_id in sector_series.items():
            series_data = data.get(series_id, [])
            if series_data and len(series_data) >= 2:
                current = series_data[0]["value"]
                previous = series_data[1]["value"]
                change = current - previous
                
                results.append({
                    "sector": name,
                    "employment": current * 1000,  # BLS reports in thousands
                    "monthly_change": change * 1000,
                    "percent_change": ((current - previous) / previous * 100) if previous else 0,
                })
        
        # Sort by employment size
        results.sort(key=lambda x: x["employment"], reverse=True)
        
        return results

    # =========================================================================
    # JOBS REPORTS
    # =========================================================================
    
    async def get_jobs_added(self, months: int = 12) -> List[Dict[str, Any]]:
        """
        Get monthly jobs added (nonfarm payroll change).
        
        Args:
            months: Number of months
            
        Returns:
            Monthly jobs added data
        """
        years_needed = (months // 12) + 2
        end_year = datetime.now().year
        start_year = end_year - years_needed
        
        data = await self.fetch_series(
            [self.SERIES_IDS["nonfarm_employment"]],
            start_year,
            end_year
        )
        
        series = data.get(self.SERIES_IDS["nonfarm_employment"], [])
        
        results = []
        for i, item in enumerate(series[:months]):
            jobs_added = None
            if i + 1 < len(series):
                jobs_added = (item["value"] - series[i + 1]["value"]) * 1000
            
            month_num = int(item["period"][1:])
            results.append({
                "year": item["year"],
                "month": month_num,
                "month_name": datetime(2000, month_num, 1).strftime("%B %Y").replace("2000", str(item["year"])),
                "nonfarm_employment": item["value"] * 1000,
                "jobs_added": jobs_added,
            })
        
        return results

    # =========================================================================
    # COMBINED REPORTS
    # =========================================================================
    
    async def get_full_employment_report(self) -> Dict[str, Any]:
        """
        Get comprehensive employment report combining all metrics.
        
        Returns:
            Full employment report
        """
        try:
            summary = await self.get_employment_summary()
            unemployment_trend = await self.get_unemployment_rate(months=12)
            demographics = await self.get_unemployment_by_demographic()
            sectors = await self.get_jobs_by_sector()
            jobs_added = await self.get_jobs_added(months=12)
            
            return {
                "summary": summary,
                "unemployment_trend": unemployment_trend,
                "demographics": demographics,
                "sectors": sectors,
                "jobs_added": jobs_added,
                "source": "Bureau of Labor Statistics",
                "fetched_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get full employment report: {e}")
            raise EmploymentServiceError(f"Failed to get employment report: {e}")


# =========================================================================
# MODULE-LEVEL CONVENIENCE FUNCTIONS
# =========================================================================

async def get_employment_summary() -> Dict[str, Any]:
    """Convenience function to get employment summary."""
    service = BLSEmploymentService()
    try:
        return await service.get_employment_summary()
    finally:
        await service.close()


async def get_unemployment_rate() -> List[Dict[str, Any]]:
    """Convenience function to get unemployment rate trend."""
    service = BLSEmploymentService()
    try:
        return await service.get_unemployment_rate()
    finally:
        await service.close()
