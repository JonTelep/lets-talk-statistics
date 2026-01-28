"""Database connection and session management."""

from uuid import uuid4

from asyncpg import Connection
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool

from app.config import get_settings


class SupabaseConnection(Connection):
    """Custom asyncpg connection class with UUID-based prepared statement names.

    This prevents "prepared statement already exists" errors when using
    Supabase's pgbouncer-based pooler in transaction mode.
    """
    def _get_unique_id(self, prefix: str) -> str:
        return f"__asyncpg_{prefix}_{uuid4()}__"

settings = get_settings()

# Detect Supabase Supavisor transaction mode connection
# Transaction mode (port 6543) requires prepared_statement_cache_size=0
is_pooled_connection = "prepared_statement_cache_size=0" in settings.database_url

# Configure engine based on connection type
# Always use NullPool and disable statement cache for Supabase pooler compatibility
# Use custom connection class with UUID-based statement names to prevent conflicts
engine_kwargs = {
    "echo": settings.debug,
    "future": True,
    "poolclass": NullPool,
    "connect_args": {
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "connection_class": SupabaseConnection,
    },
}

# Create async engine
engine = create_async_engine(
    settings.database_url,
    **engine_kwargs
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Create base class for declarative models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """
    Dependency function to get database session.

    Yields:
        AsyncSession: Database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database connections."""
    await engine.dispose()
