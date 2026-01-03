#!/bin/bash
# Test runner script with various options

cd "$(dirname "$0")/.."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Let's Talk Statistics - Test Runner${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Parse command line arguments
TEST_TYPE=${1:-all}
COVERAGE=${2:-false}

case $TEST_TYPE in
    all)
        echo -e "${YELLOW}Running all tests...${NC}"
        if [ "$COVERAGE" == "coverage" ]; then
            pytest --cov=app --cov-report=html --cov-report=term-missing
        else
            pytest -v
        fi
        ;;

    unit)
        echo -e "${YELLOW}Running unit tests only...${NC}"
        pytest -m unit -v
        ;;

    integration)
        echo -e "${YELLOW}Running integration tests only...${NC}"
        pytest -m integration -v
        ;;

    e2e)
        echo -e "${YELLOW}Running end-to-end tests only...${NC}"
        pytest -m e2e -v
        ;;

    fast)
        echo -e "${YELLOW}Running fast tests (excluding slow)...${NC}"
        pytest -m "not slow" -v
        ;;

    coverage)
        echo -e "${YELLOW}Running all tests with coverage...${NC}"
        pytest --cov=app --cov-report=html --cov-report=term-missing
        echo ""
        echo -e "${GREEN}Coverage report generated in htmlcov/index.html${NC}"
        ;;

    failed)
        echo -e "${YELLOW}Re-running last failed tests...${NC}"
        pytest --lf -v
        ;;

    *)
        echo -e "${RED}Unknown test type: $TEST_TYPE${NC}"
        echo ""
        echo "Usage: ./run_tests.sh [all|unit|integration|e2e|fast|coverage|failed] [coverage]"
        echo ""
        echo "Examples:"
        echo "  ./run_tests.sh all                 # Run all tests"
        echo "  ./run_tests.sh all coverage        # Run all tests with coverage"
        echo "  ./run_tests.sh unit                # Run unit tests only"
        echo "  ./run_tests.sh integration         # Run integration tests only"
        echo "  ./run_tests.sh e2e                 # Run end-to-end tests only"
        echo "  ./run_tests.sh fast                # Run fast tests (exclude slow)"
        echo "  ./run_tests.sh coverage            # Run with coverage report"
        echo "  ./run_tests.sh failed              # Re-run last failed tests"
        exit 1
        ;;
esac

TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}✗ Some tests failed${NC}"
    echo -e "${RED}========================================${NC}"
fi

exit $TEST_EXIT_CODE
