"""Rankings API endpoints for top/bottom statistics."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.crime_data import CalculatedStatistic
from app.models.schemas import RankingsResponse, RankingItem
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/states", response_model=RankingsResponse)
async def get_state_rankings(
    crime_type: str = Query(default="murder"),
    year: int = Query(..., description="Year to rank"),
    order: str = Query(default="desc", description="Ranking order (asc or desc)"),
    limit: int = Query(default=10, ge=1, le=51, description="Number of results to return"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get state rankings by per capita crime rate.

    Args:
        crime_type: Type of crime
        year: Year to rank
        order: 'desc' for highest rates (top), 'asc' for lowest rates (bottom)
        limit: Number of results (max 51)
        db: Database session

    Returns:
        RankingsResponse: Ranked states by crime rate
    """
    try:
        if order not in ["asc", "desc"]:
            raise HTTPException(status_code=400, detail="Order must be 'asc' or 'desc'")

        logger.info(f"Fetching {order} state rankings for {crime_type} in {year}")

        # Query calculated statistics for states
        query = select(CalculatedStatistic).where(
            and_(
                CalculatedStatistic.year == year,
                CalculatedStatistic.crime_type == crime_type,
                CalculatedStatistic.demographic_type == "by_state",
                CalculatedStatistic.per_capita_rate.isnot(None)
            )
        )

        # Order by per capita rate
        if order == "desc":
            query = query.order_by(CalculatedStatistic.per_capita_rate.desc())
        else:
            query = query.order_by(CalculatedStatistic.per_capita_rate.asc())

        query = query.limit(limit)

        result = await db.execute(query)
        records = result.scalars().all()

        rankings = []
        for rank, record in enumerate(records, start=1):
            rankings.append(RankingItem(
                rank=rank,
                state=record.state,
                incident_count=record.incident_count,
                population=record.population,
                per_capita_rate=float(record.per_capita_rate) if record.per_capita_rate else None,
                change_from_previous_year=float(record.yoy_change) if record.yoy_change else None
            ))

        return RankingsResponse(
            crime_type=crime_type,
            year=year,
            ranking_by="state",
            order=order,
            rankings=rankings
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching state rankings: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/demographics", response_model=RankingsResponse)
async def get_demographic_rankings(
    crime_type: str = Query(default="murder"),
    year: int = Query(..., description="Year to rank"),
    demographic_type: str = Query(..., description="Demographic type (by_race, by_age, by_sex)"),
    state: Optional[str] = Query(default=None, description="Optional state filter"),
    order: str = Query(default="desc", description="Ranking order (asc or desc)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get demographic rankings by per capita crime rate.

    Args:
        crime_type: Type of crime
        year: Year to rank
        demographic_type: Type of demographic breakdown
        state: Optional state filter
        order: 'desc' for highest rates, 'asc' for lowest rates
        db: Database session

    Returns:
        RankingsResponse: Ranked demographics by crime rate
    """
    try:
        valid_types = ["by_race", "by_age", "by_sex"]
        if demographic_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid demographic_type. Must be one of: {', '.join(valid_types)}"
            )

        if order not in ["asc", "desc"]:
            raise HTTPException(status_code=400, detail="Order must be 'asc' or 'desc'")

        logger.info(f"Fetching {order} {demographic_type} rankings for {crime_type} in {year}")

        # Query calculated statistics
        query = select(CalculatedStatistic).where(
            and_(
                CalculatedStatistic.year == year,
                CalculatedStatistic.crime_type == crime_type,
                CalculatedStatistic.demographic_type == demographic_type,
                CalculatedStatistic.per_capita_rate.isnot(None)
            )
        )

        if state:
            query = query.where(CalculatedStatistic.state == state)

        # Order by per capita rate
        if order == "desc":
            query = query.order_by(CalculatedStatistic.per_capita_rate.desc())
        else:
            query = query.order_by(CalculatedStatistic.per_capita_rate.asc())

        result = await db.execute(query)
        records = result.scalars().all()

        rankings = []
        for rank, record in enumerate(records, start=1):
            rankings.append(RankingItem(
                rank=rank,
                demographic_value=record.demographic_value,
                state=state,
                incident_count=record.incident_count,
                population=record.population,
                per_capita_rate=float(record.per_capita_rate) if record.per_capita_rate else None,
                change_from_previous_year=float(record.yoy_change) if record.yoy_change else None
            ))

        return RankingsResponse(
            crime_type=crime_type,
            year=year,
            ranking_by=demographic_type,
            order=order,
            rankings=rankings
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching demographic rankings: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/top-states", response_model=RankingsResponse)
async def get_top_states(
    crime_type: str = Query(default="murder"),
    year: int = Query(..., description="Year to rank"),
    limit: int = Query(default=10, ge=1, le=51, description="Number of top states"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get top states with highest per capita crime rates.

    Convenience endpoint equivalent to /rankings/states with order=desc.

    Args:
        crime_type: Type of crime
        year: Year to rank
        limit: Number of results
        db: Database session

    Returns:
        RankingsResponse: Top states by crime rate
    """
    return await get_state_rankings(crime_type, year, "desc", limit, db)


@router.get("/bottom-states", response_model=RankingsResponse)
async def get_bottom_states(
    crime_type: str = Query(default="murder"),
    year: int = Query(..., description="Year to rank"),
    limit: int = Query(default=10, ge=1, le=51, description="Number of bottom states"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get bottom states with lowest per capita crime rates.

    Convenience endpoint equivalent to /rankings/states with order=asc.

    Args:
        crime_type: Type of crime
        year: Year to rank
        limit: Number of results
        db: Database session

    Returns:
        RankingsResponse: Bottom states by crime rate
    """
    return await get_state_rankings(crime_type, year, "asc", limit, db)


@router.get("/biggest-changes", response_model=RankingsResponse)
async def get_biggest_changes(
    crime_type: str = Query(default="murder"),
    year: int = Query(..., description="Year to analyze"),
    change_type: str = Query(default="increase", description="Type of change (increase or decrease)"),
    ranking_by: str = Query(default="state", description="Ranking dimension (state or demographic_type)"),
    limit: int = Query(default=10, ge=1, le=51, description="Number of results"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get rankings by biggest year-over-year changes.

    Args:
        crime_type: Type of crime
        year: Year to analyze
        change_type: 'increase' for biggest increases, 'decrease' for biggest decreases
        ranking_by: What to rank ('state' or demographic type)
        limit: Number of results
        db: Database session

    Returns:
        RankingsResponse: Rankings by YoY change
    """
    try:
        if change_type not in ["increase", "decrease"]:
            raise HTTPException(status_code=400, detail="change_type must be 'increase' or 'decrease'")

        logger.info(f"Fetching biggest {change_type}s for {crime_type} in {year}")

        # Determine demographic type
        if ranking_by == "state":
            demographic_type = "by_state"
        elif ranking_by in ["by_race", "by_age", "by_sex"]:
            demographic_type = ranking_by
        else:
            raise HTTPException(
                status_code=400,
                detail="ranking_by must be 'state', 'by_race', 'by_age', or 'by_sex'"
            )

        # Query calculated statistics with YoY changes
        query = select(CalculatedStatistic).where(
            and_(
                CalculatedStatistic.year == year,
                CalculatedStatistic.crime_type == crime_type,
                CalculatedStatistic.demographic_type == demographic_type,
                CalculatedStatistic.yoy_change.isnot(None)
            )
        )

        # Order by YoY change
        if change_type == "increase":
            query = query.order_by(CalculatedStatistic.yoy_change.desc())
        else:
            query = query.order_by(CalculatedStatistic.yoy_change.asc())

        query = query.limit(limit)

        result = await db.execute(query)
        records = result.scalars().all()

        rankings = []
        for rank, record in enumerate(records, start=1):
            rankings.append(RankingItem(
                rank=rank,
                state=record.state if ranking_by == "state" else None,
                demographic_value=record.demographic_value if ranking_by != "state" else None,
                incident_count=record.incident_count,
                population=record.population,
                per_capita_rate=float(record.per_capita_rate) if record.per_capita_rate else None,
                change_from_previous_year=float(record.yoy_change) if record.yoy_change else None
            ))

        return RankingsResponse(
            crime_type=crime_type,
            year=year,
            ranking_by=f"{ranking_by}_yoy_change",
            order="desc" if change_type == "increase" else "asc",
            rankings=rankings
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching biggest changes: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
