"""Population data service for US Census Bureau integration."""

import asyncio
from typing import Optional, List, Dict, Any, Tuple

import httpx
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.crime_data import PopulationData
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class PopulationServiceError(Exception):
    """Custom exception for population service errors."""
    pass


class PopulationService:
    """
    Service for fetching and managing population data from US Census Bureau.

    Uses the Census Bureau's Population Estimates API to get demographic
    breakdowns by state, age, race, and sex.
    """

    # Census API base URL
    CENSUS_API_BASE = "https://api.census.gov/data"

    # State FIPS codes mapping
    STATE_FIPS = {
        "Alabama": "01", "Alaska": "02", "Arizona": "04", "Arkansas": "05",
        "California": "06", "Colorado": "08", "Connecticut": "09", "Delaware": "10",
        "Florida": "12", "Georgia": "13", "Hawaii": "15", "Idaho": "16",
        "Illinois": "17", "Indiana": "18", "Iowa": "19", "Kansas": "20",
        "Kentucky": "21", "Louisiana": "22", "Maine": "23", "Maryland": "24",
        "Massachusetts": "25", "Michigan": "26", "Minnesota": "27", "Mississippi": "28",
        "Missouri": "29", "Montana": "30", "Nebraska": "31", "Nevada": "32",
        "New Hampshire": "33", "New Jersey": "34", "New Mexico": "35", "New York": "36",
        "North Carolina": "37", "North Dakota": "38", "Ohio": "39", "Oklahoma": "40",
        "Oregon": "41", "Pennsylvania": "42", "Rhode Island": "44", "South Carolina": "45",
        "South Dakota": "46", "Tennessee": "47", "Texas": "48", "Utah": "49",
        "Vermont": "50", "Virginia": "51", "Washington": "53", "West Virginia": "54",
        "Wisconsin": "55", "Wyoming": "56", "District of Columbia": "11"
    }

    # Race code mappings from Census to our standard
    RACE_MAPPINGS = {
        "1": "White",
        "2": "Black or African American",
        "3": "American Indian or Alaska Native",
        "4": "Asian",
        "5": "Native Hawaiian or Other Pacific Islander",
        "6": "Two or More Races",
        "7": "Hispanic or Latino",
    }

    # Age group ranges
    AGE_GROUPS = {
        "0-17": list(range(0, 18)),
        "18-24": list(range(18, 25)),
        "25-34": list(range(25, 35)),
        "35-44": list(range(35, 45)),
        "45-54": list(range(45, 55)),
        "55-64": list(range(55, 65)),
        "65+": list(range(65, 100)),
    }

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize population service.

        Args:
            api_key: Optional Census API key (recommended for higher rate limits)
        """
        self.api_key = api_key
        self.timeout = 30
        self.max_retries = 3

    async def fetch_population_for_year(
        self,
        year: int,
        db: AsyncSession,
        states: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Fetch population data for a specific year.

        Args:
            year: Year to fetch data for
            db: Database session
            states: Optional list of states (if None, fetches all)

        Returns:
            Dictionary with fetch statistics

        Raises:
            PopulationServiceError: If fetch fails
        """
        logger.info(f"Fetching population data for year {year}")

        try:
            # Determine which states to fetch
            states_to_fetch = states or list(self.STATE_FIPS.keys())

            total_records = 0
            errors = []

            for state in states_to_fetch:
                try:
                    # Fetch state population data
                    population_data = await self._fetch_state_population(year, state)

                    # Store in database
                    records = await self._store_population_data(
                        population_data,
                        year,
                        state,
                        db
                    )

                    total_records += records
                    logger.info(f"Stored {records} population records for {state}")

                except Exception as e:
                    error_msg = f"Failed to fetch {state}: {str(e)}"
                    logger.error(error_msg)
                    errors.append(error_msg)

                # Small delay to avoid rate limiting
                await asyncio.sleep(0.5)

            await db.commit()

            return {
                "status": "success",
                "year": year,
                "states_processed": len(states_to_fetch) - len(errors),
                "total_records": total_records,
                "errors": errors
            }

        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to fetch population data: {str(e)}")
            raise PopulationServiceError(f"Population fetch failed: {str(e)}")

    async def _fetch_state_population(
        self,
        year: int,
        state: str
    ) -> List[Dict[str, Any]]:
        """
        Fetch population data for a specific state.

        Args:
            year: Year to fetch
            state: State name

        Returns:
            List of population records

        Raises:
            PopulationServiceError: If API call fails
        """
        # For now, return simulated data
        # In production, this would call the actual Census API
        logger.warning(f"Using simulated population data for {state} {year}")

        return await self._get_simulated_population_data(year, state)

    async def _get_simulated_population_data(
        self,
        year: int,
        state: str
    ) -> List[Dict[str, Any]]:
        """
        Generate simulated population data for development/testing.

        This is a placeholder until the actual Census API integration is implemented.

        Args:
            year: Year
            state: State name

        Returns:
            List of simulated population records
        """
        records = []

        # Base population for the state (simplified)
        base_populations = {
            "California": 39_500_000,
            "Texas": 29_000_000,
            "Florida": 21_500_000,
            "New York": 19_500_000,
            "Pennsylvania": 12_800_000,
            "Illinois": 12_700_000,
            "Ohio": 11_700_000,
            "Georgia": 10_600_000,
            "North Carolina": 10_400_000,
            "Michigan": 10_000_000,
        }

        base_pop = base_populations.get(state, 5_000_000)

        # Generate data by demographics
        for race_code, race_name in self.RACE_MAPPINGS.items():
            # Approximate race distribution (simplified)
            race_percentages = {
                "White": 0.60,
                "Black or African American": 0.13,
                "Hispanic or Latino": 0.18,
                "Asian": 0.06,
                "American Indian or Alaska Native": 0.01,
                "Native Hawaiian or Other Pacific Islander": 0.002,
                "Two or More Races": 0.028,
            }

            race_pop = int(base_pop * race_percentages.get(race_name, 0.01))

            for age_group, ages in self.AGE_GROUPS.items():
                # Approximate age distribution
                age_percentages = {
                    "0-17": 0.22,
                    "18-24": 0.09,
                    "25-34": 0.14,
                    "35-44": 0.13,
                    "45-54": 0.13,
                    "55-64": 0.13,
                    "65+": 0.16,
                }

                age_pop = int(race_pop * age_percentages.get(age_group, 0.1))

                # Split by sex (approximately 50/50)
                for sex in ["Male", "Female"]:
                    records.append({
                        "year": year,
                        "state": state,
                        "race": race_name,
                        "age_group": age_group,
                        "sex": sex,
                        "population": age_pop // 2
                    })

        return records

    async def _store_population_data(
        self,
        population_data: List[Dict[str, Any]],
        year: int,
        state: str,
        db: AsyncSession
    ) -> int:
        """
        Store population data in database.

        Args:
            population_data: List of population records
            year: Year
            state: State
            db: Database session

        Returns:
            Number of records stored
        """
        records_stored = 0

        for record in population_data:
            # Check if record already exists
            query = select(PopulationData).where(
                and_(
                    PopulationData.year == record["year"],
                    PopulationData.state == record["state"],
                    PopulationData.race == record["race"],
                    PopulationData.age_group == record["age_group"],
                    PopulationData.sex == record["sex"]
                )
            )

            result = await db.execute(query)
            existing = result.scalar_one_or_none()

            if existing:
                # Update existing record
                existing.population = record["population"]
                existing.source = "US_CENSUS_SIMULATED"
            else:
                # Create new record
                pop_data = PopulationData(
                    year=record["year"],
                    state=record["state"],
                    race=record["race"],
                    age_group=record["age_group"],
                    sex=record["sex"],
                    population=record["population"],
                    source="US_CENSUS_SIMULATED"
                )
                db.add(pop_data)

            records_stored += 1

        return records_stored

    async def get_population(
        self,
        db: AsyncSession,
        year: int,
        state: Optional[str] = None,
        race: Optional[str] = None,
        age_group: Optional[str] = None,
        sex: Optional[str] = None
    ) -> Optional[int]:
        """
        Get population for specific demographic criteria.

        Args:
            db: Database session
            year: Year
            state: Optional state filter
            race: Optional race filter
            age_group: Optional age group filter
            sex: Optional sex filter

        Returns:
            Total population or None if not found
        """
        query = select(PopulationData).where(PopulationData.year == year)

        if state:
            query = query.where(PopulationData.state == state)
        if race:
            query = query.where(PopulationData.race == race)
        if age_group:
            query = query.where(PopulationData.age_group == age_group)
        if sex:
            query = query.where(PopulationData.sex == sex)

        result = await db.execute(query)
        records = result.scalars().all()

        if not records:
            return None

        # Sum all matching populations
        total_population = sum(r.population for r in records)
        return total_population

    async def check_population_data_exists(
        self,
        db: AsyncSession,
        year: int,
        state: Optional[str] = None
    ) -> bool:
        """
        Check if population data exists for a year/state.

        Args:
            db: Database session
            year: Year to check
            state: Optional state to check

        Returns:
            True if data exists
        """
        query = select(PopulationData).where(PopulationData.year == year)

        if state:
            query = query.where(PopulationData.state == state)

        query = query.limit(1)

        result = await db.execute(query)
        return result.scalar_one_or_none() is not None

    async def delete_population_data(
        self,
        db: AsyncSession,
        year: int,
        state: Optional[str] = None
    ) -> int:
        """
        Delete population data for a year/state.

        Args:
            db: Database session
            year: Year to delete
            state: Optional state to delete

        Returns:
            Number of records deleted
        """
        from sqlalchemy import delete

        query = delete(PopulationData).where(PopulationData.year == year)

        if state:
            query = query.where(PopulationData.state == state)

        result = await db.execute(query)
        await db.commit()

        return result.rowcount

    def get_state_fips_code(self, state_name: str) -> Optional[str]:
        """
        Get FIPS code for a state.

        Args:
            state_name: State name

        Returns:
            FIPS code or None
        """
        return self.STATE_FIPS.get(state_name)

    def get_available_states(self) -> List[str]:
        """
        Get list of available states.

        Returns:
            List of state names
        """
        return list(self.STATE_FIPS.keys())
