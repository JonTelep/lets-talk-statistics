# Government Data APIs - Documentation

This document describes all government data sources used by Let's Talk Statistics, including API endpoints, authentication requirements, data formats, and update schedules.

---

## Table of Contents

1. [USASpending.gov (Federal Budget)](#1-usaspendinggov-federal-budget)
2. [Treasury Fiscal Data (National Debt)](#2-treasury-fiscal-data-national-debt)
3. [Bureau of Labor Statistics (Employment)](#3-bureau-of-labor-statistics-employment)
4. [FBI Crime Data Explorer (Crime)](#4-fbi-crime-data-explorer-crime)
5. [Future Data Sources](#5-future-data-sources)

---

## 1. USASpending.gov (Federal Budget)

### Overview
- **Official Name:** USASpending.gov
- **Managed By:** U.S. Department of the Treasury
- **Legal Mandate:** DATA Act of 2014
- **API Base URL:** `https://api.usaspending.gov/api/v2/`
- **Documentation:** https://api.usaspending.gov/docs/
- **Authentication:** None required (public API)
- **Rate Limits:** No documented limits, but be respectful

### Data Available
| Data Type | Endpoint | Update Frequency |
|-----------|----------|------------------|
| Agency Spending | `/references/toptier_agencies/` | Monthly |
| Budget Functions | `/budget_functions/list_budget_functions/` | Monthly |
| Federal Accounts | `/federal_accounts/` | Monthly |
| Spending Totals | `/spending/` | Monthly |
| Spending Over Time | `/spending/spending_over_time/` | Monthly |

### Key Endpoints Used

#### Get All Agencies
```bash
GET /api/v2/references/toptier_agencies/?fiscal_year=2024
```

#### Get Top Agencies by Spending
```bash
POST /api/v2/spending/
{
  "fiscal_year": 2024,
  "limit": 10,
  "order": "desc",
  "sort": "obligated_amount",
  "spending_type": "total"
}
```

#### Get Budget Functions
```bash
GET /api/v2/budget_functions/list_budget_functions/?fiscal_year=2024
```

### Data Definitions
- **Obligations:** Legal commitments to pay for goods/services
- **Outlays:** Actual payments made
- **Budgetary Resources:** Total funds available to an agency
- **Fiscal Year:** Oct 1 - Sep 30 (FY2024 = Oct 1, 2023 - Sep 30, 2024)

### Our Implementation
- **Service:** `app/services/budget_service.py`
- **API Routes:** `/api/v1/budget/*`
- **Caching:** Redis, 24-hour TTL

---

## 2. Treasury Fiscal Data (National Debt)

### Overview
- **Official Name:** Fiscal Data
- **Managed By:** U.S. Department of the Treasury, Bureau of the Fiscal Service
- **API Base URL:** `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/`
- **Documentation:** https://fiscaldata.treasury.gov/api-documentation/
- **Authentication:** None required
- **Rate Limits:** No documented limits

### Data Available
| Data Type | Endpoint | Update Frequency |
|-----------|----------|------------------|
| Debt to the Penny | `/v2/accounting/od/debt_to_penny` | Daily |
| Interest Expense | `/v2/accounting/od/interest_expense` | Monthly |
| Monthly Treasury Statement | `/v1/accounting/mts/mts_table_5` | Monthly |

### Key Endpoints Used

#### Get Current Debt
```bash
GET /v2/accounting/od/debt_to_penny?sort=-record_date&page[size]=1&format=json
```

Response fields:
- `tot_pub_debt_out_amt` - Total public debt outstanding
- `debt_held_public_amt` - Debt held by public
- `intragov_hold_amt` - Intragovernmental holdings
- `record_date` - Date of record

#### Get Historical Debt
```bash
GET /v2/accounting/od/debt_to_penny?filter=record_date:gte:2020-01-01&sort=-record_date&page[size]=1000
```

#### Get Interest Expense
```bash
GET /v2/accounting/od/interest_expense?filter=record_fiscal_year:eq:2024&sort=-record_date
```

### Data Definitions
- **Total Public Debt Outstanding:** Sum of all federal debt
- **Debt Held by Public:** Treasury securities held outside federal government
- **Intragovernmental Holdings:** Treasury securities held by government accounts (Social Security, etc.)
- **Fiscal Year:** Oct 1 - Sep 30

### Our Implementation
- **Service:** `app/services/debt_service.py`
- **API Routes:** `/api/v1/debt/*`
- **Caching:** Redis, 1-hour TTL (data updates daily)

---

## 3. Bureau of Labor Statistics (Employment)

### Overview
- **Official Name:** Bureau of Labor Statistics Public Data API
- **Managed By:** U.S. Department of Labor
- **API Base URL:** `https://api.bls.gov/publicAPI/v2/`
- **Documentation:** https://www.bls.gov/developers/
- **Authentication:** Optional API key for higher limits
- **Rate Limits:** 
  - Without key: 25 requests/day, 10 years max
  - With key: 500 requests/day, 20 years max

### Registration
Get a free API key at: https://data.bls.gov/registrationEngine/

### Key Series IDs
| Metric | Series ID | Description |
|--------|-----------|-------------|
| Unemployment Rate | LNS14000000 | Seasonally adjusted national rate |
| Nonfarm Employment | CES0000000001 | Total nonfarm payroll |
| Labor Force | LNS11000000 | Civilian labor force level |
| Participation Rate | LNS11300000 | Labor force participation |
| Employed | LNS12000000 | Employment level |
| Unemployed | LNS13000000 | Unemployment level |

### Demographic Unemployment Rates
| Group | Series ID |
|-------|-----------|
| Adult Men (20+) | LNS14000001 |
| Adult Women (20+) | LNS14000002 |
| Teenagers (16-19) | LNS14000012 |
| White | LNS14000003 |
| Black | LNS14000006 |
| Asian | LNS14032183 |
| Hispanic | LNS14000009 |

### Industry Employment (Nonfarm)
| Sector | Series ID |
|--------|-----------|
| Mining | CES1000000001 |
| Construction | CES2000000001 |
| Manufacturing | CES3000000001 |
| Retail Trade | CES4200000001 |
| Healthcare/Education | CES6500000001 |
| Leisure/Hospitality | CES7000000001 |
| Government | CES9000000001 |

### Key Endpoint

```bash
POST /publicAPI/v2/timeseries/data/
{
  "seriesid": ["LNS14000000", "CES0000000001"],
  "startyear": "2020",
  "endyear": "2024",
  "registrationkey": "YOUR_API_KEY"  // optional
}
```

### Data Definitions
- **Unemployment Rate:** % of labor force that is jobless and actively seeking work
- **Labor Force:** All persons 16+ who are employed or actively seeking work
- **Nonfarm Payroll:** Total number of paid workers excluding farm workers, private household employees, and nonprofit employees
- **Seasonally Adjusted:** Adjusted for predictable seasonal patterns

### Our Implementation
- **Service:** `app/services/employment_service.py`
- **API Routes:** `/api/v1/employment/*`
- **Caching:** Redis, 24-hour TTL (data updates monthly)

---

## 4. FBI Crime Data Explorer (Crime)

### Overview
- **Official Name:** FBI Crime Data Explorer
- **Managed By:** FBI Criminal Justice Information Services (CJIS)
- **Website:** https://cde.ucr.cjis.gov
- **API Status:** Limited/Manual download
- **Data Format:** CSV downloads

### Data Sources
1. **UCR (Uniform Crime Reporting)** - Legacy system
2. **NIBRS (National Incident-Based Reporting System)** - New standard

### Available Data
- Murder and nonnegligent manslaughter
- Rape
- Robbery
- Aggravated assault
- Property crimes (burglary, larceny, motor vehicle theft)

### Data Access Methods
Currently, FBI data requires manual download or URL-based ingestion:

1. Download CSV from https://cde.ucr.cjis.gov/LATEST/webapp/#/pages/downloads
2. Upload to accessible URL
3. Use our admin API to ingest

```bash
POST /api/v1/admin/download/from-url
{
  "url": "https://your-storage.com/fbi_data.csv",
  "source_name": "FBI_UCR",
  "data_type": "murder_statistics",
  "year": 2022
}
```

### Our Implementation
- **Service:** `app/services/data_fetcher.py`
- **Processor:** `app/services/csv_processor.py`
- **API Routes:** `/api/v1/statistics/*`, `/api/v1/admin/*`

---

## 5. Future Data Sources

### Immigration (DHS)
- **Website:** https://www.dhs.gov/immigration-statistics
- **Status:** Planned
- **Challenge:** No public API; data in PDF/Excel

Potential sources:
- CBP Monthly Operational Updates
- ICE ERO Annual Reports
- USCIS Immigration Statistics

### Congressional Trading
- **Senate:** https://efdsearch.senate.gov/search/
- **House:** https://disclosures-clerk.house.gov/FinancialDisclosure
- **Status:** Planned
- **Challenge:** No API; requires scraping or third-party data

Third-party alternatives:
- Capitol Trades
- Quiver Quantitative
- House Stock Watcher API

---

## Data Quality & Verification

### Best Practices
1. **Always cite sources** - Every data point should link to its origin
2. **Document update timestamps** - Track when data was fetched
3. **Handle missing data gracefully** - Not all data is available for all periods
4. **Validate incoming data** - Check for reasonable ranges and formats

### Caching Strategy
| Data Type | Cache Duration | Reason |
|-----------|----------------|--------|
| Budget | 24 hours | Monthly updates |
| Debt | 1 hour | Daily updates |
| Employment | 24 hours | Monthly updates |
| Crime | 7 days | Annual updates |

### Error Handling
- All services include retry logic
- HTTP errors logged with context
- Graceful degradation when APIs unavailable
- Clear error messages for users

---

## Adding New Data Sources

When adding a new government data source:

1. **Research the API** - Read official documentation thoroughly
2. **Create service class** in `app/services/`
3. **Create API endpoints** in `app/api/v1/endpoints/`
4. **Register routes** in `app/api/v1/router.py`
5. **Document** in this file
6. **Add tests** in `tests/`
7. **Update frontend** to consume new API

---

## Contact & Support

### Data Source Contacts
- **USASpending:** datalab@fiscal.treasury.gov
- **Treasury Fiscal Data:** fiscaldata@fiscal.treasury.gov
- **BLS:** blsdata_staff@bls.gov
- **FBI UCR:** ucr@fbi.gov

### Our Repository
- Issues: GitHub Issues
- Documentation: `/docs` folder
