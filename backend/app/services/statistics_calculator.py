"""Statistics calculation service for crime data analysis."""

from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from decimal import Decimal

from sqlalchemy import select, func, and_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.crime_data import CrimeStatistic, CalculatedStatistic, PopulationData
from app.services.population_service import PopulationService
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class StatisticsCalculatorError(Exception):
    """Custom exception for statistics calculator errors."""
    pass


class StatisticsCalculator:
    """
    Service for calculating crime statistics including per capita rates,
    year-over-year changes, and demographic breakdowns.
    """

    def __init__(self):
        """Initialize statistics calculator."""
        self.per_capita_base = settings.per_capita_base  # Default: 100,000
        self.population_service = PopulationService()

    async def calculate_per_capita_rate(
        self,
        incident_count: int,
        population: Optional[int]
    ) -> Optional[Decimal]:
        """
        Calculate per capita rate.

        Args:
            incident_count: Number of incidents
            population: Population size

        Returns:
            Per capita rate (per 100,000) or None if population missing
        """
        if population is None or population == 0:
            return None

        rate = Decimal(incident_count) / Decimal(population) * Decimal(self.per_capita_base)
        return round(rate, 4)

    async def calculate_yoy_change(
        self,
        current_value: Optional[float],
        previous_value: Optional[float]
    ) -> Optional[Decimal]:
        """
        Calculate year-over-year percentage change.

        Args:
            current_value: Current year value
            previous_value: Previous year value

        Returns:
            Percentage change or None if cannot calculate
        """
        if current_value is None or previous_value is None:
            return None

        if previous_value == 0:
            return None  # Avoid division by zero

        change = ((current_value - previous_value) / previous_value) * 100
        return round(Decimal(change), 2)

    async def calculate_statistics_for_year(
        self,
        year: int,
        crime_type: str,
        db: AsyncSession,
        states: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Calculate all statistics for a specific year and crime type.

        Args:
            year: Year to calculate statistics for
            crime_type: Type of crime
            db: Database session
            states: Optional list of states (if None, all states)

        Returns:
            Dictionary with calculation results
        """
        logger.info(f"Calculating statistics for {crime_type} in {year}")

        try:
            # Calculate total statistics
            total_stats = await self._calculate_total_statistics(
                year, crime_type, db, states
            )

            # Calculate by race
            race_stats = await self._calculate_by_demographic(
                year, crime_type, "race", db, states
            )

            # Calculate by age group
            age_stats = await self._calculate_by_demographic(
                year, crime_type, "age_group", db, states
            )

            # Calculate by sex
            sex_stats = await self._calculate_by_demographic(
                year, crime_type, "sex", db, states
            )

            # Calculate by state
            state_stats = await self._calculate_by_state(
                year, crime_type, db, states
            )

            # Calculate year-over-year changes
            if year > 1900:
                await self._calculate_yoy_changes(
                    year, crime_type, db
                )

            total_records = (
                len(total_stats) +
                len(race_stats) +
                len(age_stats) +
                len(sex_stats) +
                len(state_stats)
            )

            await db.commit()

            return {
                "status": "success",
                "year": year,
                "crime_type": crime_type,
                "total_records_calculated": total_records,
                "breakdowns": {
                    "total": len(total_stats),
                    "by_race": len(race_stats),
                    "by_age": len(age_stats),
                    "by_sex": len(sex_stats),
                    "by_state": len(state_stats)
                }
            }

        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to calculate statistics: {str(e)}")
            raise StatisticsCalculatorError(f"Calculation failed: {str(e)}")

    async def _calculate_total_statistics(
        self,
        year: int,
        crime_type: str,
        db: AsyncSession,
        states: Optional[List[str]] = None
    ) -> List[CalculatedStatistic]:
        """Calculate total statistics (all demographics combined)."""
        # Query total incidents
        query = select(
            func.sum(CrimeStatistic.incident_count).label("total_incidents")
        ).where(
            and_(
                CrimeStatistic.year == year,
                CrimeStatistic.crime_type == crime_type
            )
        )

        if states:
            query = query.where(CrimeStatistic.state.in_(states))

        result = await db.execute(query)
        row = result.first()
        total_incidents = row[0] if row and row[0] else 0

        # Get total population
        total_population = await self.population_service.get_population(
            db=db,
            year=year,
            state=None  # All states
        )

        # Calculate per capita rate
        per_capita_rate = await self.calculate_per_capita_rate(
            total_incidents,
            total_population
        )

        # Store calculated statistic
        calc_stat = await self._store_calculated_statistic(
            year=year,
            crime_type=crime_type,
            demographic_type="total",
            demographic_value=None,
            state=None,
            incident_count=total_incidents,
            population=total_population,
            per_capita_rate=per_capita_rate,
            db=db
        )

        return [calc_stat] if calc_stat else []

    async def _calculate_by_demographic(
        self,
        year: int,
        crime_type: str,
        demographic_field: str,
        db: AsyncSession,
        states: Optional[List[str]] = None
    ) -> List[CalculatedStatistic]:
        """Calculate statistics by demographic category."""
        # Map field name to database column
        field_map = {
            "race": CrimeStatistic.race,
            "age_group": CrimeStatistic.age_group,
            "sex": CrimeStatistic.sex,
        }

        if demographic_field not in field_map:
            return []

        field = field_map[demographic_field]

        # Query incidents by demographic
        query = select(
            field,
            func.sum(CrimeStatistic.incident_count).label("total_incidents")
        ).where(
            and_(
                CrimeStatistic.year == year,
                CrimeStatistic.crime_type == crime_type
            )
        ).group_by(field)

        if states:
            query = query.where(CrimeStatistic.state.in_(states))

        result = await db.execute(query)
        rows = result.all()

        calculated_stats = []

        for demographic_value, incident_count in rows:
            if demographic_value is None:
                continue

            # Get population for this demographic
            population = await self.population_service.get_population(
                db=db,
                year=year,
                **{demographic_field: demographic_value}
            )

            # Calculate per capita rate
            per_capita_rate = await self.calculate_per_capita_rate(
                incident_count,
                population
            )

            # Store calculated statistic
            calc_stat = await self._store_calculated_statistic(
                year=year,
                crime_type=crime_type,
                demographic_type=f"by_{demographic_field}",
                demographic_value=demographic_value,
                state=None,
                incident_count=incident_count,
                population=population,
                per_capita_rate=per_capita_rate,
                db=db
            )

            if calc_stat:
                calculated_stats.append(calc_stat)

        return calculated_stats

    async def _calculate_by_state(
        self,
        year: int,
        crime_type: str,
        db: AsyncSession,
        states: Optional[List[str]] = None
    ) -> List[CalculatedStatistic]:
        """Calculate statistics by state."""
        # Query incidents by state
        query = select(
            CrimeStatistic.state,
            func.sum(CrimeStatistic.incident_count).label("total_incidents")
        ).where(
            and_(
                CrimeStatistic.year == year,
                CrimeStatistic.crime_type == crime_type
            )
        ).group_by(CrimeStatistic.state)

        if states:
            query = query.where(CrimeStatistic.state.in_(states))

        result = await db.execute(query)
        rows = result.all()

        calculated_stats = []

        for state, incident_count in rows:
            if state is None:
                continue

            # Get population for this state
            population = await self.population_service.get_population(
                db=db,
                year=year,
                state=state
            )

            # Calculate per capita rate
            per_capita_rate = await self.calculate_per_capita_rate(
                incident_count,
                population
            )

            # Store calculated statistic
            calc_stat = await self._store_calculated_statistic(
                year=year,
                crime_type=crime_type,
                demographic_type="by_state",
                demographic_value=None,
                state=state,
                incident_count=incident_count,
                population=population,
                per_capita_rate=per_capita_rate,
                db=db
            )

            if calc_stat:
                calculated_stats.append(calc_stat)

        return calculated_stats

    async def _calculate_yoy_changes(
        self,
        year: int,
        crime_type: str,
        db: AsyncSession
    ) -> None:
        """Calculate year-over-year changes for all statistics."""
        previous_year = year - 1

        # Get current year statistics
        current_query = select(CalculatedStatistic).where(
            and_(
                CalculatedStatistic.year == year,
                CalculatedStatistic.crime_type == crime_type
            )
        )

        result = await db.execute(current_query)
        current_stats = result.scalars().all()

        for current_stat in current_stats:
            # Find matching previous year statistic
            prev_query = select(CalculatedStatistic).where(
                and_(
                    CalculatedStatistic.year == previous_year,
                    CalculatedStatistic.crime_type == crime_type,
                    CalculatedStatistic.demographic_type == current_stat.demographic_type,
                    CalculatedStatistic.demographic_value == current_stat.demographic_value,
                    CalculatedStatistic.state == current_stat.state
                )
            )

            prev_result = await db.execute(prev_query)
            prev_stat = prev_result.scalar_one_or_none()

            if prev_stat and prev_stat.per_capita_rate:
                # Calculate YoY change
                yoy_change = await self.calculate_yoy_change(
                    float(current_stat.per_capita_rate) if current_stat.per_capita_rate else None,
                    float(prev_stat.per_capita_rate)
                )

                current_stat.yoy_change = yoy_change

    async def _store_calculated_statistic(
        self,
        year: int,
        crime_type: str,
        demographic_type: str,
        demographic_value: Optional[str],
        state: Optional[str],
        incident_count: int,
        population: Optional[int],
        per_capita_rate: Optional[Decimal],
        db: AsyncSession
    ) -> Optional[CalculatedStatistic]:
        """Store or update a calculated statistic."""
        # Check if already exists
        query = select(CalculatedStatistic).where(
            and_(
                CalculatedStatistic.year == year,
                CalculatedStatistic.crime_type == crime_type,
                CalculatedStatistic.demographic_type == demographic_type,
                CalculatedStatistic.demographic_value == demographic_value,
                CalculatedStatistic.state == state
            )
        )

        result = await db.execute(query)
        existing = result.scalar_one_or_none()

        if existing:
            # Update existing
            existing.incident_count = incident_count
            existing.population = population
            existing.per_capita_rate = per_capita_rate
            existing.calculated_at = datetime.utcnow()
            return existing
        else:
            # Create new
            calc_stat = CalculatedStatistic(
                year=year,
                crime_type=crime_type,
                demographic_type=demographic_type,
                demographic_value=demographic_value,
                state=state,
                incident_count=incident_count,
                population=population,
                per_capita_rate=per_capita_rate,
                yoy_change=None,  # Will be calculated separately
                calculated_at=datetime.utcnow()
            )
            db.add(calc_stat)
            return calc_stat

    async def delete_calculated_statistics(
        self,
        year: int,
        crime_type: Optional[str] = None,
        db: AsyncSession = None
    ) -> int:
        """
        Delete calculated statistics.

        Args:
            year: Year to delete
            crime_type: Optional crime type filter
            db: Database session

        Returns:
            Number of records deleted
        """
        query = delete(CalculatedStatistic).where(
            CalculatedStatistic.year == year
        )

        if crime_type:
            query = query.where(CalculatedStatistic.crime_type == crime_type)

        result = await db.execute(query)
        await db.commit()

        return result.rowcount

    async def get_calculated_statistics(
        self,
        db: AsyncSession,
        year: int,
        crime_type: str,
        demographic_type: Optional[str] = None,
        state: Optional[str] = None
    ) -> List[CalculatedStatistic]:
        """
        Retrieve calculated statistics.

        Args:
            db: Database session
            year: Year
            crime_type: Crime type
            demographic_type: Optional demographic type filter
            state: Optional state filter

        Returns:
            List of calculated statistics
        """
        query = select(CalculatedStatistic).where(
            and_(
                CalculatedStatistic.year == year,
                CalculatedStatistic.crime_type == crime_type
            )
        )

        if demographic_type:
            query = query.where(CalculatedStatistic.demographic_type == demographic_type)

        if state:
            query = query.where(CalculatedStatistic.state == state)

        result = await db.execute(query)
        return result.scalars().all()

    async def check_calculated_statistics_exist(
        self,
        db: AsyncSession,
        year: int,
        crime_type: str
    ) -> bool:
        """
        Check if calculated statistics exist for a year/crime type.

        Args:
            db: Database session
            year: Year
            crime_type: Crime type

        Returns:
            True if statistics exist
        """
        query = select(CalculatedStatistic).where(
            and_(
                CalculatedStatistic.year == year,
                CalculatedStatistic.crime_type == crime_type
            )
        ).limit(1)

        result = await db.execute(query)
        return result.scalar_one_or_none() is not None

    async def recalculate_all_for_year(
        self,
        year: int,
        crime_type: str,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Recalculate all statistics for a year.

        Deletes existing calculated statistics and recalculates from scratch.

        Args:
            year: Year to recalculate
            crime_type: Crime type
            db: Database session

        Returns:
            Calculation results
        """
        logger.info(f"Recalculating statistics for {crime_type} {year}")

        # Delete existing calculated statistics
        deleted = await self.delete_calculated_statistics(year, crime_type, db)
        logger.info(f"Deleted {deleted} existing calculated statistics")

        # Recalculate
        result = await self.calculate_statistics_for_year(year, crime_type, db)

        result["records_deleted"] = deleted
        return result
