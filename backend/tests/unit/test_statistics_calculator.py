"""Unit tests for StatisticsCalculator service."""

import pytest
from decimal import Decimal

from app.services.statistics_calculator import StatisticsCalculator, StatisticsCalculatorError
from app.models.crime_data import CrimeStatistic, PopulationData, CalculatedStatistic


@pytest.mark.unit
@pytest.mark.asyncio
class TestStatisticsCalculator:
    """Test cases for StatisticsCalculator service."""

    @pytest.fixture
    def calculator(self):
        """Create a StatisticsCalculator instance."""
        return StatisticsCalculator()

    async def test_calculate_per_capita_rate_success(self, calculator):
        """Test successful per capita rate calculation."""
        result = await calculator.calculate_per_capita_rate(1000, 100000)

        assert result is not None
        assert isinstance(result, Decimal)
        assert result == Decimal("1000.0000")

    async def test_calculate_per_capita_rate_zero_population(self, calculator):
        """Test per capita rate with zero population."""
        result = await calculator.calculate_per_capita_rate(1000, 0)
        assert result is None

    async def test_calculate_per_capita_rate_none_population(self, calculator):
        """Test per capita rate with None population."""
        result = await calculator.calculate_per_capita_rate(1000, None)
        assert result is None

    async def test_calculate_per_capita_rate_zero_incidents(self, calculator):
        """Test per capita rate with zero incidents."""
        result = await calculator.calculate_per_capita_rate(0, 100000)

        assert result is not None
        assert result == Decimal("0.0000")

    async def test_calculate_yoy_change_increase(self, calculator):
        """Test year-over-year change calculation with increase."""
        result = await calculator.calculate_yoy_change(110.0, 100.0)

        assert result is not None
        assert isinstance(result, Decimal)
        assert result == Decimal("10.00")

    async def test_calculate_yoy_change_decrease(self, calculator):
        """Test year-over-year change calculation with decrease."""
        result = await calculator.calculate_yoy_change(90.0, 100.0)

        assert result is not None
        assert result == Decimal("-10.00")

    async def test_calculate_yoy_change_no_change(self, calculator):
        """Test year-over-year change with no change."""
        result = await calculator.calculate_yoy_change(100.0, 100.0)

        assert result is not None
        assert result == Decimal("0.00")

    async def test_calculate_yoy_change_zero_previous(self, calculator):
        """Test YoY change with zero previous value."""
        result = await calculator.calculate_yoy_change(100.0, 0.0)
        assert result is None

    async def test_calculate_yoy_change_none_values(self, calculator):
        """Test YoY change with None values."""
        result = await calculator.calculate_yoy_change(None, 100.0)
        assert result is None

        result = await calculator.calculate_yoy_change(100.0, None)
        assert result is None

    async def test_calculate_statistics_for_year_no_data(self, calculator, db_session):
        """Test statistics calculation with no crime data."""
        with pytest.raises(StatisticsCalculatorError):
            await calculator.calculate_statistics_for_year(
                year=2022,
                crime_type="murder",
                db=db_session
            )

    async def test_check_calculated_statistics_exist_false(self, calculator, db_session):
        """Test checking for non-existent calculated statistics."""
        exists = await calculator.check_calculated_statistics_exist(
            db=db_session,
            year=2022,
            crime_type="murder"
        )
        assert exists is False

    async def test_check_calculated_statistics_exist_true(self, calculator, db_session):
        """Test checking for existing calculated statistics."""
        # Add a calculated statistic
        stat = CalculatedStatistic(
            year=2022,
            crime_type="murder",
            demographic_type="total",
            incident_count=100,
            population=10000,
            per_capita_rate=Decimal("1000.0")
        )
        db_session.add(stat)
        await db_session.commit()

        exists = await calculator.check_calculated_statistics_exist(
            db=db_session,
            year=2022,
            crime_type="murder"
        )
        assert exists is True

    async def test_get_calculated_statistics_empty(self, calculator, db_session):
        """Test getting calculated statistics when none exist."""
        stats = await calculator.get_calculated_statistics(
            db=db_session,
            year=2022,
            crime_type="murder"
        )
        assert len(stats) == 0

    async def test_get_calculated_statistics_with_filter(self, calculator, db_session):
        """Test getting calculated statistics with demographic filter."""
        # Add multiple calculated statistics
        stats_data = [
            CalculatedStatistic(
                year=2022,
                crime_type="murder",
                demographic_type="total",
                incident_count=100,
                population=10000,
                per_capita_rate=Decimal("1000.0")
            ),
            CalculatedStatistic(
                year=2022,
                crime_type="murder",
                demographic_type="by_race",
                demographic_value="White",
                incident_count=50,
                population=5000,
                per_capita_rate=Decimal("1000.0")
            ),
        ]

        for stat in stats_data:
            db_session.add(stat)
        await db_session.commit()

        # Get only by_race statistics
        stats = await calculator.get_calculated_statistics(
            db=db_session,
            year=2022,
            crime_type="murder",
            demographic_type="by_race"
        )

        assert len(stats) == 1
        assert stats[0].demographic_type == "by_race"
        assert stats[0].demographic_value == "White"

    async def test_delete_calculated_statistics(self, calculator, db_session):
        """Test deleting calculated statistics."""
        # Add statistics
        stat = CalculatedStatistic(
            year=2022,
            crime_type="murder",
            demographic_type="total",
            incident_count=100,
            population=10000,
            per_capita_rate=Decimal("1000.0")
        )
        db_session.add(stat)
        await db_session.commit()

        # Delete
        deleted = await calculator.delete_calculated_statistics(
            year=2022,
            crime_type="murder",
            db=db_session
        )

        assert deleted == 1

        # Verify deleted
        exists = await calculator.check_calculated_statistics_exist(
            db=db_session,
            year=2022,
            crime_type="murder"
        )
        assert exists is False

    async def test_delete_calculated_statistics_with_filter(self, calculator, db_session):
        """Test deleting calculated statistics with crime type filter."""
        # Add multiple crime types
        stats_data = [
            CalculatedStatistic(
                year=2022,
                crime_type="murder",
                demographic_type="total",
                incident_count=100,
                population=10000,
                per_capita_rate=Decimal("1000.0")
            ),
            CalculatedStatistic(
                year=2022,
                crime_type="robbery",
                demographic_type="total",
                incident_count=200,
                population=10000,
                per_capita_rate=Decimal("2000.0")
            ),
        ]

        for stat in stats_data:
            db_session.add(stat)
        await db_session.commit()

        # Delete only murder
        deleted = await calculator.delete_calculated_statistics(
            year=2022,
            crime_type="murder",
            db=db_session
        )

        assert deleted == 1

        # Verify murder deleted but robbery remains
        murder_exists = await calculator.check_calculated_statistics_exist(
            db=db_session,
            year=2022,
            crime_type="murder"
        )
        assert murder_exists is False

        robbery_exists = await calculator.check_calculated_statistics_exist(
            db=db_session,
            year=2022,
            crime_type="robbery"
        )
        assert robbery_exists is True
