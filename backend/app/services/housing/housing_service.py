"""
Housing data read-side service.

Queries Postgres for housing observations and series metadata.
Does NOT extend BaseGovService — no HTTP calls, only DB reads.
"""

from collections import defaultdict
from datetime import date, datetime
from typing import Any, Optional

import asyncpg

from app.db.pool import get_pool
from app.db import queries as Q
from app.services.housing.series_config import CATEGORIES, SERIES_BY_ID
from app.utils.logger import get_logger

logger = get_logger(__name__)


def _parse_date(val: Optional[str]) -> Optional[date]:
    """Convert an optional YYYY-MM-DD string to a date object for asyncpg."""
    return date.fromisoformat(val) if val else None


# Headline series — one per category for the dashboard view
_HEADLINE_SERIES = [
    "RHORUSQ156N",   # Homeownership Rate
    "MSPUS",          # Median Sales Price
    "HOUST",          # Housing Starts
    "MORTGAGE30US",   # 30-Year Mortgage Rate
    "RRVRUSQ156N",    # Rental Vacancy Rate
    "MSACSR",         # Monthly Supply
]


class HousingService:
    """Read-side service for housing data stored in Postgres."""

    def get_pool(self) -> asyncpg.Pool:
        return get_pool()

    # ------------------------------------------------------------------
    # Categories & series listing
    # ------------------------------------------------------------------

    async def get_categories(self) -> list[dict[str, Any]]:
        """Return all categories with their series counts."""
        rows = await self.get_pool().fetch(Q.SELECT_ALL_ACTIVE_SERIES)

        # Group by category
        by_cat: dict[str, list[dict]] = defaultdict(list)
        for r in rows:
            by_cat[r["category"]].append(dict(r))

        result = []
        for cat_key, meta in CATEGORIES.items():
            result.append({
                "category": cat_key,
                "title": meta["title"],
                "description": meta["description"],
                "series_count": len(by_cat.get(cat_key, [])),
            })
        return result

    async def get_series_list(
        self,
        category: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        """Return series metadata, optionally filtered by category."""
        if category:
            rows = await self.get_pool().fetch(Q.SELECT_SERIES_BY_CATEGORY, category)
        else:
            rows = await self.get_pool().fetch(Q.SELECT_ALL_ACTIVE_SERIES)
        return [dict(r) for r in rows]

    # ------------------------------------------------------------------
    # Observations
    # ------------------------------------------------------------------

    async def get_observations(
        self,
        series_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> dict[str, Any]:
        """Return time-series observations for a single series."""
        rows = await self.get_pool().fetch(
            Q.SELECT_OBSERVATIONS_RANGE,
            series_id,
            _parse_date(start_date),
            _parse_date(end_date),
        )
        meta = SERIES_BY_ID.get(series_id, {})
        return {
            "series_id": series_id,
            "title": meta.get("title", series_id),
            "units": meta.get("units", ""),
            "frequency": meta.get("frequency", ""),
            "observations": [
                {"date": r["date"].isoformat(), "value": float(r["value"])}
                for r in rows
            ],
        }

    async def get_compare(
        self,
        series_ids: list[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        """Return observations for multiple series, grouped by series_id."""
        rows = await self.get_pool().fetch(
            Q.SELECT_OBSERVATIONS_MULTI,
            series_ids,
            _parse_date(start_date),
            _parse_date(end_date),
        )

        grouped: dict[str, list[dict]] = defaultdict(list)
        for r in rows:
            grouped[r["series_id"]].append({
                "date": r["date"].isoformat(),
                "value": float(r["value"]),
            })

        result = []
        for sid in series_ids:
            meta = SERIES_BY_ID.get(sid, {})
            result.append({
                "series_id": sid,
                "title": meta.get("title", sid),
                "units": meta.get("units", ""),
                "observations": grouped.get(sid, []),
            })
        return result

    # ------------------------------------------------------------------
    # Dashboard
    # ------------------------------------------------------------------

    async def get_dashboard(self) -> list[dict[str, Any]]:
        """Return latest observation for each headline series."""
        items = []
        for sid in _HEADLINE_SERIES:
            row = await self.get_pool().fetchrow(Q.SELECT_LATEST_OBSERVATION, sid)
            meta = SERIES_BY_ID.get(sid, {})
            items.append({
                "series_id": sid,
                "title": meta.get("title", sid),
                "category": meta.get("category", ""),
                "units": meta.get("units", ""),
                "latest_date": row["date"].isoformat() if row else None,
                "latest_value": float(row["value"]) if row else None,
            })
        return items

    # ------------------------------------------------------------------
    # Sync status
    # ------------------------------------------------------------------

    async def get_sync_status(self) -> Optional[dict[str, Any]]:
        """Return the most recent sync_log entry."""
        row = await self.get_pool().fetchrow(Q.SELECT_LATEST_SYNC)
        if row is None:
            return None
        return {
            "id": row["id"],
            "run_started_at": row["run_started_at"].isoformat(),
            "run_finished_at": row["run_finished_at"].isoformat(),
            "series_synced": row["series_synced"],
            "observations_upserted": row["observations_upserted"],
            "errors": row["errors"],
            "status": row["status"],
        }


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

_service: Optional[HousingService] = None


def get_housing_service() -> HousingService:
    """Get or create the housing service singleton."""
    global _service
    if _service is None:
        _service = HousingService()
    return _service
