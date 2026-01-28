# Let's Talk Statistics - Development Plan

**Vision:** The gold standard for government accountability and data accessibility.

**Last Updated:** 2026-01-28

---

## Current State Assessment

| Category | Frontend | Backend | Real Data | Status |
|----------|----------|---------|-----------|--------|
| Crime Statistics | ✅ Complete | ✅ Complete | ✅ FBI CDE | **Production Ready** |
| Congressional Trading | ✅ Mock data | ❌ None | ❌ | Needs backend |
| Immigration | ✅ Mock data | ❌ None | ❌ | Needs backend |
| Federal Budget | ✅ Mock data | ❌ None | ❌ | Needs backend |
| National Debt | ✅ Mock data | ❌ None | ❌ | Needs backend |
| Employment | ✅ Mock data | ❌ None | ❌ | Needs backend |

---

## Government Data Sources & APIs

### 1. USASpending.gov (Budget Data) ⭐ PRIORITY
- **URL:** https://api.usaspending.gov/
- **Auth:** None required (free, open)
- **Docs:** https://api.usaspending.gov/docs/
- **Data Available:**
  - Federal spending by agency
  - Spending by category (mandatory, discretionary)
  - Contract and grant data
  - Historical fiscal year data
- **Quality:** Excellent API, well-documented, real-time data
- **Endpoints:**
  ```
  GET /api/v2/spending/
  GET /api/v2/agency/{agency_code}/
  GET /api/v2/budget_functions/
  GET /api/v2/federal_account/
  ```

### 2. Treasury Direct / Fiscal Data (National Debt) ⭐ PRIORITY
- **URL:** https://fiscaldata.treasury.gov/api-documentation/
- **Auth:** None required
- **Data Available:**
  - Total public debt outstanding (daily)
  - Debt to the penny
  - Interest rates
  - Treasury securities
- **Endpoints:**
  ```
  GET /services/api/fiscal_service/v2/accounting/od/debt_to_penny
  GET /services/api/fiscal_service/v1/accounting/mts/mts_table_5
  ```

### 3. FRED API (Federal Reserve Economic Data)
- **URL:** https://fred.stlouisfed.org/docs/api/
- **Auth:** Free API key required
- **Data Available:**
  - GDP data
  - Debt-to-GDP ratio
  - Interest rates
  - Economic indicators
- **Endpoints:**
  ```
  GET /series/observations?series_id=GFDEBTN (Federal Debt)
  GET /series/observations?series_id=GDP
  ```

### 4. Bureau of Labor Statistics API (Employment)
- **URL:** https://www.bls.gov/developers/
- **Auth:** V2 requires free registration
- **Data Available:**
  - Unemployment rates (national, state, metro)
  - Nonfarm payroll employment
  - Labor force participation
  - Employment by sector
- **Series IDs:**
  ```
  LNS14000000 - Unemployment Rate
  CES0000000001 - Total Nonfarm Employment
  LNS11300000 - Labor Force Participation Rate
  ```

### 5. DHS Immigration Data
- **URL:** https://www.dhs.gov/immigration-statistics
- **Auth:** None (downloadable datasets)
- **Data Available:**
  - Immigration yearbooks (annual)
  - Enforcement statistics
  - USCIS data
- **Challenge:** Less API-friendly, mostly PDF/Excel downloads
- **Alternative:** CBP has some monthly data

### 6. Congressional Financial Disclosures
- **Senate:** https://efdsearch.senate.gov/search/
- **House:** https://disclosures-clerk.house.gov/FinancialDisclosure
- **Auth:** None (public records)
- **Challenge:** No official API - need to scrape or use third-party
- **Third-party options:**
  - Capitol Trades API
  - Quiver Quantitative
  - House Stock Watcher

---

## Implementation Priority

### Phase 1: Core Data Integrations (Week 1-2)
1. **USASpending.gov** → Budget page (best API, high impact)
2. **Treasury Fiscal Data** → Debt page (real-time, critical data)

### Phase 2: Economic Data (Week 2-3)
3. **BLS API** → Employment page (monthly updates)
4. **FRED API** → Supplement debt/economic data

### Phase 3: Complex Integrations (Week 3-4)
5. **DHS Data** → Immigration (may require CSV parsing)
6. **Congress Disclosures** → Trading (scraping or third-party)

---

## Technical Architecture

### Backend Services Pattern
```
backend/
├── app/
│   ├── services/
│   │   ├── data_fetcher.py        # FBI (existing)
│   │   ├── budget_service.py       # NEW: USASpending.gov
│   │   ├── debt_service.py         # NEW: Treasury Fiscal Data
│   │   ├── employment_service.py   # NEW: BLS API
│   │   ├── immigration_service.py  # NEW: DHS data
│   │   └── congress_service.py     # NEW: Stock disclosures
│   └── api/v1/
│       ├── statistics.py           # Crime (existing)
│       ├── budget.py               # NEW
│       ├── debt.py                 # NEW
│       ├── employment.py           # NEW
│       ├── immigration.py          # NEW
│       └── congress.py             # NEW
```

### Data Caching Strategy
- Use Redis for API response caching
- Cache duration based on data update frequency:
  - Debt: 1 hour (updates daily)
  - Budget: 24 hours (updates infrequently)
  - Employment: 24 hours (monthly reports)
  - Congress: 6 hours (disclosure filing lag)

### Database Schema Extensions
```sql
-- Budget data
CREATE TABLE federal_spending (
    id SERIAL PRIMARY KEY,
    fiscal_year INTEGER,
    agency_code VARCHAR(10),
    agency_name VARCHAR(255),
    total_budgetary_resources DECIMAL(20, 2),
    total_obligations DECIMAL(20, 2),
    total_outlays DECIMAL(20, 2),
    fetched_at TIMESTAMP
);

-- Debt data
CREATE TABLE national_debt (
    id SERIAL PRIMARY KEY,
    record_date DATE,
    debt_held_public DECIMAL(20, 2),
    intragovernmental_holdings DECIMAL(20, 2),
    total_public_debt DECIMAL(20, 2),
    fetched_at TIMESTAMP
);

-- Employment data
CREATE TABLE employment_stats (
    id SERIAL PRIMARY KEY,
    year INTEGER,
    month INTEGER,
    unemployment_rate DECIMAL(5, 2),
    labor_force BIGINT,
    employed BIGINT,
    unemployed BIGINT,
    nonfarm_payroll BIGINT,
    fetched_at TIMESTAMP
);
```

---

## Documentation Standards

For each data source, document:
1. **Source URL** - Where the data comes from
2. **API endpoint** - How we fetch it
3. **Update frequency** - How often it changes
4. **Data fields** - What we're pulling
5. **Caching strategy** - How long we cache
6. **Error handling** - What happens when API fails
7. **Data transformations** - Any calculations/normalization

---

## Success Metrics

- [ ] All 6 categories have real backend data
- [ ] Data freshness < 24 hours for all sources
- [ ] API response time < 500ms (with caching)
- [ ] 100% of data has source attribution
- [ ] Zero mock/hardcoded data in production

---

## Next Immediate Actions

1. Create `budget_service.py` - USASpending.gov integration
2. Create API routes for budget data
3. Update frontend to consume real API
4. Add documentation for data retrieval process
5. Repeat for debt, employment, etc.
