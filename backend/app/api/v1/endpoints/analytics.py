"""Analytics API endpoints for aggregated statistics and insights."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.crime_data import CalculatedStatistic, CrimeStatistic
from app.models.schemas import AnalyticsSummaryResponse, YearSummary, RankingItem
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummaryResponse)
async def get_analytics_summary(
    crime_type: str = Query(default="murder"),
    start_year: int = Query(..., description="Start year"),
    end_year: int = Query(..., description="End year"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get comprehensive analytics summary for a time period.

    Includes:
    - Total incidents across all years
    - Average per capita rate
    - Yearly summaries with YoY changes
    - Top 10 states by per capita rate
    - Bottom 10 states by per capita rate

    Args:
        crime_type: Type of crime
        start_year: Starting year
        end_year: Ending year
        db: Database session

    Returns:
        AnalyticsSummaryResponse: Comprehensive analytics summary
    """
    try:
        if start_year > end_year:
            raise HTTPException(status_code=400, detail="start_year must be <= end_year")

        if end_year - start_year > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 years can be analyzed at once")

        logger.info(f"Generating analytics summary for {crime_type} from {start_year} to {end_year}")

        # Get yearly summaries
        years = list(range(start_year, end_year + 1))
        yearly_summaries = []
        total_incidents_all_years = 0
        per_capita_rates = []

        for year in years:
            # Get total for this year
            total_query = select(CalculatedStatistic).where(
                and_(
                    CalculatedStatistic.year == year,
                    CalculatedStatistic.crime_type == crime_type,
                    CalculatedStatistic.demographic_type == "total"
                )
            )

            total_result = await db.execute(total_query)
            total_record = total_result.scalar_one_or_none()

            # Count states reporting
            states_query = select(func.count(CalculatedStatistic.id)).where(
                and_(
                    CalculatedStatistic.year == year,
                    CalculatedStatistic.crime_type == crime_type,
                    CalculatedStatistic.demographic_type == "by_state"
                )
            )

            states_result = await db.execute(states_query)
            states_count = states_result.scalar() or 0

            if total_record:
                total_incidents = total_record.incident_count
                total_population = total_record.population
                per_capita_rate = float(total_record.per_capita_rate) if total_record.per_capita_rate else None
                yoy_change = float(total_record.yoy_change) if total_record.yoy_change else None

                total_incidents_all_years += total_incidents
                if per_capita_rate:
                    per_capita_rates.append(per_capita_rate)

                yearly_summaries.append(YearSummary(
                    year=year,
                    total_incidents=total_incidents,
                    total_population=total_population,
                    per_capita_rate=per_capita_rate,
                    states_reporting=states_count,
                    change_from_previous_year=yoy_change
                ))
            else:
                yearly_summaries.append(YearSummary(
                    year=year,
                    total_incidents=0,
                    total_population=None,
                    per_capita_rate=None,
                    states_reporting=states_count,
                    change_from_previous_year=None
                ))

        # Calculate average per capita rate
        average_per_capita = None
        if per_capita_rates:
            average_per_capita = round(sum(per_capita_rates) / len(per_capita_rates), 2)

        # Get top states (use most recent year)
        top_states_query = select(CalculatedStatistic).where(
            and_(
                CalculatedStatistic.year == end_year,
                CalculatedStatistic.crime_type == crime_type,
                CalculatedStatistic.demographic_type == "by_state",
                CalculatedStatistic.per_capita_rate.isnot(None)
            )
        ).order_by(CalculatedStatistic.per_capita_rate.desc()).limit(10)

        top_result = await db.execute(top_states_query)
        top_records = top_result.scalars().all()

        top_states = []
        for rank, record in enumerate(top_records, start=1):
            top_states.append(RankingItem(
                rank=rank,
                state=record.state,
                incident_count=record.incident_count,
                population=record.population,
                per_capita_rate=float(record.per_capita_rate) if record.per_capita_rate else None,
                change_from_previous_year=float(record.yoy_change) if record.yoy_change else None
            ))

        # Get bottom states
        bottom_states_query = select(CalculatedStatistic).where(
            and_(
                CalculatedStatistic.year == end_year,
                CalculatedStatistic.crime_type == crime_type,
                CalculatedStatistic.demographic_type == "by_state",
                CalculatedStatistic.per_capita_rate.isnot(None)
            )
        ).order_by(CalculatedStatistic.per_capita_rate.asc()).limit(10)

        bottom_result = await db.execute(bottom_states_query)
        bottom_records = bottom_result.scalars().all()

        bottom_states = []
        for rank, record in enumerate(bottom_records, start=1):
            bottom_states.append(RankingItem(
                rank=rank,
                state=record.state,
                incident_count=record.incident_count,
                population=record.population,
                per_capita_rate=float(record.per_capita_rate) if record.per_capita_rate else None,
                change_from_previous_year=float(record.yoy_change) if record.yoy_change else None
            ))

        return AnalyticsSummaryResponse(
            crime_type=crime_type,
            start_year=start_year,
            end_year=end_year,
            total_incidents=total_incidents_all_years,
            average_per_capita_rate=average_per_capita,
            yearly_summaries=yearly_summaries,
            top_states=top_states,
            bottom_states=bottom_states
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating analytics summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/year-summary/{year}")
async def get_year_summary(
    year: int,
    crime_type: str = Query(default="murder"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed summary for a specific year.

    Args:
        year: Year to summarize
        crime_type: Type of crime
        db: Database session

    Returns:
        Detailed year summary with breakdowns
    """
    try:
        logger.info(f"Generating year summary for {crime_type} in {year}")

        # Get total statistics
        total_query = select(CalculatedStatistic).where(
            and_(
                CalculatedStatistic.year == year,
                CalculatedStatistic.crime_type == crime_type,
                CalculatedStatistic.demographic_type == "total"
            )
        )

        total_result = await db.execute(total_query)
        total_record = total_result.scalar_one_or_none()

        if not total_record:
            raise HTTPException(status_code=404, detail=f"No data found for {crime_type} in {year}")

        # Get breakdowns
        breakdowns = {}
        for demo_type in ["by_race", "by_age", "by_sex", "by_state"]:
            breakdown_query = select(CalculatedStatistic).where(
                and_(
                    CalculatedStatistic.year == year,
                    CalculatedStatistic.crime_type == crime_type,
                    CalculatedStatistic.demographic_type == demo_type
                )
            ).order_by(CalculatedStatistic.per_capita_rate.desc())

            breakdown_result = await db.execute(breakdown_query)
            breakdown_records = breakdown_result.scalars().all()

            breakdowns[demo_type] = [
                {
                    "value": r.demographic_value or r.state,
                    "incident_count": r.incident_count,
                    "population": r.population,
                    "per_capita_rate": float(r.per_capita_rate) if r.per_capita_rate else None,
                    "yoy_change": float(r.yoy_change) if r.yoy_change else None
                }
                for r in breakdown_records
            ]

        return {
            "year": year,
            "crime_type": crime_type,
            "total": {
                "incident_count": total_record.incident_count,
                "population": total_record.population,
                "per_capita_rate": float(total_record.per_capita_rate) if total_record.per_capita_rate else None,
                "yoy_change": float(total_record.yoy_change) if total_record.yoy_change else None
            },
            "breakdowns": breakdowns
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating year summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/state-profile/{state}")
async def get_state_profile(
    state: str,
    crime_type: str = Query(default="murder"),
    start_year: Optional[int] = Query(default=None),
    end_year: Optional[int] = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    """
    Get comprehensive profile for a specific state.

    Args:
        state: State name
        crime_type: Type of crime
        start_year: Optional start year
        end_year: Optional end year
        db: Database session

    Returns:
        State profile with trends and demographics
    """
    try:
        logger.info(f"Generating state profile for {state} - {crime_type}")

        # Build query
        query = select(CalculatedStatistic).where(
            and_(
                CalculatedStatistic.crime_type == crime_type,
                CalculatedStatistic.demographic_type == "by_state",
                CalculatedStatistic.state == state
            )
        )

        if start_year:
            query = query.where(CalculatedStatistic.year >= start_year)
        if end_year:
            query = query.where(CalculatedStatistic.year <= end_year)

        query = query.order_by(CalculatedStatistic.year)

        result = await db.execute(query)
        records = result.scalars().all()

        if not records:
            raise HTTPException(status_code=404, detail=f"No data found for {state}")

        # Build trend data
        trend_data = [
            {
                "year": r.year,
                "incident_count": r.incident_count,
                "population": r.population,
                "per_capita_rate": float(r.per_capita_rate) if r.per_capita_rate else None,
                "yoy_change": float(r.yoy_change) if r.yoy_change else None
            }
            for r in records
        ]

        # Get most recent year demographics
        most_recent_year = records[-1].year

        demographics = {}
        for demo_type in ["by_race", "by_age", "by_sex"]:
            demo_query = select(CalculatedStatistic).where(
                and_(
                    CalculatedStatistic.year == most_recent_year,
                    CalculatedStatistic.crime_type == crime_type,
                    CalculatedStatistic.demographic_type == demo_type,
                    CalculatedStatistic.state == state
                )
            )

            demo_result = await db.execute(demo_query)
            demo_records = demo_result.scalars().all()

            demographics[demo_type] = [
                {
                    "value": r.demographic_value,
                    "incident_count": r.incident_count,
                    "population": r.population,
                    "per_capita_rate": float(r.per_capita_rate) if r.per_capita_rate else None
                }
                for r in demo_records
            ]

        return {
            "state": state,
            "crime_type": crime_type,
            "trend_data": trend_data,
            "most_recent_year": most_recent_year,
            "demographics": demographics
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating state profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
