"""
Central configuration for all FRED housing series.

Single place to add or remove a series. The sync script and API endpoints
both read from this module.
"""

from typing import Any

# ---------------------------------------------------------------------------
# Category definitions
# ---------------------------------------------------------------------------

CATEGORIES: dict[str, dict[str, str]] = {
    "homeownership_demographics": {
        "title": "Homeownership & Demographics",
        "description": "Homeownership rates by race/ethnicity.",
    },
    "vacancy_inventory": {
        "title": "Vacancy & Inventory",
        "description": "Rental and homeowner vacancy rates, housing inventory, and time on market.",
    },
    "construction_pipeline": {
        "title": "Construction Pipeline & Permits",
        "description": "Building permits, housing starts, units under construction, and completions.",
    },
    "house_prices": {
        "title": "House Prices & Affordability",
        "description": "Median/average sale prices, price indices, and affordability metrics.",
    },
    "new_construction_sales": {
        "title": "New Construction Sales Activity",
        "description": "New and existing home sales volume and inventory.",
    },
    "mortgage_cost_context": {
        "title": "Mortgage & Cost Context",
        "description": "Mortgage rates, debt service burden, and shelter cost indices.",
    },
}

# ---------------------------------------------------------------------------
# Series definitions — each entry maps to one FRED time-series
# ---------------------------------------------------------------------------

HOUSING_SERIES: list[dict[str, Any]] = [
    # === A: Homeownership & Demographics =====================================
    {"series_id": "RHORUSQ156N", "title": "Homeownership Rate (Overall)", "category": "homeownership_demographics", "frequency": "quarterly", "units": "percent", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "BOAAAHORUSQ156N", "title": "Homeownership Rate - Black", "category": "homeownership_demographics", "frequency": "quarterly", "units": "percent", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "NHWAHORUSQ156N", "title": "Homeownership Rate - White Non-Hispanic", "category": "homeownership_demographics", "frequency": "quarterly", "units": "percent", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "HOLHORUSQ156N", "title": "Homeownership Rate - Hispanic", "category": "homeownership_demographics", "frequency": "quarterly", "units": "percent", "seasonal_adjustment": "not seasonally adjusted"},

    # === B: Vacancy & Inventory ==============================================
    {"series_id": "RRVRUSQ156N", "title": "Rental Vacancy Rate", "category": "vacancy_inventory", "frequency": "quarterly", "units": "percent", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "RHVRUSQ156N", "title": "Homeowner Vacancy Rate", "category": "vacancy_inventory", "frequency": "quarterly", "units": "percent", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "ETOTALUSQ176N", "title": "Housing Inventory Estimate - Total", "category": "vacancy_inventory", "frequency": "quarterly", "units": "thousands of units", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "EYRVACUSQ176N", "title": "Year-Round Vacant Housing Units", "category": "vacancy_inventory", "frequency": "quarterly", "units": "thousands of units", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "ERENTUSQ176N", "title": "Rental Housing Inventory", "category": "vacancy_inventory", "frequency": "quarterly", "units": "thousands of units", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "ACTLISCOUUS", "title": "Active Listing Count", "category": "vacancy_inventory", "frequency": "monthly", "units": "units", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "MSACSR", "title": "Monthly Supply of New Houses", "category": "vacancy_inventory", "frequency": "monthly", "units": "months' supply", "seasonal_adjustment": "seasonally adjusted"},
    {"series_id": "MNMFS", "title": "Median Months on Market for New Houses", "category": "vacancy_inventory", "frequency": "monthly", "units": "months", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "MEDDAYONMARUS", "title": "Median Days on Market", "category": "vacancy_inventory", "frequency": "monthly", "units": "days", "seasonal_adjustment": "not seasonally adjusted"},

    # === C: Construction Pipeline & Permits ==================================
    {"series_id": "PERMIT", "title": "New Housing Units Authorized by Permits", "category": "construction_pipeline", "frequency": "monthly", "units": "thousands of units", "seasonal_adjustment": "seasonally adjusted annual rate"},
    {"series_id": "PERMIT1", "title": "Permits - Single Unit", "category": "construction_pipeline", "frequency": "monthly", "units": "thousands of units", "seasonal_adjustment": "seasonally adjusted annual rate"},
    {"series_id": "PERMITNSA", "title": "Permits - Not Seasonally Adjusted", "category": "construction_pipeline", "frequency": "monthly", "units": "thousands of units", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "HOUST", "title": "Housing Starts (Total)", "category": "construction_pipeline", "frequency": "monthly", "units": "thousands of units", "seasonal_adjustment": "seasonally adjusted annual rate"},
    {"series_id": "HOUST1F", "title": "Housing Starts - Single Family", "category": "construction_pipeline", "frequency": "monthly", "units": "thousands of units", "seasonal_adjustment": "seasonally adjusted annual rate"},
    {"series_id": "HOUST5F", "title": "Housing Starts - 5+ Units", "category": "construction_pipeline", "frequency": "monthly", "units": "thousands of units", "seasonal_adjustment": "seasonally adjusted annual rate"},
    {"series_id": "UNDCONTSA", "title": "Housing Units Under Construction", "category": "construction_pipeline", "frequency": "monthly", "units": "thousands of units", "seasonal_adjustment": "seasonally adjusted annual rate"},
    {"series_id": "UNDCON5MUSA", "title": "Under Construction - 5+ Units", "category": "construction_pipeline", "frequency": "monthly", "units": "thousands of units", "seasonal_adjustment": "seasonally adjusted annual rate"},
    {"series_id": "COMPUTSA", "title": "Housing Units Completed", "category": "construction_pipeline", "frequency": "monthly", "units": "thousands of units", "seasonal_adjustment": "seasonally adjusted annual rate"},
    {"series_id": "COMPU1USA", "title": "Completions - Single Unit", "category": "construction_pipeline", "frequency": "monthly", "units": "thousands of units", "seasonal_adjustment": "seasonally adjusted annual rate"},
    {"series_id": "COMPU5MUSA", "title": "Completions - 5+ Units", "category": "construction_pipeline", "frequency": "monthly", "units": "thousands of units", "seasonal_adjustment": "seasonally adjusted annual rate"},
    {"series_id": "TLRESCONS", "title": "Total Residential Construction Spending", "category": "construction_pipeline", "frequency": "monthly", "units": "millions of dollars", "seasonal_adjustment": "seasonally adjusted annual rate"},
    {"series_id": "PRRESCONS", "title": "Private Residential Construction Spending", "category": "construction_pipeline", "frequency": "monthly", "units": "millions of dollars", "seasonal_adjustment": "seasonally adjusted annual rate"},

    # === D: House Prices & Affordability =====================================
    {"series_id": "MSPUS", "title": "Median Sales Price of Houses Sold", "category": "house_prices", "frequency": "quarterly", "units": "dollars", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "ASPUS", "title": "Average Sales Price of Houses Sold", "category": "house_prices", "frequency": "quarterly", "units": "dollars", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "CSUSHPISA", "title": "S&P/Case-Shiller U.S. National Home Price Index (SA)", "category": "house_prices", "frequency": "monthly", "units": "index jan 2000=100", "seasonal_adjustment": "seasonally adjusted"},
    {"series_id": "CSUSHPINSA", "title": "Case-Shiller U.S. Home Price Index (NSA)", "category": "house_prices", "frequency": "monthly", "units": "index jan 2000=100", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "USSTHPI", "title": "All-Transactions House Price Index (FHFA)", "category": "house_prices", "frequency": "quarterly", "units": "index 1980:Q1=100", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "FIXHAI", "title": "Housing Affordability Index (Fixed)", "category": "house_prices", "frequency": "monthly", "units": "index", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "ASPNHSUS", "title": "Average Sales Price of New Houses Sold", "category": "house_prices", "frequency": "monthly", "units": "dollars", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "MSPNHSUS", "title": "Median Sales Price of New Houses Sold", "category": "house_prices", "frequency": "monthly", "units": "dollars", "seasonal_adjustment": "not seasonally adjusted"},

    # === E: New Construction Sales Activity ==================================
    {"series_id": "HSN1F", "title": "New One-Family Houses Sold", "category": "new_construction_sales", "frequency": "monthly", "units": "thousands", "seasonal_adjustment": "seasonally adjusted annual rate"},
    {"series_id": "NHSDPTS", "title": "New Houses Sold by Stage of Construction", "category": "new_construction_sales", "frequency": "monthly", "units": "thousands", "seasonal_adjustment": "seasonally adjusted annual rate"},
    {"series_id": "HNFSEPUSSA", "title": "New Houses for Sale", "category": "new_construction_sales", "frequency": "monthly", "units": "thousands", "seasonal_adjustment": "seasonally adjusted"},
    {"series_id": "EXHOSLUSM495S", "title": "Existing Home Sales", "category": "new_construction_sales", "frequency": "monthly", "units": "number of units", "seasonal_adjustment": "seasonally adjusted"},

    # === F: Mortgage & Cost Context ==========================================
    {"series_id": "MORTGAGE30US", "title": "30-Year Fixed Rate Mortgage Average", "category": "mortgage_cost_context", "frequency": "weekly", "units": "percent", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "MORTGAGE15US", "title": "15-Year Fixed Rate Mortgage Average", "category": "mortgage_cost_context", "frequency": "weekly", "units": "percent", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "MDSP", "title": "Mortgage Debt Service Payments as % of Disposable Income", "category": "mortgage_cost_context", "frequency": "quarterly", "units": "percent", "seasonal_adjustment": "seasonally adjusted"},
    {"series_id": "CUUR0000SEHA", "title": "CPI - Rent of Primary Residence", "category": "mortgage_cost_context", "frequency": "monthly", "units": "index 1982-84=100", "seasonal_adjustment": "not seasonally adjusted"},
    {"series_id": "CUSR0000SEHC", "title": "CPI - Owners' Equivalent Rent", "category": "mortgage_cost_context", "frequency": "monthly", "units": "index 1982-84=100", "seasonal_adjustment": "seasonally adjusted"},
]

# ---------------------------------------------------------------------------
# Lookup helpers
# ---------------------------------------------------------------------------

SERIES_BY_ID: dict[str, dict[str, Any]] = {s["series_id"]: s for s in HOUSING_SERIES}


def get_series_by_category(category: str) -> list[dict[str, Any]]:
    """Return all series definitions for *category*."""
    return [s for s in HOUSING_SERIES if s["category"] == category]
