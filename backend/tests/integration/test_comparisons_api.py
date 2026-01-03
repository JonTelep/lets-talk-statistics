"""Integration tests for comparisons API endpoints."""

import pytest
from decimal import Decimal

from app.models.crime_data import CalculatedStatistic


@pytest.mark.integration
@pytest.mark.asyncio
class TestComparisonsAPI:
    """Test cases for comparisons API endpoints."""

    async def test_compare_years_success(self, client, db_session):
        """Test comparing statistics across multiple years."""
        # Add calculated statistics for multiple years
        for year in [2020, 2021, 2022]:
            stat = CalculatedStatistic(
                year=year,
                crime_type="murder",
                demographic_type="total",
                incident_count=100 + (year - 2020) * 10,
                population=1000000,
                per_capita_rate=Decimal(10.0 + (year - 2020))
            )
            db_session.add(stat)
        await db_session.commit()

        response = await client.get(
            "/api/v1/comparisons/years?crime_type=murder&years=2020,2021,2022"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["crime_type"] == "murder"
        assert data["comparison_type"] == "years"
        assert len(data["items"]) == 3
        assert data["items"][0]["label"] == "2020"
        assert data["items"][0]["incident_count"] == 100

    async def test_compare_years_too_few(self, client):
        """Test comparing with too few years."""
        response = await client.get(
            "/api/v1/comparisons/years?crime_type=murder&years=2022"
        )

        assert response.status_code == 400
        assert "at least 2 years" in response.json()["detail"]

    async def test_compare_years_too_many(self, client):
        """Test comparing with too many years."""
        years = ",".join(str(year) for year in range(2000, 2012))
        response = await client.get(
            f"/api/v1/comparisons/years?crime_type=murder&years={years}"
        )

        assert response.status_code == 400
        assert "Maximum 10 years" in response.json()["detail"]

    async def test_compare_states_success(self, client, db_session):
        """Test comparing statistics across multiple states."""
        # Add calculated statistics for multiple states
        for state in ["California", "Texas", "Florida"]:
            stat = CalculatedStatistic(
                year=2022,
                crime_type="murder",
                demographic_type="by_state",
                state=state,
                incident_count=100,
                population=1000000,
                per_capita_rate=Decimal("10.0")
            )
            db_session.add(stat)
        await db_session.commit()

        response = await client.get(
            "/api/v1/comparisons/states?year=2022&states=California,Texas,Florida"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["comparison_type"] == "states"
        assert len(data["items"]) == 3

    async def test_compare_states_too_few(self, client):
        """Test comparing with too few states."""
        response = await client.get(
            "/api/v1/comparisons/states?year=2022&states=California"
        )

        assert response.status_code == 400
        assert "at least 2 states" in response.json()["detail"]

    async def test_compare_demographics_success(self, client, db_session):
        """Test comparing across demographics."""
        # Add calculated statistics for different races
        for race in ["White", "Black or African American", "Hispanic or Latino"]:
            stat = CalculatedStatistic(
                year=2022,
                crime_type="murder",
                demographic_type="by_race",
                demographic_value=race,
                incident_count=100,
                population=1000000,
                per_capita_rate=Decimal("10.0")
            )
            db_session.add(stat)
        await db_session.commit()

        response = await client.get(
            "/api/v1/comparisons/demographics?year=2022&demographic_type=by_race"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["comparison_type"] == "by_race"
        assert len(data["items"]) == 3

    async def test_compare_demographics_invalid_type(self, client):
        """Test comparing with invalid demographic type."""
        response = await client.get(
            "/api/v1/comparisons/demographics?year=2022&demographic_type=invalid"
        )

        assert response.status_code == 400
        assert "Invalid demographic_type" in response.json()["detail"]
