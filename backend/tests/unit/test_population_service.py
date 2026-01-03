"""Unit tests for PopulationService."""

import pytest
from app.services.population_service import PopulationService, PopulationServiceError
from app.models.crime_data import PopulationData


@pytest.mark.unit
@pytest.mark.asyncio
class TestPopulationService:
    """Test cases for PopulationService."""

    @pytest.fixture
    def service(self):
        """Create a PopulationService instance."""
        return PopulationService()

    async def test_get_population_no_data(self, service, db_session):
        """Test getting population when no data exists."""
        population = await service.get_population(
            db=db_session,
            year=2022,
            state="California"
        )
        assert population is None

    async def test_get_population_state_only(self, service, db_session):
        """Test getting population for state only."""
        # Add population data
        pop_data = [
            PopulationData(year=2022, state="California", population=500000),
            PopulationData(year=2022, state="California", population=300000),
        ]

        for pop in pop_data:
            db_session.add(pop)
        await db_session.commit()

        population = await service.get_population(
            db=db_session,
            year=2022,
            state="California"
        )

        assert population == 800000  # Sum of both records

    async def test_get_population_all_states(self, service, db_session):
        """Test getting total population for all states."""
        # Add population data for multiple states
        pop_data = [
            PopulationData(year=2022, state="California", population=500000),
            PopulationData(year=2022, state="Texas", population=300000),
            PopulationData(year=2022, state="Florida", population=200000),
        ]

        for pop in pop_data:
            db_session.add(pop)
        await db_session.commit()

        population = await service.get_population(
            db=db_session,
            year=2022,
            state=None  # All states
        )

        assert population == 1000000

    async def test_get_population_with_demographics(self, service, db_session):
        """Test getting population with demographic filters."""
        # Add population data with demographics
        pop_data = [
            PopulationData(
                year=2022,
                state="California",
                race="White",
                age_group="18-24",
                sex="Male",
                population=100000
            ),
            PopulationData(
                year=2022,
                state="California",
                race="White",
                age_group="18-24",
                sex="Female",
                population=95000
            ),
        ]

        for pop in pop_data:
            db_session.add(pop)
        await db_session.commit()

        # Get specific demographic
        population = await service.get_population(
            db=db_session,
            year=2022,
            state="California",
            race="White",
            age_group="18-24",
            sex="Male"
        )

        assert population == 100000

        # Get by race and age (both sexes)
        population = await service.get_population(
            db=db_session,
            year=2022,
            state="California",
            race="White",
            age_group="18-24"
        )

        assert population == 195000

    async def test_check_population_data_exists_false(self, service, db_session):
        """Test checking for non-existent population data."""
        exists = await service.check_population_data_exists(
            db=db_session,
            year=2022
        )
        assert exists is False

    async def test_check_population_data_exists_true(self, service, db_session):
        """Test checking for existing population data."""
        # Add population data
        pop = PopulationData(year=2022, state="California", population=500000)
        db_session.add(pop)
        await db_session.commit()

        exists = await service.check_population_data_exists(
            db=db_session,
            year=2022
        )
        assert exists is True

    async def test_delete_population_data(self, service, db_session):
        """Test deleting population data."""
        # Add population data
        pop_data = [
            PopulationData(year=2022, state="California", population=500000),
            PopulationData(year=2022, state="Texas", population=300000),
            PopulationData(year=2021, state="California", population=480000),
        ]

        for pop in pop_data:
            db_session.add(pop)
        await db_session.commit()

        # Delete 2022 data
        deleted = await service.delete_population_data(
            db=db_session,
            year=2022
        )

        assert deleted == 2

        # Verify 2022 deleted but 2021 remains
        exists_2022 = await service.check_population_data_exists(
            db=db_session,
            year=2022
        )
        assert exists_2022 is False

        exists_2021 = await service.check_population_data_exists(
            db=db_session,
            year=2021
        )
        assert exists_2021 is True

    async def test_delete_population_data_with_state_filter(self, service, db_session):
        """Test deleting population data with state filter."""
        # Add population data
        pop_data = [
            PopulationData(year=2022, state="California", population=500000),
            PopulationData(year=2022, state="Texas", population=300000),
        ]

        for pop in pop_data:
            db_session.add(pop)
        await db_session.commit()

        # Delete only California
        deleted = await service.delete_population_data(
            db=db_session,
            year=2022,
            state="California"
        )

        assert deleted == 1

        # Verify California deleted but Texas remains
        pop = await service.get_population(
            db=db_session,
            year=2022,
            state="California"
        )
        assert pop is None

        pop = await service.get_population(
            db=db_session,
            year=2022,
            state="Texas"
        )
        assert pop == 300000

    async def test_get_available_states(self, service, db_session):
        """Test getting list of available states."""
        # Add population data for multiple states
        pop_data = [
            PopulationData(year=2022, state="California", population=500000),
            PopulationData(year=2022, state="California", population=300000),
            PopulationData(year=2022, state="Texas", population=200000),
            PopulationData(year=2022, state="Florida", population=150000),
        ]

        for pop in pop_data:
            db_session.add(pop)
        await db_session.commit()

        states = await service.get_available_states(
            db=db_session,
            year=2022
        )

        assert len(states) == 3
        assert "California" in states
        assert "Texas" in states
        assert "Florida" in states

    async def test_state_fips_mapping(self, service):
        """Test that STATE_FIPS contains expected mappings."""
        assert "California" in service.STATE_FIPS
        assert service.STATE_FIPS["California"] == "06"

        assert "Texas" in service.STATE_FIPS
        assert service.STATE_FIPS["Texas"] == "48"

        assert "District of Columbia" in service.STATE_FIPS
        assert service.STATE_FIPS["District of Columbia"] == "11"

        # Should have 51 jurisdictions (50 states + DC)
        assert len(service.STATE_FIPS) == 51
