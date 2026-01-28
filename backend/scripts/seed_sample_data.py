"""Seed sample crime statistics data for testing."""

import asyncio
import sys
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.config import get_settings
from app.models.crime_data import DataSource, CrimeStatistic, PopulationData, CalculatedStatistic
from app.database import Base

settings = get_settings()

# Sample data representing US crime statistics
SAMPLE_STATES = [
    ("California", 39538223),
    ("Texas", 29145505),
    ("Florida", 21538187),
    ("New York", 20201249),
    ("Pennsylvania", 13002700),
    ("Illinois", 12812508),
    ("Ohio", 11799448),
    ("Georgia", 10711908),
    ("North Carolina", 10439388),
    ("Michigan", 10077331),
]

SAMPLE_YEARS = [2020, 2021, 2022, 2023]


async def seed_data():
    """Seed sample data into the database."""
    print("\n" + "=" * 60)
    print("Seeding Sample Crime Statistics Data")
    print("=" * 60 + "\n")

    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        # Create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)
        print("Database tables created/verified")

    async with async_session() as session:
        try:
            records_created = 0

            for year in SAMPLE_YEARS:
                # Create data source record
                data_source = DataSource(
                    source_name="FBI_UCR_SAMPLE",
                    source_url="https://cde.ucr.cjis.gov",
                    data_type="murder_statistics",
                    year=year,
                    download_date=datetime.utcnow(),
                    file_path=None,
                    file_hash=None,
                    status="processed",
                    source_metadata={"type": "sample_data", "generated": datetime.utcnow().isoformat()}
                )
                session.add(data_source)
                await session.flush()

                print(f"\nYear {year}:")

                for state_name, population in SAMPLE_STATES:
                    # Generate realistic-looking murder counts
                    # National average is roughly 6 per 100k
                    base_rate = 5 + (hash(state_name) % 10)  # 5-14 per 100k
                    incident_count = int((population / 100000) * base_rate)

                    # Add some year-over-year variation
                    year_factor = 1 + ((year - 2020) * 0.02)  # slight increase each year
                    incident_count = int(incident_count * year_factor)

                    # Create crime statistic
                    crime_stat = CrimeStatistic(
                        source_id=data_source.id,
                        year=year,
                        crime_type="murder",
                        state=state_name,
                        jurisdiction=None,
                        age_group=None,
                        race=None,
                        sex=None,
                        incident_count=incident_count,
                        population=population,
                        additional_data=None
                    )
                    session.add(crime_stat)

                    # Create population data
                    pop_data = PopulationData(
                        year=year,
                        state=state_name,
                        age_group=None,
                        race=None,
                        sex=None,
                        population=population,
                        source="CENSUS_SAMPLE"
                    )
                    session.add(pop_data)

                    # Create calculated statistic
                    per_capita = round((incident_count / population) * 100000, 2)
                    calc_stat = CalculatedStatistic(
                        year=year,
                        crime_type="murder",
                        demographic_type="total",
                        demographic_value=None,
                        state=state_name,
                        incident_count=incident_count,
                        population=population,
                        per_capita_rate=per_capita,
                        yoy_change=None,
                        calculated_at=datetime.utcnow()
                    )
                    session.add(calc_stat)

                    records_created += 3
                    print(f"  {state_name}: {incident_count} incidents ({per_capita}/100k)")

                # Add national total
                total_incidents = sum(
                    int((pop / 100000) * (5 + (hash(state) % 10)) * (1 + ((year - 2020) * 0.02)))
                    for state, pop in SAMPLE_STATES
                )
                total_population = sum(pop for _, pop in SAMPLE_STATES)

                national_stat = CalculatedStatistic(
                    year=year,
                    crime_type="murder",
                    demographic_type="total",
                    demographic_value=None,
                    state=None,  # National level
                    incident_count=total_incidents,
                    population=total_population,
                    per_capita_rate=round((total_incidents / total_population) * 100000, 2),
                    yoy_change=None,
                    calculated_at=datetime.utcnow()
                )
                session.add(national_stat)
                records_created += 1

            await session.commit()

            print(f"\n{'=' * 60}")
            print(f"Successfully created {records_created} records")
            print(f"Years: {SAMPLE_YEARS}")
            print(f"States: {len(SAMPLE_STATES)}")
            print(f"{'=' * 60}\n")

        except Exception as e:
            await session.rollback()
            print(f"\nError: {str(e)}")
            raise
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_data())
