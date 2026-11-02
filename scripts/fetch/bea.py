"""BEA National Income and Product Accounts, Section 1, annual GDP."""

from __future__ import annotations

import openpyxl

from .common import RAW, download, is_year, number_text, source_record, utc_now, write_bytes

URL = "https://apps.bea.gov/national/Release/XLS/Survey/Section1All_xls.xlsx"
PAGE = "https://www.bea.gov/data/gdp/gross-domestic-product"
PUBLISHER = "U.S. Bureau of Economic Analysis"


def fetch() -> tuple[list[dict], list[dict]]:
    retrieved = utc_now()
    payload = download(URL, timeout=180)
    path = RAW / "bea" / "Section1All_xls.xlsx"
    write_bytes(path, payload)
    workbook = openpyxl.load_workbook(path, data_only=True, read_only=True)
    specs = [
        (
            "T10105-A",
            "bea_gdp_nominal",
            "Gross domestic product",
            "A191RC",
            "millions of dollars",
            "nominal",
        ),
        (
            "T10106-A",
            "bea_gdp_real",
            "Gross domestic product",
            "A191RX",
            "millions of chained (2017) dollars",
            "inflation-adjusted",
        ),
    ]
    titles = {}
    series = []
    for sheet_name, series_id, line_name, code, units, kind in specs:
        sheet = workbook[sheet_name]
        rows = list(sheet.iter_rows(values_only=True))
        titles[sheet_name] = " ".join(str(rows[0][0]).split())
        unit_line = " ".join(str(rows[1][0]).split())
        if units.split()[0].lower() not in unit_line.lower() and "chained" in units and "chained" not in unit_line.lower():
            raise RuntimeError(f"{sheet_name} units line was {unit_line}")
        if "2017" in units and "2017" not in unit_line:
            raise RuntimeError(f"{sheet_name} did not state the 2017 chain base")
        header_index = next(i for i, row in enumerate(rows) if row and row[0] == "Line")
        header = rows[header_index]
        data = None
        for row in rows[header_index + 1 :]:
            if row and str(row[2]).strip() == code:
                data = row
                break
        if data is None:
            raise RuntimeError(f"{code} was not in {sheet_name}")
        points = []
        for index, year in enumerate(header):
            if not is_year(year):
                continue
            value = number_text(data[index] if index < len(data) else None)
            if value is None:
                continue
            points.append(
                {
                    "date": str(year).strip(),
                    "value": value,
                    "locator": {"sheet": sheet_name, "line_code": code, "column": str(year).strip()},
                }
            )
        series.append(
            {
                "id": series_id,
                "name": line_name,
                "units": unit_line,
                "adjustment": "annual",
                "nominal_or_real": kind,
                "frequency": "annual",
                "source_id": "bea_nipa_section1",
                "series_url": PAGE,
                "notes": f"{titles[sheet_name]} Line code {code}.",
                "points": points,
            }
        )
    workbook.close()
    source = source_record(
        "bea_nipa_section1",
        PUBLISHER,
        "NIPA Section 1, All tables. Table 1.1.5 and Table 1.1.6, annual.",
        URL,
        path,
        retrieved,
        "xlsx",
        {"page_url": PAGE, "sheets": titles},
    )
    return [source], series
