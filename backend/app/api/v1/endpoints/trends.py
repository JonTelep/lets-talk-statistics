"""Trend analysis API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.crime_data import CrimeStatistic
from app.models.schemas import TrendDataResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/trends", response_model=TrendDataResponse)
async def get_trend_data(
    crime_type: str = Query(default="murder"),
    start_year: int = Query(..., description="Start year for trend analysis"),
    end_year: int = Query(..., description="End year for trend analysis"),
    state: Optional[str] = Query(default=None, description="State filter"),
    race: Optional[str] = Query(default=None, description="Race filter"),
    age_group: Optional[str] = Query(default=None, description="Age group filter"),
    sex: Optional[str] = Query(default=None, description="Sex filter"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get trend data for crime statistics over multiple years.

    Args:
        crime_type: Type of crime
        start_year: Starting year
        end_year: Ending year
        state: Optional state filter
        race: Optional race filter
        age_group: Optional age group filter
        sex: Optional sex filter
        db: Database session

    Returns:
        TrendDataResponse: Trend data with year-over-year changes
    """
    try:
        if start_year > end_year:
            raise HTTPException(status_code=400, detail="start_year must be <= end_year")

        logger.info(f"Fetching trend data: {crime_type} from {start_year} to {end_year}")

        # Build query for each year
        years = list(range(start_year, end_year + 1))
        year_data = {}

        for year in years:
            query = select(
                func.sum(CrimeStatistic.incident_count).label("total_incidents"),
                func.sum(CrimeStatistic.population).label("total_population")
            ).where(
                CrimeStatistic.crime_type == crime_type,
                CrimeStatistic.year == year
            )

            # Apply filters
            if state:
                query = query.where(CrimeStatistic.state == state)
            if race:
                query = query.where(CrimeStatistic.race == race)
            if age_group:
                query = query.where(CrimeStatistic.age_group == age_group)
            if sex:
                query = query.where(CrimeStatistic.sex == sex)

            result = await db.execute(query)
            row = result.first()

            if row:
                incidents, population = row
                year_data[year] = {
                    "incidents": incidents or 0,
                    "population": population or 0
                }
            else:
                year_data[year] = {
                    "incidents": 0,
                    "population": 0
                }

        # Calculate per capita rates and year-over-year changes
        incident_counts = []
        per_capita_rates = []
        yoy_changes = []

        for i, year in enumerate(years):
            data = year_data[year]
            incidents = data["incidents"]
            population = data["population"]

            incident_counts.append(incidents)

            # Calculate per capita rate
            if population and population > 0:
                per_capita = round((incidents / population) * 100000, 2)
                per_capita_rates.append(per_capita)
            else:
                per_capita_rates.append(None)

            # Calculate year-over-year change
            if i == 0:
                yoy_changes.append(None)
            else:
                prev_incidents = year_data[years[i - 1]]["incidents"]
                if prev_incidents > 0:
                    change = round(((incidents - prev_incidents) / prev_incidents) * 100, 2)
                    yoy_changes.append(change)
                else:
                    yoy_changes.append(None)

        return TrendDataResponse(
            crime_type=crime_type,
            years=years,
            incident_counts=incident_counts,
            per_capita_rates=per_capita_rates,
            yoy_changes=yoy_changes
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching trend data: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
