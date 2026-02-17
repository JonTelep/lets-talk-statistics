"""Tests for HousingService (read-side)."""

import os
import tempfile
from datetime import date, datetime
from unittest.mock import AsyncMock, patch, MagicMock

import pytest

os.environ.setdefault("DATA_DIR", tempfile.mkdtemp())

from app.services.housing.housing_service import HousingService


def _row(mapping: dict):
    """Simulate an asyncpg Record with dict-like access."""
    m = MagicMock()
    m.__getitem__ = lambda self, key: mapping[key]
    m.keys = lambda: mapping.keys()
    m.items = lambda: mapping.items()
    m.values = lambda: mapping.values()
    # dict(row) support
    m.__iter__ = lambda self: iter(mapping)
    m.__len__ = lambda: len(mapping)
    return m


@pytest.fixture
def mock_pool():
    pool = AsyncMock()
    return pool


@pytest.fixture
def service(mock_pool):
    svc = HousingService()
    svc.get_pool = lambda: mock_pool
    return svc


class TestGetCategories:
    @pytest.mark.asyncio
    async def test_returns_all_categories(self, service, mock_pool):
        mock_pool.fetch.return_value = [
            _row({"series_id": "HOUST", "title": "Starts", "category": "construction_pipeline",
                  "frequency": "monthly", "units": "thousands", "seasonal_adjustment": "sa",
                  "last_synced_at": datetime.now()}),
        ]
        cats = await service.get_categories()
        assert len(cats) == 6  # Always returns all 6 categories
        names = [c["category"] for c in cats]
        assert "construction_pipeline" in names


class TestGetSeriesList:
    @pytest.mark.asyncio
    async def test_no_filter(self, service, mock_pool):
        mock_pool.fetch.return_value = [
            _row({"series_id": "A", "title": "A", "category": "x",
                  "frequency": "m", "units": "u", "seasonal_adjustment": "n",
                  "last_synced_at": None}),
        ]
        result = await service.get_series_list()
        assert len(result) == 1

    @pytest.mark.asyncio
    async def test_with_category_filter(self, service, mock_pool):
        mock_pool.fetch.return_value = []
        result = await service.get_series_list(category="house_prices")
        assert result == []
        # Should have called the category-filtered query
        mock_pool.fetch.assert_called_once()


class TestGetObservations:
    @pytest.mark.asyncio
    async def test_with_date_range(self, service, mock_pool):
        mock_pool.fetch.return_value = [
            _row({"date": date(2024, 1, 1), "value": 65.7}),
            _row({"date": date(2024, 4, 1), "value": 66.1}),
        ]
        data = await service.get_observations("RHORUSQ156N", start_date="2024-01-01")
        assert data["series_id"] == "RHORUSQ156N"
        assert len(data["observations"]) == 2
        assert data["observations"][0]["value"] == 65.7


class TestGetCompare:
    @pytest.mark.asyncio
    async def test_groups_by_series(self, service, mock_pool):
        mock_pool.fetch.return_value = [
            _row({"series_id": "A", "date": date(2024, 1, 1), "value": 10.0}),
            _row({"series_id": "B", "date": date(2024, 1, 1), "value": 20.0}),
            _row({"series_id": "A", "date": date(2024, 2, 1), "value": 11.0}),
        ]
        result = await service.get_compare(["A", "B"])
        assert len(result) == 2
        a_data = next(s for s in result if s["series_id"] == "A")
        assert len(a_data["observations"]) == 2


class TestGetDashboard:
    @pytest.mark.asyncio
    async def test_returns_headline_items(self, service, mock_pool):
        mock_pool.fetchrow.return_value = _row({
            "date": date(2024, 6, 1),
            "value": 65.5,
        })
        items = await service.get_dashboard()
        assert len(items) == 6  # One per headline series
        assert all(item["latest_value"] is not None for item in items)


class TestGetSyncStatus:
    @pytest.mark.asyncio
    async def test_no_sync_runs(self, service, mock_pool):
        mock_pool.fetchrow.return_value = None
        result = await service.get_sync_status()
        assert result is None

    @pytest.mark.asyncio
    async def test_returns_latest(self, service, mock_pool):
        mock_pool.fetchrow.return_value = _row({
            "id": 1,
            "run_started_at": datetime(2024, 6, 1, 6, 0),
            "run_finished_at": datetime(2024, 6, 1, 6, 5),
            "series_synced": 48,
            "observations_upserted": 5000,
            "errors": [],
            "status": "success",
        })
        result = await service.get_sync_status()
        assert result["status"] == "success"
        assert result["series_synced"] == 48
