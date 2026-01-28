"""
Unified government data service.

Simple approach:
1. Fetch from government APIs
2. Cache responses as JSON files
3. Serve from cache when fresh, re-fetch when stale

No Redis. No Celery. No PostgreSQL. Just files.
"""

import json
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Optional

import httpx

from app.config import get_settings

settings = get_settings()


class GovDataService:
    """
    Unified service for fetching and caching government data.
    
    Supported sources:
    - Treasury: National debt data
    - BLS: Employment statistics  
    - Census: Population data
    - FEC: Election/campaign finance data
    """
    
    def __init__(self):
        self.cache_dir = settings.data_dir / "cache"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.client = httpx.AsyncClient(timeout=30.0)
    
    def _cache_path(self, key: str) -> Path:
        """Get cache file path for a given key."""
        safe_key = hashlib.md5(key.encode()).hexdigest()
        return self.cache_dir / f"{safe_key}.json"
    
    def _is_cache_fresh(self, cache_path: Path, ttl_hours: int = None) -> bool:
        """Check if cached data is still fresh."""
        if not cache_path.exists():
            return False
        
        ttl = ttl_hours or settings.cache_ttl_hours
        mtime = datetime.fromtimestamp(cache_path.stat().st_mtime)
        return datetime.now() - mtime < timedelta(hours=ttl)
    
    def _read_cache(self, key: str) -> Optional[dict]:
        """Read data from cache if fresh."""
        cache_path = self._cache_path(key)
        if self._is_cache_fresh(cache_path):
            return json.loads(cache_path.read_text())
        return None
    
    def _write_cache(self, key: str, data: dict) -> None:
        """Write data to cache."""
        cache_path = self._cache_path(key)
        cache_path.write_text(json.dumps(data, indent=2, default=str))
    
    async def _fetch_json(self, url: str, params: dict = None) -> dict:
        """Fetch JSON from URL with error handling."""
        try:
            resp = await self.client.get(url, params=params)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as e:
            raise DataFetchError(f"Failed to fetch {url}: {e}")
    
    # ==================== TREASURY (Debt) ====================
    
    async def get_national_debt(self, days: int = 365) -> dict:
        """
        Get national debt data from Treasury API.
        
        Source: https://fiscaldata.treasury.gov/
        Updates: Daily (but historical data is static)
        """
        cache_key = f"treasury_debt_{days}"
        
        if cached := self._read_cache(cache_key):
            return cached
        
        # Treasury Fiscal Data API
        url = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny"
        params = {
            "sort": "-record_date",
            "page[size]": min(days, 10000),
            "fields": "record_date,tot_pub_debt_out_amt"
        }
        
        data = await self._fetch_json(url, params)
        
        # Simplify response
        result = {
            "source": "U.S. Treasury Fiscal Data",
            "fetched_at": datetime.now().isoformat(),
            "data": [
                {
                    "date": record["record_date"],
                    "total_debt": float(record["tot_pub_debt_out_amt"])
                }
                for record in data.get("data", [])
            ]
        }
        
        self._write_cache(cache_key, result)
        return result
    
    # ==================== BLS (Employment) ====================
    
    async def get_unemployment_rate(self, years: int = 5) -> dict:
        """
        Get unemployment rate from Bureau of Labor Statistics.
        
        Source: https://www.bls.gov/
        Updates: Monthly
        Series: LNS14000000 (Unemployment Rate)
        """
        cache_key = f"bls_unemployment_{years}"
        
        if cached := self._read_cache(cache_key):
            return cached
        
        # BLS Public Data API (no key needed for basic access)
        url = "https://api.bls.gov/publicAPI/v2/timeseries/data/"
        
        end_year = datetime.now().year
        start_year = end_year - years
        
        payload = {
            "seriesid": ["LNS14000000"],  # Unemployment rate
            "startyear": str(start_year),
            "endyear": str(end_year),
        }
        
        # Add API key if available for higher rate limits
        if settings.bls_api_key:
            payload["registrationkey"] = settings.bls_api_key
        
        resp = await self.client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        
        # Parse BLS response format
        series_data = data.get("Results", {}).get("series", [{}])[0].get("data", [])
        
        result = {
            "source": "Bureau of Labor Statistics",
            "series": "LNS14000000",
            "fetched_at": datetime.now().isoformat(),
            "data": [
                {
                    "year": int(item["year"]),
                    "month": int(item["period"].replace("M", "")),
                    "rate": float(item["value"])
                }
                for item in series_data
                if item["period"].startswith("M")  # Monthly data only
            ]
        }
        
        self._write_cache(cache_key, result)
        return result
    
    # ==================== CENSUS (Population) ====================
    
    async def get_state_populations(self, year: int = None) -> dict:
        """
        Get state population estimates from Census Bureau.
        
        Source: https://www.census.gov/
        Updates: Annually
        """
        year = year or datetime.now().year - 1  # Previous year usually has data
        cache_key = f"census_population_{year}"
        
        if cached := self._read_cache(cache_key):
            return cached
        
        # Census Population Estimates API
        url = f"https://api.census.gov/data/{year}/pep/population"
        params = {
            "get": "NAME,POP",
            "for": "state:*"
        }
        
        if settings.census_api_key:
            params["key"] = settings.census_api_key
        
        data = await self._fetch_json(url, params)
        
        # First row is headers
        headers = data[0]
        rows = data[1:]
        
        result = {
            "source": "U.S. Census Bureau",
            "year": year,
            "fetched_at": datetime.now().isoformat(),
            "data": [
                {
                    "state": row[0],
                    "population": int(row[1]),
                    "fips": row[2]
                }
                for row in rows
            ]
        }
        
        self._write_cache(cache_key, result)
        return result
    
    # ==================== FEC (Elections) ====================
    
    async def get_candidate_totals(self, cycle: int = None) -> dict:
        """
        Get candidate fundraising totals from FEC.
        
        Source: https://www.fec.gov/
        Updates: Varies (filings-based)
        """
        cycle = cycle or (datetime.now().year if datetime.now().year % 2 == 0 else datetime.now().year - 1)
        cache_key = f"fec_candidates_{cycle}"
        
        if cached := self._read_cache(cache_key):
            return cached
        
        # FEC OpenFEC API
        url = "https://api.open.fec.gov/v1/candidates/totals/"
        params = {
            "cycle": cycle,
            "sort": "-receipts",
            "per_page": 100,
            "is_active_candidate": True,
        }
        
        if settings.fec_api_key:
            params["api_key"] = settings.fec_api_key
        else:
            params["api_key"] = "DEMO_KEY"  # FEC allows demo key for limited access
        
        data = await self._fetch_json(url, params)
        
        result = {
            "source": "Federal Election Commission",
            "cycle": cycle,
            "fetched_at": datetime.now().isoformat(),
            "data": [
                {
                    "name": c.get("name"),
                    "party": c.get("party"),
                    "office": c.get("office"),
                    "state": c.get("state"),
                    "receipts": c.get("receipts"),
                    "disbursements": c.get("disbursements"),
                }
                for c in data.get("results", [])
            ]
        }
        
        self._write_cache(cache_key, result)
        return result
    
    async def get_budget_data(self, fiscal_year: int = None) -> dict:
        """
        Get federal budget data from Treasury.
        
        Source: https://fiscaldata.treasury.gov/
        """
        fiscal_year = fiscal_year or datetime.now().year
        cache_key = f"treasury_budget_{fiscal_year}"
        
        if cached := self._read_cache(cache_key):
            return cached
        
        # Monthly Treasury Statement
        url = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_5"
        params = {
            "filter": f"record_fiscal_year:eq:{fiscal_year}",
            "sort": "-record_date",
            "page[size]": 1000,
        }
        
        data = await self._fetch_json(url, params)
        
        result = {
            "source": "U.S. Treasury Monthly Statement",
            "fiscal_year": fiscal_year,
            "fetched_at": datetime.now().isoformat(),
            "data": data.get("data", [])
        }
        
        self._write_cache(cache_key, result)
        return result
    
    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()


class DataFetchError(Exception):
    """Raised when data fetching fails."""
    pass


# Singleton instance
_service: Optional[GovDataService] = None


def get_gov_data_service() -> GovDataService:
    """Get or create the gov data service singleton."""
    global _service
    if _service is None:
        _service = GovDataService()
    return _service
