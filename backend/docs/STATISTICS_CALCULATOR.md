# Statistics Calculator Documentation

## Overview

The Statistics Calculator is the analytical engine of the crime statistics platform. It calculates per capita rates, year-over-year trends, and pre-computes statistics for fast querying.

## Features

- **Per Capita Calculations**: Crime rates per 100,000 population
- **Year-over-Year Trends**: Percentage changes between years
- **Demographic Breakdowns**: Statistics by race, age, sex, and state
- **Pre-Calculation**: Stores computed statistics for performance
- **Automatic Population Matching**: Integrates crime and population data
- **Edge Case Handling**: Missing population, zero values, etc.

## Statistics Types

### 1. Total Statistics
Overall crime statistics for a year:
- Total incidents across all demographics
- Total population
- Overall per capita rate

### 2. By Race
Statistics broken down by racial categories:
- White
- Black or African American
- Hispanic or Latino
- Asian
- American Indian or Alaska Native
- Native Hawaiian or Other Pacific Islander
- Two or More Races

### 3. By Age Group
Statistics by age ranges:
- 0-17 (Juveniles)
- 18-24 (Young adults)
- 25-34
- 35-44
- 45-54
- 55-64
- 65+ (Seniors)

### 4. By Sex
Statistics by gender:
- Male
- Female

### 5. By State
State-level statistics:
- All 50 states + DC
- Per capita rates by state
- State-specific trends

## Calculations

### Per Capita Rate Formula

```
Per Capita Rate = (Incident Count / Population) × 100,000
```

**Example:**
- Incidents: 1,000 murders
- Population: 10,000,000
- Per Capita Rate: (1,000 / 10,000,000) × 100,000 = 10.0 per 100,000

### Year-over-Year Change Formula

```
YoY Change = ((Current Year - Previous Year) / Previous Year) × 100
```

**Example:**
- 2022 Rate: 10.5 per 100,000
- 2021 Rate: 10.0 per 100,000
- YoY Change: ((10.5 - 10.0) / 10.0) × 100 = +5.0%

## Usage

### API Endpoints

#### 1. Calculate Statistics

```bash
POST /api/v1/admin/statistics/calculate/{year}?crime_type=murder
```

Example:
```bash
# Calculate all statistics for 2022
curl -X POST "http://localhost:8000/api/v1/admin/statistics/calculate/2022?crime_type=murder"

# Calculate for specific states
curl -X POST "http://localhost:8000/api/v1/admin/statistics/calculate/2022?crime_type=murder&states=California&states=Texas"
```

Response:
```json
{
  "status": "calculation_started",
  "message": "Statistics calculation started for murder 2022",
  "year": 2022,
  "crime_type": "murder"
}
```

#### 2. Recalculate Statistics

```bash
POST /api/v1/admin/statistics/recalculate/{year}?crime_type=murder
```

Example:
```bash
curl -X POST "http://localhost:8000/api/v1/admin/statistics/recalculate/2022?crime_type=murder"
```

Response:
```json
{
  "status": "recalculation_started",
  "message": "Statistics recalculation started for murder 2022",
  "year": 2022,
  "crime_type": "murder"
}
```

#### 3. Check if Calculated

```bash
GET /api/v1/admin/statistics/check/{year}?crime_type=murder
```

Example:
```bash
curl "http://localhost:8000/api/v1/admin/statistics/check/2022?crime_type=murder"
```

Response:
```json
{
  "year": 2022,
  "crime_type": "murder",
  "exists": true,
  "message": "Statistics calculated"
}
```

#### 4. Delete Calculated Statistics

```bash
DELETE /api/v1/admin/statistics/{year}?crime_type=murder
```

Example:
```bash
# Delete all crime types for a year
curl -X DELETE "http://localhost:8000/api/v1/admin/statistics/2022"

# Delete specific crime type
curl -X DELETE "http://localhost:8000/api/v1/admin/statistics/2022?crime_type=murder"
```

### CLI Tool

#### Calculate Statistics

```bash
cd backend

# Calculate for 2022
python scripts/calculate_statistics.py calculate 2022

# Specific crime type
python scripts/calculate_statistics.py calculate 2022 --crime-type murder

# Specific states
python scripts/calculate_statistics.py calculate 2022 --states California,Texas,Florida
```

Example output:
```
============================================================
Calculating Statistics
============================================================

Year: 2022
Crime Type: murder
States: All

Calculating...

✓ Calculation complete!

============================================================
Results:
============================================================
Status: success
Total records calculated: 157

Breakdowns:
  • total: 1 records
  • by_race: 7 records
  • by_age: 7 records
  • by_sex: 2 records
  • by_state: 51 records
```

#### Check if Calculated

```bash
python scripts/calculate_statistics.py check 2022

# Specific crime type
python scripts/calculate_statistics.py check 2022 --crime-type murder
```

#### View Statistics

```bash
# View all statistics
python scripts/calculate_statistics.py view 2022

# View by demographic type
python scripts/calculate_statistics.py view 2022 --demographic by_race

# View specific crime type
python scripts/calculate_statistics.py view 2022 --crime-type murder --demographic by_state
```

Example output:
```
============================================================
Calculated Statistics
============================================================

Year: 2022
Crime Type: murder

Found 68 statistics:

TOTAL
------------------------------------------------------------
Total                Incidents:      1,000 | Pop:   39,500,000 | Rate:     2.53 | YoY:   +5.2%

BY_RACE
------------------------------------------------------------
White                Incidents:        600 | Pop:   23,700,000 | Rate:     2.53 | YoY:   +3.1%
Black or African ... Incidents:        250 | Pop:    5,135,000 | Rate:     4.87 | YoY:   +8.5%
Hispanic or Latino   Incidents:        100 | Pop:    7,110,000 | Rate:     1.41 | YoY:   +2.3%
... and 4 more

BY_STATE
------------------------------------------------------------
California           Incidents:        150 | Pop:   39,500,000 | Rate:     0.38 | YoY:   +1.2%
Texas                Incidents:        120 | Pop:   29,000,000 | Rate:     0.41 | YoY:   -2.5%
... and 49 more
```

#### Delete Statistics

```bash
# Delete all for a year
python scripts/calculate_statistics.py delete 2022

# Delete specific crime type
python scripts/calculate_statistics.py delete 2022 --crime-type murder
```

### Programmatic Usage

```python
from app.services.statistics_calculator import StatisticsCalculator
from app.database import AsyncSessionLocal

async def calculate_stats():
    async with AsyncSessionLocal() as db:
        calculator = StatisticsCalculator()

        # Calculate all statistics
        result = await calculator.calculate_statistics_for_year(
            year=2022,
            crime_type="murder",
            db=db
        )

        print(f"Calculated {result['total_records_calculated']} statistics")

        # Get calculated statistics
        stats = await calculator.get_calculated_statistics(
            db=db,
            year=2022,
            crime_type="murder",
            demographic_type="by_race"
        )

        for stat in stats:
            print(f"{stat.demographic_value}: {stat.per_capita_rate} per 100k")
```

## Workflow

### Complete Statistics Pipeline

1. **Ensure data is loaded:**
```bash
# Download crime data
curl -X POST "http://localhost:8000/api/v1/admin/download/from-url" ...

# Process CSV
curl -X POST "http://localhost:8000/api/v1/admin/process/1"

# Fetch population data
curl -X POST "http://localhost:8000/api/v1/admin/population/fetch/2022"
```

2. **Calculate statistics:**
```bash
curl -X POST "http://localhost:8000/api/v1/admin/statistics/calculate/2022?crime_type=murder"
```

3. **Query pre-calculated data:**
```bash
# Now queries are fast!
curl "http://localhost:8000/api/v1/statistics/per-capita?crime_type=murder&year=2022&demographic_type=by_race"
```

## Database Storage

### calculated_statistics Table

Pre-calculated statistics are stored in the `calculated_statistics` table:

```sql
SELECT
    demographic_type,
    demographic_value,
    incident_count,
    population,
    per_capita_rate,
    yoy_change
FROM calculated_statistics
WHERE year = 2022 AND crime_type = 'murder'
ORDER BY demographic_type, demographic_value;
```

Example records:
```
| demographic_type | demographic_value | incidents | population | per_capita | yoy_change |
|-----------------|-------------------|-----------|------------|------------|------------|
| total           | NULL              | 1000      | 39500000   | 2.53       | +5.2       |
| by_race         | White             | 600       | 23700000   | 2.53       | +3.1       |
| by_race         | Black...          | 250       | 5135000    | 4.87       | +8.5       |
| by_age          | 18-24             | 300       | 3555000    | 8.44       | +10.2      |
| by_state        | California        | 150       | 39500000   | 0.38       | +1.2       |
```

## Performance

### Calculation Performance

| Data Volume | Calculation Time | Records Created |
|-------------|-----------------|-----------------|
| 1 state, 1 year | ~2 seconds | ~68 records |
| 10 states, 1 year | ~10 seconds | ~200 records |
| All states, 1 year | ~30 seconds | ~500 records |

### Query Performance

Pre-calculated statistics enable fast queries:
- Without pre-calculation: 500-1000ms (aggregate on-the-fly)
- With pre-calculation: 10-50ms (direct table lookup)

**50-100x performance improvement!**

## Edge Cases

### 1. Missing Population Data

**Issue**: No population data for specific demographics

**Handling**:
- Per capita rate set to `NULL`
- Incident count still recorded
- Log warning

**Example**:
```json
{
  "demographic_value": "Unknown Race",
  "incident_count": 50,
  "population": null,
  "per_capita_rate": null
}
```

### 2. Zero Population

**Issue**: Population is 0 (data error or very specific demographic)

**Handling**:
- Per capita rate set to `NULL`
- Avoid division by zero

### 3. Missing Previous Year Data

**Issue**: Cannot calculate YoY change without previous year

**Handling**:
- YoY change set to `NULL`
- Calculated in subsequent years

### 4. No Crime Data

**Issue**: No crime incidents for a demographic

**Handling**:
- Record not created (0 incidents = no statistic)
- Or create with 0 incidents if population exists

## Best Practices

### 1. Calculate After Data Loading

Always calculate statistics after:
1. Processing crime CSV files
2. Fetching population data

```bash
# Load crime data
curl -X POST ".../process/1"

# Load population
curl -X POST ".../population/fetch/2022"

# Calculate statistics
curl -X POST ".../statistics/calculate/2022"
```

### 2. Recalculate on Data Updates

If you reprocess crime data or update population:

```bash
curl -X POST ".../statistics/recalculate/2022"
```

### 3. Calculate Multiple Years

For trend analysis, calculate multiple consecutive years:

```bash
for year in 2018 2019 2020 2021 2022; do
    curl -X POST ".../statistics/calculate/$year"
done
```

### 4. Monitor Calculation Status

Check if statistics exist before calculating:

```bash
curl ".../statistics/check/2022"
```

### 5. Use Background Tasks

For large datasets, calculations run in background:
- API returns immediately
- Check logs for completion
- Query calculated_statistics table to verify

## Troubleshooting

### Issue: "No population data found"

**Cause**: Population data not loaded for that year

**Solution**:
```bash
# Fetch population first
curl -X POST ".../population/fetch/2022"

# Then calculate statistics
curl -X POST ".../statistics/calculate/2022"
```

### Issue: Per Capita Rates are NULL

**Cause**: Missing or zero population for demographics

**Solutions**:
1. Check population data exists
2. Verify demographic values match between crime and population
3. Accept NULL for demographics without population data

### Issue: YoY Changes are NULL

**Cause**: Previous year statistics don't exist

**Solution**:
```bash
# Calculate previous year first
curl -X POST ".../statistics/calculate/2021"

# Then current year (YoY will be calculated)
curl -X POST ".../statistics/calculate/2022"
```

### Issue: Calculation Takes Too Long

**Cause**: Large dataset

**Solutions**:
- Use background tasks (automatic via API)
- Calculate by states (split the work)
- Monitor with CLI tool for progress

## Future Enhancements

- [ ] Multi-year batch calculation
- [ ] Confidence intervals for rates
- [ ] Statistical significance testing
- [ ] Demographic intersection analysis (e.g., White males 18-24)
- [ ] Geographic clustering analysis
- [ ] Time series forecasting
- [ ] Comparative statistics (state vs national)

## Related Documentation

- [Population Service](POPULATION_SERVICE.md) - Population data management
- [CSV Processor](CSV_PROCESSOR.md) - Crime data processing
- [API Endpoints](../README.md) - All API endpoints
