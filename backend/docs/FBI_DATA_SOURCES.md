# FBI Crime Data Sources - Quick Reference

## FBI Crime Data Explorer (CDE)

### Main Website
- **URL**: https://cde.ucr.cjis.gov
- **Data**: UCR (Uniform Crime Reporting) and NIBRS data
- **Format**: Interactive web tool, CSV exports available
- **Coverage**: 1995 - present

### Downloads Page
https://cde.ucr.cjis.gov/LATEST/webapp/#/pages/downloads

### Available Datasets

#### 1. Offenses Known to Law Enforcement
- Murder and nonnegligent manslaughter
- Rape
- Robbery
- Aggravated assault
- Burglary
- Larceny-theft
- Motor vehicle theft
- Arson

#### 2. Arrests by Age, Sex, and Race
- Detailed demographic breakdowns
- Available by:
  - Age groups
  - Sex (Male/Female)
  - Race categories

#### 3. Law Enforcement Officers Killed and Assaulted (LEOKA)

## Data Access Methods

### Method 1: Manual Download (Currently Recommended)

1. Visit https://cde.ucr.cjis.gov
2. Navigate to Downloads section
3. Select desired data type and year
4. Download CSV file
5. Upload to accessible URL or server
6. Use our API to ingest:

```bash
python scripts/fetch_data.py url \
  "https://your-storage.com/fbi_data.csv" \
  FBI_UCR \
  murder_statistics \
  2022
```

### Method 2: Crime Data API (Future)

FBI is developing a new API:
- **Documentation**: https://cde.ucr.cjis.gov/LATEST/webapp/#/pages/docApi
- **Status**: Limited availability
- **Authentication**: API key may be required

Example API endpoint structure (subject to change):
```
GET https://api.usa.gov/crime/fbi/sapi/api/data/{type}/{year}
```

### Method 3: Data.gov

FBI datasets are also published on Data.gov:
- **URL**: https://catalog.data.gov/dataset
- **Search**: "FBI UCR crime statistics"
- **Format**: CSV, JSON
- **Advantage**: Direct download links

Example datasets:
- https://catalog.data.gov/dataset/crime-data-explorer

## Alternative Sources

### 1. Bureau of Justice Statistics (BJS)

- **URL**: https://bjs.ojp.gov
- **Data**: Additional crime statistics, victimization surveys
- **Format**: Excel, CSV, PDF

Key datasets:
- National Crime Victimization Survey (NCVS)
- Correctional population statistics
- Criminal victimization data

### 2. ICPSR (Inter-university Consortium for Political and Social Research)

- **URL**: https://www.icpsr.umich.edu
- **Data**: Historical FBI UCR data
- **Coverage**: 1960s - present
- **Format**: Research-ready datasets

### 3. FBI UCR Publications

- **URL**: https://ucr.fbi.gov/crime-in-the-u.s/
- **Data**: Annual reports and tables
- **Format**: PDF, some Excel/CSV

## Data Categories and Demographics

### Crime Types
- **Violent Crimes**:
  - Murder and nonnegligent manslaughter
  - Rape (revised and legacy definitions)
  - Robbery
  - Aggravated assault

- **Property Crimes**:
  - Burglary
  - Larceny-theft
  - Motor vehicle theft
  - Arson

### Demographic Breakdowns

#### Age Groups (Typical)
- Under 18
- 18-24
- 25-34
- 35-44
- 45-54
- 55-64
- 65 and over

#### Race Categories
- White
- Black or African American
- American Indian or Alaska Native
- Asian
- Native Hawaiian or Other Pacific Islander

#### Sex
- Male
- Female

## Population Data (for Per Capita Calculations)

### US Census Bureau

- **URL**: https://data.census.gov
- **API**: https://www.census.gov/data/developers/data-sets.html
- **Data**: Population estimates by demographics

Example API endpoint:
```
https://api.census.gov/data/{year}/pep/population
```

Required for:
- Per capita rate calculations
- Demographic population totals
- State-level population data

## Data Update Schedule

### FBI UCR
- **Release**: Annually
- **Timing**: Late August to October
- **Data Year**: Previous calendar year
- **Example**: 2022 data released in Fall 2023

### Census Population Estimates
- **Release**: Annually
- **Timing**: Late June
- **Data Year**: July 1 estimates

## Important Notes

### Data Completeness
- Not all agencies report to FBI
- Coverage varies by year
- Some states transitioned from UCR to NIBRS

### Data Transitions
- **UCR to NIBRS**: Ongoing transition
- **Impact**: Some data comparability issues
- **Solution**: Use adjusted data or separate analyses

### Data Quality
- Voluntary reporting by agencies
- Definitions may change over time
- Population estimates vs. actual counts

## Sample Data Files

For testing and development, you can use:

1. **FBI Sample Data**
   - Small subset for testing
   - Includes all demographic fields
   - Available on request

2. **Historical Data**
   - ICPSR archives
   - Cleaned and documented
   - Good for baseline

## API Integration Checklist

When FBI provides official API access:

- [ ] Register for API key
- [ ] Review rate limits
- [ ] Update `FBI_CDE_BASE_URL` in config
- [ ] Add API key to `.env`
- [ ] Update `_construct_download_url()` in data fetcher
- [ ] Test with recent year data
- [ ] Implement pagination if needed
- [ ] Add API-specific error handling

## Useful Links

- **FBI CDE**: https://cde.ucr.cjis.gov
- **FBI UCR**: https://ucr.fbi.gov
- **BJS**: https://bjs.ojp.gov
- **Census API**: https://www.census.gov/data/developers.html
- **Data.gov**: https://catalog.data.gov
- **ICPSR**: https://www.icpsr.umich.edu

## Contact Information

### FBI UCR Program
- Email: ucr@fbi.gov
- Phone: (304) 625-4995

### Technical Issues
- FBI CJIS Division
- Help: Check FBI CDE website for support options

## Example Workflow

1. **Identify Data Need**
   ```
   Need: Murder statistics for 2022 by race
   ```

2. **Locate Data**
   ```
   Source: FBI CDE Downloads page
   File: "Offenses Known - Murders by Demographics 2022.csv"
   ```

3. **Download Manually**
   ```
   Download from FBI CDE website
   Upload to accessible location
   ```

4. **Ingest into System**
   ```bash
   python scripts/fetch_data.py url \
     "https://storage.example.com/fbi_murders_2022.csv" \
     FBI_UCR \
     murder_statistics \
     2022
   ```

5. **Process Data**
   ```
   Continue to Phase 3: CSV Processing
   ```
