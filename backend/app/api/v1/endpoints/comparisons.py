"""Comparison API endpoints for comparing crime statistics across dimensions."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.crime_data import CalculatedStatistic
from app.models.schemas import ComparisonResponse, ComparisonItem
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/years", response_model=ComparisonResponse)
async def compare_years(
    crime_type: str = Query(default="murder"),
    years: str = Query(..., description="Comma-separated list of years (e.g., 2020,2021,2022)"),
    state: Optional[str] = Query(default=None, description="State filter"),
    demographic_type: str = Query(default="total", description="Demographic breakdown type"),
    db: AsyncSession = Depends(get_db)
):
    """
    Compare crime statistics across multiple years.

    Args:
        crime_type: Type of crime
        years: Comma-separated years to compare
        state: Optional state filter
        demographic_type: Type of demographic breakdown
        db: Database session

    Returns:
        ComparisonResponse: Comparison data across years
    """
    try:
        # Parse years
        year_list = [int(y.strip()) for y in years.split(",")]

        if len(year_list) < 2:
            raise HTTPException(status_code=400, detail="Please provide at least 2 years to compare")

        if len(year_list) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 years can be compared at once")

        logger.info(f"Comparing {crime_type} across years: {year_list}")

        items = []

        for year in year_list:
            query = select(CalculatedStatistic).where(
                and_(
                    CalculatedStatistic.year == year,
                    CalculatedStatistic.crime_type == crime_type,
                    CalculatedStatistic.demographic_type == demographic_type
                )
            )

            if state:
                query = query.where(CalculatedStatistic.state == state)
            else:
                # Get total for the year
                query = query.where(CalculatedStatistic.demographic_value.is_(None))

            result = await db.execute(query)
            record = result.scalar_one_or_none()

            if record:
                items.append(ComparisonItem(
                    label=str(year),
                    year=year,
                    state=state,
                    incident_count=record.incident_count,
                    population=record.population,
                    per_capita_rate=float(record.per_capita_rate) if record.per_capita_rate else None
                ))
            else:
                items.append(ComparisonItem(
                    label=str(year),
                    year=year,
                    state=state,
                    incident_count=0,
                    population=None,
                    per_capita_rate=None
                ))

        return ComparisonResponse(
            crime_type=crime_type,
            comparison_type="years",
            items=items
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid year format: {str(e)}")
    except Exception as e:
        logger.error(f"Error comparing years: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/states", response_model=ComparisonResponse)
async def compare_states(
    crime_type: str = Query(default="murder"),
    year: int = Query(..., description="Year to compare"),
    states: str = Query(..., description="Comma-separated list of states"),
    db: AsyncSession = Depends(get_db)
):
    """
    Compare crime statistics across multiple states.

    Args:
        crime_type: Type of crime
        year: Year to compare
        states: Comma-separated states
        db: Database session

    Returns:
        ComparisonResponse: Comparison data across states
    """
    try:
        # Parse states
        state_list = [s.strip() for s in states.split(",")]

        if len(state_list) < 2:
            raise HTTPException(status_code=400, detail="Please provide at least 2 states to compare")

        if len(state_list) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 states can be compared at once")

        logger.info(f"Comparing {crime_type} across states: {state_list}")

        items = []

        for state in state_list:
            query = select(CalculatedStatistic).where(
                and_(
                    CalculatedStatistic.year == year,
                    CalculatedStatistic.crime_type == crime_type,
                    CalculatedStatistic.demographic_type == "by_state",
                    CalculatedStatistic.state == state
                )
            )

            result = await db.execute(query)
            record = result.scalar_one_or_none()

            if record:
                items.append(ComparisonItem(
                    label=state,
                    year=year,
                    state=state,
                    incident_count=record.incident_count,
                    population=record.population,
                    per_capita_rate=float(record.per_capita_rate) if record.per_capita_rate else None
                ))
            else:
                items.append(ComparisonItem(
                    label=state,
                    year=year,
                    state=state,
                    incident_count=0,
                    population=None,
                    per_capita_rate=None
                ))

        return ComparisonResponse(
            crime_type=crime_type,
            comparison_type="states",
            items=items
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing states: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/demographics", response_model=ComparisonResponse)
async def compare_demographics(
    crime_type: str = Query(default="murder"),
    year: int = Query(..., description="Year to compare"),
    demographic_type: str = Query(..., description="Demographic type (by_race, by_age, by_sex)"),
    state: Optional[str] = Query(default=None, description="State filter"),
    db: AsyncSession = Depends(get_db)
):
    """
    Compare crime statistics across demographics.

    Args:
        crime_type: Type of crime
        year: Year to compare
        demographic_type: Type of demographic breakdown
        state: Optional state filter
        db: Database session

    Returns:
        ComparisonResponse: Comparison data across demographics
    """
    try:
        valid_types = ["by_race", "by_age", "by_sex"]
        if demographic_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid demographic_type. Must be one of: {', '.join(valid_types)}"
            )

        logger.info(f"Comparing {crime_type} across {demographic_type}")

        query = select(CalculatedStatistic).where(
            and_(
                CalculatedStatistic.year == year,
                CalculatedStatistic.crime_type == crime_type,
                CalculatedStatistic.demographic_type == demographic_type
            )
        )

        if state:
            query = query.where(CalculatedStatistic.state == state)

        result = await db.execute(query)
        records = result.scalars().all()

        items = []
        for record in records:
            items.append(ComparisonItem(
                label=record.demographic_value or "Unknown",
                year=year,
                state=state,
                demographic_value=record.demographic_value,
                incident_count=record.incident_count,
                population=record.population,
                per_capita_rate=float(record.per_capita_rate) if record.per_capita_rate else None
            ))

        # Sort by per capita rate descending
        items.sort(key=lambda x: x.per_capita_rate or 0, reverse=True)

        return ComparisonResponse(
            crime_type=crime_type,
            comparison_type=demographic_type,
            items=items
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing demographics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
