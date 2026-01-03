"""CLI script for managing population data."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.config import get_settings
from app.services.population_service import PopulationService, PopulationServiceError
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


async def fetch_population(year: int, states: list = None):
    """Fetch population data for a specific year."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            population_service = PopulationService()

            print(f"\n{'='*60}")
            print(f"Fetching Population Data for {year}")
            print(f"{'='*60}\n")

            if states:
                print(f"States: {', '.join(states)}")
            else:
                print(f"States: All ({len(population_service.get_available_states())} states)")

            print("\nNote: Currently using simulated data for development")
            print("      Census API integration pending\n")

            # Check if data exists
            has_data = await population_service.check_population_data_exists(session, year)

            if has_data and not states:
                print(f"⚠ Warning: Population data for {year} already exists")
                response = input("Do you want to continue and add more data? (y/n): ")
                if response.lower() != 'y':
                    print("Cancelled.")
                    return

            # Fetch data
            print(f"Fetching data...\n")
            result = await population_service.fetch_population_for_year(
                year=year,
                db=session,
                states=states
            )

            print(f"✓ Fetch complete!")
            print(f"\n{'='*60}")
            print(f"Results:")
            print(f"{'='*60}")
            print(f"Status: {result['status']}")
            print(f"Year: {result['year']}")
            print(f"States processed: {result['states_processed']}")
            print(f"Total records: {result['total_records']}")

            if result['errors']:
                print(f"\nErrors ({len(result['errors'])}):")
                for error in result['errors'][:5]:
                    print(f"  • {error}")
                if len(result['errors']) > 5:
                    print(f"  ... and {len(result['errors']) - 5} more")

        except PopulationServiceError as e:
            print(f"\n✗ Error: {str(e)}")
            sys.exit(1)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            print(f"\n✗ Unexpected error: {str(e)}")
            sys.exit(1)
        finally:
            await engine.dispose()


async def lookup_population(year: int, state: str = None, race: str = None,
                           age_group: str = None, sex: str = None):
    """Lookup population for specific criteria."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            population_service = PopulationService()

            print(f"\n{'='*60}")
            print(f"Population Lookup")
            print(f"{'='*60}\n")

            print(f"Year: {year}")
            if state:
                print(f"State: {state}")
            if race:
                print(f"Race: {race}")
            if age_group:
                print(f"Age Group: {age_group}")
            if sex:
                print(f"Sex: {sex}")

            population = await population_service.get_population(
                db=session,
                year=year,
                state=state,
                race=race,
                age_group=age_group,
                sex=sex
            )

            print(f"\n{'='*60}")
            if population is None:
                print("✗ No population data found")
            else:
                print(f"✓ Population: {population:,}")
            print(f"{'='*60}")

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            print(f"\n✗ Error: {str(e)}")
            sys.exit(1)
        finally:
            await engine.dispose()


async def check_data(year: int, state: str = None):
    """Check if population data exists."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            population_service = PopulationService()

            exists = await population_service.check_population_data_exists(
                db=session,
                year=year,
                state=state
            )

            print(f"\n{'='*60}")
            print(f"Population Data Check")
            print(f"{'='*60}\n")
            print(f"Year: {year}")
            if state:
                print(f"State: {state}")
            print(f"\nStatus: {'✓ Data exists' if exists else '✗ No data found'}")
            print(f"{'='*60}")

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            print(f"\n✗ Error: {str(e)}")
            sys.exit(1)
        finally:
            await engine.dispose()


async def delete_data(year: int, state: str = None):
    """Delete population data."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            population_service = PopulationService()

            print(f"\n{'='*60}")
            print(f"Delete Population Data")
            print(f"{'='*60}\n")
            print(f"Year: {year}")
            if state:
                print(f"State: {state}")
            else:
                print(f"State: All states")

            response = input("\n⚠ Are you sure you want to delete this data? (y/n): ")
            if response.lower() != 'y':
                print("Cancelled.")
                return

            records_deleted = await population_service.delete_population_data(
                db=session,
                year=year,
                state=state
            )

            print(f"\n✓ Deleted {records_deleted} records")
            print(f"{'='*60}")

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            print(f"\n✗ Error: {str(e)}")
            sys.exit(1)
        finally:
            await engine.dispose()


async def list_states():
    """List available states."""
    population_service = PopulationService()
    states = population_service.get_available_states()

    print(f"\n{'='*60}")
    print(f"Available States ({len(states)})")
    print(f"{'='*60}\n")

    for i, state in enumerate(states, 1):
        fips = population_service.get_state_fips_code(state)
        print(f"{i:2}. {state:<25} (FIPS: {fips})")

    print(f"\nTotal: {len(states)} states + DC")


def print_usage():
    """Print usage information."""
    print("""
Population Data Management CLI

Usage:
    python scripts/manage_population.py fetch <YEAR> [--states STATE1,STATE2,...]
        Fetch population data for a year

    python scripts/manage_population.py lookup <YEAR> [--state STATE] [--race RACE] [--age AGE] [--sex SEX]
        Lookup population for specific criteria

    python scripts/manage_population.py check <YEAR> [--state STATE]
        Check if population data exists

    python scripts/manage_population.py delete <YEAR> [--state STATE]
        Delete population data

    python scripts/manage_population.py list-states
        List all available states

    python scripts/manage_population.py --help
        Show this help message

Examples:
    # Fetch all states for 2022
    python scripts/manage_population.py fetch 2022

    # Fetch specific states
    python scripts/manage_population.py fetch 2022 --states California,Texas,Florida

    # Lookup population
    python scripts/manage_population.py lookup 2022 --state California --race White

    # Check if data exists
    python scripts/manage_population.py check 2022

    # Delete data
    python scripts/manage_population.py delete 2022 --state California

    # List states
    python scripts/manage_population.py list-states
    """)


def main():
    """Main CLI entry point."""
    if len(sys.argv) < 2 or sys.argv[1] in ["--help", "-h", "help"]:
        print_usage()
        sys.exit(0)

    command = sys.argv[1]

    if command == "fetch":
        if len(sys.argv) < 3:
            print("Error: Year required")
            print("Usage: python scripts/manage_population.py fetch <YEAR>")
            sys.exit(1)

        try:
            year = int(sys.argv[2])
            states = None

            # Check for --states option
            if "--states" in sys.argv:
                idx = sys.argv.index("--states")
                if idx + 1 < len(sys.argv):
                    states = [s.strip() for s in sys.argv[idx + 1].split(",")]

            asyncio.run(fetch_population(year, states))
        except ValueError:
            print(f"Error: Invalid year '{sys.argv[2]}'")
            sys.exit(1)

    elif command == "lookup":
        if len(sys.argv) < 3:
            print("Error: Year required")
            print("Usage: python scripts/manage_population.py lookup <YEAR>")
            sys.exit(1)

        try:
            year = int(sys.argv[2])
            state = None
            race = None
            age_group = None
            sex = None

            # Parse options
            if "--state" in sys.argv:
                idx = sys.argv.index("--state")
                if idx + 1 < len(sys.argv):
                    state = sys.argv[idx + 1]

            if "--race" in sys.argv:
                idx = sys.argv.index("--race")
                if idx + 1 < len(sys.argv):
                    race = sys.argv[idx + 1]

            if "--age" in sys.argv:
                idx = sys.argv.index("--age")
                if idx + 1 < len(sys.argv):
                    age_group = sys.argv[idx + 1]

            if "--sex" in sys.argv:
                idx = sys.argv.index("--sex")
                if idx + 1 < len(sys.argv):
                    sex = sys.argv[idx + 1]

            asyncio.run(lookup_population(year, state, race, age_group, sex))
        except ValueError:
            print(f"Error: Invalid year '{sys.argv[2]}'")
            sys.exit(1)

    elif command == "check":
        if len(sys.argv) < 3:
            print("Error: Year required")
            print("Usage: python scripts/manage_population.py check <YEAR>")
            sys.exit(1)

        try:
            year = int(sys.argv[2])
            state = None

            if "--state" in sys.argv:
                idx = sys.argv.index("--state")
                if idx + 1 < len(sys.argv):
                    state = sys.argv[idx + 1]

            asyncio.run(check_data(year, state))
        except ValueError:
            print(f"Error: Invalid year '{sys.argv[2]}'")
            sys.exit(1)

    elif command == "delete":
        if len(sys.argv) < 3:
            print("Error: Year required")
            print("Usage: python scripts/manage_population.py delete <YEAR>")
            sys.exit(1)

        try:
            year = int(sys.argv[2])
            state = None

            if "--state" in sys.argv:
                idx = sys.argv.index("--state")
                if idx + 1 < len(sys.argv):
                    state = sys.argv[idx + 1]

            asyncio.run(delete_data(year, state))
        except ValueError:
            print(f"Error: Invalid year '{sys.argv[2]}'")
            sys.exit(1)

    elif command == "list-states":
        asyncio.run(list_states())

    else:
        print(f"Error: Unknown command '{command}'")
        print_usage()
        sys.exit(1)


if __name__ == "__main__":
    main()
