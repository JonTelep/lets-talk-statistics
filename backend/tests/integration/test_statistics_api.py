"""Integration tests for statistics API endpoints."""

import pytest
from decimal import Decimal

from app.models.crime_data import CrimeStatistic, CalculatedStatistic, DataSource


@pytest.mark.integration
@pytest.mark.asyncio
class TestStatisticsAPI:
    """Test cases for statistics API endpoints."""

    async def test_get_crime_statistics_empty(self, client):
        """Test getting crime statistics when no data exists."""
        response = await client.get("/api/v1/statistics/crimes?crime_type=murder&year=2022")

        assert response.status_code == 200
        data = response.json()
        assert data["crime_type"] == "murder"
        assert data["year"] == 2022
        assert data["total_incidents"] == 0

    async def test_get_crime_statistics_with_data(self, client, db_session):
        """Test getting crime statistics with existing data."""
        # Add test data
        source = DataSource(
            source_name="FBI_UCR",
            data_type="murder_statistics",
            year=2022,
            status="processed"
        )
        db_session.add(source)
        await db_session.flush()

        crime_data = [
            CrimeStatistic(
                year=2022,
                crime_type="murder",
                state="California",
                race="White",
                age_group="18-24",
                sex="Male",
                incident_count=100,
                population=1000000,
                source_id=source.id
            ),
            CrimeStatistic(
                year=2022,
                crime_type="murder",
                state="California",
                race="Black or African American",
                age_group="18-24",
                sex="Male",
                incident_count=50,
                population=500000,
                source_id=source.id
            ),
        ]

        for crime in crime_data:
            db_session.add(crime)
        await db_session.commit()

        response = await client.get("/api/v1/statistics/crimes?crime_type=murder&year=2022")

        assert response.status_code == 200
        data = response.json()
        assert data["crime_type"] == "murder"
        assert data["year"] == 2022
        assert data["total_incidents"] == 150
        assert data["population"] == 1500000

    async def test_get_crime_statistics_with_filters(self, client, db_session):
        """Test getting crime statistics with demographic filters."""
        # Add test data
        source = DataSource(
            source_name="FBI_UCR",
            data_type="murder_statistics",
            year=2022,
            status="processed"
        )
        db_session.add(source)
        await db_session.flush()

        crime_data = [
            CrimeStatistic(
                year=2022,
                crime_type="murder",
                state="California",
                race="White",
                age_group="18-24",
                sex="Male",
                incident_count=100,
                population=1000000,
                source_id=source.id
            ),
            CrimeStatistic(
                year=2022,
                crime_type="murder",
                state="Texas",
                race="White",
                age_group="18-24",
                sex="Male",
                incident_count=80,
                population=800000,
                source_id=source.id
            ),
        ]

        for crime in crime_data:
            db_session.add(crime)
        await db_session.commit()

        # Filter by state
        response = await client.get(
            "/api/v1/statistics/crimes?crime_type=murder&year=2022&state=California"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_incidents"] == 100
        assert data["filters"]["state"] == "California"

    async def test_get_per_capita_rates(self, client, db_session):
        """Test getting per capita rates."""
        # Add calculated statistics
        calc_stats = [
            CalculatedStatistic(
                year=2022,
                crime_type="murder",
                demographic_type="by_race",
                demographic_value="White",
                incident_count=100,
                population=1000000,
                per_capita_rate=Decimal("10.0")
            ),
            CalculatedStatistic(
                year=2022,
                crime_type="murder",
                demographic_type="by_race",
                demographic_value="Black or African American",
                incident_count=50,
                population=500000,
                per_capita_rate=Decimal("10.0")
            ),
        ]

        for stat in calc_stats:
            db_session.add(stat)
        await db_session.commit()

        response = await client.get(
            "/api/v1/statistics/per-capita?crime_type=murder&year=2022&demographic_type=by_race"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["crime_type"] == "murder"
        assert data["year"] == 2022
        assert data["demographic_type"] == "by_race"
        assert len(data["data"]) == 2

    async def test_get_demographic_breakdown(self, client, db_session):
        """Test getting demographic breakdown."""
        # Add test data
        source = DataSource(
            source_name="FBI_UCR",
            data_type="murder_statistics",
            year=2022,
            status="processed"
        )
        db_session.add(source)
        await db_session.flush()

        crime_data = [
            CrimeStatistic(
                year=2022,
                crime_type="murder",
                state="California",
                race="White",
                incident_count=100,
                population=1000000,
                source_id=source.id
            ),
            CrimeStatistic(
                year=2022,
                crime_type="murder",
                state="California",
                race="Black or African American",
                incident_count=50,
                population=500000,
                source_id=source.id
            ),
        ]

        for crime in crime_data:
            db_session.add(crime)
        await db_session.commit()

        response = await client.get(
            "/api/v1/statistics/demographics?crime_type=murder&year=2022&breakdown_by=race"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["breakdown_by"] == "race"
        assert len(data["data"]) == 2

    async def test_get_demographic_breakdown_invalid_field(self, client):
        """Test demographic breakdown with invalid breakdown field."""
        response = await client.get(
            "/api/v1/statistics/demographics?crime_type=murder&year=2022&breakdown_by=invalid"
        )

        assert response.status_code == 400
        assert "Invalid breakdown_by parameter" in response.json()["detail"]

    async def test_list_crime_statistics_pagination(self, client, db_session):
        """Test listing crime statistics with pagination."""
        # Add test data
        source = DataSource(
            source_name="FBI_UCR",
            data_type="murder_statistics",
            year=2022,
            status="processed"
        )
        db_session.add(source)
        await db_session.flush()

        # Add 150 records
        for i in range(150):
            crime = CrimeStatistic(
                year=2022,
                crime_type="murder",
                state="California",
                incident_count=10,
                source_id=source.id
            )
            db_session.add(crime)
        await db_session.commit()

        # Get first page
        response = await client.get(
            "/api/v1/statistics/list?crime_type=murder&page=1&page_size=50"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 50
        assert data["pagination"]["page"] == 1
        assert data["pagination"]["total_records"] == 150
        assert data["pagination"]["total_pages"] == 3
        assert data["pagination"]["has_next"] is True
        assert data["pagination"]["has_previous"] is False

        # Get second page
        response = await client.get(
            "/api/v1/statistics/list?crime_type=murder&page=2&page_size=50"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 50
        assert data["pagination"]["page"] == 2
        assert data["pagination"]["has_next"] is True
        assert data["pagination"]["has_previous"] is True

    async def test_search_crime_statistics(self, client, db_session):
        """Test advanced search functionality."""
        # Add test data
        source = DataSource(
            source_name="FBI_UCR",
            data_type="murder_statistics",
            year=2022,
            status="processed"
        )
        db_session.add(source)
        await db_session.flush()

        crime_data = [
            CrimeStatistic(
                year=2022,
                crime_type="murder",
                state="California",
                race="White",
                incident_count=100,
                source_id=source.id
            ),
            CrimeStatistic(
                year=2022,
                crime_type="murder",
                state="Texas",
                race="White",
                incident_count=80,
                source_id=source.id
            ),
            CrimeStatistic(
                year=2022,
                crime_type="murder",
                state="California",
                race="Black or African American",
                incident_count=50,
                source_id=source.id
            ),
        ]

        for crime in crime_data:
            db_session.add(crime)
        await db_session.commit()

        # Search with filters
        search_filters = {
            "crime_type": "murder",
            "years": [2022],
            "states": ["California"],
            "races": ["White"]
        }

        response = await client.post(
            "/api/v1/statistics/search",
            json=search_filters
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_results"] == 1
        assert len(data["results"]) == 1
        assert data["results"][0]["state"] == "California"
        assert data["results"][0]["race"] == "White"
