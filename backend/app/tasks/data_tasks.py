"""Celery tasks for data fetching and processing."""

import asyncio
from datetime import datetime
from typing import List, Dict, Any

from celery import Task
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.config import get_settings
from app.services.data_fetcher import FBIDataFetcher, DataFetcherError
from app.services.csv_processor import CSVProcessor, CSVProcessingError
from app.services.population_service import PopulationService, PopulationServiceError
from app.tasks.celery_app import celery_app
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class AsyncTask(Task):
    """Base task that provides async support."""

    def __call__(self, *args, **kwargs):
        """Execute async task in event loop."""
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(self.run(*args, **kwargs))

    async def run(self, *args, **kwargs):
        """Override this method in subclasses."""
        raise NotImplementedError


async def get_db_session():
    """Get database session for tasks."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            yield session
        finally:
            await engine.dispose()


@celery_app.task(name="app.tasks.data_tasks.download_fbi_data")
def download_fbi_data(year: int, crime_type: str = "murder") -> Dict[str, Any]:
    """
    Download FBI crime data for a specific year.

    Args:
        year: Year to download
        crime_type: Type of crime data

    Returns:
        Task result with download status
    """
    async def _download():
        async for db in get_db_session():
            try:
                fetcher = FBIDataFetcher()

                if crime_type == "murder":
                    result = await fetcher.fetch_murder_statistics(year, db)
                else:
                    logger.warning(f"Crime type {crime_type} not yet supported")
                    return {
                        "status": "error",
                        "message": f"Crime type {crime_type} not supported"
                    }

                logger.info(f"Successfully downloaded {crime_type} data for {year}")
                return {
                    "status": "success",
                    "year": year,
                    "crime_type": crime_type,
                    "data_source_id": result.get("data_source_id"),
                    "message": f"Downloaded {crime_type} data for {year}"
                }

            except DataFetcherError as e:
                logger.error(f"Failed to download data: {str(e)}")
                return {
                    "status": "error",
                    "message": str(e)
                }
            except Exception as e:
                logger.error(f"Unexpected error downloading data: {str(e)}")
                return {
                    "status": "error",
                    "message": f"Unexpected error: {str(e)}"
                }

    return asyncio.run(_download())


@celery_app.task(name="app.tasks.data_tasks.process_csv_data")
def process_csv_data(data_source_id: int, crime_type: str = "murder") -> Dict[str, Any]:
    """
    Process CSV data from a data source.

    Args:
        data_source_id: ID of data source to process
        crime_type: Type of crime

    Returns:
        Task result with processing status
    """
    async def _process():
        async for db in get_db_session():
            try:
                processor = CSVProcessor()
                result = await processor.process_data_source(data_source_id, db, crime_type)

                logger.info(f"Successfully processed data source {data_source_id}")
                return {
                    "status": "success",
                    "data_source_id": data_source_id,
                    "crime_type": crime_type,
                    "records_inserted": result.get("records_inserted"),
                    "message": result.get("message")
                }

            except CSVProcessingError as e:
                logger.error(f"Failed to process CSV: {str(e)}")
                return {
                    "status": "error",
                    "message": str(e)
                }
            except Exception as e:
                logger.error(f"Unexpected error processing CSV: {str(e)}")
                return {
                    "status": "error",
                    "message": f"Unexpected error: {str(e)}"
                }

    return asyncio.run(_process())


@celery_app.task(name="app.tasks.data_tasks.fetch_population_data")
def fetch_population_data(year: int, states: List[str] = None) -> Dict[str, Any]:
    """
    Fetch population data for a year.

    Args:
        year: Year to fetch
        states: Optional list of states

    Returns:
        Task result with fetch status
    """
    async def _fetch():
        async for db in get_db_session():
            try:
                service = PopulationService()
                result = await service.fetch_population_for_year(year, db, states)

                logger.info(f"Successfully fetched population data for {year}")
                return {
                    "status": "success",
                    "year": year,
                    "records_created": result.get("records_created"),
                    "message": result.get("message")
                }

            except PopulationServiceError as e:
                logger.error(f"Failed to fetch population: {str(e)}")
                return {
                    "status": "error",
                    "message": str(e)
                }
            except Exception as e:
                logger.error(f"Unexpected error fetching population: {str(e)}")
                return {
                    "status": "error",
                    "message": f"Unexpected error: {str(e)}"
                }

    return asyncio.run(_fetch())


@celery_app.task(name="app.tasks.data_tasks.check_fbi_data_updates")
def check_fbi_data_updates() -> Dict[str, Any]:
    """
    Check for new FBI data updates.

    Scheduled task that checks if new data is available and downloads it.

    Returns:
        Task result with check status
    """
    logger.info("Starting scheduled FBI data update check")

    # Get current year and previous year
    current_year = datetime.utcnow().year
    previous_year = current_year - 1

    # FBI typically releases previous year data in August/September
    current_month = datetime.utcnow().month
    years_to_check = [previous_year] if current_month >= 8 else []

    if not years_to_check:
        logger.info("No years to check (FBI data not yet released)")
        return {
            "status": "skipped",
            "message": "No new data expected yet"
        }

    results = []
    for year in years_to_check:
        try:
            # Download the data
            download_result = download_fbi_data(year, "murder")

            if download_result["status"] == "success":
                data_source_id = download_result["data_source_id"]

                # Process the CSV
                process_result = process_csv_data(data_source_id, "murder")

                if process_result["status"] == "success":
                    # Fetch population data
                    pop_result = fetch_population_data(year)

                    results.append({
                        "year": year,
                        "status": "success",
                        "downloaded": True,
                        "processed": True,
                        "population_fetched": pop_result["status"] == "success"
                    })
                else:
                    results.append({
                        "year": year,
                        "status": "partial",
                        "downloaded": True,
                        "processed": False,
                        "error": process_result.get("message")
                    })
            else:
                results.append({
                    "year": year,
                    "status": "failed",
                    "downloaded": False,
                    "error": download_result.get("message")
                })

        except Exception as e:
            logger.error(f"Error checking updates for {year}: {str(e)}")
            results.append({
                "year": year,
                "status": "error",
                "error": str(e)
            })

    logger.info(f"Completed FBI data update check: {len(results)} years checked")
    return {
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat(),
        "years_checked": years_to_check,
        "results": results
    }


@celery_app.task(name="app.tasks.data_tasks.refresh_all_data")
def refresh_all_data() -> Dict[str, Any]:
    """
    Refresh all data (monthly scheduled task).

    Re-downloads and reprocesses all available years.

    Returns:
        Task result with refresh status
    """
    logger.info("Starting monthly data refresh")

    # Define years to refresh (last 5 years)
    current_year = datetime.utcnow().year
    years_to_refresh = list(range(current_year - 5, current_year))

    results = []
    for year in years_to_refresh:
        try:
            # Download
            download_result = download_fbi_data(year, "murder")

            if download_result["status"] == "success":
                data_source_id = download_result["data_source_id"]

                # Process
                process_result = process_csv_data(data_source_id, "murder")

                results.append({
                    "year": year,
                    "status": "success" if process_result["status"] == "success" else "partial",
                    "downloaded": True,
                    "processed": process_result["status"] == "success"
                })
            else:
                results.append({
                    "year": year,
                    "status": "failed",
                    "downloaded": False
                })

        except Exception as e:
            logger.error(f"Error refreshing data for {year}: {str(e)}")
            results.append({
                "year": year,
                "status": "error",
                "error": str(e)
            })

    logger.info(f"Completed monthly data refresh: {len(results)} years processed")
    return {
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat(),
        "years_refreshed": years_to_refresh,
        "results": results
    }


@celery_app.task(name="app.tasks.data_tasks.full_data_pipeline")
def full_data_pipeline(year: int, crime_type: str = "murder") -> Dict[str, Any]:
    """
    Execute full data pipeline for a year.

    Downloads data, processes CSV, fetches population, and calculates statistics.

    Args:
        year: Year to process
        crime_type: Type of crime

    Returns:
        Task result with pipeline status
    """
    logger.info(f"Starting full data pipeline for {crime_type} {year}")

    try:
        # Step 1: Download
        download_result = download_fbi_data(year, crime_type)
        if download_result["status"] != "success":
            return {
                "status": "failed",
                "step": "download",
                "error": download_result.get("message")
            }

        data_source_id = download_result["data_source_id"]

        # Step 2: Process CSV
        process_result = process_csv_data(data_source_id, crime_type)
        if process_result["status"] != "success":
            return {
                "status": "failed",
                "step": "process",
                "error": process_result.get("message")
            }

        # Step 3: Fetch population
        pop_result = fetch_population_data(year)
        if pop_result["status"] != "success":
            return {
                "status": "failed",
                "step": "population",
                "error": pop_result.get("message")
            }

        # Step 4: Calculate statistics (import here to avoid circular dependency)
        from app.tasks.statistics_tasks import calculate_statistics
        stats_result = calculate_statistics(year, crime_type)

        if stats_result["status"] != "success":
            return {
                "status": "partial",
                "step": "statistics",
                "message": "Data loaded but statistics calculation failed",
                "error": stats_result.get("message")
            }

        logger.info(f"Successfully completed full pipeline for {crime_type} {year}")
        return {
            "status": "success",
            "year": year,
            "crime_type": crime_type,
            "records_inserted": process_result.get("records_inserted"),
            "statistics_calculated": stats_result.get("total_records_calculated"),
            "message": f"Full pipeline completed for {crime_type} {year}"
        }

    except Exception as e:
        logger.error(f"Error in full data pipeline: {str(e)}")
        return {
            "status": "error",
            "message": f"Unexpected error: {str(e)}"
        }
