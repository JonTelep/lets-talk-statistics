"""Integration tests for trends API endpoints."""

import pytest

from app.models.crime_data import CrimeStatistic, DataSource


@pytest.mark.integration
@pytest.mark.asyncio
class TestTrendsAPI:
    """Test cases for trends API endpoints."""

    async def test_get_trend_data_success(self, client, db_session):
        """Test getting trend data over multiple years."""
        # Add test data
        source = DataSource(
            source_name="FBI_UCR",
            data_type="murder_statistics",
            year=2022,
            status="processed"
        )
        db_session.add(source)
        await db_session.flush()

        # Add data for multiple years
        for year in [2020, 2021, 2022]:
            crime = CrimeStatistic(
                year=year,
                crime_type="murder",
                state="California",
                incident_count=100 + (year - 2020) * 10,
                population=1000000,
                source_id=source.id
            )
            db_session.add(crime)
        await db_session.commit()

        response = await client.get(
            "/api/v1/statistics/trends?crime_type=murder&start_year=2020&end_year=2022"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["crime_type"] == "murder"
        assert data["years"] == [2020, 2021, 2022]
        assert data["incident_counts"] == [100, 110, 120]
        assert len(data["per_capita_rates"]) == 3
        assert len(data["yoy_changes"]) == 3
        assert data["yoy_changes"][0] is None  # First year has no previous

    async def test_get_trend_data_with_filters(self, client, db_session):
        """Test trend data with demographic filters."""
        # Add test data
        source = DataSource(
            source_name="FBI_UCR",
            data_type="murder_statistics",
            year=2022,
            status="processed"
        )
        db_session.add(source)
        await db_session.flush()

        # Add data for multiple years and states
        for year in [2020, 2021, 2022]:
            for state in ["California", "Texas"]:
                crime = CrimeStatistic(
                    year=year,
                    crime_type="murder",
                    state=state,
                    incident_count=100 if state == "California" else 50,
                    population=1000000 if state == "California" else 500000,
                    source_id=source.id
                )
                db_session.add(crime)
        await db_session.commit()

        # Filter by state
        response = await client.get(
            "/api/v1/statistics/trends?crime_type=murder&start_year=2020&end_year=2022&state=California"
        )

        assert response.status_code == 200
        data = response.json()
        # Should only include California data
        assert all(count == 100 for count in data["incident_counts"])

    async def test_get_trend_data_invalid_year_range(self, client):
        """Test trend data with invalid year range."""
        response = await client.get(
            "/api/v1/statistics/trends?crime_type=murder&start_year=2022&end_year=2020"
        )

        assert response.status_code == 400
        assert "start_year must be <= end_year" in response.json()["detail"]

    async def test_get_trend_data_no_data(self, client):
        """Test trend data when no crime data exists."""
        response = await client.get(
            "/api/v1/statistics/trends?crime_type=murder&start_year=2020&end_year=2022"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["years"] == [2020, 2021, 2022]
        assert all(count == 0 for count in data["incident_counts"])
