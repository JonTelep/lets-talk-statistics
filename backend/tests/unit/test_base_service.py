"""Tests for BaseGovService."""

import json
import time
from pathlib import Path
from unittest.mock import AsyncMock, patch

import httpx
import pytest

from app.services.base import BaseGovService, ServiceError


class ConcreteService(BaseGovService):
    """Minimal concrete subclass for testing."""

    SERVICE_NAME = "test_service"
    BASE_URL = "https://api.example.gov"
    TIMEOUT = 10


@pytest.fixture
def service(tmp_path, monkeypatch):
    """Create a service with a temporary cache directory."""
    monkeypatch.setattr(
        "app.services.base.settings",
        type("S", (), {"data_dir": tmp_path, "cache_ttl_hours": 48})(),
    )
    return ConcreteService()


# ── Client lifecycle ────────────────────────────────────────────────────────


class TestClientLifecycle:
    @pytest.mark.asyncio
    async def test_lazy_init(self, service):
        assert service._client is None
        client = await service._get_client()
        assert client is not None
        assert isinstance(client, httpx.AsyncClient)

    @pytest.mark.asyncio
    async def test_same_client_returned(self, service):
        c1 = await service._get_client()
        c2 = await service._get_client()
        assert c1 is c2

    @pytest.mark.asyncio
    async def test_close(self, service):
        await service._get_client()
        assert service._client is not None
        await service.close()
        assert service._client is None

    @pytest.mark.asyncio
    async def test_close_when_no_client(self, service):
        await service.close()  # should not raise


# ── Cache key ───────────────────────────────────────────────────────────────


class TestCacheKey:
    def test_deterministic(self, service):
        k1 = service._cache_key("debt", "365")
        k2 = service._cache_key("debt", "365")
        assert k1 == k2

    def test_different_parts_different_key(self, service):
        k1 = service._cache_key("debt", "365")
        k2 = service._cache_key("debt", "30")
        assert k1 != k2

    def test_service_name_prefix(self, service):
        """Keys from different SERVICE_NAME values must differ."""
        other = service.__class__.__new__(service.__class__)
        other.SERVICE_NAME = "other_service"
        assert service._cache_key("x") != other._cache_key("x")


# ── Cache read / write ──────────────────────────────────────────────────────


class TestCacheReadWrite:
    def test_write_then_read(self, service):
        key = service._cache_key("a")
        data = {"value": 42}
        service._write_cache(key, data)
        assert service._read_cache(key) == data

    def test_read_missing(self, service):
        assert service._read_cache("nonexistent") is None

    def test_cache_expires(self, service, tmp_path):
        key = service._cache_key("b")
        service._write_cache(key, {"v": 1})

        # Backdate the file mtime by 100 hours
        path = service._cache_path(key)
        old_time = time.time() - (100 * 3600)
        import os
        os.utime(path, (old_time, old_time))

        assert service._read_cache(key) is None  # default 48h TTL

    def test_custom_ttl(self, service):
        key = service._cache_key("c")
        service._write_cache(key, {"v": 1})

        # Backdate by 2 hours
        path = service._cache_path(key)
        old_time = time.time() - (2 * 3600)
        import os
        os.utime(path, (old_time, old_time))

        assert service._read_cache(key, ttl=1) is None
        assert service._read_cache(key, ttl=3) == {"v": 1}


# ── _cached_fetch ───────────────────────────────────────────────────────────


class TestCachedFetch:
    @pytest.mark.asyncio
    async def test_miss_calls_fetch_fn(self, service):
        fetch = AsyncMock(return_value={"result": "fresh"})
        key = service._cache_key("miss")
        data = await service._cached_fetch(key, fetch)
        assert data == {"result": "fresh"}
        fetch.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_hit_skips_fetch_fn(self, service):
        key = service._cache_key("hit")
        service._write_cache(key, {"result": "cached"})
        fetch = AsyncMock(return_value={"result": "fresh"})
        data = await service._cached_fetch(key, fetch)
        assert data == {"result": "cached"}
        fetch.assert_not_awaited()


# ── _fetch_json ─────────────────────────────────────────────────────────────


class TestFetchJson:
    @pytest.mark.asyncio
    async def test_get_success(self, service):
        mock_response = httpx.Response(200, json={"ok": True}, request=httpx.Request("GET", "https://api.example.gov/data"))
        with patch.object(httpx.AsyncClient, "get", return_value=mock_response):
            result = await service._fetch_json("https://api.example.gov/data")
            assert result == {"ok": True}

    @pytest.mark.asyncio
    async def test_post_success(self, service):
        mock_response = httpx.Response(200, json={"posted": True}, request=httpx.Request("POST", "https://api.example.gov/data"))
        with patch.object(httpx.AsyncClient, "post", return_value=mock_response):
            result = await service._fetch_json(
                "https://api.example.gov/data",
                method="POST",
                json_body={"q": 1},
            )
            assert result == {"posted": True}

    @pytest.mark.asyncio
    async def test_retries_on_failure(self, service):
        fail = httpx.Response(500, json={"error": "server"}, request=httpx.Request("GET", "https://x"))
        success = httpx.Response(200, json={"ok": True}, request=httpx.Request("GET", "https://api.example.gov/data"))

        with patch.object(
            httpx.AsyncClient, "get", side_effect=[fail, success],
        ):
            result = await service._fetch_json(
                "https://api.example.gov/data",
                retries=1,
                backoff_base=0.0,  # no actual delay in tests
            )
            assert result == {"ok": True}

    @pytest.mark.asyncio
    async def test_raises_service_error_after_exhausted_retries(self, service):
        fail = httpx.Response(500, json={"error": "server"}, request=httpx.Request("GET", "https://x"))

        with patch.object(
            httpx.AsyncClient, "get", return_value=fail,
        ):
            with pytest.raises(ServiceError) as exc_info:
                await service._fetch_json(
                    "https://api.example.gov/data",
                    retries=1,
                    backoff_base=0.0,
                )
            assert exc_info.value.source == "test_service"
            assert "api.example.gov" in exc_info.value.url


# ── _response_envelope ──────────────────────────────────────────────────────


class TestResponseEnvelope:
    def test_shape(self):
        env = BaseGovService._response_envelope(
            data=[1, 2, 3],
            source="Test Source",
        )
        assert env["source"] == "Test Source"
        assert env["data"] == [1, 2, 3]
        assert "fetched_at" in env

    def test_extra_fields(self):
        env = BaseGovService._response_envelope(
            data={},
            source="S",
            fiscal_year=2025,
        )
        assert env["fiscal_year"] == 2025
