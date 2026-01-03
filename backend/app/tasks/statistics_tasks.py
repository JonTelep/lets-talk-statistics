"""Celery tasks for statistics calculations."""

import asyncio
from typing import Dict, Any, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.config import get_settings
from app.models.crime_data import CalculatedStatistic
from app.services.statistics_calculator import StatisticsCalculator, StatisticsCalculatorError
from app.tasks.celery_app import celery_app
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


async def get_db_session():
    """Get database session for tasks."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            yield session
        finally:
            await engine.dispose()


@celery_app.task(name="app.tasks.statistics_tasks.calculate_statistics")
def calculate_statistics(
    year: int,
    crime_type: str = "murder",
    states: List[str] = None
) -> Dict[str, Any]:
    """
    Calculate statistics for a specific year and crime type.

    Args:
        year: Year to calculate
        crime_type: Type of crime
        states: Optional list of states

    Returns:
        Task result with calculation status
    """
    async def _calculate():
        async for db in get_db_session():
            try:
                calculator = StatisticsCalculator()

                # Check if already calculated
                exists = await calculator.check_calculated_statistics_exist(
                    db, year, crime_type
                )

                if exists:
                    logger.info(f"Statistics for {crime_type} {year} already calculated, recalculating...")
                    result = await calculator.recalculate_all_for_year(year, crime_type, db)
                else:
                    logger.info(f"Calculating statistics for {crime_type} {year}")
                    result = await calculator.calculate_statistics_for_year(
                        year, crime_type, db, states
                    )

                logger.info(f"Successfully calculated statistics for {crime_type} {year}")
                return {
                    "status": "success",
                    "year": year,
                    "crime_type": crime_type,
                    "total_records_calculated": result.get("total_records_calculated"),
                    "breakdowns": result.get("breakdowns"),
                    "message": f"Statistics calculated for {crime_type} {year}"
                }

            except StatisticsCalculatorError as e:
                logger.error(f"Failed to calculate statistics: {str(e)}")
                return {
                    "status": "error",
                    "message": str(e)
                }
            except Exception as e:
                logger.error(f"Unexpected error calculating statistics: {str(e)}")
                return {
                    "status": "error",
                    "message": f"Unexpected error: {str(e)}"
                }

    return asyncio.run(_calculate())


@celery_app.task(name="app.tasks.statistics_tasks.recalculate_statistics")
def recalculate_statistics(year: int, crime_type: str = "murder") -> Dict[str, Any]:
    """
    Recalculate statistics for a year (deletes and recalculates).

    Args:
        year: Year to recalculate
        crime_type: Type of crime

    Returns:
        Task result with recalculation status
    """
    async def _recalculate():
        async for db in get_db_session():
            try:
                calculator = StatisticsCalculator()
                result = await calculator.recalculate_all_for_year(year, crime_type, db)

                logger.info(f"Successfully recalculated statistics for {crime_type} {year}")
                return {
                    "status": "success",
                    "year": year,
                    "crime_type": crime_type,
                    "records_deleted": result.get("records_deleted"),
                    "total_records_calculated": result.get("total_records_calculated"),
                    "message": f"Statistics recalculated for {crime_type} {year}"
                }

            except StatisticsCalculatorError as e:
                logger.error(f"Failed to recalculate statistics: {str(e)}")
                return {
                    "status": "error",
                    "message": str(e)
                }
            except Exception as e:
                logger.error(f"Unexpected error recalculating statistics: {str(e)}")
                return {
                    "status": "error",
                    "message": f"Unexpected error: {str(e)}"
                }

    return asyncio.run(_recalculate())


@celery_app.task(name="app.tasks.statistics_tasks.recalculate_all_statistics")
def recalculate_all_statistics() -> Dict[str, Any]:
    """
    Recalculate all statistics (weekly scheduled task).

    Recalculates statistics for all years and crime types in the database.

    Returns:
        Task result with recalculation status
    """
    logger.info("Starting weekly statistics recalculation")

    async def _get_years_and_types():
        """Get all unique year/crime_type combinations."""
        async for db in get_db_session():
            query = select(
                CalculatedStatistic.year,
                CalculatedStatistic.crime_type
            ).distinct()

            result = await db.execute(query)
            return result.all()

    # Get all year/type combinations
    combinations = asyncio.run(_get_years_and_types())

    results = []
    for year, crime_type in combinations:
        try:
            result = recalculate_statistics(year, crime_type)
            results.append({
                "year": year,
                "crime_type": crime_type,
                "status": result["status"],
                "records_calculated": result.get("total_records_calculated", 0)
            })
        except Exception as e:
            logger.error(f"Error recalculating {crime_type} {year}: {str(e)}")
            results.append({
                "year": year,
                "crime_type": crime_type,
                "status": "error",
                "error": str(e)
            })

    successful = sum(1 for r in results if r["status"] == "success")
    logger.info(f"Completed weekly recalculation: {successful}/{len(results)} successful")

    return {
        "status": "completed",
        "total_combinations": len(results),
        "successful": successful,
        "failed": len(results) - successful,
        "results": results
    }


@celery_app.task(name="app.tasks.statistics_tasks.calculate_yoy_trends")
def calculate_yoy_trends(
    start_year: int,
    end_year: int,
    crime_type: str = "murder"
) -> Dict[str, Any]:
    """
    Calculate year-over-year trends for a range of years.

    Args:
        start_year: Starting year
        end_year: Ending year
        crime_type: Type of crime

    Returns:
        Task result with trend calculation status
    """
    logger.info(f"Calculating YoY trends for {crime_type} from {start_year} to {end_year}")

    results = []
    for year in range(start_year, end_year + 1):
        try:
            result = calculate_statistics(year, crime_type)
            results.append({
                "year": year,
                "status": result["status"]
            })
        except Exception as e:
            logger.error(f"Error calculating trends for {year}: {str(e)}")
            results.append({
                "year": year,
                "status": "error",
                "error": str(e)
            })

    successful = sum(1 for r in results if r["status"] == "success")
    logger.info(f"Completed YoY trend calculation: {successful}/{len(results)} years successful")

    return {
        "status": "completed",
        "start_year": start_year,
        "end_year": end_year,
        "crime_type": crime_type,
        "total_years": len(results),
        "successful": successful,
        "results": results
    }
