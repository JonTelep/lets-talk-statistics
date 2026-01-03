"""Integration tests for rankings API endpoints."""

import pytest
from decimal import Decimal

from app.models.crime_data import CalculatedStatistic


@pytest.mark.integration
@pytest.mark.asyncio
class TestRankingsAPI:
    """Test cases for rankings API endpoints."""

    async def test_get_state_rankings_desc(self, client, db_session):
        """Test getting state rankings in descending order (highest first)."""
        # Add calculated statistics for multiple states
        states_data = [
            ("California", 15.0),
            ("Texas", 12.0),
            ("Florida", 10.0),
            ("New York", 8.0),
        ]

        for state, rate in states_data:
            stat = CalculatedStatistic(
                year=2022,
                crime_type="murder",
                demographic_type="by_state",
                state=state,
                incident_count=100,
                population=1000000,
                per_capita_rate=Decimal(str(rate))
            )
            db_session.add(stat)
        await db_session.commit()

        response = await client.get(
            "/api/v1/rankings/states?year=2022&order=desc&limit=3"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["order"] == "desc"
        assert len(data["rankings"]) == 3
        assert data["rankings"][0]["state"] == "California"
        assert data["rankings"][0]["rank"] == 1
        assert data["rankings"][1]["state"] == "Texas"
        assert data["rankings"][1]["rank"] == 2

    async def test_get_state_rankings_asc(self, client, db_session):
        """Test getting state rankings in ascending order (lowest first)."""
        # Add calculated statistics
        states_data = [
            ("California", 15.0),
            ("Texas", 12.0),
            ("Florida", 10.0),
            ("New York", 8.0),
        ]

        for state, rate in states_data:
            stat = CalculatedStatistic(
                year=2022,
                crime_type="murder",
                demographic_type="by_state",
                state=state,
                incident_count=100,
                population=1000000,
                per_capita_rate=Decimal(str(rate))
            )
            db_session.add(stat)
        await db_session.commit()

        response = await client.get(
            "/api/v1/rankings/states?year=2022&order=asc&limit=3"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["order"] == "asc"
        assert len(data["rankings"]) == 3
        assert data["rankings"][0]["state"] == "New York"
        assert data["rankings"][0]["rank"] == 1

    async def test_get_state_rankings_invalid_order(self, client):
        """Test rankings with invalid order parameter."""
        response = await client.get(
            "/api/v1/rankings/states?year=2022&order=invalid"
        )

        assert response.status_code == 400
        assert "Order must be" in response.json()["detail"]

    async def test_get_demographic_rankings(self, client, db_session):
        """Test getting demographic rankings."""
        # Add calculated statistics for different races
        races_data = [
            ("White", 10.0),
            ("Black or African American", 15.0),
            ("Hispanic or Latino", 12.0),
        ]

        for race, rate in races_data:
            stat = CalculatedStatistic(
                year=2022,
                crime_type="murder",
                demographic_type="by_race",
                demographic_value=race,
                incident_count=100,
                population=1000000,
                per_capita_rate=Decimal(str(rate))
            )
            db_session.add(stat)
        await db_session.commit()

        response = await client.get(
            "/api/v1/rankings/demographics?year=2022&demographic_type=by_race&order=desc"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["ranking_by"] == "by_race"
        assert len(data["rankings"]) == 3
        assert data["rankings"][0]["demographic_value"] == "Black or African American"

    async def test_get_top_states(self, client, db_session):
        """Test convenience endpoint for top states."""
        # Add test data
        states_data = [
            ("California", 15.0),
            ("Texas", 12.0),
            ("Florida", 10.0),
        ]

        for state, rate in states_data:
            stat = CalculatedStatistic(
                year=2022,
                crime_type="murder",
                demographic_type="by_state",
                state=state,
                incident_count=100,
                population=1000000,
                per_capita_rate=Decimal(str(rate))
            )
            db_session.add(stat)
        await db_session.commit()

        response = await client.get(
            "/api/v1/rankings/top-states?year=2022&limit=2"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["rankings"]) == 2
        assert data["rankings"][0]["state"] == "California"

    async def test_get_bottom_states(self, client, db_session):
        """Test convenience endpoint for bottom states."""
        # Add test data
        states_data = [
            ("California", 15.0),
            ("Texas", 12.0),
            ("Florida", 10.0),
        ]

        for state, rate in states_data:
            stat = CalculatedStatistic(
                year=2022,
                crime_type="murder",
                demographic_type="by_state",
                state=state,
                incident_count=100,
                population=1000000,
                per_capita_rate=Decimal(str(rate))
            )
            db_session.add(stat)
        await db_session.commit()

        response = await client.get(
            "/api/v1/rankings/bottom-states?year=2022&limit=2"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["rankings"]) == 2
        assert data["rankings"][0]["state"] == "Florida"

    async def test_get_biggest_changes(self, client, db_session):
        """Test getting biggest year-over-year changes."""
        # Add statistics with YoY changes
        states_data = [
            ("California", 15.0, 10.0),
            ("Texas", 12.0, -5.0),
            ("Florida", 10.0, 2.0),
        ]

        for state, rate, yoy_change in states_data:
            stat = CalculatedStatistic(
                year=2022,
                crime_type="murder",
                demographic_type="by_state",
                state=state,
                incident_count=100,
                population=1000000,
                per_capita_rate=Decimal(str(rate)),
                yoy_change=Decimal(str(yoy_change))
            )
            db_session.add(stat)
        await db_session.commit()

        # Get biggest increases
        response = await client.get(
            "/api/v1/rankings/biggest-changes?year=2022&change_type=increase"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["rankings"][0]["state"] == "California"
        assert data["rankings"][0]["change_from_previous_year"] == 10.0

        # Get biggest decreases
        response = await client.get(
            "/api/v1/rankings/biggest-changes?year=2022&change_type=decrease"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["rankings"][0]["state"] == "Texas"
        assert data["rankings"][0]["change_from_previous_year"] == -5.0
