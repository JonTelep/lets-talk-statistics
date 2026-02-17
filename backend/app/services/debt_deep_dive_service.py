"""
Debt deep-dive service — composition, interest, rates, foreign holders, GDP ratio.

Data sources:
- FRED (Federal Reserve Economic Data): Debt holders, Debt-to-GDP ratio
- Treasury Fiscal Data API: Interest expense, Average interest rates
- Treasury TIC (Treasury International Capital): Foreign holders by country

Extends ``BaseGovService`` for HTTP client, retries, and file-based caching.
"""

import asyncio
import re
from datetime import datetime
from typing import Any, Optional

from app.config import get_settings
from app.services.base import BaseGovService, ServiceError
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)

# FRED series IDs for debt holder composition (all quarterly)
FRED_SERIES = {
    "federal_reserve": "FDHBFRBN",          # Fed Reserve Banks (billions $)
    "foreign": "FDHBFIN",                    # Foreign & International (billions $)
    "pension_funds": "BOGZ1FL593061105Q",    # Pension Funds (millions $)
    "state_local": "BOGZ1FL213061103Q",      # State & Local Govts (millions $)
    "mutual_funds": "BOGZ1LM653061105Q",     # Mutual Funds (millions $)
    "total_debt": "GFDEBTN",                 # Total Federal Debt (millions $)
    "debt_held_public": "FYGFDPUN",          # Debt Held by Public (millions $)
}

FRED_GDP_SERIES = "GFDGDPA188S"  # Federal Debt to GDP Percent (annual)

TREASURY_BASE = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service"
FRED_BASE = "https://api.stlouisfed.org/fred"
TIC_URL = "https://ticdata.treasury.gov/resource-center/data-chart-center/tic/Documents/mfh.txt"


class DebtDeepDiveService(BaseGovService):
    """Debt composition, interest, rates, and foreign holders."""

    SERVICE_NAME = "debt_deep_dive"
    BASE_URL = FRED_BASE
    TIMEOUT = 45

    # ------------------------------------------------------------------
    # FRED helpers
    # ------------------------------------------------------------------

    def _fred_params(self, **extra: Any) -> dict[str, Any]:
        """Base query parameters for every FRED call."""
        params: dict[str, Any] = {
            "api_key": settings.fred_api_key,
            "file_type": "json",
        }
        params.update(extra)
        return params

    async def _fetch_fred_latest(self, series_id: str) -> Optional[dict]:
        """Fetch the most recent observation for a FRED series."""
        url = f"{FRED_BASE}/series/observations"
        data = await self._fetch_json(
            url,
            params=self._fred_params(
                series_id=series_id,
                sort_order="desc",
                limit=1,
            ),
        )
        obs = data.get("observations", [])
        if not obs or obs[0].get("value") == ".":
            return None
        return {"date": obs[0]["date"], "value": float(obs[0]["value"])}

    async def _fetch_fred_history(
        self, series_id: str, limit: int = 40
    ) -> list[dict]:
        """Fetch recent observations for a FRED series."""
        url = f"{FRED_BASE}/series/observations"
        data = await self._fetch_json(
            url,
            params=self._fred_params(
                series_id=series_id,
                sort_order="desc",
                limit=limit,
            ),
        )
        return [
            {"date": o["date"], "value": float(o["value"])}
            for o in data.get("observations", [])
            if o.get("value") != "."
        ]

    # ------------------------------------------------------------------
    # 1. Holders composition (latest snapshot)
    # ------------------------------------------------------------------

    async def get_holders_composition(self) -> dict:
        """Who holds the national debt — latest quarterly snapshot."""
        key = self._cache_key("holders_composition")

        async def _fetch() -> dict:
            # Fetch all FRED series in parallel
            results = await asyncio.gather(
                self._fetch_fred_latest(FRED_SERIES["federal_reserve"]),
                self._fetch_fred_latest(FRED_SERIES["foreign"]),
                self._fetch_fred_latest(FRED_SERIES["pension_funds"]),
                self._fetch_fred_latest(FRED_SERIES["state_local"]),
                self._fetch_fred_latest(FRED_SERIES["mutual_funds"]),
                self._fetch_fred_latest(FRED_SERIES["total_debt"]),
                self._fetch_fred_latest(FRED_SERIES["debt_held_public"]),
                return_exceptions=True,
            )

            def _val(idx: int, divisor: float = 1.0) -> float:
                r = results[idx]
                if isinstance(r, Exception) or r is None:
                    return 0.0
                return r["value"] / divisor

            fed_reserve = _val(0)              # already billions
            foreign = _val(1)                  # already billions
            pension = _val(2, 1000)            # millions → billions
            state_local = _val(3, 1000)        # millions → billions
            mutual_funds = _val(4, 1000)       # millions → billions
            total_debt = _val(5, 1000)         # millions → billions
            debt_held_public = _val(6, 1000)   # millions → billions

            intragov = total_debt - debt_held_public if total_debt and debt_held_public else 0.0
            known = fed_reserve + foreign + pension + state_local + mutual_funds + intragov
            other = max(0, total_debt - known)

            holders = []
            for name, amount in [
                ("Federal Reserve", fed_reserve),
                ("Foreign & International", foreign),
                ("Intragovernmental", intragov),
                ("Mutual Funds", mutual_funds),
                ("Pension Funds", pension),
                ("State & Local Govts", state_local),
                ("Other", other),
            ]:
                if amount > 0:
                    holders.append({
                        "name": name,
                        "amount_billions": round(amount, 2),
                        "percent": round(amount / total_debt * 100, 1) if total_debt else 0,
                    })

            # Get as_of_date from the first successful result
            as_of = None
            for r in results:
                if not isinstance(r, Exception) and r is not None:
                    as_of = r["date"]
                    break

            return {
                "holders": holders,
                "total_billions": round(total_debt, 2),
                "as_of_date": as_of,
                "source": "FRED (Federal Reserve Economic Data)",
            }

        return await self._cached_fetch(key, _fetch)

    # ------------------------------------------------------------------
    # 2. Holders history (quarterly, ~10 years)
    # ------------------------------------------------------------------

    async def get_holders_history(self) -> dict:
        """Holder composition over time — quarterly series."""
        key = self._cache_key("holders_history")

        async def _fetch() -> dict:
            limit = 40  # ~10 years quarterly
            results = await asyncio.gather(
                self._fetch_fred_history(FRED_SERIES["federal_reserve"], limit),
                self._fetch_fred_history(FRED_SERIES["foreign"], limit),
                self._fetch_fred_history(FRED_SERIES["pension_funds"], limit),
                self._fetch_fred_history(FRED_SERIES["state_local"], limit),
                self._fetch_fred_history(FRED_SERIES["mutual_funds"], limit),
                return_exceptions=True,
            )

            def _series(idx: int, divisor: float = 1.0) -> list[dict]:
                r = results[idx]
                if isinstance(r, Exception):
                    return []
                return [
                    {"date": o["date"], "value": round(o["value"] / divisor, 2)}
                    for o in r
                ]

            return {
                "series": {
                    "federal_reserve": _series(0),
                    "foreign": _series(1),
                    "pension_funds": _series(2, 1000),
                    "state_local": _series(3, 1000),
                    "mutual_funds": _series(4, 1000),
                },
                "units": "billions_usd",
                "source": "FRED (Federal Reserve Economic Data)",
            }

        return await self._cached_fetch(key, _fetch)

    # ------------------------------------------------------------------
    # 3. Interest expense (Treasury Fiscal Data)
    # ------------------------------------------------------------------

    async def get_interest_expense(self, fiscal_year: Optional[int] = None) -> dict:
        """Interest expense on the national debt by fiscal year."""
        fy = fiscal_year or self._current_fiscal_year()
        key = self._cache_key("interest_expense", str(fy))

        async def _fetch() -> dict:
            url = f"{TREASURY_BASE}/v2/accounting/od/interest_expense"

            # Fetch current FY + previous 5
            years = list(range(fy - 5, fy + 1))
            filter_str = ",".join(str(y) for y in years)

            data = await self._fetch_json(url, params={
                "filter": f"record_fiscal_year:in:({filter_str})",
                "sort": "-record_date",
                "page[size]": 10000,
                "format": "json",
            })

            records = data.get("data", [])

            # Aggregate by fiscal year
            fy_totals: dict[int, float] = {}
            monthly_current: list[dict] = []

            for r in records:
                r_fy = int(r.get("record_fiscal_year", 0))
                amount = _parse_amount(r.get("expense_amt", 0))
                fy_totals[r_fy] = fy_totals.get(r_fy, 0) + amount

                if r_fy == fy:
                    monthly_current.append({
                        "date": r.get("record_date"),
                        "month": r.get("record_calendar_month"),
                        "expense_type": r.get("expense_type_desc", ""),
                        "amount": amount,
                    })

            annual = [
                {"fiscal_year": y, "total": round(fy_totals.get(y, 0), 2)}
                for y in sorted(years)
                if fy_totals.get(y, 0) > 0
            ]

            return {
                "current_fy": fy,
                "annual": annual,
                "monthly_current_fy": sorted(monthly_current, key=lambda x: x["date"] or ""),
                "source": "Treasury Fiscal Data API",
            }

        return await self._cached_fetch(key, _fetch)

    # ------------------------------------------------------------------
    # 4. Average interest rates (Treasury Fiscal Data)
    # ------------------------------------------------------------------

    async def get_avg_interest_rates(self) -> dict:
        """Average interest rates by security type."""
        key = self._cache_key("avg_interest_rates")

        async def _fetch() -> dict:
            url = f"{TREASURY_BASE}/v2/accounting/od/avg_interest_rates"
            data = await self._fetch_json(url, params={
                "sort": "-record_date",
                "page[size]": 50,
                "format": "json",
            })

            records = data.get("data", [])
            if not records:
                return {"rates": [], "as_of_date": None, "source": "Treasury Fiscal Data API"}

            # Get the latest month's records
            latest_date = records[0].get("record_date")
            latest_records = [r for r in records if r.get("record_date") == latest_date]

            rates = []
            for r in latest_records:
                rate = r.get("avg_interest_rate_amt")
                if rate and rate != "null":
                    rates.append({
                        "security_type": r.get("security_type_desc", ""),
                        "rate": float(rate),
                    })

            return {
                "rates": sorted(rates, key=lambda x: x["rate"], reverse=True),
                "as_of_date": latest_date,
                "source": "Treasury Fiscal Data API",
            }

        return await self._cached_fetch(key, _fetch)

    # ------------------------------------------------------------------
    # 5. Foreign holders (Treasury TIC data)
    # ------------------------------------------------------------------

    async def get_foreign_holders(self) -> dict:
        """Top foreign holders of U.S. Treasury securities."""
        key = self._cache_key("foreign_holders")

        async def _fetch() -> dict:
            client = await self._get_client()
            resp = await client.get(TIC_URL, headers={"Accept": "text/plain"})
            resp.raise_for_status()
            text = resp.text

            countries = _parse_tic_text(text)
            return {
                "countries": countries[:20],
                "total_countries": len(countries),
                "source": "Treasury International Capital (TIC) System",
            }

        return await self._cached_fetch(key, _fetch)

    # ------------------------------------------------------------------
    # 6. Debt-to-GDP ratio (FRED)
    # ------------------------------------------------------------------

    async def get_debt_to_gdp(self) -> dict:
        """Federal debt as percent of GDP."""
        key = self._cache_key("debt_to_gdp")

        async def _fetch() -> dict:
            history = await self._fetch_fred_history(FRED_GDP_SERIES, limit=60)
            latest = history[0] if history else None

            return {
                "latest": {
                    "date": latest["date"] if latest else None,
                    "percent": round(latest["value"], 1) if latest else None,
                },
                "history": [
                    {"date": o["date"], "percent": round(o["value"], 1)}
                    for o in reversed(history)
                ],
                "source": "FRED (Federal Reserve Economic Data)",
            }

        return await self._cached_fetch(key, _fetch)

    # ------------------------------------------------------------------
    # Utilities
    # ------------------------------------------------------------------

    @staticmethod
    def _current_fiscal_year() -> int:
        today = datetime.now()
        return today.year + 1 if today.month >= 10 else today.year


# ======================================================================
# Module-level helpers
# ======================================================================

def _parse_amount(value: Any) -> float:
    """Parse monetary amount from API response."""
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(str(value).replace(",", ""))
    except (ValueError, TypeError):
        return 0.0


def _parse_tic_text(text: str) -> list[dict]:
    """
    Parse the Treasury TIC ``mfh.txt`` tab-delimited file.

    The file has a header section, then country rows with monthly holdings.
    We extract each country name and its most recent (rightmost) non-empty value.
    """
    lines = text.strip().split("\n")

    # Find the header row that starts with "Country"
    header_idx = None
    for i, line in enumerate(lines):
        if line.strip().lower().startswith("country"):
            header_idx = i
            break

    if header_idx is None:
        logger.warning("Could not find header row in TIC data")
        return []

    # Skip known aggregate/label rows
    skip_prefixes = {
        "grand total", "total", "of which", "europe", "asia",
        "south and central america", "caribbean", "africa",
        "other", "all other", "international", "country",
        "memo:", "canada", "middle east", "western hemisphere",
    }

    countries: list[dict] = []
    for line in lines[header_idx + 1:]:
        if not line.strip():
            continue

        # Split on tab or multiple spaces
        parts = re.split(r"\t+|\s{2,}", line.strip())
        if len(parts) < 2:
            continue

        name = parts[0].strip()
        if not name or name.lower() in skip_prefixes:
            continue

        # Find the latest non-empty numeric value (rightmost)
        value = None
        for col in reversed(parts[1:]):
            col = col.strip().replace(",", "")
            if col and col not in ("n/a", "--", "*"):
                try:
                    value = float(col)
                    break
                except ValueError:
                    continue

        if value is not None and value > 0:
            countries.append({
                "country": name,
                "holdings_billions": round(value, 1),
            })

    # Sort by holdings descending
    countries.sort(key=lambda x: x["holdings_billions"], reverse=True)
    return countries


# ======================================================================
# Singleton
# ======================================================================

_instance: Optional[DebtDeepDiveService] = None


def get_debt_deep_dive_service() -> DebtDeepDiveService:
    """Return the singleton ``DebtDeepDiveService`` instance."""
    global _instance
    if _instance is None:
        _instance = DebtDeepDiveService()
    return _instance
