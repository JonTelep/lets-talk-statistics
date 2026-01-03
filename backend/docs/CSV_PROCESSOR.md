## CSV Processor Documentation

## Overview

The CSV Processor service handles parsing, validation, normalization, and database insertion of FBI crime statistics CSV files. It includes robust data quality checks, flexible column mapping, and batch processing capabilities.

## Features

- **Flexible Column Mapping**: Automatically detects various column name formats
- **Data Normalization**: Standardizes race, sex, and age group categories
- **Schema Validation**: Validates required fields before processing
- **Data Quality Checks**: Detects outliers, negative values, and missing data
- **Batch Processing**: Inserts records in batches (default: 1000 per batch)
- **Transaction Safety**: Rolls back on errors, maintains data integrity
- **Multiple Encodings**: Supports UTF-8, Latin-1, ISO-8859-1, CP1252
- **Preview Mode**: Preview CSV before processing

## Column Mappings

The processor automatically detects columns with various naming conventions:

### Supported Column Names

| Standard Field | Recognized Variations |
|---------------|----------------------|
| `year` | year, data_year, Year, YEAR |
| `state` | state, state_name, State, STATE |
| `jurisdiction` | jurisdiction, agency, ori, Agency, JURISDICTION |
| `race` | race, offender_race, victim_race, Race, RACE |
| `age_group` | age_group, age, age_range, Age, AGE_GROUP |
| `sex` | sex, gender, Sex, GENDER |
| `incident_count` | count, incidents, total, murders, COUNT, INCIDENTS |
| `population` | population, pop, Population, POPULATION |

### Required Fields

- **year**: Year of data
- **incident_count**: Number of incidents

### Optional Fields

At least one of these should be present:
- state
- race
- age_group
- sex
- jurisdiction

## Data Normalization

### Race Standardization

Automatically normalizes race values to standard FBI categories:

| Input (case-insensitive) | Standardized Output |
|--------------------------|-------------------|
| white, White, WHITE | White |
| black, Black, African American | Black or African American |
| asian, Asian/Pacific Islander | Asian |
| pacific islander, Native Hawaiian | Native Hawaiian or Other Pacific Islander |
| american indian, Alaska Native | American Indian or Alaska Native |
| hispanic, latino, Latino | Hispanic or Latino |
| unknown, Unknown | Unknown |
| other, Other | Other |

### Sex Normalization

| Input | Standardized Output |
|-------|-------------------|
| M, m, male, Male, MALE | Male |
| F, f, female, Female, FEMALE | Female |
| (anything else) | Unknown |

### Age Group Normalization

Automatically detects and normalizes age ranges:

| Pattern | Standardized Output |
|---------|-------------------|
| 0-17, Under 18, under 18 | 0-17 |
| 18-24, 18 - 24 | 18-24 |
| 25-34, 25 - 34 | 25-34 |
| 35-44, 35 - 44 | 35-44 |
| 45-54, 45 - 54 | 45-54 |
| 55-64, 55 - 64 | 55-64 |
| 65+, Over 64, 65 and over | 65+ |

## Data Quality Checks

The processor automatically detects:

### 1. Negative Incident Counts
```json
{
  "negative_counts": 5
}
```

### 2. Outliers
Uses z-score method (threshold: 3.0 standard deviations):
```json
{
  "outlier_count": 12,
  "outlier_values": [5000, 4800, 4500, ...]
}
```

### 3. Invalid Years
Checks for years outside 1900-2100:
```json
{
  "invalid_years": 2
}
```

### 4. Missing Data
Reports missing values by field:
```json
{
  "missing_race": {
    "count": 150,
    "percentage": 12.5
  },
  "missing_state": {
    "count": 50,
    "percentage": 4.2
  }
}
```

## Usage

### API Endpoints

#### 1. Process CSV File

```bash
POST /api/v1/admin/process/{data_source_id}?crime_type=murder
```

Example:
```bash
curl -X POST "http://localhost:8000/api/v1/admin/process/1?crime_type=murder"
```

Response:
```json
{
  "status": "processing_started",
  "message": "Processing started for data source 1",
  "data_source_id": 1,
  "crime_type": "murder"
}
```

#### 2. Preview CSV

```bash
GET /api/v1/admin/preview/{data_source_id}?rows=10
```

Example:
```bash
curl "http://localhost:8000/api/v1/admin/preview/1?rows=20"
```

Response:
```json
{
  "data_source_id": 1,
  "file_path": "/path/to/file.csv",
  "status": "downloaded",
  "total_rows": 1500,
  "columns": ["year", "state", "race", "count"],
  "detected_fields": {
    "year": "year",
    "incident_count": "count",
    "state": "state",
    "race": "race"
  },
  "preview": [
    {"year": 2022, "state": "California", "race": "White", "count": 150},
    ...
  ]
}
```

#### 3. Get Processing Status

```bash
GET /api/v1/admin/processing-status/{data_source_id}
```

Example:
```bash
curl "http://localhost:8000/api/v1/admin/processing-status/1"
```

Response:
```json
{
  "data_source_id": 1,
  "status": "processed",
  "year": 2022,
  "data_type": "murder_statistics",
  "download_date": "2024-01-15T10:30:00",
  "metadata": {
    "processing_stats": {
      "records_inserted": 1450,
      "quality_issues": {
        "missing_race": {"count": 50, "percentage": 3.4}
      }
    }
  }
}
```

### CLI Tool

#### Process CSV

```bash
cd backend
python scripts/process_data.py process 1
```

Example output:
```
============================================================
Processing Data Source 1
============================================================

Source: FBI_UCR
Year: 2022
File: /path/to/murder_statistics_2022.csv
Status: downloaded

Processing CSV file...

✓ Processing complete!

============================================================
Results:
============================================================
Status: success
Records inserted: 1450

Data Quality Issues:
  • missing_race: {'count': 50, 'percentage': 3.4}
```

#### Preview CSV

```bash
python scripts/process_data.py preview 1 --rows 20
```

#### List Data Sources

```bash
# List all
python scripts/process_data.py list

# List by status
python scripts/process_data.py list --status processed
```

### Programmatic Usage

```python
from app.services.csv_processor import CSVProcessor
from app.database import AsyncSessionLocal

async def process_csv():
    async with AsyncSessionLocal() as db:
        processor = CSVProcessor()

        # Preview first
        preview = processor.preview_csv("/path/to/file.csv", rows=10)
        print(f"Total rows: {preview['total_rows']}")
        print(f"Detected fields: {preview['detected_fields']}")

        # Process
        result = await processor.process_data_source(
            data_source_id=1,
            db=db,
            crime_type="murder"
        )

        print(f"Inserted {result['records_inserted']} records")
```

## Workflow

### Complete Data Ingestion Workflow

1. **Download Data**
```bash
curl -X POST "http://localhost:8000/api/v1/admin/download/from-url" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/fbi_murder_2022.csv",
    "source_name": "FBI_UCR",
    "data_type": "murder_statistics",
    "year": 2022
  }'
```

Response includes `data_source_id`: 1

2. **Preview Data**
```bash
curl "http://localhost:8000/api/v1/admin/preview/1?rows=20"
```

Check:
- Are required fields detected?
- Do values look normalized?
- Any obvious data issues?

3. **Process Data**
```bash
curl -X POST "http://localhost:8000/api/v1/admin/process/1?crime_type=murder"
```

4. **Check Status**
```bash
curl "http://localhost:8000/api/v1/admin/processing-status/1"
```

5. **Query Data**
```bash
curl "http://localhost:8000/api/v1/statistics/crimes?year=2022&crime_type=murder"
```

## Configuration

### Batch Size

Adjust batch size for large files:

```python
processor = CSVProcessor()
processor.batch_size = 2000  # Default: 1000
```

### Custom Column Mappings

To support additional column names:

```python
CSVProcessor.COLUMN_MAPPINGS["year"].append("Year_Of_Data")
```

## Error Handling

### Common Errors and Solutions

#### 1. "Missing required field: year"

**Cause**: CSV doesn't have a year column

**Solutions**:
- Add year column to CSV
- Update `COLUMN_MAPPINGS` if column has different name
- Extract year from filename/metadata (custom code needed)

#### 2. "Schema validation failed"

**Cause**: CSV missing required columns

**Solution**: Preview CSV to see what fields are detected:
```bash
python scripts/process_data.py preview 1
```

#### 3. "CSV file is empty"

**Cause**: Downloaded file is empty or corrupted

**Solution**: Re-download the file:
```bash
curl -X POST "http://localhost:8000/api/v1/admin/download/from-url" ...
```

#### 4. "Failed to read CSV with any encoding"

**Cause**: File encoding not supported

**Solution**: Convert file to UTF-8:
```bash
iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv
```

#### 5. Data source already processed

**Cause**: Attempting to reprocess

**Solution**:
- Check status first
- Delete existing records if reprocessing needed (manual DB operation)
- Or process into a new data source

## Performance Considerations

### Large Files

For files with 100k+ rows:

1. **Increase Batch Size**
```python
processor.batch_size = 5000
```

2. **Monitor Memory**
```bash
# Process in background
curl -X POST "http://localhost:8000/api/v1/admin/process/1"
```

3. **Use CLI for Local Processing**
```bash
# More control over resources
python scripts/process_data.py process 1
```

### Typical Performance

| Rows | Processing Time | Memory Usage |
|------|----------------|--------------|
| 1,000 | ~2 seconds | ~50 MB |
| 10,000 | ~15 seconds | ~100 MB |
| 100,000 | ~2 minutes | ~500 MB |
| 1,000,000 | ~20 minutes | ~2 GB |

## Data Source Status Flow

```
downloaded → processing → processed
     ↓           ↓
   failed ← ← ← failed
```

- **downloaded**: CSV file downloaded, not yet processed
- **processing**: Currently being processed (if using background tasks)
- **processed**: Successfully processed and inserted into database
- **failed**: Processing failed (check metadata for error details)

## Extending the Processor

### Adding New Crime Types

```python
# In csv_processor.py
async def process_data_source(
    self,
    data_source_id: int,
    db: AsyncSession,
    crime_type: str = "murder"  # Support: "robbery", "assault", etc.
):
    # Crime type is stored with each record
    # No code changes needed for new types!
```

### Custom Normalizations

Add to normalization methods:

```python
def _normalize_race(self, value: Any) -> str:
    # Add custom mappings
    if "multiracial" in str(value).lower():
        return "Two or More Races"
    # ... existing code
```

### Additional Quality Checks

```python
def _check_data_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
    issues = super()._check_data_quality(df)

    # Add custom check
    if (df["incident_count"] > 10000).any():
        issues["unusually_high_counts"] = True

    return issues
```

## Best Practices

1. **Always Preview First**
   - Check field mappings
   - Verify data looks reasonable
   - Identify potential issues

2. **Monitor Quality Issues**
   - Review quality_issues in metadata
   - Investigate outliers
   - Check missing data percentages

3. **Validate After Processing**
```bash
# Check record count
curl "http://localhost:8000/api/v1/statistics/crimes?year=2022&crime_type=murder"
```

4. **Log Everything**
   - Processing logs in application logs
   - Quality issues in metadata
   - Failed attempts tracked in status

5. **Test with Small Samples**
   - Test with first 100 rows
   - Verify normalization works
   - Then process full file

## Troubleshooting

### Debug Mode

Enable debug logging:

```bash
# In .env
LOG_LEVEL=DEBUG
```

Restart server and check logs during processing.

### Manual Database Inspection

```sql
-- Check processed records
SELECT COUNT(*) FROM crime_statistics WHERE source_id = 1;

-- Check data quality
SELECT race, COUNT(*) FROM crime_statistics
WHERE source_id = 1
GROUP BY race;

-- Check for outliers
SELECT * FROM crime_statistics
WHERE source_id = 1 AND incident_count > 1000
ORDER BY incident_count DESC;
```

### Rollback Failed Processing

If processing fails midway:

```sql
-- Check data source status
SELECT id, status, metadata FROM data_sources WHERE id = 1;

-- Delete partial records
DELETE FROM crime_statistics WHERE source_id = 1;

-- Reset status
UPDATE data_sources SET status = 'downloaded' WHERE id = 1;
```

Then retry processing.

## Future Enhancements

- [ ] Streaming processing for very large files
- [ ] Parallel processing of multiple files
- [ ] Advanced outlier detection algorithms
- [ ] Machine learning for data quality assessment
- [ ] Automatic data repair/correction
- [ ] Real-time processing progress updates
