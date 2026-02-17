"""
Integration tests for housing sync (requires live Postgres).

These tests talk to a real ``housing_db`` database.  They are skipped by
default and only run when explicitly selected:

    pytest tests/integration/ -m integration -v
"""

import asyncio
from datetime import datetime

import pytest

try:
    import asyncpg
except ImportError:
    asyncpg = None

from app.config import get_settings
from app.db import queries as Q

pytestmark = pytest.mark.integration


@pytest.fixture(scope="module")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="module")
async def pool():
    """Create a test pool connected to the housing DB."""
    if asyncpg is None:
        pytest.skip("asyncpg not installed")
    settings = get_settings()
    try:
        p = await asyncpg.create_pool(
            host=settings.housing_db_host,
            port=settings.housing_db_port,
            user=settings.housing_db_user,
            password=settings.housing_db_password or None,
            database=settings.housing_db_name,
            min_size=1,
            max_size=3,
        )
    except Exception as e:
        pytest.skip(f"Cannot connect to housing DB: {e}")
    yield p
    await p.close()


@pytest.mark.asyncio
async def test_upsert_and_query_series(pool):
    """Upsert a series, then read it back."""
    await pool.execute(
        Q.UPSERT_SERIES,
        "_TEST_SERIES", "Test Series", "house_prices",
        "monthly", "dollars", "seasonally adjusted",
    )
    rows = await pool.fetch(Q.SELECT_ALL_ACTIVE_SERIES)
    ids = [r["series_id"] for r in rows]
    assert "_TEST_SERIES" in ids

    # Cleanup
    await pool.execute("DELETE FROM housing.series_registry WHERE series_id = '_TEST_SERIES'")


@pytest.mark.asyncio
async def test_upsert_observations_idempotent(pool):
    """Upserting the same observation twice should not error."""
    # Setup series first
    await pool.execute(
        Q.UPSERT_SERIES,
        "_TEST_OBS", "Test Obs", "house_prices",
        "monthly", "dollars", "not seasonally adjusted",
    )
    rows = [("_TEST_OBS", "2024-01-01", 100.0), ("_TEST_OBS", "2024-02-01", 200.0)]
    await pool.executemany(Q.UPSERT_OBSERVATIONS, rows)

    # Upsert again with updated value
    rows2 = [("_TEST_OBS", "2024-01-01", 105.0)]
    await pool.executemany(Q.UPSERT_OBSERVATIONS, rows2)

    result = await pool.fetch(Q.SELECT_OBSERVATIONS, "_TEST_OBS")
    values = {r["date"].isoformat(): float(r["value"]) for r in result}
    assert values["2024-01-01"] == 105.0
    assert values["2024-02-01"] == 200.0

    # Cleanup
    await pool.execute("DELETE FROM housing.observations WHERE series_id = '_TEST_OBS'")
    await pool.execute("DELETE FROM housing.series_registry WHERE series_id = '_TEST_OBS'")


@pytest.mark.asyncio
async def test_sync_log_insertion(pool):
    """Insert a sync_log row and read it back."""
    now = datetime.utcnow()
    row = await pool.fetchrow(
        Q.INSERT_SYNC_LOG,
        now, now, 5, 100, ["err1"], "partial",
    )
    assert row["id"] is not None

    latest = await pool.fetchrow(Q.SELECT_LATEST_SYNC)
    assert latest["series_synced"] == 5
    assert latest["status"] == "partial"

    # Cleanup
    await pool.execute("DELETE FROM housing.sync_log WHERE id = $1", row["id"])
