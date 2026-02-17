"""Tests for housing API endpoints."""

import os
import tempfile
from datetime import date, datetime
from unittest.mock import AsyncMock, patch, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

os.environ.setdefault("DATA_DIR", tempfile.mkdtemp())

from app.main import app


@pytest.fixture
def mock_housing_service():
    """Create a mock HousingService."""
    svc = AsyncMock()
    svc.get_categories.return_value = [
        {"category": "house_prices", "title": "House Prices", "description": "...", "series_count": 8},
    ]
    svc.get_series_list.return_value = [
        {"series_id": "MSPUS", "title": "Median Sales Price", "category": "house_prices",
         "frequency": "quarterly", "units": "dollars", "seasonal_adjustment": "nsa",
         "last_synced_at": "2024-06-01T00:00:00"},
    ]
    svc.get_observations.return_value = {
        "series_id": "MSPUS",
        "title": "Median Sales Price",
        "units": "dollars",
        "frequency": "quarterly",
        "observations": [
            {"date": "2024-01-01", "value": 420000.0},
        ],
    }
    svc.get_compare.return_value = [
        {"series_id": "HOUST", "title": "Housing Starts", "units": "thousands",
         "observations": [{"date": "2024-01-01", "value": 1500.0}]},
    ]
    svc.get_dashboard.return_value = [
        {"series_id": "RHORUSQ156N", "title": "Homeownership Rate", "category": "homeownership_demographics",
         "units": "percent", "latest_date": "2024-06-01", "latest_value": 65.6},
    ]
    svc.get_sync_status.return_value = {
        "id": 1, "run_started_at": "2024-06-01T06:00:00",
        "run_finished_at": "2024-06-01T06:05:00",
        "series_synced": 48, "observations_upserted": 5000,
        "errors": [], "status": "success",
    }
    return svc


@pytest.fixture
async def client(mock_housing_service):
    mock_pool = MagicMock()
    with patch("app.api.v1.endpoints.housing.get_housing_service", return_value=mock_housing_service), \
         patch("app.api.v1.endpoints.housing.get_pool", return_value=mock_pool):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac


class TestCategoriesEndpoint:
    @pytest.mark.asyncio
    async def test_list_categories(self, client):
        resp = await client.get("/api/v1/housing/categories")
        assert resp.status_code == 200
        body = resp.json()
        assert "categories" in body
        assert len(body["categories"]) >= 1


class TestSeriesEndpoint:
    @pytest.mark.asyncio
    async def test_list_series(self, client):
        resp = await client.get("/api/v1/housing/series")
        assert resp.status_code == 200
        body = resp.json()
        assert "series" in body
        assert body["count"] >= 1

    @pytest.mark.asyncio
    async def test_filter_by_category(self, client):
        resp = await client.get("/api/v1/housing/series?category=house_prices")
        assert resp.status_code == 200


class TestObservationsEndpoint:
    @pytest.mark.asyncio
    async def test_get_observations(self, client):
        resp = await client.get("/api/v1/housing/observations/MSPUS")
        assert resp.status_code == 200
        body = resp.json()
        assert body["series_id"] == "MSPUS"
        assert len(body["observations"]) > 0

    @pytest.mark.asyncio
    async def test_with_date_range(self, client):
        resp = await client.get("/api/v1/housing/observations/MSPUS?start_date=2024-01-01&end_date=2024-12-31")
        assert resp.status_code == 200


class TestCompareEndpoint:
    @pytest.mark.asyncio
    async def test_compare(self, client):
        resp = await client.get("/api/v1/housing/compare?series_ids=HOUST,PERMIT")
        assert resp.status_code == 200
        body = resp.json()
        assert "series" in body

    @pytest.mark.asyncio
    async def test_missing_series_ids(self, client):
        resp = await client.get("/api/v1/housing/compare")
        assert resp.status_code == 422  # FastAPI validation error


class TestDashboardEndpoint:
    @pytest.mark.asyncio
    async def test_dashboard(self, client):
        resp = await client.get("/api/v1/housing/dashboard")
        assert resp.status_code == 200
        body = resp.json()
        assert "indicators" in body


class TestSyncStatusEndpoint:
    @pytest.mark.asyncio
    async def test_sync_status(self, client):
        resp = await client.get("/api/v1/housing/sync/status")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "success"
