"""Treasury Fiscal Data API. No key required."""

from __future__ import annotations

import json
from decimal import Decimal, ROUND_HALF_UP
from urllib.parse import urlencode

from .common import RAW, download, number_text, source_record, utc_now, write_bytes

PUBLISHER = "U.S. Department of the Treasury, Bureau of the Fiscal Service"
API = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service"

MONTHS = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12,
}


def _get_json(url: str) -> dict:
    return json.loads(download(url, timeout=180).decode("utf-8"))


def _paginate(path: str, params: dict) -> list[dict]:
    query = dict(params)
    query["page[size]"] = "10000"
    query["page[number]"] = "1"
    url = f"{API}/{path}?{urlencode(query)}"
    rows: list[dict] = []
    seen_pages = 0
    while url and seen_pages < 30:
        payload = _get_json(url)
        rows.extend(payload.get("data") or [])
        seen_pages += 1
        url = (payload.get("links") or {}).get("next")
    return rows


def _cents(text: str) -> Decimal:
    return Decimal(text).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def fetch() -> tuple[list[dict], list[dict]]:
    retrieved = utc_now()
    sources: list[dict] = []
    series: list[dict] = []

    debt_rows = _paginate(
        "v2/accounting/od/debt_to_penny",
        {"sort": "record_date"},
    )
    if not debt_rows:
        raise RuntimeError("Debt to the Penny returned no rows")
    debt_path = RAW / "treasury" / "debt_to_penny.json"
    write_bytes(debt_path, json.dumps({"data": debt_rows}, ensure_ascii=False).encode("utf-8"))
    sources.append(
        source_record(
            "treasury_debt_to_penny",
            PUBLISHER,
            "Debt to the Penny",
            "https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny",
            debt_path,
            retrieved,
            "treasury_json",
            {
                "api_url": f"{API}/v2/accounting/od/debt_to_penny",
                "fields": {
                    "tot_pub_debt_out_amt": "Total Public Debt Outstanding",
                    "debt_held_public_amt": "Debt Held by the Public",
                    "intragov_hold_amt": "Intragovernmental Holdings",
                },
            },
        )
    )
    by_month: dict[str, dict] = {}
    for row in debt_rows:
        date = row["record_date"]
        month = date[:7]
        if month not in by_month or date > by_month[month]["record_date"]:
            by_month[month] = row
    field_map = {
        "tot_pub_debt_out_amt": ("treasury_debt_total_monthly", "Total Public Debt Outstanding"),
        "debt_held_public_amt": ("treasury_debt_public_monthly", "Debt Held by the Public"),
        "intragov_hold_amt": ("treasury_debt_intragov_monthly", "Intragovernmental Holdings"),
    }
    for field, (series_id, label) in field_map.items():
        points = []
        for month in sorted(by_month):
            row = by_month[month]
            value = number_text(row.get(field))
            if value is None:
                continue
            points.append(
                {
                    "date": month,
                    "value": value,
                    "locator": {"record_date": row["record_date"], "field": field},
                }
            )
        series.append(
            {
                "id": series_id,
                "name": label,
                "units": "Dollars, nominal",
                "adjustment": "not applicable",
                "nominal_or_real": "nominal",
                "frequency": "monthly",
                "source_id": "treasury_debt_to_penny",
                "series_url": "https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny",
                "notes": "Month value is the last Debt to the Penny record in that calendar month.",
                "points": points,
            }
        )

    interest_rows = _paginate(
        "v2/accounting/od/interest_expense",
        {"sort": "record_date"},
    )
    if not interest_rows:
        raise RuntimeError("Interest Expense returned no rows")
    interest_path = RAW / "treasury" / "interest_expense.json"
    write_bytes(interest_path, json.dumps({"data": interest_rows}, ensure_ascii=False).encode("utf-8"))
    sources.append(
        source_record(
            "treasury_interest_expense",
            PUBLISHER,
            "Interest Expense on the Debt Outstanding",
            "https://fiscaldata.treasury.gov/datasets/interest-expense-debt-outstanding/interest-expense-on-the-debt-outstanding",
            interest_path,
            retrieved,
            "treasury_json",
            {"api_url": f"{API}/v2/accounting/od/interest_expense"},
        )
    )
    buckets: dict[str, list[str]] = {}
    for row in interest_rows:
        value = number_text(row.get("month_expense_amt"))
        if value is None:
            continue
        buckets.setdefault(row["record_date"], []).append(value)
    interest_points = []
    for record_date in sorted(buckets):
        total = sum((_cents(item) for item in buckets[record_date]), Decimal("0.00"))
        total = total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        interest_points.append(
            {
                "date": record_date[:7],
                "value": format(total, "f"),
                "locator": {
                    "record_date": record_date,
                    "field": "month_expense_amt",
                    "aggregate": "sum",
                },
            }
        )
    series.append(
        {
            "id": "treasury_interest_expense_monthly",
            "name": "Interest Expense on the Debt Outstanding",
            "units": "Dollars, nominal",
            "adjustment": "not applicable",
            "nominal_or_real": "nominal",
            "frequency": "monthly",
            "source_id": "treasury_interest_expense",
            "series_url": "https://fiscaldata.treasury.gov/datasets/interest-expense-debt-outstanding/interest-expense-on-the-debt-outstanding",
            "notes": "Sum of month_expense_amt across every line on that record date. Lines are the published components. No total line is published in the file.",
            "points": interest_points,
        }
    )

    mts_rows = _paginate("v1/accounting/mts/mts_table_1", {"sort": "record_date"})
    if not mts_rows:
        raise RuntimeError("Monthly Treasury Statement table 1 returned no rows")
    mts_path = RAW / "treasury" / "mts_table_1.json"
    write_bytes(mts_path, json.dumps({"data": mts_rows}, ensure_ascii=False).encode("utf-8"))
    sources.append(
        source_record(
            "treasury_mts_table_1",
            PUBLISHER,
            "Monthly Treasury Statement, Table 1, Summary of Receipts, Outlays, and the Deficit/Surplus of the U.S. Government",
            "https://fiscaldata.treasury.gov/datasets/monthly-treasury-statement/summary-of-receipts-outlays-and-the-deficit-surplus-of-the-u-s-government",
            mts_path,
            retrieved,
            "treasury_json",
            {"api_url": f"{API}/v1/accounting/mts/mts_table_1"},
        )
    )
    mts_points = _latest_mts_months(mts_rows)
    mts_fields = {
        "current_month_gross_rcpt_amt": (
            "treasury_mts_receipts_monthly",
            "Current Month Gross Receipts Amount",
        ),
        "current_month_gross_outly_amt": (
            "treasury_mts_outlays_monthly",
            "Current Month Gross Outlay Amount",
        ),
        "current_month_dfct_sur_amt": (
            "treasury_mts_deficit_surplus_monthly",
            "Current Month Deficit Surplus Amount",
        ),
    }
    for field, (series_id, label) in mts_fields.items():
        points = []
        for item in mts_points:
            value = number_text(item["row"].get(field))
            if value is None:
                continue
            points.append(
                {
                    "date": item["date"],
                    "value": value,
                    "locator": {
                        "record_date": item["row"]["record_date"],
                        "sequence_number_cd": item["row"]["sequence_number_cd"],
                        "field": field,
                    },
                }
            )
        series.append(
            {
                "id": series_id,
                "name": label,
                "units": "Dollars, nominal",
                "adjustment": "not applicable",
                "nominal_or_real": "nominal",
                "frequency": "monthly",
                "source_id": "treasury_mts_table_1",
                "series_url": "https://fiscaldata.treasury.gov/datasets/monthly-treasury-statement/summary-of-receipts-outlays-and-the-deficit-surplus-of-the-u-s-government",
                "notes": "When a calendar month appears on more than one statement, the row from the latest record_date is kept. Current Month Deficit Surplus Amount equals outlays minus receipts on the published rows.",
                "points": points,
            }
        )
    _check_deficit_identity(series)
    return sources, series


def _check_deficit_identity(series: list[dict]) -> None:
    by_id = {item["id"]: item for item in series}
    receipts = {point["date"]: Decimal(point["value"]) for point in by_id["treasury_mts_receipts_monthly"]["points"]}
    outlays = {point["date"]: Decimal(point["value"]) for point in by_id["treasury_mts_outlays_monthly"]["points"]}
    deficit = {point["date"]: Decimal(point["value"]) for point in by_id["treasury_mts_deficit_surplus_monthly"]["points"]}
    shared = sorted(set(receipts) & set(outlays) & set(deficit))
    if not shared:
        raise RuntimeError("Monthly Treasury Statement months did not overlap")
    for date in shared:
        gap = (outlays[date] - receipts[date]) - deficit[date]
        if abs(gap) > Decimal("0.05"):
            raise RuntimeError(f"Deficit field does not equal outlays minus receipts for {date}")


def _latest_mts_months(rows: list[dict]) -> list[dict]:
    by_statement: dict[str, list[dict]] = {}
    for row in rows:
        by_statement.setdefault(row["record_date"], []).append(row)
    chosen: dict[str, dict] = {}
    for record_date, statement_rows in by_statement.items():
        sections: dict[str, int] = {}
        for row in statement_rows:
            if row.get("record_type_cd") == "SL" and str(row.get("classification_desc", "")).startswith("FY "):
                sections[str(row.get("sequence_number_cd"))] = int(str(row["classification_desc"]).replace("FY ", "").strip())
        for row in statement_rows:
            if row.get("record_type_cd") != "MTH":
                continue
            month_name = row.get("classification_desc")
            if month_name not in MONTHS:
                continue
            sequence = str(row.get("sequence_number_cd") or "")
            section = sequence.split(".", 1)[0]
            if section not in sections:
                continue
            fiscal_year = sections[section]
            month = MONTHS[month_name]
            calendar_year = fiscal_year if month <= 9 else fiscal_year - 1
            date = f"{calendar_year:04d}-{month:02d}"
            previous = chosen.get(date)
            if previous is None or record_date > previous["row"]["record_date"]:
                chosen[date] = {"date": date, "row": row}
    return [chosen[key] for key in sorted(chosen)]
