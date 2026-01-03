"""Pytest configuration and shared fixtures."""

import asyncio
from typing import AsyncGenerator, Generator
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.main import app
from app.database import get_db
from app.models.crime_data import Base
from app.config import get_settings

settings = get_settings()

# Use a test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def db_engine():
    """Create a test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        poolclass=NullPool,
    )

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Drop all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture(scope="function")
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    async_session = async_sessionmaker(
        db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with async_session() as session:
        yield session
        await session.rollback()


@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create a test HTTP client."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def sample_crime_data():
    """Sample crime data for testing."""
    return {
        "year": 2022,
        "crime_type": "murder",
        "state": "California",
        "jurisdiction": "Los Angeles",
        "age_group": "18-24",
        "race": "White",
        "sex": "Male",
        "incident_count": 100,
        "population": 1000000,
        "source_id": 1
    }


@pytest.fixture
def sample_population_data():
    """Sample population data for testing."""
    return {
        "year": 2022,
        "state": "California",
        "age_group": "18-24",
        "race": "White",
        "sex": "Male",
        "population": 1000000,
        "source": "US Census Bureau"
    }


@pytest.fixture
def sample_data_source():
    """Sample data source for testing."""
    return {
        "source_name": "FBI_UCR",
        "source_url": "https://example.com/data.csv",
        "data_type": "murder_statistics",
        "year": 2022,
        "file_path": "/tmp/test_data.csv",
        "file_hash": "abc123",
        "status": "downloaded"
    }


@pytest.fixture
def sample_csv_content():
    """Sample CSV content for testing."""
    return """Year,State,Age,Race,Sex,Count
2022,California,18-24,White,Male,100
2022,California,18-24,Black or African American,Male,50
2022,California,25-34,White,Female,30
2022,Texas,18-24,White,Male,80
2022,Texas,18-24,Hispanic or Latino,Female,40
"""


@pytest.fixture
def sample_calculated_statistic():
    """Sample calculated statistic for testing."""
    return {
        "year": 2022,
        "crime_type": "murder",
        "demographic_type": "total",
        "demographic_value": None,
        "state": None,
        "incident_count": 300,
        "population": 2000000,
        "per_capita_rate": 15.0,
        "yoy_change": 5.2
    }
