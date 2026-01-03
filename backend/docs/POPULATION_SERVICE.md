# Population Service Documentation

## Overview

The Population Service manages population data integration from the US Census Bureau. It provides demographic population breakdowns essential for calculating per capita crime rates.

## Features

- **Demographic Breakdowns**: Population by state, race, age group, and sex
- **Census Integration**: Designed for US Census Bureau API (currently using simulated data)
- **Smart Storage**: Prevents duplicate records with unique constraints
- **Flexible Lookup**: Query population by any combination of demographics
- **51 Jurisdictions**: All 50 states + District of Columbia
- **FIPS Code Support**: State FIPS code mapping for Census API

## Data Structure

### Population Demographics

Population data is stored with the following dimensions:

| Dimension | Values |
|-----------|--------|
| **Year** | 1900-2100 (validated) |
| **State** | 50 states + DC |
| **Race** | White, Black or African American, Asian, Hispanic or Latino, etc. |
| **Age Group** | 0-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+ |
| **Sex** | Male, Female |

### Race Categories

Standardized race categories matching FBI UCR:

1. White
2. Black or African American
3. American Indian or Alaska Native
4. Asian
5. Native Hawaiian or Other Pacific Islander
6. Two or More Races
7. Hispanic or Latino

### Age Groups

| Group | Ages |
|-------|------|
| 0-17 | Under 18 years |
| 18-24 | Young adults |
| 25-34 | Adults |
| 35-44 | Middle age |
| 45-54 | Middle age |
| 55-64 | Older adults |
| 65+ | Seniors |

## Usage

### API Endpoints

#### 1. Fetch Population Data

```bash
POST /api/v1/admin/population/fetch/{year}?states=California,Texas
```

Example:
```bash
# Fetch all states
curl -X POST "http://localhost:8000/api/v1/admin/population/fetch/2022"

# Fetch specific states
curl -X POST "http://localhost:8000/api/v1/admin/population/fetch/2022?states=California&states=Texas&states=Florida"
```

Response:
```json
{
  "status": "fetch_started",
  "message": "Population data fetch started for year 2022",
  "year": 2022,
  "states": ["California", "Texas", "Florida"]
}
```

#### 2. Lookup Population

```bash
GET /api/v1/admin/population/lookup?year=2022&state=California&race=White&age_group=25-34&sex=Male
```

Example:
```bash
curl "http://localhost:8000/api/v1/admin/population/lookup?year=2022&state=California&race=White"
```

Response:
```json
{
  "year": 2022,
  "filters": {
    "state": "California",
    "race": "White",
    "age_group": null,
    "sex": null
  },
  "population": 14850000
}
```

#### 3. Check Data Exists

```bash
GET /api/v1/admin/population/check/{year}?state=California
```

Example:
```bash
curl "http://localhost:8000/api/v1/admin/population/check/2022"
```

Response:
```json
{
  "year": 2022,
  "state": null,
  "exists": true,
  "message": "Data exists"
}
```

#### 4. Delete Population Data

```bash
DELETE /api/v1/admin/population/{year}?state=California
```

Example:
```bash
# Delete all data for a year
curl -X DELETE "http://localhost:8000/api/v1/admin/population/2022"

# Delete specific state
curl -X DELETE "http://localhost:8000/api/v1/admin/population/2022?state=California"
```

Response:
```json
{
  "status": "success",
  "year": 2022,
  "state": "California",
  "records_deleted": 196
}
```

#### 5. Get Available States

```bash
GET /api/v1/admin/population/states
```

Example:
```bash
curl "http://localhost:8000/api/v1/admin/population/states"
```

Response:
```json
{
  "states": ["Alabama", "Alaska", ..., "Wyoming", "District of Columbia"],
  "count": 51
}
```

### CLI Tool

#### Fetch Population Data

```bash
cd backend

# Fetch all states for 2022
python scripts/manage_population.py fetch 2022

# Fetch specific states
python scripts/manage_population.py fetch 2022 --states California,Texas,Florida
```

Example output:
```
============================================================
Fetching Population Data for 2022
============================================================

States: California, Texas, Florida

Note: Currently using simulated data for development
      Census API integration pending

Fetching data...

✓ Fetch complete!

============================================================
Results:
============================================================
Status: success
Year: 2022
States processed: 3
Total records: 588
```

#### Lookup Population

```bash
# Total population for California in 2022
python scripts/manage_population.py lookup 2022 --state California

# Specific demographic
python scripts/manage_population.py lookup 2022 --state California --race White --age 25-34 --sex Male
```

#### Check Data

```bash
# Check if 2022 data exists
python scripts/manage_population.py check 2022

# Check specific state
python scripts/manage_population.py check 2022 --state California
```

#### Delete Data

```bash
# Delete all 2022 data
python scripts/manage_population.py delete 2022

# Delete specific state
python scripts/manage_population.py delete 2022 --state California
```

#### List States

```bash
python scripts/manage_population.py list-states
```

Example output:
```
============================================================
Available States (51)
============================================================

 1. Alabama                   (FIPS: 01)
 2. Alaska                    (FIPS: 02)
 3. Arizona                   (FIPS: 04)
...
51. District of Columbia      (FIPS: 11)

Total: 51 states + DC
```

### Programmatic Usage

```python
from app.services.population_service import PopulationService
from app.database import AsyncSessionLocal

async def get_population_data():
    async with AsyncSessionLocal() as db:
        service = PopulationService()

        # Fetch population data
        result = await service.fetch_population_for_year(
            year=2022,
            db=db,
            states=["California", "Texas"]
        )

        print(f"Fetched {result['total_records']} records")

        # Lookup specific population
        pop = await service.get_population(
            db=db,
            year=2022,
            state="California",
            race="White",
            age_group="25-34"
        )

        print(f"Population: {pop:,}")
```

## Current Implementation (Simulated Data)

### Why Simulated Data?

The current implementation uses **simulated population data** for development and testing purposes. This allows:

1. **Immediate functionality**: Test the system without Census API setup
2. **Realistic structure**: Data follows actual Census Bureau format
3. **Full demographic breakdowns**: All race, age, sex combinations
4. **Easy transition**: Simple to swap for real Census API calls

### Simulated Data Characteristics

- **Realistic totals**: Based on approximate 2020 state populations
- **Demographic distributions**: Approximate US demographic percentages
- **Complete coverage**: All states, all demographics
- **Marked as simulated**: Source field = "US_CENSUS_SIMULATED"

### Example Simulated Data

For **California, 2022**:
- Total population: ~39.5 million
- Broken down by:
  - 7 race categories
  - 7 age groups
  - 2 sexes
  - = 98 records per state

**Sample record:**
```json
{
  "year": 2022,
  "state": "California",
  "race": "White",
  "age_group": "25-34",
  "sex": "Male",
  "population": 1_482_000,
  "source": "US_CENSUS_SIMULATED"
}
```

## Census Bureau API Integration (Future)

### Census API Overview

**API Endpoint**: `https://api.census.gov/data/{year}/pep/population`

**Authentication**: API key (free from census.gov/developers)

**Available Data**:
- Population Estimates Program (PEP)
- American Community Survey (ACS)
- Decennial Census

### Integration Steps

1. **Get API Key**
```bash
# Register at: https://api.census.gov/data/key_signup.html
# Add to .env:
CENSUS_API_KEY=your_api_key_here
```

2. **Update Service**

In `population_service.py`, replace `_fetch_state_population`:

```python
async def _fetch_state_population(self, year: int, state: str):
    """Fetch from actual Census API."""
    fips_code = self.STATE_FIPS[state]

    # Example Census API call
    url = f"{self.CENSUS_API_BASE}/{year}/pep/population"
    params = {
        "get": "POP,RACE,SEX,AGE",
        "for": f"state:{fips_code}",
        "key": self.api_key
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    # Parse and return data
    return self._parse_census_response(data)
```

3. **Test Integration**
```bash
python scripts/manage_population.py fetch 2022 --states California
```

### Census API Resources

- **Documentation**: https://www.census.gov/data/developers/data-sets/popest-popproj/popest.html
- **API Discovery**: https://api.census.gov/data.html
- **Examples**: https://www.census.gov/data/developers/guidance/api-user-guide.html
- **Variables**: https://api.census.gov/data/{year}/pep/population/variables.html

## Database Schema

### Population Data Table

```sql
CREATE TABLE population_data (
    id BIGSERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    state VARCHAR(50),
    age_group VARCHAR(20),
    race VARCHAR(50),
    sex VARCHAR(10),
    population BIGINT NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP NOT NULL,
    UNIQUE (year, state, age_group, race, sex)
);
```

### Unique Constraint

Prevents duplicate records for the same demographic combination:
- One population count per (year, state, race, age_group, sex) combination
- Updates existing record if re-fetched

## Use Cases

### 1. Calculate Per Capita Crime Rate

```python
# Get crime count
crime_count = 1000  # murders in California 2022

# Get population
population = await service.get_population(
    db=db,
    year=2022,
    state="California"
)

# Calculate per capita rate (per 100,000)
per_capita = (crime_count / population) * 100_000
print(f"Per capita rate: {per_capita:.2f} per 100,000")
```

### 2. Demographic-Specific Rates

```python
# White males age 25-34 in California
crime_count = 50
population = await service.get_population(
    db=db,
    year=2022,
    state="California",
    race="White",
    age_group="25-34",
    sex="Male"
)

per_capita = (crime_count / population) * 100_000
```

### 3. Multi-State Aggregation

```python
# Total population for multiple states
total_pop = 0
for state in ["California", "Texas", "Florida"]:
    pop = await service.get_population(
        db=db,
        year=2022,
        state=state
    )
    total_pop += pop

print(f"Combined population: {total_pop:,}")
```

## Best Practices

1. **Fetch Once Per Year**
   - Population data changes slowly
   - Fetch once and reuse throughout year
   - Update when Census releases new estimates

2. **Check Before Fetching**
```bash
# Check if data exists
python scripts/manage_population.py check 2022

# If not, fetch
python scripts/manage_population.py fetch 2022
```

3. **Use Background Tasks**
```python
# API endpoint automatically uses background tasks
# Fetching 51 states takes ~30 seconds
```

4. **Match Demographics to Crime Data**
```python
# Ensure race, age_group, sex match between:
# - crime_statistics table
# - population_data table
```

5. **Handle Missing Data Gracefully**
```python
population = await service.get_population(...)
if population is None:
    # No matching population data
    # Cannot calculate per capita rate
    per_capita_rate = None
else:
    per_capita_rate = (count / population) * 100_000
```

## Performance

### Fetch Performance

| States | Records | Time (simulated) | Time (Census API) |
|--------|---------|-----------------|------------------|
| 1 state | ~200 | 1 second | 2-3 seconds |
| 10 states | ~2,000 | 5 seconds | 20-30 seconds |
| All 51 | ~10,000 | 30 seconds | 2-3 minutes |

### Lookup Performance

- Single lookup: <10ms
- Aggregated lookup (all states): <100ms
- Database indexes on (year, state, race, age_group, sex)

## Troubleshooting

### Issue: Duplicate Key Error

**Cause**: Trying to insert data that already exists

**Solution**:
```bash
# Check existing data
python scripts/manage_population.py check 2022

# Delete if needed
python scripts/manage_population.py delete 2022

# Re-fetch
python scripts/manage_population.py fetch 2022
```

### Issue: No Population Found for Lookup

**Cause**: Demographics don't match or data not fetched

**Solutions**:
1. Check if data exists for that year
2. Verify demographic values match exactly
3. Try broader criteria (e.g., remove age_group filter)

### Issue: Census API Rate Limiting

**Cause**: Too many API requests

**Solution**:
- Add delay between requests (currently 0.5s)
- Use API key for higher limits
- Batch requests by state

## State FIPS Codes

Sample state FIPS codes:

| State | FIPS | State | FIPS |
|-------|------|-------|------|
| Alabama | 01 | Montana | 30 |
| Alaska | 02 | Nebraska | 31 |
| Arizona | 04 | Nevada | 32 |
| California | 06 | New York | 36 |
| Florida | 12 | Texas | 48 |

Full list: 51 total (50 states + DC)

## Future Enhancements

- [ ] Real Census Bureau API integration
- [ ] Historical population data (1960-present)
- [ ] Population projections (future years)
- [ ] County-level population data
- [ ] Metropolitan area populations
- [ ] Caching for frequently requested data
- [ ] Bulk export/import for offline use

## Related Documentation

- [CSV Processor](CSV_PROCESSOR.md) - Crime data processing
- [Statistics Calculator](STATISTICS_CALCULATOR.md) - Per capita calculations
- [Data Fetcher](DATA_FETCHER.md) - FBI data downloads
