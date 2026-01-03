"""End-to-end tests for the complete data pipeline."""

import pytest
from decimal import Decimal

from app.models.crime_data import DataSource, CrimeStatistic, PopulationData, CalculatedStatistic
from app.services.statistics_calculator import StatisticsCalculator
from app.services.population_service import PopulationService


@pytest.mark.e2e
@pytest.mark.asyncio
class TestDataPipeline:
    """Test complete data pipeline workflows."""

    async def test_complete_pipeline_manual_data(self, db_session):
        """Test complete pipeline with manually created data."""
        # Step 1: Create data source
        source = DataSource(
            source_name="FBI_UCR",
            data_type="murder_statistics",
            year=2022,
            status="processed"
        )
        db_session.add(source)
        await db_session.flush()

        # Step 2: Add crime statistics
        crime_data = [
            CrimeStatistic(
                year=2022,
                crime_type="murder",
                state="California",
                race="White",
                age_group="18-24",
                sex="Male",
                incident_count=100,
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
                source_id=source.id
            ),
        ]

        for crime in crime_data:
            db_session.add(crime)
        await db_session.commit()

        # Step 3: Add population data
        pop_service = PopulationService()
        population_data = [
            PopulationData(year=2022, state="California", race="White", age_group="18-24", sex="Male", population=1000000),
            PopulationData(year=2022, state="California", race="Black or African American", age_group="18-24", sex="Male", population=500000),
            PopulationData(year=2022, state="Texas", race="White", age_group="18-24", sex="Male", population=800000),
            PopulationData(year=2022, state="California", population=5000000),
            PopulationData(year=2022, state="Texas", population=3000000),
            PopulationData(year=2022, population=8000000),  # Total
        ]

        for pop in population_data:
            db_session.add(pop)
        await db_session.commit()

        # Step 4: Calculate statistics
        calculator = StatisticsCalculator()
        result = await calculator.calculate_statistics_for_year(
            year=2022,
            crime_type="murder",
            db=db_session
        )

        # Verify results
        assert result["status"] == "success"
        assert result["total_records_calculated"] > 0
        assert result["breakdowns"]["total"] == 1
        assert result["breakdowns"]["by_race"] > 0
        assert result["breakdowns"]["by_state"] > 0

        # Step 5: Query calculated statistics
        stats = await calculator.get_calculated_statistics(
            db=db_session,
            year=2022,
            crime_type="murder"
        )

        assert len(stats) > 0

        # Verify total statistics
        total_stat = next((s for s in stats if s.demographic_type == "total"), None)
        assert total_stat is not None
        assert total_stat.incident_count == 230  # 100 + 50 + 80
        assert total_stat.per_capita_rate is not None

        # Verify state statistics
        ca_stat = next((s for s in stats if s.state == "California" and s.demographic_type == "by_state"), None)
        assert ca_stat is not None
        assert ca_stat.incident_count == 150  # 100 + 50

        tx_stat = next((s for s in stats if s.state == "Texas" and s.demographic_type == "by_state"), None)
        assert tx_stat is not None
        assert tx_stat.incident_count == 80

    async def test_pipeline_with_yoy_calculation(self, db_session):
        """Test pipeline with year-over-year change calculation."""
        source = DataSource(
            source_name="FBI_UCR",
            data_type="murder_statistics",
            year=2022,
            status="processed"
        )
        db_session.add(source)
        await db_session.flush()

        # Add data for 2021 and 2022
        for year in [2021, 2022]:
            crime = CrimeStatistic(
                year=year,
                crime_type="murder",
                state="California",
                incident_count=100 if year == 2021 else 110,
                source_id=source.id
            )
            db_session.add(crime)

            pop = PopulationData(
                year=year,
                state="California",
                population=1000000
            )
            db_session.add(pop)

        await db_session.commit()

        # Calculate for both years
        calculator = StatisticsCalculator()

        # Calculate 2021 first
        await calculator.calculate_statistics_for_year(
            year=2021,
            crime_type="murder",
            db=db_session
        )

        # Calculate 2022 (should include YoY)
        result = await calculator.calculate_statistics_for_year(
            year=2022,
            crime_type="murder",
            db=db_session
        )

        assert result["status"] == "success"

        # Get 2022 statistics
        stats_2022 = await calculator.get_calculated_statistics(
            db=db_session,
            year=2022,
            crime_type="murder",
            demographic_type="by_state"
        )

        ca_stat = next((s for s in stats_2022 if s.state == "California"), None)
        assert ca_stat is not None
        assert ca_stat.yoy_change is not None
        assert ca_stat.yoy_change > 0  # 110 > 100, should be positive

    async def test_pipeline_multiple_crime_types(self, db_session):
        """Test pipeline with multiple crime types."""
        source = DataSource(
            source_name="FBI_UCR",
            data_type="crime_statistics",
            year=2022,
            status="processed"
        )
        db_session.add(source)
        await db_session.flush()

        # Add data for murder and robbery
        crime_data = [
            CrimeStatistic(
                year=2022,
                crime_type="murder",
                state="California",
                incident_count=100,
                source_id=source.id
            ),
            CrimeStatistic(
                year=2022,
                crime_type="robbery",
                state="California",
                incident_count=500,
                source_id=source.id
            ),
        ]

        for crime in crime_data:
            db_session.add(crime)

        pop = PopulationData(year=2022, state="California", population=1000000)
        db_session.add(pop)
        await db_session.commit()

        # Calculate statistics for both crime types
        calculator = StatisticsCalculator()

        murder_result = await calculator.calculate_statistics_for_year(
            year=2022,
            crime_type="murder",
            db=db_session
        )

        robbery_result = await calculator.calculate_statistics_for_year(
            year=2022,
            crime_type="robbery",
            db=db_session
        )

        assert murder_result["status"] == "success"
        assert robbery_result["status"] == "success"

        # Verify separate statistics exist
        murder_stats = await calculator.get_calculated_statistics(
            db=db_session,
            year=2022,
            crime_type="murder"
        )

        robbery_stats = await calculator.get_calculated_statistics(
            db=db_session,
            year=2022,
            crime_type="robbery"
        )

        assert len(murder_stats) > 0
        assert len(robbery_stats) > 0

        # Verify different incident counts
        murder_total = next((s for s in murder_stats if s.demographic_type == "total"), None)
        robbery_total = next((s for s in robbery_stats if s.demographic_type == "total"), None)

        assert murder_total.incident_count == 100
        assert robbery_total.incident_count == 500

    async def test_pipeline_recalculation(self, db_session):
        """Test recalculating statistics after data updates."""
        source = DataSource(
            source_name="FBI_UCR",
            data_type="murder_statistics",
            year=2022,
            status="processed"
        )
        db_session.add(source)
        await db_session.flush()

        # Add initial crime data
        crime = CrimeStatistic(
            year=2022,
            crime_type="murder",
            state="California",
            incident_count=100,
            source_id=source.id
        )
        db_session.add(crime)

        pop = PopulationData(year=2022, state="California", population=1000000)
        db_session.add(pop)
        await db_session.commit()

        # Calculate initial statistics
        calculator = StatisticsCalculator()
        await calculator.calculate_statistics_for_year(
            year=2022,
            crime_type="murder",
            db=db_session
        )

        # Verify initial calculation
        stats = await calculator.get_calculated_statistics(
            db=db_session,
            year=2022,
            crime_type="murder",
            demographic_type="by_state"
        )

        ca_stat = next((s for s in stats if s.state == "California"), None)
        assert ca_stat.incident_count == 100

        # Update crime data
        crime.incident_count = 150
        await db_session.commit()

        # Recalculate
        result = await calculator.recalculate_all_for_year(
            year=2022,
            crime_type="murder",
            db=db_session
        )

        assert result["status"] == "success"
        assert result["records_deleted"] > 0

        # Verify updated statistics
        updated_stats = await calculator.get_calculated_statistics(
            db=db_session,
            year=2022,
            crime_type="murder",
            demographic_type="by_state"
        )

        updated_ca_stat = next((s for s in updated_stats if s.state == "California"), None)
        assert updated_ca_stat.incident_count == 150
