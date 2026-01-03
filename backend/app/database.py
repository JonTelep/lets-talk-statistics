"""Database connection and session management."""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool

from app.config import get_settings

settings = get_settings()

# Detect Supabase pooled connection (PgBouncer)
# Pooled connections have prepared_statement_cache_size=0 parameter
is_pooled_connection = "prepared_statement_cache_size=0" in settings.database_url

# Configure engine based on connection type
engine_kwargs = {
    "echo": settings.debug,
    "future": True,
}

if is_pooled_connection:
    # Supabase pooled connection (port 6543)
    # Use NullPool since PgBouncer handles connection pooling
    engine_kwargs["poolclass"] = NullPool
else:
    # Direct connection (port 5432) or local database
    # Use built-in SQLAlchemy connection pooling
    engine_kwargs.update({
        "pool_size": settings.database_pool_size,
        "max_overflow": settings.database_max_overflow,
        "pool_pre_ping": settings.database_pool_pre_ping,
        "pool_recycle": settings.database_pool_recycle,
    })

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
