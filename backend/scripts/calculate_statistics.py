"""CLI script for calculating crime statistics."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.config import get_settings
from app.services.statistics_calculator import StatisticsCalculator, StatisticsCalculatorError
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


async def calculate_statistics(year: int, crime_type: str = "murder", states: list = None):
    """Calculate statistics for a specific year."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            calculator = StatisticsCalculator()

            print(f"\n{'='*60}")
            print(f"Calculating Statistics")
            print(f"{'='*60}\n")

            print(f"Year: {year}")
            print(f"Crime Type: {crime_type}")
            if states:
                print(f"States: {', '.join(states)}")
            else:
                print(f"States: All")

            # Check if already calculated
            exists = await calculator.check_calculated_statistics_exist(session, year, crime_type)

            if exists:
                print(f"\n⚠ Warning: Statistics for {crime_type} {year} already calculated")
                response = input("Do you want to recalculate? (y/n): ")
                if response.lower() == 'y':
                    print("\nRecalculating...")
                    result = await calculator.recalculate_all_for_year(year, crime_type, session)
                else:
                    print("Cancelled.")
                    return
            else:
                print("\nCalculating...")
                result = await calculator.calculate_statistics_for_year(year, crime_type, session, states)

            print(f"\n✓ Calculation complete!")
            print(f"\n{'='*60}")
            print(f"Results:")
            print(f"{'='*60}")
            print(f"Status: {result['status']}")
            print(f"Total records calculated: {result['total_records_calculated']}")
            print(f"\nBreakdowns:")
            for breakdown_type, count in result['breakdowns'].items():
                print(f"  • {breakdown_type}: {count} records")

            if 'records_deleted' in result:
                print(f"\nRecords deleted: {result['records_deleted']}")

        except StatisticsCalculatorError as e:
            print(f"\n✗ Error: {str(e)}")
            sys.exit(1)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            print(f"\n✗ Unexpected error: {str(e)}")
            sys.exit(1)
        finally:
            await engine.dispose()


async def check_statistics(year: int, crime_type: str = "murder"):
    """Check if statistics have been calculated."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            calculator = StatisticsCalculator()

            exists = await calculator.check_calculated_statistics_exist(
                db=session,
                year=year,
                crime_type=crime_type
            )

            print(f"\n{'='*60}")
            print(f"Calculated Statistics Check")
            print(f"{'='*60}\n")
            print(f"Year: {year}")
            print(f"Crime Type: {crime_type}")
            print(f"\nStatus: {'✓ Statistics calculated' if exists else '✗ No statistics found'}")
            print(f"{'='*60}")

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            print(f"\n✗ Error: {str(e)}")
            sys.exit(1)
        finally:
            await engine.dispose()


async def view_statistics(year: int, crime_type: str = "murder", demographic_type: str = None):
    """View calculated statistics."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            calculator = StatisticsCalculator()

            stats = await calculator.get_calculated_statistics(
                db=session,
                year=year,
                crime_type=crime_type,
                demographic_type=demographic_type
            )

            print(f"\n{'='*60}")
            print(f"Calculated Statistics")
            print(f"{'='*60}\n")
            print(f"Year: {year}")
            print(f"Crime Type: {crime_type}")
            if demographic_type:
                print(f"Demographic Type: {demographic_type}")

            if not stats:
                print(f"\n✗ No statistics found")
                return

            print(f"\nFound {len(stats)} statistics:\n")

            # Group by demographic type
            grouped = {}
            for stat in stats:
                demo_type = stat.demographic_type
                if demo_type not in grouped:
                    grouped[demo_type] = []
                grouped[demo_type].append(stat)

            for demo_type, demo_stats in grouped.items():
                print(f"\n{demo_type.upper()}")
                print("-" * 60)

                for stat in demo_stats[:10]:  # Show first 10
                    label = stat.demographic_value or stat.state or "Total"
                    incidents = f"{stat.incident_count:,}"
                    population = f"{stat.population:,}" if stat.population else "N/A"
                    rate = f"{float(stat.per_capita_rate):.2f}" if stat.per_capita_rate else "N/A"
                    yoy = f"{float(stat.yoy_change):+.2f}%" if stat.yoy_change else "N/A"

                    print(f"{label:<20} Incidents: {incidents:>10} | Pop: {population:>12} | Rate: {rate:>8} | YoY: {yoy:>8}")

                if len(demo_stats) > 10:
                    print(f"... and {len(demo_stats) - 10} more")

            print(f"\n{'='*60}")

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            print(f"\n✗ Error: {str(e)}")
            sys.exit(1)
        finally:
            await engine.dispose()


async def delete_statistics(year: int, crime_type: str = None):
    """Delete calculated statistics."""
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            calculator = StatisticsCalculator()

            print(f"\n{'='*60}")
            print(f"Delete Calculated Statistics")
            print(f"{'='*60}\n")
            print(f"Year: {year}")
            if crime_type:
                print(f"Crime Type: {crime_type}")
            else:
                print(f"Crime Type: All")

            response = input("\n⚠ Are you sure you want to delete these statistics? (y/n): ")
            if response.lower() != 'y':
                print("Cancelled.")
                return

            records_deleted = await calculator.delete_calculated_statistics(
                year=year,
                crime_type=crime_type,
                db=session
            )

            print(f"\n✓ Deleted {records_deleted} records")
            print(f"{'='*60}")

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            print(f"\n✗ Error: {str(e)}")
            sys.exit(1)
        finally:
            await engine.dispose()


def print_usage():
    """Print usage information."""
    print("""
Statistics Calculator CLI

Usage:
    python scripts/calculate_statistics.py calculate <YEAR> [--crime-type TYPE] [--states STATE1,STATE2,...]
        Calculate statistics for a year

    python scripts/calculate_statistics.py check <YEAR> [--crime-type TYPE]
        Check if statistics have been calculated

    python scripts/calculate_statistics.py view <YEAR> [--crime-type TYPE] [--demographic TYPE]
        View calculated statistics

    python scripts/calculate_statistics.py delete <YEAR> [--crime-type TYPE]
        Delete calculated statistics

    python scripts/calculate_statistics.py --help
        Show this help message

Options:
    --crime-type TYPE       Type of crime (default: murder)
    --states STATE1,STATE2  Comma-separated list of states
    --demographic TYPE      Demographic type filter (total, by_race, by_age, by_sex, by_state)

Examples:
    # Calculate all statistics for 2022
    python scripts/calculate_statistics.py calculate 2022

    # Calculate with specific crime type
    python scripts/calculate_statistics.py calculate 2022 --crime-type murder

    # Calculate for specific states
    python scripts/calculate_statistics.py calculate 2022 --states California,Texas,Florida

    # Check if calculated
    python scripts/calculate_statistics.py check 2022

    # View statistics
    python scripts/calculate_statistics.py view 2022

    # View by demographic
    python scripts/calculate_statistics.py view 2022 --demographic by_race

    # Delete statistics
    python scripts/calculate_statistics.py delete 2022
    """)


def main():
    """Main CLI entry point."""
    if len(sys.argv) < 2 or sys.argv[1] in ["--help", "-h", "help"]:
        print_usage()
        sys.exit(0)

    command = sys.argv[1]

    if command == "calculate":
        if len(sys.argv) < 3:
            print("Error: Year required")
            print("Usage: python scripts/calculate_statistics.py calculate <YEAR>")
            sys.exit(1)

        try:
            year = int(sys.argv[2])
            crime_type = "murder"
            states = None

            # Parse options
            if "--crime-type" in sys.argv:
                idx = sys.argv.index("--crime-type")
                if idx + 1 < len(sys.argv):
                    crime_type = sys.argv[idx + 1]

            if "--states" in sys.argv:
                idx = sys.argv.index("--states")
                if idx + 1 < len(sys.argv):
                    states = [s.strip() for s in sys.argv[idx + 1].split(",")]

            asyncio.run(calculate_statistics(year, crime_type, states))
        except ValueError:
            print(f"Error: Invalid year '{sys.argv[2]}'")
            sys.exit(1)

    elif command == "check":
        if len(sys.argv) < 3:
            print("Error: Year required")
            print("Usage: python scripts/calculate_statistics.py check <YEAR>")
            sys.exit(1)

        try:
            year = int(sys.argv[2])
            crime_type = "murder"

            if "--crime-type" in sys.argv:
                idx = sys.argv.index("--crime-type")
                if idx + 1 < len(sys.argv):
                    crime_type = sys.argv[idx + 1]

            asyncio.run(check_statistics(year, crime_type))
        except ValueError:
            print(f"Error: Invalid year '{sys.argv[2]}'")
            sys.exit(1)

    elif command == "view":
        if len(sys.argv) < 3:
            print("Error: Year required")
            print("Usage: python scripts/calculate_statistics.py view <YEAR>")
            sys.exit(1)

        try:
            year = int(sys.argv[2])
            crime_type = "murder"
            demographic_type = None

            if "--crime-type" in sys.argv:
                idx = sys.argv.index("--crime-type")
                if idx + 1 < len(sys.argv):
                    crime_type = sys.argv[idx + 1]

            if "--demographic" in sys.argv:
                idx = sys.argv.index("--demographic")
                if idx + 1 < len(sys.argv):
                    demographic_type = sys.argv[idx + 1]

            asyncio.run(view_statistics(year, crime_type, demographic_type))
        except ValueError:
            print(f"Error: Invalid year '{sys.argv[2]}'")
            sys.exit(1)

    elif command == "delete":
        if len(sys.argv) < 3:
            print("Error: Year required")
            print("Usage: python scripts/calculate_statistics.py delete <YEAR>")
            sys.exit(1)

        try:
            year = int(sys.argv[2])
            crime_type = None

            if "--crime-type" in sys.argv:
                idx = sys.argv.index("--crime-type")
                if idx + 1 < len(sys.argv):
                    crime_type = sys.argv[idx + 1]

            asyncio.run(delete_statistics(year, crime_type))
        except ValueError:
            print(f"Error: Invalid year '{sys.argv[2]}'")
            sys.exit(1)

    else:
        print(f"Error: Unknown command '{command}'")
        print_usage()
        sys.exit(1)


if __name__ == "__main__":
    main()
