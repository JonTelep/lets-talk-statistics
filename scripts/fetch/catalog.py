"""Chart catalog. A chart is included only when every series exists and has points."""

from __future__ import annotations

CHARTS = [
    {
        "id": "cpi-u-all-items",
        "title": "CPI-U, All items",
        "page": "prices",
        "frequency": "annual",
        "shade": "calendar",
        "series": ["bls_cuur0000sa0_annual"],
        "notes": "Annual average (period M13). U.S. city average, all urban consumers, not seasonally adjusted.",
    },
    {
        "id": "cpi-u-12-month-change",
        "title": "CPI-U, All items, 12-month percent change",
        "page": "prices",
        "frequency": "monthly",
        "shade": "month",
        "series": ["cpi_u_all_items_12_month_change"],
        "notes": "Computed from the CPI-U all-items index. Not seasonally adjusted.",
    },
    {
        "id": "cpi-u-components",
        "title": "CPI-U food, shelter, energy, medical care, and education",
        "page": "prices",
        "frequency": "annual",
        "shade": "calendar",
        "series": [
            "bls_cuur0000saf1_annual_rebased",
            "bls_cuur0000sah1_annual_rebased",
            "bls_cuur0000sa0e_annual_rebased",
            "bls_cuur0000sam_annual_rebased",
            "bls_cuur0000sae1_annual_rebased",
        ],
        "notes": "Each line is rebased to 100 in the first year shared by all five series. Published bases differ. Education is December 1997=100. The others shown here are 1982-84=100.",
    },
    {
        "id": "new-home-median-price",
        "title": "Median sales price of new privately owned houses sold",
        "page": "prices",
        "frequency": "annual",
        "shade": "calendar",
        "series": ["census_new_home_median", "census_new_home_median_cpi_u"],
        "notes": "United States. New houses only. The sales price includes the land. The inflation-adjusted line uses CPI-U, base 1982-84=100.",
    },
    {
        "id": "hourly-earnings-all-employees",
        "title": "Average hourly earnings of all employees, total private",
        "page": "economy",
        "frequency": "annual",
        "shade": "calendar",
        "series": ["bls_ceu0500000003_annual", "bls_ceu0500000013_annual"],
        "notes": "Not seasonally adjusted. Annual average (period M13). The inflation-adjusted series is the BLS series in 1982-1984 dollars.",
    },
    {
        "id": "hourly-earnings-production",
        "title": "Average hourly earnings of production and nonsupervisory employees, total private",
        "page": "economy",
        "frequency": "annual",
        "shade": "calendar",
        "series": ["bls_ceu0500000008_annual", "bls_ceu0500000032_annual"],
        "notes": "Not seasonally adjusted. Annual average (period M13). The inflation-adjusted series is the BLS series in 1982-84 dollars.",
    },
    {
        "id": "unemployment-rate",
        "title": "Unemployment rate",
        "page": "economy",
        "frequency": "monthly",
        "shade": "month",
        "series": ["bls_lns14000000_monthly"],
        "notes": "Seasonally adjusted, as published by BLS.",
    },
    {
        "id": "median-household-income",
        "title": "Median household income",
        "page": "economy",
        "frequency": "annual",
        "shade": "calendar",
        "series": ["census_median_income_current", "census_median_income_adjusted"],
        "notes": "All races. Current dollars and the Census 2025-dollar column. That column uses 2025 C-CPI-U for 2000 to 2025 and R-CPI-U-RS before 2000.",
    },
    {
        "id": "gdp",
        "title": "Gross domestic product",
        "page": "economy",
        "frequency": "annual",
        "shade": "calendar",
        "series": ["bea_gdp_nominal", "bea_gdp_real"],
        "notes": "BEA NIPA annual data. Nominal GDP is current dollars. Real GDP is chained 2017 dollars.",
    },
    {
        "id": "debt-to-the-penny",
        "title": "Debt to the Penny",
        "page": "budget",
        "frequency": "monthly",
        "shade": "month",
        "series": [
            "treasury_debt_total_monthly",
            "treasury_debt_public_monthly",
            "treasury_debt_intragov_monthly",
        ],
        "notes": "Last Debt to the Penny record in each calendar month. Nominal dollars.",
    },
    {
        "id": "mts-receipts-outlays",
        "title": "Monthly receipts, outlays, and deficit or surplus",
        "page": "budget",
        "frequency": "monthly",
        "shade": "month",
        "series": [
            "treasury_mts_receipts_monthly",
            "treasury_mts_outlays_monthly",
            "treasury_mts_deficit_surplus_monthly",
        ],
        "notes": "Monthly Treasury Statement Table 1. The deficit or surplus field equals outlays minus receipts. Nominal dollars.",
    },
    {
        "id": "interest-expense",
        "title": "Interest expense on the debt outstanding",
        "page": "budget",
        "frequency": "monthly",
        "shade": "month",
        "series": ["treasury_interest_expense_monthly"],
        "notes": "Sum of the published monthly component lines. Nominal dollars.",
    },
    {
        "id": "omb-receipts-outlays",
        "title": "Receipts, outlays, and surplus or deficit",
        "page": "budget",
        "frequency": "fiscal_year",
        "shade": "fiscal",
        "series": ["omb_receipts", "omb_outlays", "omb_deficit"],
        "notes": "OMB Historical Table 1.1. Total, in millions of dollars. Single fiscal years only. Budget figures before 1933 use the Administrative Budget.",
    },
    {
        "id": "omb-share-of-gdp",
        "title": "Receipts, outlays, and surplus or deficit as percentages of GDP",
        "page": "budget",
        "frequency": "fiscal_year",
        "shade": "fiscal",
        "series": ["omb_receipts_pct_gdp", "omb_outlays_pct_gdp", "omb_deficit_pct_gdp"],
        "notes": "OMB Historical Table 1.2.",
    },
    {
        "id": "omb-constant-dollars",
        "title": "Receipts, outlays, and surplus or deficit in constant FY 2017 dollars",
        "page": "budget",
        "frequency": "fiscal_year",
        "shade": "fiscal",
        "series": ["omb_receipts_fy2017", "omb_outlays_fy2017", "omb_deficit_fy2017"],
        "notes": "OMB Historical Table 1.3. Billions of constant FY 2017 dollars.",
    },
    {
        "id": "omb-outlays-by-function",
        "title": "Outlays by function",
        "page": "budget",
        "frequency": "fiscal_year",
        "shade": "fiscal",
        "series": [
            "omb_fn_defense",
            "omb_fn_human",
            "omb_fn_physical",
            "omb_fn_interest",
            "omb_fn_other",
        ],
        "notes": "OMB Historical Table 3.1, millions of dollars. Estimate columns are omitted. Labels are the table labels.",
    },
    {
        "id": "omb-outlays-by-function-gdp",
        "title": "Outlays by function as percentages of GDP",
        "page": "budget",
        "frequency": "fiscal_year",
        "shade": "fiscal",
        "series": [
            "omb_fn_defense_pct_gdp",
            "omb_fn_human_pct_gdp",
            "omb_fn_physical_pct_gdp",
            "omb_fn_interest_pct_gdp",
            "omb_fn_other_pct_gdp",
        ],
        "notes": "OMB Historical Table 3.1, as percentages of GDP. Estimate columns are omitted.",
    },
    {
        "id": "omb-debt-dollars",
        "title": "Federal debt at the end of the year",
        "page": "budget",
        "frequency": "fiscal_year",
        "shade": "fiscal",
        "series": ["omb_debt_gross", "omb_debt_public"],
        "notes": "OMB Historical Table 7.1. Millions of dollars.",
    },
    {
        "id": "omb-debt-share",
        "title": "Federal debt at the end of the year as a percentage of GDP",
        "page": "budget",
        "frequency": "fiscal_year",
        "shade": "fiscal",
        "series": ["omb_debt_gross_pct_gdp", "omb_debt_public_pct_gdp"],
        "notes": "OMB Historical Table 7.1. Percent of GDP.",
    },
    {
        "id": "lawful-permanent-residents",
        "title": "Persons obtaining lawful permanent resident status",
        "page": "immigration",
        "frequency": "fiscal_year",
        "shade": "fiscal",
        "series": ["dhs_lpr_table1"],
        "notes": "DHS Yearbook of Immigration Statistics, Table 1. Fiscal years. OHSS rounds cells to the nearest 10. The 1976 row covers 15 months. Shading uses October 1, the same fiscal year rule as the other charts on this site.",
    },
    {
        "id": "cbp-nationwide-encounters",
        "title": "CBP nationwide encounters",
        "page": "immigration",
        "frequency": "monthly",
        "shade": "month",
        "series": ["cbp_nationwide_encounters_monthly"],
        "notes": "Sum of the Encounter Count column in each CBP nationwide encounters workbook. October of a fiscal year is October of the previous calendar year. Repeated rows in a file stay in the sum.",
    },
    {
        "id": "us-electricity-generation-shares",
        "title": "United States: electricity net generation shares by source",
        "page": "energy",
        "frequency": "annual",
        "shade": "calendar",
        "type": "stacked",
        "series": [
            "eia_us_share_coal",
            "eia_us_share_natural_gas",
            "eia_us_share_nuclear",
            "eia_us_share_hydro",
            "eia_us_share_wind",
            "eia_us_share_solar",
            "eia_us_share_petroleum",
            "eia_us_share_other",
        ],
        "notes": (
            "Annual percent of U.S. electricity net generation. "
            "Coal, natural gas, nuclear, conventional hydroelectric, wind, petroleum, and TOTAL.ELETPUS "
            "are all-sectors series in the EIA Monthly Energy Review bulk file. "
            "Solar is TOTAL.SOTEPUS (Solar Electricity Net Generation), which includes estimated small-scale solar. "
            "The total is TOTAL.ELETPUS plus TOTAL.SOTEPUS minus TOTAL.SOETPUS when both solar series are published for that year, "
            "so small-scale solar is included once. "
            "Other is that total minus the named sources published for that year. "
            "An NA source is omitted and is not subtracted. "
            "Shares are rounded half up to 3 decimals and can sum to a number other than 100."
        ),
    },
]


def _country_charts(series_by_id: dict[str, dict]) -> list[dict]:
    charts = []
    for series_id, series in series_by_id.items():
        if not series_id.startswith("eia_intl_gen_"):
            continue
        if not series.get("points"):
            continue
        code = series.get("country_code")
        name = series.get("country_name")
        if not code or not name:
            continue
        shade = "calendar" if code == "USA" else "none"
        charts.append(
            {
                "id": f"electricity-generation-{code.lower()}",
                "title": f"{name}: electricity generation, TWh",
                "page": "energy",
                "frequency": "annual",
                "shade": shade,
                "type": "line",
                "country_code": code,
                "country_name": name,
                "series": [series_id],
                "notes": (
                    "EIA International Energy Data, electricity net generation, billion kilowatthours. "
                    "1 billion kilowatthours = 1 terawatthour. Annual."
                ),
            }
        )
        person_id = f"eia_intl_kwh_person_{code}"
        person = series_by_id.get(person_id)
        if person and person.get("points"):
            charts.append(
                {
                    "id": f"electricity-per-person-{code.lower()}",
                    "title": f"{name}: electricity generation per person, kWh",
                    "page": "energy",
                    "frequency": "annual",
                    "shade": shade,
                    "type": "line",
                    "markers": "peak_1970_latest",
                    "country_code": code,
                    "country_name": name,
                    "series": [person_id],
                    "notes": (
                        "Kilowatthours per person equal EIA electricity net generation in billion kilowatthours, "
                        "times 1,000,000,000, divided by the World Bank midyear population for that country code and year "
                        "(SP.POP.TOTL). Rounded half up to the nearest kilowatthour. "
                        "A year is omitted when either value is missing. "
                        "Labels mark the earliest year of the maximum value and the latest year. "
                        "When the series contains a year from 1960 to 1979, that label is 1970 if 1970 is published, "
                        "otherwise the earliest published year in that span."
                    ),
                }
            )
    charts.sort(key=lambda chart: chart["title"].casefold())
    return charts


def build(series_by_id: dict[str, dict]) -> tuple[list[dict], list[dict]]:
    charts = []
    skipped = []
    for chart in CHARTS:
        missing = [sid for sid in chart["series"] if sid not in series_by_id or not series_by_id[sid].get("points")]
        if missing:
            skipped.append(
                {
                    "id": chart["id"],
                    "dataset": chart["title"],
                    "url": "",
                    "reason": "Chart omitted because these series had no points: " + ", ".join(missing),
                }
            )
            continue
        charts.append(chart)
    charts.extend(_country_charts(series_by_id))
    return charts, skipped
