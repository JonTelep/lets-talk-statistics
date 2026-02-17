"""Tests for HousingSyncService."""

import asyncio
import os
import tempfile
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Point DATA_DIR at a temp directory so BaseGovService.__init__ doesn't fail
os.environ.setdefault("DATA_DIR", tempfile.mkdtemp())

from app.services.housing.sync_service import HousingSyncService
from app.services.housing.series_config import HOUSING_SERIES


@pytest.fixture
def mock_pool():
    """Create a mock asyncpg pool."""
    pool = AsyncMock()
    pool.execute = AsyncMock()
    pool.executemany = AsyncMock()
    pool.fetchrow = AsyncMock(return_value=None)
    return pool


@pytest.fixture
def service(mock_pool):
    """Create a HousingSyncService with mocked pool."""
    return HousingSyncService(mock_pool)


@pytest.fixture
def sample_series():
    return HOUSING_SERIES[0]  # RHORUSQ156N


class TestValidateSeries:
    @pytest.mark.asyncio
    async def test_valid_series(self, service):
        fred_resp = {"seriess": [{"id": "HOUST", "title": "Housing Starts"}]}
        with patch.object(service, "_fetch_json", new_callable=AsyncMock, return_value=fred_resp):
            result = await service.validate_series("HOUST")
        assert result is not None
        assert result["id"] == "HOUST"

    @pytest.mark.asyncio
    async def test_invalid_series(self, service):
        with patch.object(service, "_fetch_json", new_callable=AsyncMock, side_effect=Exception("404")):
            result = await service.validate_series("INVALID")
        assert result is None

    @pytest.mark.asyncio
    async def test_empty_seriess_list(self, service):
        with patch.object(service, "_fetch_json", new_callable=AsyncMock, return_value={"seriess": []}):
            result = await service.validate_series("GONE")
        assert result is None


class TestFetchObservations:
    @pytest.mark.asyncio
    async def test_filters_dot_values(self, service):
        fred_resp = {
            "observations": [
                {"date": "2024-01-01", "value": "65.7"},
                {"date": "2024-02-01", "value": "."},
                {"date": "2024-03-01", "value": "66.1"},
            ]
        }
        with patch.object(service, "_fetch_json", new_callable=AsyncMock, return_value=fred_resp):
            obs = await service.fetch_observations("TEST", "2024-01-01")
        assert len(obs) == 2
        assert all(o["value"] != "." for o in obs)

    @pytest.mark.asyncio
    async def test_empty_observations(self, service):
        with patch.object(service, "_fetch_json", new_callable=AsyncMock, return_value={"observations": []}):
            obs = await service.fetch_observations("TEST")
        assert obs == []


class TestSyncSeries:
    @pytest.mark.asyncio
    async def test_full_backfill(self, service, mock_pool, sample_series):
        fred_obs = [{"date": "2024-01-01", "value": "65.7"}]
        with patch.object(service, "fetch_observations", new_callable=AsyncMock, return_value=fred_obs):
            count, err = await service.sync_series(sample_series, full_backfill=True)
        assert count == 1
        assert err is None
        # Should have called upsert on pool
        mock_pool.execute.assert_called_once()
        mock_pool.executemany.assert_called_once()

    @pytest.mark.asyncio
    async def test_incremental_uses_last_synced(self, service, mock_pool, sample_series):
        last_synced = datetime(2024, 6, 1)
        mock_pool.fetchrow.return_value = {"last_synced_at": last_synced}
        fred_obs = [{"date": "2024-06-01", "value": "66.0"}]

        with patch.object(service, "fetch_observations", new_callable=AsyncMock, return_value=fred_obs) as mock_fetch:
            count, err = await service.sync_series(sample_series, full_backfill=False)

        assert count == 1
        assert err is None
        # Should have used last_synced - 7 days as start
        expected_start = (last_synced.date() - timedelta(days=7)).isoformat()
        mock_fetch.assert_called_once_with(sample_series["series_id"], observation_start=expected_start)

    @pytest.mark.asyncio
    async def test_error_returns_message(self, service, sample_series):
        with patch.object(service, "fetch_observations", new_callable=AsyncMock, side_effect=Exception("timeout")):
            count, err = await service.sync_series(sample_series)
        assert count == 0
        assert err is not None
        assert "timeout" in err


class TestSyncAll:
    @pytest.mark.asyncio
    async def test_collects_errors(self, service, mock_pool):
        # Make sync_series return alternating success/failure
        call_count = 0

        async def mock_sync(series_def, full_backfill=False):
            nonlocal call_count
            call_count += 1
            if call_count % 5 == 0:
                return 0, f"Error on {series_def['series_id']}"
            return 10, None

        mock_pool.fetchrow.return_value = {"id": 1}  # log_sync_run return

        with patch.object(service, "sync_series", side_effect=mock_sync):
            # Override REQUEST_DELAY to speed up test
            service.REQUEST_DELAY = 0
            summary = await service.sync_all()

        assert summary["status"] in ("success", "partial")
        assert summary["series_total"] == len(HOUSING_SERIES)
        assert summary["observations_upserted"] > 0
        assert isinstance(summary["errors"], list)
