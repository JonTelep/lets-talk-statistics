"""
asyncpg connection pool lifecycle.

Call ``init_pool`` at application startup and ``close_pool`` at shutdown.
"""

from typing import Optional

import asyncpg

from app.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

_pool: Optional[asyncpg.Pool] = None


async def init_pool() -> asyncpg.Pool:
    """Create the asyncpg connection pool from application settings."""
    global _pool
    settings = get_settings()
    _pool = await asyncpg.create_pool(
        host=settings.housing_db_host,
        port=settings.housing_db_port,
        user=settings.housing_db_user,
        password=settings.housing_db_password or None,
        database=settings.housing_db_name,
        min_size=2,
        max_size=10,
    )
    logger.info("Housing DB pool initialised (%s@%s:%s/%s)",
                settings.housing_db_user, settings.housing_db_host,
                settings.housing_db_port, settings.housing_db_name)
    return _pool


async def close_pool() -> None:
    """Close the connection pool (no-op if not initialised)."""
    global _pool
    if _pool is not None:
        await _pool.close()
        logger.info("Housing DB pool closed")
        _pool = None


def get_pool() -> asyncpg.Pool:
    """Return the live pool or raise if not yet initialised."""
    if _pool is None:
        raise RuntimeError("Housing DB pool is not initialised — call init_pool() first")
    return _pool
