"""Fail if a chart value is not in an official source snapshot."""

from __future__ import annotations

import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
SITE = ROOT / "frontend" / "data" / "site.json"

from scripts.fetch.common import number_text, sha256_file  # noqa: E402


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def q(value: Decimal, places: str) -> str:
    return format(value.quantize(Decimal(places), rounding=ROUND_HALF_UP), "f")


def test_manifest_hashes_match_raw_files():
    manifest = load(DATA / "manifest.json")
    assert manifest["sources"], "manifest has no sources"
    for source in manifest["sources"]:
        path = ROOT / source["path"]
        assert path.is_file(), source["path"]
        assert sha256_file(path) == source["sha256"], source["id"]
        assert source["url"].startswith("https://")
        assert source["retrieved_at"]
        assert source["publisher"]


def test_every_chart_series_traces_to_a_source_record():
    site = load(SITE)
    manifest = {source["id"]: source for source in load(DATA / "manifest.json")["sources"]}
    bls_values = _bls_index(manifest)
    treasury = _treasury_index(manifest)
    workbooks = {}

    for chart in site["charts"]:
        assert chart["series"], chart["id"]
        for series_id in chart["series"]:
            series = site["series"][series_id]
            assert series["points"], series_id
            for point in series["points"]:
                assert _is_number(point["value"]), point
                assert point.get("locator"), (series_id, point)
            if series.get("derived"):
                continue
            source = manifest[series["source_id"]]
            fmt = source["format"]
            if fmt == "bls_tsv":
                for point in series["points"]:
                    key = (series["bls_series_id"], point["locator"]["year"], point["locator"]["period"])
                    assert bls_values[source["id"]][key] == point["value"], (series_id, point)
            elif fmt == "treasury_json":
                for point in series["points"]:
                    assert _treasury_value(treasury[source["id"]], point) == point["value"], (series_id, point)
            elif fmt == "xlsx":
                for point in series["points"]:
                    assert _xlsx_value(workbooks, source, series, point) == point["value"], (series_id, point)
            else:
                raise AssertionError(f"unknown source format {fmt}")


def test_derived_values_recompute_from_source_series():
    site = load(SITE)
    series = site["series"]
    yoy = series["cpi_u_all_items_12_month_change"]
    monthly = {point["date"]: Decimal(point["value"]) for point in series["bls_cuur0000sa0_monthly"]["points"]}
    expected = []
    for date in sorted(monthly):
        year, month = date.split("-")
        prior = f"{int(year) - 1}-{month}"
        if prior not in monthly or monthly[prior] == 0:
            continue
        change = (monthly[date] / monthly[prior] - Decimal(1)) * Decimal(100)
        expected.append((date, q(change, "0.001")))
    assert [(point["date"], point["value"]) for point in yoy["points"]] == expected

    base_year = series["bls_cuur0000saf1_annual_rebased"]["base_year"]
    for source_id, derived_id in (
        ("bls_cuur0000saf1_annual", "bls_cuur0000saf1_annual_rebased"),
        ("bls_cuur0000sah1_annual", "bls_cuur0000sah1_annual_rebased"),
        ("bls_cuur0000sa0e_annual", "bls_cuur0000sa0e_annual_rebased"),
        ("bls_cuur0000sam_annual", "bls_cuur0000sam_annual_rebased"),
        ("bls_cuur0000sae1_annual", "bls_cuur0000sae1_annual_rebased"),
    ):
        raw = {point["date"]: Decimal(point["value"]) for point in series[source_id]["points"]}
        base = raw[base_year]
        got = [(point["date"], point["value"]) for point in series[derived_id]["points"]]
        want = [(year, q(raw[year] / base * Decimal(100), "0.001")) for year in sorted(raw) if year >= base_year]
        assert got == want, derived_id

    prices = {point["date"]: Decimal(point["value"]) for point in series["census_new_home_median"]["points"]}
    cpi = {point["date"]: Decimal(point["value"]) for point in series["bls_cuur0000sa0_annual"]["points"]}
    got = [(point["date"], point["value"]) for point in series["census_new_home_median_cpi_u"]["points"]]
    want = []
    for year in sorted(prices):
        if year in cpi and cpi[year] != 0:
            want.append((year, q(prices[year] * Decimal(100) / cpi[year], "0.01")))
    assert got == want


def test_site_bundle_matches_normalized_files():
    site = load(SITE)
    charts = load(DATA / "normalized" / "charts.json")["charts"]
    assert site["charts"] == charts
    for path in (DATA / "normalized" / "series").glob("*.json"):
        item = load(path)
        assert site["series"][item["id"]]["points"] == item["points"]


def test_no_placeholder_numbers():
    site = load(SITE)
    banned = {"placeholder", "estimated by", "lorem", "todo", "n/a", "null"}
    for series in site["series"].values():
        for point in series["points"]:
            lowered = point["value"].lower()
            assert all(word not in lowered for word in banned)


def _is_number(value: str) -> bool:
    try:
        Decimal(value)
    except Exception:
        return False
    return True


def _bls_index(manifest: dict) -> dict:
    indexed = {}
    for source in manifest.values():
        if source["format"] != "bls_tsv":
            continue
        table = {}
        lines = (ROOT / source["path"]).read_text(encoding="utf-8").splitlines()
        for line in lines[1:]:
            if not line.strip():
                continue
            parts = line.split("\t")
            table[(parts[0].strip(), parts[1].strip(), parts[2].strip())] = parts[3].strip()
        indexed[source["id"]] = table
    return indexed


def _treasury_index(manifest: dict) -> dict:
    indexed = {}
    for source in manifest.values():
        if source["format"] != "treasury_json":
            continue
        indexed[source["id"]] = load(ROOT / source["path"])["data"]
    return indexed


def _treasury_value(rows: list[dict], point: dict) -> str:
    locator = point["locator"]
    if locator.get("aggregate") == "sum":
        total = Decimal("0.00")
        found = False
        for row in rows:
            if row.get("record_date") == locator["record_date"]:
                found = True
                total += Decimal(row[locator["field"]])
        assert found
        return format(total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP), "f")
    matches = [
        row
        for row in rows
        if row.get("record_date") == locator["record_date"]
        and (locator.get("sequence_number_cd") is None or str(row.get("sequence_number_cd")) == str(locator["sequence_number_cd"]))
    ]
    assert len(matches) == 1, locator
    return str(matches[0][locator["field"]])


XLSX_COLUMNS = {
    "omb_receipts": 1,
    "omb_outlays": 2,
    "omb_deficit": 3,
    "omb_gdp": 1,
    "omb_receipts_pct_gdp": 2,
    "omb_outlays_pct_gdp": 3,
    "omb_deficit_pct_gdp": 4,
    "omb_receipts_fy2017": 4,
    "omb_outlays_fy2017": 5,
    "omb_deficit_fy2017": 6,
    "omb_debt_gross": 1,
    "omb_debt_public": 3,
    "omb_debt_gross_pct_gdp": 6,
    "omb_debt_public_pct_gdp": 8,
    "census_median_income_current": 2,
    "census_median_income_adjusted": 3,
    "census_new_home_median": 1,
}


def _xlsx_value(cache: dict, source: dict, series: dict, point: dict) -> str:
    path = str(ROOT / source["path"])
    if path not in cache:
        workbook = openpyxl.load_workbook(path, data_only=True, read_only=True)
        cache[path] = workbook
    workbook = cache[path]
    locator = point["locator"]
    if "line_code" in locator:
        sheet = workbook[locator["sheet"]]
        rows = list(sheet.iter_rows(values_only=True))
        header = next(row for row in rows if row and row[0] == "Line")
        data = next(row for row in rows if row and str(row[2]).strip() == locator["line_code"])
        column = next(index for index, cell in enumerate(header) if str(cell).strip() == locator["column"])
        return number_text(data[column])
    if series["id"] == "census_new_home_median":
        sheet = workbook["Annual"]
        for row in sheet.iter_rows(values_only=True):
            if row and str(row[0]).strip() == point["date"]:
                return number_text(row[1])
        raise AssertionError(point)
    if series["source_id"] == "census_h05":
        column = XLSX_COLUMNS[series["id"]]
        for row in workbook[workbook.sheetnames[0]].iter_rows(values_only=True):
            if row and str(row[0]).strip() == locator["row_label"]:
                return number_text(row[column])
        raise AssertionError(locator)
    if series["source_id"] == "hist03z1":
        sheet = workbook[workbook.sheetnames[0]]
        rows = list(sheet.iter_rows(values_only=True))
        header = rows[1]
        column = next(index for index, cell in enumerate(header) if str(cell).strip() == locator["column"])
        for row in rows:
            label = " ".join(str(row[0]).split()) if row and row[0] is not None else ""
            if label == locator["row_label"] and number_text(row[column]) == point["value"]:
                return point["value"]
        raise AssertionError(locator)
    column = XLSX_COLUMNS[series["id"]]
    for row in workbook[workbook.sheetnames[0]].iter_rows(values_only=True):
        if row and str(row[0]).strip() == point["date"]:
            return number_text(row[column])
    raise AssertionError(point)
