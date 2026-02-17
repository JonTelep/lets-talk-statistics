"""
Housing data sync service.

Fetches time-series observations from FRED (Federal Reserve Economic Data)
and upserts them into Postgres.  Extends ``BaseGovService`` for the HTTP
client and retry logic.
"""

import asyncio
import json
from datetime import datetime, date, timedelta
from typing import Any, Optional

import asyncpg

from app.config import get_settings
from app.db import queries as Q
from app.services.base import BaseGovService
from app.services.housing.series_config import HOUSING_SERIES
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class HousingSyncService(BaseGovService):
    """Sync FRED housing series into Postgres."""

    SERVICE_NAME = "housing_sync"
    BASE_URL = "https://api.stlouisfed.org/fred"
    TIMEOUT = 45

    # FRED free tier: 120 requests / minute ≈ 2 req/sec
    REQUEST_DELAY = 0.5

    def __init__(self, pool: asyncpg.Pool) -> None:
        super().__init__()
        self._pool = pool

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

    async def validate_series(self, series_id: str) -> Optional[dict]:
        """
        Call ``fred/series`` and return metadata, or *None* if the ID is
        invalid / discontinued.
        """
        url = f"{self.BASE_URL}/series"
        try:
            data = await self._fetch_json(url, params=self._fred_params(series_id=series_id))
            serieses = data.get("seriess", [])
            return serieses[0] if serieses else None
        except Exception as exc:
            logger.warning("validate_series(%s) failed: %s", series_id, exc)
            return None

    async def fetch_observations(
        self,
        series_id: str,
        observation_start: str = "1900-01-01",
    ) -> list[dict[str, str]]:
        """
        Fetch observations for *series_id* from FRED.

        Filters out rows where value is ``"."`` (FRED's marker for missing data).
        """
        url = f"{self.BASE_URL}/series/observations"
        data = await self._fetch_json(
            url,
            params=self._fred_params(
                series_id=series_id,
                observation_start=observation_start,
            ),
        )
        observations = data.get("observations", [])
        return [obs for obs in observations if obs.get("value") != "."]

    # ------------------------------------------------------------------
    # DB helpers
    # ------------------------------------------------------------------

    async def upsert_series_registry(self, series_def: dict[str, Any]) -> None:
        """Insert/update a single row in ``housing.series_registry``."""
        await self._pool.execute(
            Q.UPSERT_SERIES,
            series_def["series_id"],
            series_def["title"],
            series_def["category"],
            series_def["frequency"],
            series_def["units"],
            series_def["seasonal_adjustment"],
        )

    async def upsert_observations(
        self,
        series_id: str,
        observations: list[dict[str, str]],
    ) -> int:
        """Bulk-upsert observations. Returns the number of rows affected."""
        if not observations:
            return 0
        rows = [
            (series_id, date.fromisoformat(obs["date"]), float(obs["value"]))
            for obs in observations
        ]
        await self._pool.executemany(Q.UPSERT_OBSERVATIONS, rows)
        return len(rows)

    async def get_last_synced_at(self, series_id: str) -> Optional[datetime]:
        """Return the ``last_synced_at`` timestamp for *series_id*, or None."""
        row = await self._pool.fetchrow(Q.SELECT_LAST_SYNCED_AT, series_id)
        return row["last_synced_at"] if row else None

    async def log_sync_run(
        self,
        run_started_at: datetime,
        run_finished_at: datetime,
        series_synced: int,
        observations_upserted: int,
        errors: list[str],
        status: str,
    ) -> int:
        """Insert a row into ``housing.sync_log`` and return its id."""
        row = await self._pool.fetchrow(
            Q.INSERT_SYNC_LOG,
            run_started_at,
            run_finished_at,
            series_synced,
            observations_upserted,
            json.dumps(errors),  # jsonb column needs a JSON string
            status,
        )
        return row["id"]

    # ------------------------------------------------------------------
    # Sync orchestration
    # ------------------------------------------------------------------

    async def sync_series(
        self,
        series_def: dict[str, Any],
        full_backfill: bool = False,
    ) -> tuple[int, Optional[str]]:
        """
        Sync one series: determine start date, fetch, upsert.

        Returns ``(observation_count, error_message_or_none)``.
        """
        series_id = series_def["series_id"]
        try:
            # Determine start date
            if full_backfill:
                start = "1900-01-01"
            else:
                last_synced = await self.get_last_synced_at(series_id)
                if last_synced is None:
                    start = "1900-01-01"
                else:
                    start = (last_synced.date() - timedelta(days=7)).isoformat()

            observations = await self.fetch_observations(series_id, observation_start=start)
            await self.upsert_series_registry(series_def)
            count = await self.upsert_observations(series_id, observations)
            return count, None
        except Exception as exc:
            msg = f"{series_id}: {exc}"
            logger.error("sync_series failed — %s", msg)
            return 0, msg

    async def sync_all(
        self,
        full_backfill: bool = False,
    ) -> dict[str, Any]:
        """
        Iterate every series in ``HOUSING_SERIES``, honouring rate limits.

        Returns a summary dict with counts and errors.
        """
        run_started = datetime.utcnow()
        total_obs = 0
        total_synced = 0
        errors: list[str] = []

        for i, series_def in enumerate(HOUSING_SERIES):
            sid = series_def["series_id"]
            logger.info("[%d/%d] syncing %s …", i + 1, len(HOUSING_SERIES), sid)

            count, err = await self.sync_series(series_def, full_backfill=full_backfill)
            total_obs += count
            if err:
                errors.append(err)
            else:
                total_synced += 1

            # Rate-limit pause between FRED requests
            if i < len(HOUSING_SERIES) - 1:
                await asyncio.sleep(self.REQUEST_DELAY)

        run_finished = datetime.utcnow()
        status = "success" if not errors else ("partial" if total_synced > 0 else "failure")

        log_id = await self.log_sync_run(
            run_started_at=run_started,
            run_finished_at=run_finished,
            series_synced=total_synced,
            observations_upserted=total_obs,
            errors=errors,
            status=status,
        )

        summary = {
            "sync_log_id": log_id,
            "status": status,
            "series_synced": total_synced,
            "series_total": len(HOUSING_SERIES),
            "observations_upserted": total_obs,
            "errors": errors,
            "duration_seconds": (run_finished - run_started).total_seconds(),
        }
        logger.info("sync_all complete: %s", summary)
        return summary
