"""Admin and data management API endpoints."""

from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.crime_data import DataSource
from app.services.data_fetcher import FBIDataFetcher, DataFetcherError
from app.services.csv_processor import CSVProcessor, CSVProcessingError
from app.services.population_service import PopulationService, PopulationServiceError
from app.services.statistics_calculator import StatisticsCalculator, StatisticsCalculatorError
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post("/download/murder-statistics/{year}")
async def download_murder_statistics(
    year: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger download of murder statistics for a specific year.

    Args:
        year: Year to download data for
        background_tasks: FastAPI background tasks
        db: Database session

    Returns:
        Download status and job information
    """
    try:
        logger.info(f"Received request to download murder statistics for year {year}")

        # Validate year
        if year < 1900 or year > 2100:
            raise HTTPException(status_code=400, detail="Invalid year")

        fetcher = FBIDataFetcher()

        # Check if we already have this data
        has_updates = await fetcher.check_for_updates(db, year)

        if not has_updates:
            return {
                "status": "already_exists",
                "message": f"Data for year {year} already exists and is up to date",
                "year": year
            }

        # Trigger download in background
        background_tasks.add_task(
            _download_task,
            year=year,
            db=db
        )

        return {
            "status": "download_started",
            "message": f"Download started for year {year}",
            "year": year
        }

    except DataFetcherError as e:
        logger.error(f"Data fetcher error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error downloading data: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/download/from-url")
async def download_from_url(
    url: str,
    source_name: str,
    data_type: str,
    year: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Download data from a direct URL (for manual data ingestion).

    Args:
        url: Direct URL to CSV file
        source_name: Name of data source (e.g., 'FBI_UCR', 'BJS')
        data_type: Type of crime data
        year: Year of data
        background_tasks: FastAPI background tasks
        db: Database session

    Returns:
        Download status
    """
    try:
        logger.info(f"Downloading from URL: {url}")

        fetcher = FBIDataFetcher()

        # Trigger download
        background_tasks.add_task(
            _download_from_url_task,
            url=url,
            source_name=source_name,
            data_type=data_type,
            year=year,
            db=db
        )

        return {
            "status": "download_started",
            "message": "Download started from provided URL",
            "url": url,
            "year": year,
            "data_type": data_type
        }

    except Exception as e:
        logger.error(f"Error initiating download: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/available-years")
async def get_available_years():
    """
    Get list of years with available data from FBI.

    Returns:
        List of available years
    """
    try:
        fetcher = FBIDataFetcher()
        years = await fetcher.get_available_years()

        return {
            "available_years": years,
            "count": len(years)
        }

    except Exception as e:
        logger.error(f"Error fetching available years: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/check-updates/{year}")
async def check_for_updates(
    year: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Check if new data is available for a specific year.

    Args:
        year: Year to check
        db: Database session

    Returns:
        Update availability status
    """
    try:
        fetcher = FBIDataFetcher()
        has_updates = await fetcher.check_for_updates(db, year)

        return {
            "year": year,
            "updates_available": has_updates,
            "message": "New data available" if has_updates else "Data is up to date"
        }

    except Exception as e:
        logger.error(f"Error checking for updates: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Background task functions
async def _download_task(year: int, db: AsyncSession):
    """Background task to download murder statistics."""
    try:
        logger.info(f"Background task: Downloading murder statistics for {year}")
        fetcher = FBIDataFetcher()
        data_source = await fetcher.fetch_murder_statistics(year, db)
        logger.info(f"Successfully downloaded data: {data_source.id}")
    except Exception as e:
        logger.error(f"Background download task failed: {str(e)}")


async def _download_from_url_task(
    url: str,
    source_name: str,
    data_type: str,
    year: int,
    db: AsyncSession
):
    """Background task to download from direct URL."""
    try:
        logger.info(f"Background task: Downloading from {url}")
        fetcher = FBIDataFetcher()
        data_source = await fetcher.download_from_url(
            url=url,
            source_name=source_name,
            data_type=data_type,
            year=year,
            db=db
        )
        logger.info(f"Successfully downloaded data: {data_source.id}")
    except Exception as e:
        logger.error(f"Background download task failed: {str(e)}")


# CSV Processing Endpoints

@router.post("/process/{data_source_id}")
async def process_data_source(
    data_source_id: int,
    crime_type: str = "murder",
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Process a downloaded CSV file and insert into database.

    Args:
        data_source_id: ID of data source to process
        crime_type: Type of crime data
        background_tasks: FastAPI background tasks
        db: Database session

    Returns:
        Processing status
    """
    try:
        # Verify data source exists
        query = select(DataSource).where(DataSource.id == data_source_id)
        result = await db.execute(query)
        data_source = result.scalar_one_or_none()

        if not data_source:
            raise HTTPException(status_code=404, detail=f"Data source {data_source_id} not found")

        if data_source.status == "processed":
            return {
                "status": "already_processed",
                "message": f"Data source {data_source_id} already processed",
                "data_source_id": data_source_id
            }

        # Trigger processing in background
        if background_tasks:
            background_tasks.add_task(
                _process_task,
                data_source_id=data_source_id,
                crime_type=crime_type,
                db=db
            )

            return {
                "status": "processing_started",
                "message": f"Processing started for data source {data_source_id}",
                "data_source_id": data_source_id,
                "crime_type": crime_type
            }
        else:
            # Process synchronously if no background tasks
            processor = CSVProcessor()
            result = await processor.process_data_source(data_source_id, db, crime_type)
            return result

    except HTTPException:
        raise
    except CSVProcessingError as e:
        logger.error(f"CSV processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error processing data: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/preview/{data_source_id}")
async def preview_data_source(
    data_source_id: int,
    rows: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """
    Preview CSV file before processing.

    Args:
        data_source_id: ID of data source
        rows: Number of rows to preview
        db: Database session

    Returns:
        CSV preview data
    """
    try:
        # Get data source
        query = select(DataSource).where(DataSource.id == data_source_id)
        result = await db.execute(query)
        data_source = result.scalar_one_or_none()

        if not data_source:
            raise HTTPException(status_code=404, detail=f"Data source {data_source_id} not found")

        # Preview CSV
        processor = CSVProcessor()
        preview = processor.preview_csv(data_source.file_path, rows=rows)

        return {
            "data_source_id": data_source_id,
            "file_path": data_source.file_path,
            "status": data_source.status,
            **preview
        }

    except CSVProcessingError as e:
        logger.error(f"Preview error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error previewing data: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/processing-status/{data_source_id}")
async def get_processing_status(
    data_source_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get processing status for a data source.

    Args:
        data_source_id: ID of data source
        db: Database session

    Returns:
        Processing status information
    """
    try:
        query = select(DataSource).where(DataSource.id == data_source_id)
        result = await db.execute(query)
        data_source = result.scalar_one_or_none()

        if not data_source:
            raise HTTPException(status_code=404, detail=f"Data source {data_source_id} not found")

        return {
            "data_source_id": data_source_id,
            "status": data_source.status,
            "year": data_source.year,
            "data_type": data_source.data_type,
            "download_date": data_source.download_date,
            "metadata": data_source.metadata
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


async def _process_task(data_source_id: int, crime_type: str, db: AsyncSession):
    """Background task to process CSV data."""
    try:
        logger.info(f"Background task: Processing data source {data_source_id}")
        processor = CSVProcessor()
        result = await processor.process_data_source(data_source_id, db, crime_type)
        logger.info(f"Successfully processed: {result}")
    except Exception as e:
        logger.error(f"Background processing task failed: {str(e)}")


# Population Data Endpoints

@router.post("/population/fetch/{year}")
async def fetch_population_data(
    year: int,
    states: Optional[List[str]] = Query(default=None, description="List of states to fetch"),
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch population data for a specific year.

    Args:
        year: Year to fetch population data for
        states: Optional list of states (if None, fetches all)
        background_tasks: FastAPI background tasks
        db: Database session

    Returns:
        Fetch status
    """
    try:
        # Validate year
        if year < 1900 or year > 2100:
            raise HTTPException(status_code=400, detail="Invalid year")

        population_service = PopulationService()

        # Check if data already exists
        has_data = await population_service.check_population_data_exists(db, year)

        if has_data and not states:
            return {
                "status": "already_exists",
                "message": f"Population data for year {year} already exists",
                "year": year
            }

        # Trigger fetch in background
        if background_tasks:
            background_tasks.add_task(
                _fetch_population_task,
                year=year,
                states=states,
                db=db
            )

            return {
                "status": "fetch_started",
                "message": f"Population data fetch started for year {year}",
                "year": year,
                "states": states or "all"
            }
        else:
            # Fetch synchronously
            result = await population_service.fetch_population_for_year(year, db, states)
            return result

    except PopulationServiceError as e:
        logger.error(f"Population service error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error fetching population: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/population/lookup")
async def lookup_population(
    year: int = Query(..., description="Year"),
    state: Optional[str] = Query(default=None, description="State"),
    race: Optional[str] = Query(default=None, description="Race"),
    age_group: Optional[str] = Query(default=None, description="Age group"),
    sex: Optional[str] = Query(default=None, description="Sex"),
    db: AsyncSession = Depends(get_db)
):
    """
    Lookup population for specific demographic criteria.

    Args:
        year: Year
        state: Optional state filter
        race: Optional race filter
        age_group: Optional age group filter
        sex: Optional sex filter
        db: Database session

    Returns:
        Population total
    """
    try:
        population_service = PopulationService()

        population = await population_service.get_population(
            db=db,
            year=year,
            state=state,
            race=race,
            age_group=age_group,
            sex=sex
        )

        if population is None:
            return {
                "year": year,
                "filters": {
                    "state": state,
                    "race": race,
                    "age_group": age_group,
                    "sex": sex
                },
                "population": None,
                "message": "No population data found for these criteria"
            }

        return {
            "year": year,
            "filters": {
                "state": state,
                "race": race,
                "age_group": age_group,
                "sex": sex
            },
            "population": population
        }

    except Exception as e:
        logger.error(f"Error looking up population: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/population/check/{year}")
async def check_population_data(
    year: int,
    state: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    """
    Check if population data exists for a year.

    Args:
        year: Year to check
        state: Optional state to check
        db: Database session

    Returns:
        Existence status
    """
    try:
        population_service = PopulationService()

        exists = await population_service.check_population_data_exists(
            db=db,
            year=year,
            state=state
        )

        return {
            "year": year,
            "state": state,
            "exists": exists,
            "message": "Data exists" if exists else "No data found"
        }

    except Exception as e:
        logger.error(f"Error checking population data: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/population/{year}")
async def delete_population_data(
    year: int,
    state: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete population data for a year.

    Args:
        year: Year to delete
        state: Optional state to delete
        db: Database session

    Returns:
        Deletion status
    """
    try:
        population_service = PopulationService()

        records_deleted = await population_service.delete_population_data(
            db=db,
            year=year,
            state=state
        )

        return {
            "status": "success",
            "year": year,
            "state": state,
            "records_deleted": records_deleted
        }

    except Exception as e:
        logger.error(f"Error deleting population data: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/population/states")
async def get_available_states():
    """
    Get list of available states.

    Returns:
        List of state names
    """
    try:
        population_service = PopulationService()
        states = population_service.get_available_states()

        return {
            "states": states,
            "count": len(states)
        }

    except Exception as e:
        logger.error(f"Error getting states: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


async def _fetch_population_task(year: int, states: Optional[List[str]], db: AsyncSession):
    """Background task to fetch population data."""
    try:
        logger.info(f"Background task: Fetching population data for {year}")
        population_service = PopulationService()
        result = await population_service.fetch_population_for_year(year, db, states)
        logger.info(f"Successfully fetched population data: {result}")
    except Exception as e:
        logger.error(f"Background population fetch failed: {str(e)}")


# Statistics Calculation Endpoints

@router.post("/statistics/calculate/{year}")
async def calculate_statistics(
    year: int,
    crime_type: str = Query(default="murder", description="Crime type"),
    states: Optional[List[str]] = Query(default=None, description="List of states"),
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate statistics for a specific year and crime type.

    Args:
        year: Year to calculate statistics for
        crime_type: Type of crime
        states: Optional list of states
        background_tasks: FastAPI background tasks
        db: Database session

    Returns:
        Calculation status
    """
    try:
        calculator = StatisticsCalculator()

        # Check if already calculated
        exists = await calculator.check_calculated_statistics_exist(db, year, crime_type)

        if exists:
            return {
                "status": "already_calculated",
                "message": f"Statistics for {crime_type} {year} already calculated. Use recalculate endpoint to force recalculation.",
                "year": year,
                "crime_type": crime_type
            }

        # Trigger calculation in background
        if background_tasks:
            background_tasks.add_task(
                _calculate_statistics_task,
                year=year,
                crime_type=crime_type,
                states=states,
                db=db
            )

            return {
                "status": "calculation_started",
                "message": f"Statistics calculation started for {crime_type} {year}",
                "year": year,
                "crime_type": crime_type
            }
        else:
            # Calculate synchronously
            result = await calculator.calculate_statistics_for_year(
                year=year,
                crime_type=crime_type,
                db=db,
                states=states
            )
            return result

    except StatisticsCalculatorError as e:
        logger.error(f"Statistics calculation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error calculating statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/statistics/recalculate/{year}")
async def recalculate_statistics(
    year: int,
    crime_type: str = Query(default="murder", description="Crime type"),
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Recalculate statistics (deletes existing and recalculates).

    Args:
        year: Year to recalculate
        crime_type: Type of crime
        background_tasks: FastAPI background tasks
        db: Database session

    Returns:
        Recalculation status
    """
    try:
        calculator = StatisticsCalculator()

        # Trigger recalculation in background
        if background_tasks:
            background_tasks.add_task(
                _recalculate_statistics_task,
                year=year,
                crime_type=crime_type,
                db=db
            )

            return {
                "status": "recalculation_started",
                "message": f"Statistics recalculation started for {crime_type} {year}",
                "year": year,
                "crime_type": crime_type
            }
        else:
            # Recalculate synchronously
            result = await calculator.recalculate_all_for_year(
                year=year,
                crime_type=crime_type,
                db=db
            )
            return result

    except StatisticsCalculatorError as e:
        logger.error(f"Statistics recalculation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error recalculating statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/statistics/check/{year}")
async def check_calculated_statistics(
    year: int,
    crime_type: str = Query(default="murder", description="Crime type"),
    db: AsyncSession = Depends(get_db)
):
    """
    Check if calculated statistics exist for a year.

    Args:
        year: Year to check
        crime_type: Crime type
        db: Database session

    Returns:
        Existence status
    """
    try:
        calculator = StatisticsCalculator()

        exists = await calculator.check_calculated_statistics_exist(
            db=db,
            year=year,
            crime_type=crime_type
        )

        return {
            "year": year,
            "crime_type": crime_type,
            "exists": exists,
            "message": "Statistics calculated" if exists else "No statistics found"
        }

    except Exception as e:
        logger.error(f"Error checking calculated statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/statistics/{year}")
async def delete_calculated_statistics(
    year: int,
    crime_type: Optional[str] = Query(default=None, description="Crime type"),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete calculated statistics for a year.

    Args:
        year: Year to delete
        crime_type: Optional crime type filter
        db: Database session

    Returns:
        Deletion status
    """
    try:
        calculator = StatisticsCalculator()

        records_deleted = await calculator.delete_calculated_statistics(
            year=year,
            crime_type=crime_type,
            db=db
        )

        return {
            "status": "success",
            "year": year,
            "crime_type": crime_type,
            "records_deleted": records_deleted
        }

    except Exception as e:
        logger.error(f"Error deleting calculated statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


async def _calculate_statistics_task(
    year: int,
    crime_type: str,
    states: Optional[List[str]],
    db: AsyncSession
):
    """Background task to calculate statistics."""
    try:
        logger.info(f"Background task: Calculating statistics for {crime_type} {year}")
        calculator = StatisticsCalculator()
        result = await calculator.calculate_statistics_for_year(year, crime_type, db, states)
        logger.info(f"Successfully calculated statistics: {result}")
    except Exception as e:
        logger.error(f"Background statistics calculation failed: {str(e)}")


async def _recalculate_statistics_task(year: int, crime_type: str, db: AsyncSession):
    """Background task to recalculate statistics."""
    try:
        logger.info(f"Background task: Recalculating statistics for {crime_type} {year}")
        calculator = StatisticsCalculator()
        result = await calculator.recalculate_all_for_year(year, crime_type, db)
        logger.info(f"Successfully recalculated statistics: {result}")
    except Exception as e:
        logger.error(f"Background statistics recalculation failed: {str(e)}")
