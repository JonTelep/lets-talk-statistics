"""Statistics API endpoints."""

from datetime import datetime
from typing import List, Optional
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.crime_data import CrimeStatistic, CalculatedStatistic
from app.models.schemas import (
    CrimeStatisticsResponse,
    CrimeStatisticsQuery,
    PaginatedCrimeStatisticsResponse,
    PaginationMetadata,
    CrimeStatisticResponse,
    SearchFilters,
    SearchResponse
)
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/states")
async def get_available_states(db: AsyncSession = Depends(get_db)):
    """
    Get list of all available states in the database.

    Returns:
        List of state names
    """
    try:
        query = select(CrimeStatistic.state).distinct().where(
            CrimeStatistic.state.isnot(None)
        ).order_by(CrimeStatistic.state)

        result = await db.execute(query)
        states = [row[0] for row in result.all()]

        return states

    except Exception as e:
        logger.error(f"Error fetching states: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/years")
async def get_available_years(db: AsyncSession = Depends(get_db)):
    """
    Get list of all available years in the database.

    Returns:
        List of years (sorted descending)
    """
    try:
        query = select(CrimeStatistic.year).distinct().where(
            CrimeStatistic.year.isnot(None)
        ).order_by(CrimeStatistic.year.desc())

        result = await db.execute(query)
        years = [row[0] for row in result.all()]

        return years

    except Exception as e:
        logger.error(f"Error fetching years: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/crimes", response_model=CrimeStatisticsResponse)
async def get_crime_statistics(
    crime_type: str = Query(default="murder", description="Type of crime"),
    year: Optional[int] = Query(default=None, description="Specific year"),
    state: Optional[str] = Query(default=None, description="State filter"),
    race: Optional[str] = Query(default=None, description="Race filter"),
    age_group: Optional[str] = Query(default=None, description="Age group filter"),
    sex: Optional[str] = Query(default=None, description="Sex filter"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get crime statistics with optional filters.

    Args:
        crime_type: Type of crime (default: murder)
        year: Specific year to query
        state: Filter by state
        race: Filter by race
        age_group: Filter by age group
        sex: Filter by sex
        db: Database session

    Returns:
        CrimeStatisticsResponse: Crime statistics data
    """
    try:
        logger.info(f"Fetching crime statistics: type={crime_type}, year={year}")

        # Build query
        query = select(CrimeStatistic).where(CrimeStatistic.crime_type == crime_type)

        if year:
            query = query.where(CrimeStatistic.year == year)
        if state:
            query = query.where(CrimeStatistic.state == state)
        if race:
            query = query.where(CrimeStatistic.race == race)
        if age_group:
            query = query.where(CrimeStatistic.age_group == age_group)
        if sex:
            query = query.where(CrimeStatistic.sex == sex)

        # Execute query
        result = await db.execute(query)
        records = result.scalars().all()

        if not records:
            return CrimeStatisticsResponse(
                crime_type=crime_type,
                year=year,
                filters={
                    "state": state,
                    "race": race,
                    "age_group": age_group,
                    "sex": sex,
                },
                total_incidents=0,
                population=None,
                per_capita_rate=None,
                breakdown_by_state=[]
            )

        # Calculate totals
        total_incidents = sum(r.incident_count for r in records)
        total_population = sum(r.population for r in records if r.population)

        # Calculate per capita rate
        per_capita_rate = None
        if total_population and total_population > 0:
            per_capita_rate = round((total_incidents / total_population) * 100000, 2)

        # Group by state for breakdown
        state_breakdown = {}
        for record in records:
            state_key = record.state or "Unknown"
            if state_key not in state_breakdown:
                state_breakdown[state_key] = {
                    "state": state_key,
                    "incidents": 0,
                    "population": 0
                }
            state_breakdown[state_key]["incidents"] += record.incident_count
            if record.population:
                state_breakdown[state_key]["population"] += record.population

        breakdown_list = list(state_breakdown.values())

        return CrimeStatisticsResponse(
            crime_type=crime_type,
            year=year,
            filters={
                "state": state,
                "race": race,
                "age_group": age_group,
                "sex": sex,
            },
            total_incidents=total_incidents,
            population=total_population if total_population else None,
            per_capita_rate=per_capita_rate,
            breakdown_by_state=breakdown_list if not state else None
        )

    except Exception as e:
        logger.error(f"Error fetching crime statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/per-capita")
async def get_per_capita_rates(
    crime_type: str = Query(default="murder"),
    year: Optional[int] = Query(default=None),
    demographic_type: str = Query(default="total", description="Demographic breakdown type"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get per capita crime rates.

    Args:
        crime_type: Type of crime
        year: Specific year
        demographic_type: Type of demographic breakdown
        db: Database session

    Returns:
        Per capita rate data
    """
    try:
        query = select(CalculatedStatistic).where(
            CalculatedStatistic.crime_type == crime_type,
            CalculatedStatistic.demographic_type == demographic_type
        )

        if year:
            query = query.where(CalculatedStatistic.year == year)

        result = await db.execute(query)
        records = result.scalars().all()

        return {
            "crime_type": crime_type,
            "year": year,
            "demographic_type": demographic_type,
            "data": [
                {
                    "year": r.year,
                    "demographic_value": r.demographic_value,
                    "state": r.state,
                    "per_capita_rate": float(r.per_capita_rate) if r.per_capita_rate else None,
                    "incident_count": r.incident_count,
                    "population": r.population
                }
                for r in records
            ]
        }

    except Exception as e:
        logger.error(f"Error fetching per capita rates: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/demographics")
async def get_demographic_breakdown(
    crime_type: str = Query(default="murder"),
    year: int = Query(..., description="Year to query"),
    breakdown_by: str = Query(default="race", description="Demographic field to break down by"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get demographic breakdown of crime statistics.

    Args:
        crime_type: Type of crime
        year: Year to query
        breakdown_by: Field to break down by (race, age_group, sex)
        db: Database session

    Returns:
        Demographic breakdown data
    """
    try:
        # Map breakdown_by to the actual column
        field_map = {
            "race": CrimeStatistic.race,
            "age_group": CrimeStatistic.age_group,
            "sex": CrimeStatistic.sex,
        }

        if breakdown_by not in field_map:
            raise HTTPException(status_code=400, detail="Invalid breakdown_by parameter")

        field = field_map[breakdown_by]

        # Build aggregation query
        query = select(
            field,
            func.sum(CrimeStatistic.incident_count).label("total_incidents"),
            func.sum(CrimeStatistic.population).label("total_population")
        ).where(
            CrimeStatistic.crime_type == crime_type,
            CrimeStatistic.year == year
        ).group_by(field)

        result = await db.execute(query)
        rows = result.all()

        breakdown = []
        for row in rows:
            demographic_value, incidents, population = row
            per_capita = None
            if population and population > 0:
                per_capita = round((incidents / population) * 100000, 2)

            breakdown.append({
                breakdown_by: demographic_value,
                "incident_count": incidents,
                "population": population,
                "per_capita_rate": per_capita
            })

        return {
            "crime_type": crime_type,
            "year": year,
            "breakdown_by": breakdown_by,
            "data": breakdown
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching demographic breakdown: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/list", response_model=PaginatedCrimeStatisticsResponse)
async def list_crime_statistics(
    crime_type: str = Query(default="murder"),
    year: Optional[int] = Query(default=None),
    state: Optional[str] = Query(default=None),
    race: Optional[str] = Query(default=None),
    age_group: Optional[str] = Query(default=None),
    sex: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=100, ge=1, le=1000, description="Items per page"),
    db: AsyncSession = Depends(get_db)
):
    """
    List crime statistics with pagination.

    Args:
        crime_type: Type of crime
        year: Optional year filter
        state: Optional state filter
        race: Optional race filter
        age_group: Optional age group filter
        sex: Optional sex filter
        page: Page number (starts at 1)
        page_size: Number of items per page (max 1000)
        db: Database session

    Returns:
        PaginatedCrimeStatisticsResponse: Paginated crime statistics
    """
    try:
        logger.info(f"Listing crime statistics: page={page}, size={page_size}")

        # Build base query
        query = select(CrimeStatistic).where(CrimeStatistic.crime_type == crime_type)

        # Apply filters
        if year:
            query = query.where(CrimeStatistic.year == year)
        if state:
            query = query.where(CrimeStatistic.state == state)
        if race:
            query = query.where(CrimeStatistic.race == race)
        if age_group:
            query = query.where(CrimeStatistic.age_group == age_group)
        if sex:
            query = query.where(CrimeStatistic.sex == sex)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        count_result = await db.execute(count_query)
        total_records = count_result.scalar() or 0

        # Calculate pagination
        total_pages = ceil(total_records / page_size) if total_records > 0 else 0
        offset = (page - 1) * page_size

        # Get paginated results
        query = query.order_by(CrimeStatistic.year.desc(), CrimeStatistic.state)
        query = query.limit(page_size).offset(offset)

        result = await db.execute(query)
        records = result.scalars().all()

        # Convert to response models
        data = [
            CrimeStatisticResponse(
                id=r.id,
                year=r.year,
                crime_type=r.crime_type,
                state=r.state,
                jurisdiction=r.jurisdiction,
                age_group=r.age_group,
                race=r.race,
                sex=r.sex,
                incident_count=r.incident_count,
                population=r.population,
                source_id=r.source_id,
                additional_data=r.additional_data,
                created_at=r.created_at
            )
            for r in records
        ]

        pagination = PaginationMetadata(
            page=page,
            page_size=page_size,
            total_records=total_records,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_previous=page > 1
        )

        return PaginatedCrimeStatisticsResponse(
            data=data,
            pagination=pagination
        )

    except Exception as e:
        logger.error(f"Error listing crime statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/search", response_model=SearchResponse)
async def search_crime_statistics(
    filters: SearchFilters,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """
    Advanced search for crime statistics with multiple filters.

    Args:
        filters: Search filters
        page: Page number
        page_size: Items per page
        db: Database session

    Returns:
        SearchResponse: Search results with pagination
    """
    try:
        logger.info(f"Searching crime statistics with filters: {filters}")

        # Build query
        query = select(CrimeStatistic)

        conditions = []

        # Apply filters
        if filters.crime_type:
            conditions.append(CrimeStatistic.crime_type == filters.crime_type)

        if filters.years:
            conditions.append(CrimeStatistic.year.in_(filters.years))

        if filters.states:
            conditions.append(CrimeStatistic.state.in_(filters.states))

        if filters.races:
            conditions.append(CrimeStatistic.race.in_(filters.races))

        if filters.age_groups:
            conditions.append(CrimeStatistic.age_group.in_(filters.age_groups))

        if filters.sexes:
            conditions.append(CrimeStatistic.sex.in_(filters.sexes))

        if filters.min_incidents is not None:
            conditions.append(CrimeStatistic.incident_count >= filters.min_incidents)

        if filters.max_incidents is not None:
            conditions.append(CrimeStatistic.incident_count <= filters.max_incidents)

        if conditions:
            query = query.where(and_(*conditions))

        # Handle per capita rate filters (requires calculated statistics)
        if filters.min_per_capita_rate is not None or filters.max_per_capita_rate is not None:
            # This is a simplified approach - in production you might join with calculated_statistics
            logger.warning("Per capita rate filtering not yet implemented in search")

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        count_result = await db.execute(count_query)
        total_results = count_result.scalar() or 0

        # Get paginated results
        offset = (page - 1) * page_size
        query = query.order_by(CrimeStatistic.year.desc(), CrimeStatistic.state)
        query = query.limit(page_size).offset(offset)

        result = await db.execute(query)
        records = result.scalars().all()

        # Convert to response models
        results = [
            CrimeStatisticResponse(
                id=r.id,
                year=r.year,
                crime_type=r.crime_type,
                state=r.state,
                jurisdiction=r.jurisdiction,
                age_group=r.age_group,
                race=r.race,
                sex=r.sex,
                incident_count=r.incident_count,
                population=r.population,
                source_id=r.source_id,
                additional_data=r.additional_data,
                created_at=r.created_at
            )
            for r in records
        ]

        # Calculate pagination
        total_pages = ceil(total_results / page_size) if total_results > 0 else 0

        pagination = PaginationMetadata(
            page=page,
            page_size=page_size,
            total_records=total_results,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_previous=page > 1
        )

        return SearchResponse(
            filters_applied=filters,
            total_results=total_results,
            results=results,
            pagination=pagination
        )

    except Exception as e:
        logger.error(f"Error searching crime statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
