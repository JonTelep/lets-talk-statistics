"""Data export API endpoints."""

from typing import Optional
import io

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import pandas as pd

from app.api.deps import get_db
from app.models.crime_data import CrimeStatistic, DataSource
from app.models.schemas import CrimeTypeInfo, CrimeTypesResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/csv")
async def export_to_csv(
    crime_type: str = Query(default="murder"),
    year: Optional[int] = Query(default=None),
    state: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    """
    Export crime statistics data to CSV format.

    Args:
        crime_type: Type of crime
        year: Optional year filter
        state: Optional state filter
        db: Database session

    Returns:
        CSV file download
    """
    try:
        logger.info(f"Exporting CSV: type={crime_type}, year={year}")

        # Build query
        query = select(CrimeStatistic).where(CrimeStatistic.crime_type == crime_type)

        if year:
            query = query.where(CrimeStatistic.year == year)
        if state:
            query = query.where(CrimeStatistic.state == state)

        # Execute query
        result = await db.execute(query)
        records = result.scalars().all()

        if not records:
            raise HTTPException(status_code=404, detail="No data found for the specified filters")

        # Convert to DataFrame
        data = []
        for record in records:
            data.append({
                "year": record.year,
                "crime_type": record.crime_type,
                "state": record.state,
                "jurisdiction": record.jurisdiction,
                "age_group": record.age_group,
                "race": record.race,
                "sex": record.sex,
                "incident_count": record.incident_count,
                "population": record.population,
            })

        df = pd.DataFrame(data)

        # Convert to CSV
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)

        # Create filename
        filename = f"crime_statistics_{crime_type}"
        if year:
            filename += f"_{year}"
        if state:
            filename += f"_{state}"
        filename += ".csv"

        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(csv_buffer.getvalue().encode()),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting to CSV: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/crime-types", response_model=CrimeTypesResponse)
async def get_crime_types(db: AsyncSession = Depends(get_db)):
    """
    Get list of available crime types with metadata.

    Args:
        db: Database session

    Returns:
        CrimeTypesResponse: List of available crime types
    """
    try:
        # Query distinct crime types from crime_statistics
        query = select(
            CrimeStatistic.crime_type,
        ).distinct()

        result = await db.execute(query)
        crime_types = result.scalars().all()

        crime_type_list = []
        for crime_type in crime_types:
            # Get years available for this crime type
            years_query = select(CrimeStatistic.year).where(
                CrimeStatistic.crime_type == crime_type
            ).distinct().order_by(CrimeStatistic.year)

            years_result = await db.execute(years_query)
            years = years_result.scalars().all()

            # Get data sources
            sources_query = select(DataSource.source_name).join(
                CrimeStatistic,
                DataSource.id == CrimeStatistic.source_id
            ).where(
                CrimeStatistic.crime_type == crime_type
            ).distinct()

            sources_result = await db.execute(sources_query)
            sources = sources_result.scalars().all()

            # Create display name (capitalize first letter of each word)
            display_name = crime_type.replace("_", " ").title()

            crime_type_list.append(
                CrimeTypeInfo(
                    type=crime_type,
                    display_name=display_name,
                    available_years=list(years),
                    data_sources=list(sources)
                )
            )

        return CrimeTypesResponse(crime_types=crime_type_list)

    except Exception as e:
        logger.error(f"Error fetching crime types: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/data-sources")
async def get_data_sources(
    year: Optional[int] = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of available data sources.

    Args:
        year: Optional year filter
        db: Database session

    Returns:
        List of data sources
    """
    try:
        query = select(DataSource)

        if year:
            query = query.where(DataSource.year == year)

        query = query.order_by(DataSource.year.desc(), DataSource.source_name)

        result = await db.execute(query)
        sources = result.scalars().all()

        return {
            "data_sources": [
                {
                    "id": source.id,
                    "source_name": source.source_name,
                    "data_type": source.data_type,
                    "year": source.year,
                    "download_date": source.download_date,
                    "status": source.status,
                }
                for source in sources
            ]
        }

    except Exception as e:
        logger.error(f"Error fetching data sources: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
