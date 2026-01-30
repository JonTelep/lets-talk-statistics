"""
Immigration Data Service

Fetches border crossing and immigration-related data from government sources.

Data Sources:
1. Bureau of Transportation Statistics (BTS) Border Crossing API
   - Port-level crossing data (trucks, buses, passengers, pedestrians)
   - Monthly updates going back decades
   - URL: https://data.bts.gov/resource/keg4-3bc2.json

2. DHS Immigration Statistics (Limited API availability)
   - Historical yearbook data (mostly PDFs)
   - For now, we cache and serve known historical data

Note: CBP/DHS enforcement data (encounters, apprehensions) does not have a 
structured public API. We include historical data points sourced from
official DHS yearbooks and CBP press releases.
"""

import asyncio
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import httpx

from app.config import get_settings
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class ImmigrationServiceError(Exception):
    """Custom exception for immigration service errors."""
    pass


class ImmigrationService:
    """
    Service for fetching immigration and border crossing data.
    
    Uses BTS Socrata API for border crossing data.
    Includes historical DHS data from official sources.
    """
    
    # BTS Border Crossing API (Socrata)
    BTS_BASE_URL = "https://data.bts.gov/resource/keg4-3bc2.json"
    TIMEOUT = 30
    
    # Historical enforcement data from DHS/CBP official sources
    # Source: DHS Immigration Yearbook, CBP Monthly Operational Updates
    HISTORICAL_ENFORCEMENT = [
        {"fiscal_year": 2024, "legal_admissions": 1016000, "removals": 142580, 
         "border_encounters": 2475669, "source": "DHS FY2024 Yearbook"},
        {"fiscal_year": 2023, "legal_admissions": 1100000, "removals": 142580, 
         "border_encounters": 2045838, "source": "DHS FY2023 Yearbook"},
        {"fiscal_year": 2022, "legal_admissions": 1080000, "removals": 72177, 
         "border_encounters": 2378944, "source": "DHS FY2022 Yearbook"},
        {"fiscal_year": 2021, "legal_admissions": 740000, "removals": 59011, 
         "border_encounters": 1734686, "source": "DHS FY2021 Yearbook"},
        {"fiscal_year": 2020, "legal_admissions": 707362, "removals": 185884, 
         "border_encounters": 458088, "source": "DHS FY2020 Yearbook"},
        {"fiscal_year": 2019, "legal_admissions": 1031765, "removals": 267258, 
         "border_encounters": 977509, "source": "DHS FY2019 Yearbook"},
        {"fiscal_year": 2018, "legal_admissions": 1096611, "removals": 256085, 
         "border_encounters": 521090, "source": "DHS FY2018 Yearbook"},
        {"fiscal_year": 2017, "legal_admissions": 1127167, "removals": 226119, 
         "border_encounters": 415816, "source": "DHS FY2017 Yearbook"},
        {"fiscal_year": 2016, "legal_admissions": 1183505, "removals": 240255, 
         "border_encounters": 553378, "source": "DHS FY2016 Yearbook"},
        {"fiscal_year": 2015, "legal_admissions": 1051031, "removals": 235413, 
         "border_encounters": 444859, "source": "DHS FY2015 Yearbook"},
    ]
    
    # Top source countries for legal immigration (FY2024)
    TOP_SOURCE_COUNTRIES = [
        {"country": "Mexico", "admissions": 129451, "percentage": 12.7},
        {"country": "India", "admissions": 104584, "percentage": 10.3},
        {"country": "China", "admissions": 75867, "percentage": 7.5},
        {"country": "Philippines", "admissions": 54329, "percentage": 5.3},
        {"country": "Cuba", "admissions": 52785, "percentage": 5.2},
        {"country": "Dominican Republic", "admissions": 50934, "percentage": 5.0},
        {"country": "Vietnam", "admissions": 35547, "percentage": 3.5},
        {"country": "El Salvador", "admissions": 28234, "percentage": 2.8},
        {"country": "Haiti", "admissions": 26138, "percentage": 2.6},
        {"country": "South Korea", "admissions": 22765, "percentage": 2.2},
    ]
    
    # Immigration by category (FY2024)
    IMMIGRATION_BY_CATEGORY = [
        {"category": "Family-Based", "count": 556472, "percent": 54.8},
        {"category": "Employment-Based", "count": 204467, "percent": 20.1},
        {"category": "Refugees & Asylees", "count": 154987, "percent": 15.3},
        {"category": "Diversity Lottery", "count": 54872, "percent": 5.4},
        {"category": "Other", "count": 45202, "percent": 4.4},
    ]
    
    def __init__(self):
        """Initialize the immigration service."""
        self.client = None
        
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client."""
        if self.client is None:
            self.client = httpx.AsyncClient(
                timeout=self.TIMEOUT,
                headers={
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
    # BTS BORDER CROSSING DATA
    # =========================================================================
    
    async def get_border_crossings(
        self,
        border: Optional[str] = None,
        measure: Optional[str] = None,
        state: Optional[str] = None,
        year: Optional[int] = None,
        limit: int = 1000
    ) -> Dict[str, Any]:
        """
        Get border crossing data from BTS.
        
        Args:
            border: "US-Mexico Border" or "US-Canada Border"
            measure: "Personal Vehicles", "Trucks", "Bus Passengers", etc.
            state: State name (e.g., "Texas", "California")
            year: Filter by year
            limit: Max records to return
            
        Returns:
            Border crossing data with aggregations
        """
        try:
            client = await self._get_client()
            
            # Build Socrata query
            params = {"$limit": limit, "$order": "date DESC"}
            
            where_clauses = []
            if border:
                where_clauses.append(f"border='{border}'")
            if measure:
                where_clauses.append(f"measure='{measure}'")
            if state:
                where_clauses.append(f"state='{state}'")
            if year:
                where_clauses.append(f"date >= '{year}-01-01' AND date < '{year+1}-01-01'")
            
            if where_clauses:
                params["$where"] = " AND ".join(where_clauses)
            
            response = await client.get(self.BTS_BASE_URL, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            # Aggregate by month and measure
            aggregated = self._aggregate_crossings(data)
            
            return {
                "source": "Bureau of Transportation Statistics",
                "api_url": "https://data.bts.gov/resource/keg4-3bc2.json",
                "fetched_at": datetime.now().isoformat(),
                "filters": {
                    "border": border,
                    "measure": measure,
                    "state": state,
                    "year": year
                },
                "record_count": len(data),
                "data": data,
                "aggregations": aggregated
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch BTS data: {e}")
            raise ImmigrationServiceError(f"Failed to fetch border crossing data: {e}")
    
    def _aggregate_crossings(self, data: List[Dict]) -> Dict[str, Any]:
        """Aggregate crossing data by month and measure."""
        by_month = {}
        by_measure = {}
        by_border = {"US-Mexico Border": 0, "US-Canada Border": 0}
        
        for record in data:
            # By month
            date = record.get("date", "")[:7]  # YYYY-MM
            if date:
                value = int(record.get("value", 0))
                by_month[date] = by_month.get(date, 0) + value
                
                # By measure
                measure = record.get("measure", "Unknown")
                by_measure[measure] = by_measure.get(measure, 0) + value
                
                # By border
                border = record.get("border", "")
                if border in by_border:
                    by_border[border] += value
        
        return {
            "by_month": dict(sorted(by_month.items(), reverse=True)[:12]),
            "by_measure": by_measure,
            "by_border": by_border
        }
    
    async def get_monthly_crossing_summary(
        self,
        months: int = 12
    ) -> Dict[str, Any]:
        """
        Get summary of border crossings for the last N months.
        
        Args:
            months: Number of months to include
            
        Returns:
            Monthly summary data
        """
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=months * 31)
        
        try:
            client = await self._get_client()
            
            params = {
                "$limit": 10000,
                "$where": f"date >= '{start_date.strftime('%Y-%m-%d')}'",
                "$order": "date DESC"
            }
            
            response = await client.get(self.BTS_BASE_URL, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            # Process monthly totals
            monthly_totals = {}
            for record in data:
                date = record.get("date", "")[:7]  # YYYY-MM
                if date:
                    value = int(record.get("value", 0))
                    border = record.get("border", "Unknown")
                    
                    if date not in monthly_totals:
                        monthly_totals[date] = {
                            "mexico": 0,
                            "canada": 0,
                            "total": 0
                        }
                    
                    monthly_totals[date]["total"] += value
                    if "Mexico" in border:
                        monthly_totals[date]["mexico"] += value
                    elif "Canada" in border:
                        monthly_totals[date]["canada"] += value
            
            return {
                "source": "Bureau of Transportation Statistics",
                "fetched_at": datetime.now().isoformat(),
                "period": f"Last {months} months",
                "monthly_crossings": dict(sorted(monthly_totals.items(), reverse=True))
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch BTS summary: {e}")
            raise ImmigrationServiceError(f"Failed to fetch crossing summary: {e}")
    
    # =========================================================================
    # HISTORICAL ENFORCEMENT DATA
    # =========================================================================
    
    async def get_historical_enforcement(
        self,
        start_year: Optional[int] = None,
        end_year: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Get historical enforcement data (legal admissions, removals, encounters).
        
        Note: This data is from official DHS yearbooks but is cached here
        because DHS does not provide a structured API.
        
        Args:
            start_year: Start fiscal year
            end_year: End fiscal year
            
        Returns:
            Historical enforcement statistics
        """
        data = self.HISTORICAL_ENFORCEMENT
        
        if start_year:
            data = [d for d in data if d["fiscal_year"] >= start_year]
        if end_year:
            data = [d for d in data if d["fiscal_year"] <= end_year]
        
        # Calculate trends
        if len(data) >= 2:
            latest = data[0]
            previous = data[1]
            
            trends = {
                "legal_admissions": {
                    "change": latest["legal_admissions"] - previous["legal_admissions"],
                    "percent_change": round(
                        (latest["legal_admissions"] - previous["legal_admissions"]) 
                        / previous["legal_admissions"] * 100, 1
                    )
                },
                "removals": {
                    "change": latest["removals"] - previous["removals"],
                    "percent_change": round(
                        (latest["removals"] - previous["removals"]) 
                        / previous["removals"] * 100, 1
                    )
                },
                "border_encounters": {
                    "change": latest["border_encounters"] - previous["border_encounters"],
                    "percent_change": round(
                        (latest["border_encounters"] - previous["border_encounters"]) 
                        / previous["border_encounters"] * 100, 1
                    )
                }
            }
        else:
            trends = None
        
        return {
            "source": "DHS Immigration Statistics Yearbook",
            "note": "Data compiled from official DHS publications",
            "fetched_at": datetime.now().isoformat(),
            "data": data,
            "trends": trends,
            "latest": data[0] if data else None
        }
    
    async def get_immigration_by_category(self) -> Dict[str, Any]:
        """
        Get immigration breakdown by admission category.
        
        Returns:
            Immigration by category (family, employment, refugee, etc.)
        """
        return {
            "source": "DHS Immigration Statistics Yearbook FY2024",
            "fetched_at": datetime.now().isoformat(),
            "fiscal_year": 2024,
            "categories": self.IMMIGRATION_BY_CATEGORY,
            "total": sum(c["count"] for c in self.IMMIGRATION_BY_CATEGORY)
        }
    
    async def get_top_source_countries(
        self,
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Get top source countries for legal immigration.
        
        Args:
            limit: Number of countries to return
            
        Returns:
            Top source countries with admission counts
        """
        return {
            "source": "DHS Immigration Statistics Yearbook FY2024",
            "fetched_at": datetime.now().isoformat(),
            "fiscal_year": 2024,
            "countries": self.TOP_SOURCE_COUNTRIES[:limit],
            "total_countries_in_data": len(self.TOP_SOURCE_COUNTRIES)
        }
    
    async def get_summary_stats(self) -> Dict[str, Any]:
        """
        Get summary immigration statistics (latest available data).
        
        Returns:
            Summary statistics for display
        """
        latest = self.HISTORICAL_ENFORCEMENT[0]
        
        # Calculate ratio
        ratio = round(latest["legal_admissions"] / latest["removals"], 1)
        net_migration = latest["legal_admissions"] - latest["removals"]
        
        return {
            "source": "DHS Immigration Statistics",
            "fetched_at": datetime.now().isoformat(),
            "fiscal_year": latest["fiscal_year"],
            "summary": {
                "legal_admissions": latest["legal_admissions"],
                "removals": latest["removals"],
                "border_encounters": latest["border_encounters"],
                "admission_to_removal_ratio": f"{ratio}:1",
                "net_legal_migration": net_migration
            },
            "labels": {
                "legal_admissions": "Lawful Permanent Residents (Green Cards)",
                "removals": "Removals (Deportations by ICE ERO)",
                "border_encounters": "CBP Southwest Border Encounters"
            }
        }


# Singleton instance
_service: Optional[ImmigrationService] = None


def get_immigration_service() -> ImmigrationService:
    """Get or create the immigration service singleton."""
    global _service
    if _service is None:
        _service = ImmigrationService()
    return _service
