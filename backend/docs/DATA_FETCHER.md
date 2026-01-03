# FBI Data Fetcher Documentation

## Overview

The FBI Data Fetcher service handles downloading crime statistics data from the FBI Crime Data Explorer (CDE) and other government sources. It provides robust download capabilities with retry logic, file integrity checking, and versioned storage.

## Features

- **Automated Downloads**: Fetch data directly from FBI CDE
- **Manual Downloads**: Support for direct URL downloads
- **Retry Logic**: Automatic retry on network failures (3 attempts)
- **File Integrity**: SHA-256 hash calculation and verification
- **Versioned Storage**: Timestamped file storage for data versioning
- **Database Tracking**: All downloads tracked in `data_sources` table
- **Error Handling**: Comprehensive error logging and recovery

## FBI Crime Data Explorer

### Data Sources

The FBI Crime Data Explorer provides crime statistics through:

1. **UCR (Uniform Crime Reporting) Program**
   - Website: https://cde.ucr.cjis.gov
   - Data: Crime statistics from law enforcement agencies
   - Coverage: 1995 - present
   - Update Schedule: Annual (typically August/September)

2. **NIBRS (National Incident-Based Reporting System)**
   - More detailed incident-level data
   - Replacing UCR program

### Data Types Supported

Currently supported:
- `murder_statistics` - Murder and nonnegligent manslaughter

Planned:
- `robbery` - Robbery statistics
- `assault` - Aggravated assault statistics
- `property_crime` - Property crime statistics

## Usage

### API Endpoints

#### 1. Download Murder Statistics

```bash
POST /api/v1/admin/download/murder-statistics/{year}
```

Example:
```bash
curl -X POST "http://localhost:8000/api/v1/admin/download/murder-statistics/2022"
```

Response:
```json
{
  "status": "download_started",
  "message": "Download started for year 2022",
  "year": 2022
}
```

#### 2. Download from Direct URL

```bash
POST /api/v1/admin/download/from-url
```

Parameters:
- `url`: Direct URL to CSV file
- `source_name`: Source identifier (e.g., 'FBI_UCR', 'BJS')
- `data_type`: Type of data (e.g., 'murder_statistics')
- `year`: Year of data

Example:
```bash
curl -X POST "http://localhost:8000/api/v1/admin/download/from-url" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/murder_data_2022.csv",
    "source_name": "FBI_UCR",
    "data_type": "murder_statistics",
    "year": 2022
  }'
```

#### 3. Check for Updates

```bash
POST /api/v1/admin/check-updates/{year}
```

Example:
```bash
curl -X POST "http://localhost:8000/api/v1/admin/check-updates/2022"
```

#### 4. Get Available Years

```bash
GET /api/v1/admin/available-years
```

Example:
```bash
curl "http://localhost:8000/api/v1/admin/available-years"
```

### CLI Tool

The CLI tool provides a command-line interface for data operations.

#### Fetch Data for Specific Year

```bash
python scripts/fetch_data.py year 2022
```

#### Download from URL

```bash
python scripts/fetch_data.py url \
  "https://example.com/data.csv" \
  FBI_UCR \
  murder_statistics \
  2022
```

#### List Available Years

```bash
python scripts/fetch_data.py list
```

### Programmatic Usage

```python
from app.services.data_fetcher import FBIDataFetcher
from app.database import AsyncSessionLocal

async def download_data():
    async with AsyncSessionLocal() as db:
        fetcher = FBIDataFetcher()

        # Download murder statistics
        data_source = await fetcher.fetch_murder_statistics(
            year=2022,
            db=db
        )

        print(f"Downloaded: {data_source.file_path}")
        print(f"Hash: {data_source.file_hash}")
```

## File Storage

### Directory Structure

```
backend/storage/raw_data/
├── murder_statistics_2020_20240101_120000.csv
├── murder_statistics_2021_20240101_120500.csv
└── murder_statistics_2022_20240101_121000.csv
```

### File Naming Convention

```
{data_type}_{year}_{timestamp}.csv
```

- `data_type`: Type of crime data (e.g., 'murder_statistics')
- `year`: Year of data
- `timestamp`: Download timestamp (YYYYMMDD_HHMMSS)

## Database Tracking

All downloads are tracked in the `data_sources` table:

```sql
SELECT
    id,
    source_name,
    data_type,
    year,
    download_date,
    status,
    file_hash
FROM data_sources
ORDER BY download_date DESC;
```

## Error Handling

### Common Errors

1. **Network Errors**
   - Automatic retry (3 attempts)
   - 5-second delay between retries
   - Logged for investigation

2. **404 Not Found**
   - No retry (data doesn't exist)
   - Returns clear error message

3. **File Integrity Issues**
   - Hash verification
   - Partial downloads cleaned up

### Error Responses

```json
{
  "detail": "Failed to fetch data for year 2022: Network error"
}
```

## Configuration

### Environment Variables

```bash
# FBI Crime Data Explorer
FBI_CDE_BASE_URL=https://cde.ucr.cjis.gov
FBI_API_KEY=  # If required

# Data Storage
DATA_STORAGE_PATH=./storage/raw_data
```

### Timeout Settings

- Default timeout: 300 seconds (5 minutes)
- Suitable for large CSV files
- Configurable in `FBIDataFetcher.__init__()`

## Best Practices

1. **Check for Updates First**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/admin/check-updates/2022"
   ```

2. **Download During Off-Peak Hours**
   - Reduces load on FBI servers
   - Better download speeds

3. **Verify Downloads**
   ```python
   # Hash is automatically calculated
   # Compare with FBI-provided hash if available
   ```

4. **Monitor Storage Space**
   ```bash
   du -sh backend/storage/raw_data/
   ```

## FBI CDE Data Access Notes

### Current Implementation

The current implementation includes:
- URL construction for FBI CDE downloads
- HTTP client with authentication support
- Retry logic for reliability

### Real-World Usage

To use with actual FBI data:

1. **Manual Download** (Recommended for now):
   - Visit https://cde.ucr.cjis.gov
   - Download CSV files manually
   - Use the "download from URL" endpoint

2. **Direct URL** (If FBI provides):
   ```bash
   curl -X POST "http://localhost:8000/api/v1/admin/download/from-url" \
     -d '{"url": "https://cde.ucr.cjis.gov/...", ...}'
   ```

3. **API Integration** (Future):
   - FBI CDE may provide official API
   - Update `_construct_download_url()` method
   - Add API authentication

### Example: Manual Download Workflow

1. Visit FBI CDE website
2. Download murder statistics CSV for 2022
3. Upload to server or accessible URL
4. Use CLI or API to ingest:

```bash
python scripts/fetch_data.py url \
  "https://your-server.com/fbi_murder_2022.csv" \
  FBI_UCR \
  murder_statistics \
  2022
```

## Troubleshooting

### Issue: Download Fails with Timeout

**Solution**: Increase timeout in `FBIDataFetcher`:
```python
self.timeout = 600  # 10 minutes
```

### Issue: File Already Exists

**Solution**: Use `check_for_updates` first or manually delete old data source record

### Issue: Invalid URL

**Solution**: Verify FBI CDE URL structure or use direct URL download

## Future Enhancements

- [ ] Support for additional crime types (robbery, assault)
- [ ] FBI API integration (when available)
- [ ] Automatic data validation
- [ ] Progress tracking for large downloads
- [ ] Parallel downloads for multiple years
- [ ] Email notifications on download completion
