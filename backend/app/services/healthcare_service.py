"""
Healthcare Service - Medicaid & CHIP Enrollment + DSH Payment Data

Sources (all free, no auth):
  - data.medicaid.gov DKAN API
  - State Medicaid/CHIP Enrollment (10,000+ records, 2013-present)
  - DSH Hospital Payments (limited CA 2013 data)
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

DKAN_BASE = "https://data.medicaid.gov/api/1/datastore/query"

# Dataset UUIDs
ENROLLMENT_DATASET = "6165f45b-ca93-5bb5-9d06-db29c692a360"
DSH_DATASET = "c491f14b-6dd5-5e00-9e8d-0c49420e7caa"


class HealthcareServiceError(Exception):
    pass


class HealthcareService:
    """Fetches Medicaid enrollment and hospital payment data from data.medicaid.gov."""

    def __init__(self):
        self.timeout = 30.0
        self._cache: Dict[str, Any] = {}
        self._cache_time: Dict[str, datetime] = {}
        self._cache_ttl = 3600  # 1 hour

    def _get_cache(self, key: str) -> Optional[Dict]:
        if key in self._cache:
            age = (datetime.now() - self._cache_time[key]).total_seconds()
            if age < self._cache_ttl:
                return self._cache[key]
        return None

    def _set_cache(self, key: str, data: Dict):
        self._cache[key] = data
        self._cache_time[key] = datetime.now()

    async def _fetch_dkan(self, dataset_id: str, limit: int = 500, offset: int = 0) -> Dict:
        """Fetch from DKAN datastore API."""
        url = f"{DKAN_BASE}/{dataset_id}/0"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(url, params={"limit": limit, "offset": offset, "count": "true"})
            response.raise_for_status()
            return response.json()

    async def get_enrollment_data(self, limit: int = 2000) -> Dict[str, Any]:
        """
        Get state-level Medicaid & CHIP enrollment data.
        Returns latest final reports per state with historical trends.
        """
        cache_key = f"enrollment_{limit}"
        if cached := self._get_cache(cache_key):
            return cached

        try:
            raw = await self._fetch_dkan(ENROLLMENT_DATASET, limit=limit)
            results = raw.get("results", [])
            total_count = raw.get("count", len(results))

            # Parse records
            records = []
            for r in results:
                enrollment = _safe_int(r.get("total_medicaid_and_chip_enrollment"))
                if not enrollment:
                    continue

                period = r.get("reporting_period", "")
                year = int(period[:4]) if len(period) >= 4 else None
                month = int(period[4:6]) if len(period) >= 6 else None

                records.append({
                    "state": r.get("state_abbreviation", ""),
                    "stateName": r.get("state_name", ""),
                    "year": year,
                    "month": month,
                    "period": period,
                    "totalEnrollment": enrollment,
                    "childEnrollment": _safe_int(r.get("medicaid_and_chip_child_enrollment")),
                    "adultEnrollment": _safe_int(r.get("total_adult_medicaid_enrollment")),
                    "medicaidEnrollment": _safe_int(r.get("total_medicaid_enrollment")),
                    "chipEnrollment": _safe_int(r.get("total_chip_enrollment")),
                    "expandedMedicaid": r.get("state_expanded_medicaid") == "Y",
                    "isFinal": r.get("final_report") == "Y",
                    "newApplications": _safe_int(r.get("new_applications_submitted_to_medicaid_and_chip_agencies")),
                    "determinations": _safe_int(r.get("total_medicaid_and_chip_determinations")),
                })

            # Filter to final reports only for cleaner data
            final_records = [r for r in records if r["isFinal"]]
            if not final_records:
                final_records = records

            # Get latest period per state
            state_latest: Dict[str, Dict] = {}
            for r in final_records:
                state = r["state"]
                if state not in state_latest or r["period"] > state_latest[state]["period"]:
                    state_latest[state] = r

            # National totals from latest period
            latest_states = list(state_latest.values())
            national_enrollment = sum(s["totalEnrollment"] for s in latest_states)

            # Historical national trend (aggregate by period)
            period_totals: Dict[str, int] = {}
            for r in final_records:
                p = r["period"]
                period_totals[p] = period_totals.get(p, 0) + r["totalEnrollment"]

            trends = [
                {"period": p, "year": int(p[:4]), "month": int(p[4:6]) if len(p) >= 6 else 1, "totalEnrollment": total}
                for p, total in sorted(period_totals.items())
            ]

            # Expansion status summary
            expanded_states = len([s for s in latest_states if s["expandedMedicaid"]])

            result = {
                "source": "CMS Medicaid.gov - State Enrollment Data",
                "fetched_at": datetime.now().isoformat(),
                "metadata": {
                    "total_records_available": total_count,
                    "records_fetched": len(results),
                    "states_reported": len(state_latest),
                    "latest_period": max(r["period"] for r in final_records) if final_records else None,
                },
                "summary": {
                    "nationalEnrollment": national_enrollment,
                    "statesReporting": len(state_latest),
                    "statesExpandedMedicaid": expanded_states,
                    "statesNotExpanded": len(latest_states) - expanded_states,
                },
                "byState": sorted(latest_states, key=lambda x: x["totalEnrollment"], reverse=True),
                "trends": trends,
            }

            self._set_cache(cache_key, result)
            return result

        except httpx.RequestError as e:
            logger.error("Network error fetching enrollment data: %s", e)
            raise HealthcareServiceError(f"Failed to fetch enrollment data: {e}")
        except httpx.HTTPStatusError as e:
            logger.error("HTTP error fetching enrollment data: %s", e.response.status_code)
            raise HealthcareServiceError(f"API error: {e.response.status_code}")

    async def get_dsh_payments(self) -> Dict[str, Any]:
        """
        Fetch DSH (Disproportionate Share Hospital) payment records.
        Note: Currently limited to California 2013 data from CMS.
        """
        cache_key = "dsh_payments"
        if cached := self._get_cache(cache_key):
            return cached

        try:
            raw = await self._fetch_dkan(DSH_DATASET, limit=500)
            results = raw.get("results", [])

            records = []
            for r in results:
                try:
                    records.append({
                        "year": int(r.get("year", 0)),
                        "state": _abbreviate_state(r.get("state", "")),
                        "stateFull": r.get("state", ""),
                        "category": r.get("category", ""),
                        "hospitalName": r.get("hospital_name", ""),
                        "medicareProviderNumber": r.get("medicare_provider_number", ""),
                        "medicaidProviderNumber": r.get("medicaid_provider_number", ""),
                        "totalMedicaidPayments": _safe_float(r.get("total_medicaid_ipop_medicaid_payments", 0)),
                        "totalCostOfCare": _safe_float(r.get("total_cost_of_care__medicaid_ipop_services", 0)),
                        "uncompensatedCareCosts": _safe_float(r.get("total_eligible_uncompensated_care_costs", 0)),
                        "medicaidUtilizationRate": _safe_float(r.get("medicaid_ip_utilization_rate", 0)),
                        "lowIncomeUtilizationRate": _safe_float(r.get("lowincome_utilization_rate", 0)),
                        "totalDSHPayments": _safe_float(r.get("total_instate_dsh_payments_received", 0))
                                          + _safe_float(r.get("total_outofstate_dsh_payments_received", 0)),
                        "location": r.get("location", ""),
                        "notes": r.get("notes", ""),
                    })
                except (ValueError, TypeError) as e:
                    logger.warning("Skipping malformed DSH record: %s", e)
                    continue

            result = {
                "source": "CMS Medicaid.gov - DSH Annual Reporting",
                "fetched_at": datetime.now().isoformat(),
                "data": records,
                "metadata": {
                    "total_records": len(records),
                    "year_range": [min(r["year"] for r in records), max(r["year"] for r in records)] if records else [],
                },
            }

            self._set_cache(cache_key, result)
            return result

        except httpx.RequestError as e:
            logger.error("Network error fetching DSH data: %s", e)
            raise HealthcareServiceError(f"Failed to fetch DSH data: {e}")
        except httpx.HTTPStatusError as e:
            logger.error("HTTP error fetching DSH data: %s", e.response.status_code)
            raise HealthcareServiceError(f"API error: {e.response.status_code}")

    async def get_overview(self) -> Dict[str, Any]:
        """
        Combined healthcare overview: enrollment summary + DSH highlights.
        This is the main endpoint the frontend calls at /healthcare/.
        """
        cache_key = "overview"
        if cached := self._get_cache(cache_key):
            return cached

        enrollment = await self.get_enrollment_data()
        dsh = await self.get_dsh_payments()

        result = {
            "source": "CMS Medicaid.gov",
            "fetched_at": datetime.now().isoformat(),
            "data": dsh.get("data", []),
            "enrollment": enrollment,
            "metadata": {
                "enrollment_records": enrollment.get("metadata", {}).get("total_records_available", 0),
                "dsh_records": dsh.get("metadata", {}).get("total_records", 0),
                "year_range": dsh.get("metadata", {}).get("year_range", []),
            },
        }

        self._set_cache(cache_key, result)
        return result


# Singleton
_healthcare_service: Optional[HealthcareService] = None


def get_healthcare_service() -> HealthcareService:
    global _healthcare_service
    if _healthcare_service is None:
        _healthcare_service = HealthcareService()
    return _healthcare_service


def _safe_float(val) -> float:
    if val is None or val == "":
        return 0.0
    try:
        return float(str(val).replace(",", ""))
    except (ValueError, TypeError):
        return 0.0


def _safe_int(val) -> Optional[int]:
    if val is None or val == "" or val == "null":
        return None
    try:
        return int(float(str(val).replace(",", "")))
    except (ValueError, TypeError):
        return None


_STATE_ABBREV = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
    "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
    "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
    "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
    "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
    "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
    "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
    "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
    "Puerto Rico": "PR",
}


def _abbreviate_state(name: str) -> str:
    return _STATE_ABBREV.get(name.strip(), name.strip()[:2].upper() if name else "")
