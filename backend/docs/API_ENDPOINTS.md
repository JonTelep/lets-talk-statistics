# API Endpoints Documentation

## Overview

The Crime Statistics API provides comprehensive access to US government crime statistics data with powerful filtering, comparison, ranking, and analytics capabilities.

**Base URL**: `http://localhost:8000/api/v1`

## Authentication

Currently, the API is publicly accessible with no authentication required (MVP phase).

## Endpoint Categories

- [Statistics](#statistics) - Query crime statistics with filters
- [Trends](#trends) - Year-over-year trend analysis
- [Exports](#exports) - Data export in various formats
- [Comparisons](#comparisons) - Compare data across dimensions
- [Rankings](#rankings) - Top/bottom rankings by various metrics
- [Analytics](#analytics) - Aggregated analytics and insights
- [Admin](#admin) - Data management operations
- [Tasks](#tasks) - Background task management

---

## Statistics

### Get Crime Statistics
```http
GET /statistics/crimes
```

Query crime statistics with optional filters.

**Parameters:**
- `crime_type` (string, default: "murder"): Type of crime
- `year` (integer, optional): Specific year
- `state` (string, optional): State filter
- `race` (string, optional): Race filter
- `age_group` (string, optional): Age group filter
- `sex` (string, optional): Sex filter

**Example:**
```bash
curl "http://localhost:8000/api/v1/statistics/crimes?crime_type=murder&year=2022&race=White"
```

### Get Per Capita Rates
```http
GET /statistics/per-capita
```

Get per capita crime rates by demographic breakdown.

**Parameters:**
- `crime_type` (string, default: "murder")
- `year` (integer, optional)
- `demographic_type` (string, default: "total"): Demographic breakdown type

**Example:**
```bash
curl "http://localhost:8000/api/v1/statistics/per-capita?year=2022&demographic_type=by_race"
```

### Get Demographic Breakdown
```http
GET /statistics/demographics
```

Get demographic breakdown of crime statistics.

**Parameters:**
- `crime_type` (string, default: "murder")
- `year` (integer, required)
- `breakdown_by` (string, default: "race"): Field to break down by (race, age_group, sex)

**Example:**
```bash
curl "http://localhost:8000/api/v1/statistics/demographics?year=2022&breakdown_by=age_group"
```

### List Crime Statistics (Paginated)
```http
GET /statistics/list
```

List crime statistics with pagination support.

**Parameters:**
- `crime_type` (string, default: "murder")
- `year` (integer, optional)
- `state`, `race`, `age_group`, `sex` (string, optional): Filters
- `page` (integer, default: 1): Page number
- `page_size` (integer, default: 100, max: 1000): Items per page

**Example:**
```bash
curl "http://localhost:8000/api/v1/statistics/list?year=2022&page=1&page_size=50"
```

### Advanced Search
```http
POST /statistics/search
```

Advanced search with multiple filters.

**Request Body:**
```json
{
  "crime_type": "murder",
  "years": [2020, 2021, 2022],
  "states": ["California", "Texas", "Florida"],
  "races": ["White", "Black or African American"],
  "min_incidents": 100,
  "max_incidents": 1000
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/statistics/search?page=1&page_size=100" \
  -H "Content-Type: application/json" \
  -d '{"crime_type":"murder","years":[2022],"states":["California"]}'
```

---

## Trends

### Get Trend Data
```http
GET /statistics/trends
```

Get trend data for crime statistics over multiple years.

**Parameters:**
- `crime_type` (string, default: "murder")
- `start_year` (integer, required)
- `end_year` (integer, required)
- `state`, `race`, `age_group`, `sex` (string, optional): Filters

**Example:**
```bash
curl "http://localhost:8000/api/v1/statistics/trends?crime_type=murder&start_year=2018&end_year=2022"
```

**Response:**
```json
{
  "crime_type": "murder",
  "years": [2018, 2019, 2020, 2021, 2022],
  "incident_counts": [1000, 1050, 1100, 1200, 1150],
  "per_capita_rates": [5.2, 5.4, 5.6, 6.1, 5.8],
  "yoy_changes": [null, 3.8, 3.7, 8.9, -4.9]
}
```

---

## Exports

### Export to CSV
```http
GET /csv
```

Export crime statistics to CSV format.

**Parameters:**
- `crime_type` (string, default: "murder")
- `year` (integer, optional)
- `state` (string, optional)

**Example:**
```bash
curl "http://localhost:8000/api/v1/csv?crime_type=murder&year=2022" -o crime_data.csv
```

### Get Crime Types
```http
GET /crime-types
```

Get list of available crime types with metadata.

**Example:**
```bash
curl "http://localhost:8000/api/v1/crime-types"
```

### Get Data Sources
```http
GET /data-sources
```

Get list of available data sources.

**Parameters:**
- `year` (integer, optional): Filter by year

**Example:**
```bash
curl "http://localhost:8000/api/v1/data-sources?year=2022"
```

---

## Comparisons

### Compare Years
```http
GET /comparisons/years
```

Compare crime statistics across multiple years.

**Parameters:**
- `crime_type` (string, default: "murder")
- `years` (string, required): Comma-separated years (e.g., "2020,2021,2022")
- `state` (string, optional)
- `demographic_type` (string, default: "total")

**Example:**
```bash
curl "http://localhost:8000/api/v1/comparisons/years?years=2020,2021,2022&crime_type=murder"
```

### Compare States
```http
GET /comparisons/states
```

Compare crime statistics across multiple states.

**Parameters:**
- `crime_type` (string, default: "murder")
- `year` (integer, required)
- `states` (string, required): Comma-separated states

**Example:**
```bash
curl "http://localhost:8000/api/v1/comparisons/states?year=2022&states=California,Texas,New York"
```

### Compare Demographics
```http
GET /comparisons/demographics
```

Compare crime statistics across demographics.

**Parameters:**
- `crime_type` (string, default: "murder")
- `year` (integer, required)
- `demographic_type` (string, required): by_race, by_age, by_sex
- `state` (string, optional)

**Example:**
```bash
curl "http://localhost:8000/api/v1/comparisons/demographics?year=2022&demographic_type=by_race"
```

---

## Rankings

### Get State Rankings
```http
GET /rankings/states
```

Get state rankings by per capita crime rate.

**Parameters:**
- `crime_type` (string, default: "murder")
- `year` (integer, required)
- `order` (string, default: "desc"): "desc" for highest, "asc" for lowest
- `limit` (integer, default: 10, max: 51)

**Example:**
```bash
curl "http://localhost:8000/api/v1/rankings/states?year=2022&order=desc&limit=10"
```

### Get Demographic Rankings
```http
GET /rankings/demographics
```

Get demographic rankings by per capita crime rate.

**Parameters:**
- `crime_type` (string, default: "murder")
- `year` (integer, required)
- `demographic_type` (string, required): by_race, by_age, by_sex
- `state` (string, optional)
- `order` (string, default: "desc")

**Example:**
```bash
curl "http://localhost:8000/api/v1/rankings/demographics?year=2022&demographic_type=by_race"
```

### Get Top States
```http
GET /rankings/top-states
```

Get top states with highest per capita crime rates.

**Parameters:**
- `crime_type` (string, default: "murder")
- `year` (integer, required)
- `limit` (integer, default: 10)

**Example:**
```bash
curl "http://localhost:8000/api/v1/rankings/top-states?year=2022&limit=5"
```

### Get Bottom States
```http
GET /rankings/bottom-states
```

Get bottom states with lowest per capita crime rates.

**Parameters:**
- `crime_type` (string, default: "murder")
- `year` (integer, required)
- `limit` (integer, default: 10)

**Example:**
```bash
curl "http://localhost:8000/api/v1/rankings/bottom-states?year=2022&limit=5"
```

### Get Biggest Changes
```http
GET /rankings/biggest-changes
```

Get rankings by biggest year-over-year changes.

**Parameters:**
- `crime_type` (string, default: "murder")
- `year` (integer, required)
- `change_type` (string, default: "increase"): "increase" or "decrease"
- `ranking_by` (string, default: "state"): "state", "by_race", "by_age", "by_sex"
- `limit` (integer, default: 10)

**Example:**
```bash
curl "http://localhost:8000/api/v1/rankings/biggest-changes?year=2022&change_type=increase&limit=10"
```

---

## Analytics

### Get Analytics Summary
```http
GET /analytics/summary
```

Get comprehensive analytics summary for a time period.

**Parameters:**
- `crime_type` (string, default: "murder")
- `start_year` (integer, required)
- `end_year` (integer, required)

**Example:**
```bash
curl "http://localhost:8000/api/v1/analytics/summary?start_year=2018&end_year=2022"
```

**Response includes:**
- Total incidents across all years
- Average per capita rate
- Yearly summaries with YoY changes
- Top 10 states
- Bottom 10 states

### Get Year Summary
```http
GET /analytics/year-summary/{year}
```

Get detailed summary for a specific year.

**Parameters:**
- `year` (path parameter, required)
- `crime_type` (string, default: "murder")

**Example:**
```bash
curl "http://localhost:8000/api/v1/analytics/year-summary/2022?crime_type=murder"
```

### Get State Profile
```http
GET /analytics/state-profile/{state}
```

Get comprehensive profile for a specific state.

**Parameters:**
- `state` (path parameter, required)
- `crime_type` (string, default: "murder")
- `start_year` (integer, optional)
- `end_year` (integer, optional)

**Example:**
```bash
curl "http://localhost:8000/api/v1/analytics/state-profile/California?crime_type=murder"
```

---

## Admin

See [Admin Documentation](../README.md#admin-data-management) for full list of admin endpoints including:
- Data download and processing
- Population data management
- Statistics calculation
- Data source management

---

## Tasks

See [Scheduled Tasks Documentation](SCHEDULED_TASKS.md) for full list of task endpoints including:
- Background task submission
- Task status monitoring
- Worker management

---

## Error Responses

All endpoints return standard error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid parameter: start_year must be <= end_year"
}
```

### 404 Not Found
```json
{
  "detail": "No data found for the specified filters"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented (MVP phase).

## Pagination

Paginated endpoints return a `pagination` object:

```json
{
  "page": 1,
  "page_size": 100,
  "total_records": 5000,
  "total_pages": 50,
  "has_next": true,
  "has_previous": false
}
```

## Interactive Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These provide interactive API documentation where you can test endpoints directly.
