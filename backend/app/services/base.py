"""
Base government data service.

Provides shared HTTP client management, file-based caching, error handling,
and response formatting for all government data services.
"""

import json
import hashlib
import asyncio
from abc import ABC
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Callable, Coroutine, Optional

import httpx

from app.config import get_settings
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class ServiceError(Exception):
    """Base exception for government data service errors."""

    def __init__(self, message: str, source: str = "", url: str = ""):
        self.source = source
        self.url = url
        super().__init__(message)


class BaseGovService(ABC):
    """
    Abstract base class for government data services.

    Subclasses set class-level config and inherit HTTP client management,
    file-based JSON caching, and standardised response formatting.

    Example subclass::

        class HousingService(BaseGovService):
            SERVICE_NAME = "housing"
            BASE_URL = "https://api.example.gov"
            TIMEOUT = 45
    """

    # -- Subclass configuration (override as needed) --------------------------
    SERVICE_NAME: str = "gov"
    BASE_URL: str = ""
    TIMEOUT: int = 30
    DEFAULT_HEADERS: dict[str, str] = {"Accept": "application/json"}

    def __init__(self) -> None:
        self._client: Optional[httpx.AsyncClient] = None
        self._cache_dir: Path = settings.data_dir / "cache"
        self._cache_dir.mkdir(parents=True, exist_ok=True)

    # -- HTTP client ----------------------------------------------------------

    async def _get_client(self) -> httpx.AsyncClient:
        """Lazy-initialise and return the shared ``httpx.AsyncClient``."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=self.TIMEOUT,
                headers=self.DEFAULT_HEADERS,
            )
        return self._client

    async def close(self) -> None:
        """Close the HTTP client (call on shutdown)."""
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    # -- HTTP fetch -----------------------------------------------------------

    async def _fetch_json(
        self,
        url: str,
        params: Optional[dict] = None,
        *,
        method: str = "GET",
        json_body: Optional[dict] = None,
        headers: Optional[dict] = None,
        retries: int = 2,
        backoff_base: float = 1.0,
    ) -> Any:
        """
        Fetch JSON from *url* with automatic retries and error handling.

        Parameters
        ----------
        url:
            Full URL to request.
        params:
            Query parameters.
        method:
            HTTP method (``GET`` or ``POST``).
        json_body:
            JSON body for POST requests.
        headers:
            Extra headers merged with defaults.
        retries:
            Number of retry attempts after the initial request.
        backoff_base:
            Base seconds for exponential backoff between retries.
        """
        client = await self._get_client()
        merged_headers = {**self.DEFAULT_HEADERS, **(headers or {})}
        last_exc: Optional[Exception] = None

        for attempt in range(1 + retries):
            try:
                if method.upper() == "POST":
                    resp = await client.post(
                        url, params=params, json=json_body, headers=merged_headers,
                    )
                else:
                    resp = await client.get(
                        url, params=params, headers=merged_headers,
                    )
                resp.raise_for_status()
                return resp.json()
            except (httpx.HTTPError, httpx.StreamError) as exc:
                last_exc = exc
                if attempt < retries:
                    wait = backoff_base * (2 ** attempt)
                    logger.warning(
                        "%s: request to %s failed (attempt %d/%d), retrying in %.1fs: %s",
                        self.SERVICE_NAME, url, attempt + 1, 1 + retries, wait, exc,
                    )
                    await asyncio.sleep(wait)

        raise ServiceError(
            f"Failed to fetch {url} after {1 + retries} attempts: {last_exc}",
            source=self.SERVICE_NAME,
            url=url,
        )

    # -- File-based cache -----------------------------------------------------

    def _cache_key(self, *parts: str) -> str:
        """Build a deterministic cache key with ``SERVICE_NAME`` prefix."""
        raw = f"{self.SERVICE_NAME}:{'|'.join(str(p) for p in parts)}"
        return hashlib.md5(raw.encode()).hexdigest()

    def _cache_path(self, key: str) -> Path:
        """Return the file path for a cache key."""
        return self._cache_dir / f"{key}.json"

    def _read_cache(self, key: str, ttl: Optional[int] = None) -> Optional[dict]:
        """
        Return cached data if the file exists and is still fresh.

        Parameters
        ----------
        key:
            Cache key (from ``_cache_key``).
        ttl:
            Freshness window in hours.  Falls back to ``settings.cache_ttl_hours``.
        """
        path = self._cache_path(key)
        if not path.exists():
            return None

        ttl_hours = ttl if ttl is not None else settings.cache_ttl_hours
        mtime = datetime.fromtimestamp(path.stat().st_mtime)
        if datetime.now() - mtime >= timedelta(hours=ttl_hours):
            return None

        try:
            return json.loads(path.read_text())
        except (json.JSONDecodeError, OSError):
            return None

    def _write_cache(self, key: str, data: dict) -> None:
        """Write *data* to the cache file for *key*."""
        path = self._cache_path(key)
        path.write_text(json.dumps(data, indent=2, default=str))

    async def _cached_fetch(
        self,
        key: str,
        fetch_fn: Callable[[], Coroutine[Any, Any, dict]],
        ttl: Optional[int] = None,
    ) -> dict:
        """
        Cache-aside helper: return cached data or call *fetch_fn* and cache the result.

        Parameters
        ----------
        key:
            Cache key (from ``_cache_key``).
        fetch_fn:
            Async callable that returns the data dict to cache.
        ttl:
            Freshness window in hours.
        """
        cached = self._read_cache(key, ttl=ttl)
        if cached is not None:
            return cached

        data = await fetch_fn()
        self._write_cache(key, data)
        return data

    # -- Response formatting --------------------------------------------------

    @staticmethod
    def _response_envelope(
        data: Any,
        source: str,
        **extra: Any,
    ) -> dict:
        """
        Wrap *data* in the standard response envelope::

            {"source": "...", "fetched_at": "...", "data": ..., ...}
        """
        envelope: dict[str, Any] = {
            "source": source,
            "fetched_at": datetime.now().isoformat(),
            "data": data,
        }
        envelope.update(extra)
        return envelope
