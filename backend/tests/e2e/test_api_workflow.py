"""End-to-end tests for complete API workflows."""

import pytest
from decimal import Decimal

from app.models.crime_data import DataSource, CrimeStatistic, PopulationData, CalculatedStatistic


@pytest.mark.e2e
@pytest.mark.asyncio
class TestAPIWorkflow:
    """Test complete API workflows from data ingestion to querying."""

    async def test_query_workflow(self, client, db_session):
        """Test complete workflow: add data -> query statistics."""
        # Setup: Add test data
        source = DataSource(
            source_name="FBI_UCR",
            data_type="murder_statistics",
            year=2022,
            status="processed"
        )
        db_session.add(source)
        await db_session.flush()

        # Add crime data for multiple demographics
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

        # Test 1: Get all crime statistics
        response = await client.get("/api/v1/statistics/crimes?crime_type=murder&year=2022")
        assert response.status_code == 200
        data = response.json()
        assert data["total_incidents"] == 150

        # Test 2: Get filtered statistics
        response = await client.get(
            "/api/v1/statistics/crimes?crime_type=murder&year=2022&race=White"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_incidents"] == 100

        # Test 3: Get demographic breakdown
        response = await client.get(
            "/api/v1/statistics/demographics?year=2022&breakdown_by=race"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 2

        # Test 4: Export to CSV
        response = await client.get("/api/v1/csv?crime_type=murder&year=2022")
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv; charset=utf-8"

    async def test_comparison_workflow(self, client, db_session):
        """Test workflow: add calculated stats -> compare."""
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

        # Test 1: Compare years
        response = await client.get(
            "/api/v1/comparisons/years?years=2020,2021,2022"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3

        # Test 2: Get trend data
        response = await client.get(
            "/api/v1/statistics/trends?start_year=2020&end_year=2022"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["years"]) == 3
        assert data["incident_counts"] == [100, 110, 120]

    async def test_rankings_workflow(self, client, db_session):
        """Test workflow: add state stats -> get rankings."""
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
                incident_count=int(rate * 10),
                population=1000000,
                per_capita_rate=Decimal(str(rate)),
                yoy_change=Decimal("5.0") if state == "California" else Decimal("2.0")
            )
            db_session.add(stat)
        await db_session.commit()

        # Test 1: Get top states
        response = await client.get("/api/v1/rankings/top-states?year=2022&limit=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data["rankings"]) == 2
        assert data["rankings"][0]["state"] == "California"

        # Test 2: Get bottom states
        response = await client.get("/api/v1/rankings/bottom-states?year=2022&limit=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data["rankings"]) == 2
        assert data["rankings"][0]["state"] == "New York"

        # Test 3: Get biggest changes
        response = await client.get(
            "/api/v1/rankings/biggest-changes?year=2022&change_type=increase"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["rankings"][0]["state"] == "California"

        # Test 4: Compare states
        response = await client.get(
            "/api/v1/comparisons/states?year=2022&states=California,Texas,Florida"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3

    async def test_analytics_workflow(self, client, db_session):
        """Test workflow: add multi-year data -> get analytics."""
        # Add data for multiple years
        for year in range(2020, 2023):
            # Total statistic
            total_stat = CalculatedStatistic(
                year=year,
                crime_type="murder",
                demographic_type="total",
                incident_count=100 + (year - 2020) * 10,
                population=1000000,
                per_capita_rate=Decimal(10.0 + (year - 2020))
            )
            db_session.add(total_stat)

            # State statistics
            for state in ["California", "Texas", "Florida"]:
                state_stat = CalculatedStatistic(
                    year=year,
                    crime_type="murder",
                    demographic_type="by_state",
                    state=state,
                    incident_count=50,
                    population=500000,
                    per_capita_rate=Decimal("10.0")
                )
                db_session.add(state_stat)

        await db_session.commit()

        # Test 1: Get analytics summary
        response = await client.get(
            "/api/v1/analytics/summary?start_year=2020&end_year=2022"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["start_year"] == 2020
        assert data["end_year"] == 2022
        assert len(data["yearly_summaries"]) == 3
        assert data["total_incidents"] == 330  # 100 + 110 + 120
        assert len(data["top_states"]) > 0
        assert len(data["bottom_states"]) > 0

        # Test 2: Get year summary
        response = await client.get("/api/v1/analytics/year-summary/2022")
        assert response.status_code == 200
        data = response.json()
        assert data["year"] == 2022
        assert "total" in data
        assert "breakdowns" in data

        # Test 3: Get state profile
        response = await client.get(
            "/api/v1/analytics/state-profile/California?start_year=2020&end_year=2022"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["state"] == "California"
        assert len(data["trend_data"]) == 3

    async def test_search_workflow(self, client, db_session):
        """Test workflow: add diverse data -> advanced search."""
        source = DataSource(
            source_name="FBI_UCR",
            data_type="murder_statistics",
            year=2022,
            status="processed"
        )
        db_session.add(source)
        await db_session.flush()

        # Add diverse crime data
        crime_data = []
        for state in ["California", "Texas", "Florida"]:
            for race in ["White", "Black or African American"]:
                crime = CrimeStatistic(
                    year=2022,
                    crime_type="murder",
                    state=state,
                    race=race,
                    incident_count=100 if state == "California" else 50,
                    source_id=source.id
                )
                crime_data.append(crime)

        for crime in crime_data:
            db_session.add(crime)
        await db_session.commit()

        # Test search with multiple filters
        search_filters = {
            "crime_type": "murder",
            "years": [2022],
            "states": ["California", "Texas"],
            "races": ["White"],
            "min_incidents": 50
        }

        response = await client.post(
            "/api/v1/statistics/search",
            json=search_filters
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total_results"] == 2  # California and Texas, both White
        assert all(r["race"] == "White" for r in data["results"])
        assert all(r["state"] in ["California", "Texas"] for r in data["results"])
