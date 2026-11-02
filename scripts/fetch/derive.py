"""Series computed only from other fetched series. No outside numbers."""

from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP


def _q(value: Decimal, places: str) -> str:
    return format(value.quantize(Decimal(places), rounding=ROUND_HALF_UP), "f")


def twelve_month_change(monthly: dict) -> dict:
    by_date = {point["date"]: Decimal(point["value"]) for point in monthly["points"]}
    points = []
    for date in sorted(by_date):
        year, month = date.split("-")
        prior = f"{int(year) - 1}-{month}"
        if prior not in by_date or by_date[prior] == 0:
            continue
        change = (by_date[date] / by_date[prior] - Decimal(1)) * Decimal(100)
        points.append(
            {
                "date": date,
                "value": _q(change, "0.001"),
                "locator": {"formula": "12-month percent change", "date": date, "prior": prior},
            }
        )
    return {
        "id": "cpi_u_all_items_12_month_change",
        "name": "12-month percent change",
        "units": "Percent",
        "adjustment": monthly["adjustment"],
        "nominal_or_real": "percent change",
        "frequency": "monthly",
        "source_id": monthly["source_id"],
        "series_url": monthly["series_url"],
        "derived": True,
        "inputs": [monthly["id"]],
        "notes": "Computed as (index this month / index 12 months earlier - 1) x 100. Rounded half up to 3 decimals. Not a separately published BLS percent series.",
        "points": points,
    }


def rebase_to_common_year(components: list[dict]) -> list[dict]:
    first = {}
    for series in components:
        years = [point["date"] for point in series["points"]]
        if not years:
            raise RuntimeError(f"{series['id']} has no annual points")
        first[series["id"]] = min(years)
    base_year = max(first.values())
    derived = []
    for series in components:
        by_year = {point["date"]: Decimal(point["value"]) for point in series["points"]}
        base = by_year[base_year]
        points = []
        for year in sorted(by_year):
            if year < base_year or base == 0:
                continue
            rebased = by_year[year] / base * Decimal(100)
            points.append(
                {
                    "date": year,
                    "value": _q(rebased, "0.001"),
                    "locator": {"formula": "rebase", "base_year": base_year, "input": series["id"]},
                }
            )
        derived.append(
            {
                "id": series["id"] + "_rebased",
                "name": series["name"],
                "units": f"Index, {base_year}=100",
                "adjustment": series["adjustment"],
                "nominal_or_real": "index",
                "frequency": "annual",
                "source_id": series["source_id"],
                "series_url": series["series_url"],
                "derived": True,
                "inputs": [series["id"]],
                "base_year": base_year,
                "published_units": series["units"],
                "notes": (
                    f"Published index divided by its {base_year} annual average and multiplied by 100. "
                    f"Published base: {series['units']}. Rounded half up to 3 decimals."
                ),
                "points": points,
            }
        )
    return derived


def real_home_price(prices: dict, cpi: dict) -> dict:
    cpi_by_year = {point["date"]: Decimal(point["value"]) for point in cpi["points"]}
    points = []
    for point in prices["points"]:
        if point["date"] not in cpi_by_year or cpi_by_year[point["date"]] == 0:
            continue
        real = Decimal(point["value"]) * Decimal(100) / cpi_by_year[point["date"]]
        points.append(
            {
                "date": point["date"],
                "value": _q(real, "0.01"),
                "locator": {"formula": "price x 100 / CPI-U", "cpi_series": cpi["id"]},
            }
        )
    return {
        "id": "census_new_home_median_cpi_u",
        "name": "Median sales price, CPI-U adjusted",
        "units": "1982-84 dollars",
        "adjustment": "inflation-adjusted with CPI-U, base 1982-84=100",
        "nominal_or_real": "inflation-adjusted",
        "frequency": "annual",
        "source_id": prices["source_id"],
        "series_url": prices["series_url"],
        "derived": True,
        "inputs": [prices["id"], cpi["id"]],
        "notes": (
            "Median sales price times 100, divided by the CPI-U all-items annual average for that year. "
            "CPI-U base is 1982-84=100. Rounded half up to cents. Census does not publish this adjusted series."
        ),
        "points": points,
    }
