"""Bureau of Labor Statistics public time-series files.

These are the same series the BLS Public Data API v1 exposes. The bulk files are
used so the full history is available without a registration key. API v1 without
a key returns a shorter year span.
"""

from __future__ import annotations

from pathlib import Path

from .common import RAW, download, number_text, source_record, utc_now, write_bytes

BLS = "U.S. Bureau of Labor Statistics"
BASE = "https://download.bls.gov/pub/time.series/"

CPI_FILES = {
    "CUUR0000SA0": "cu/cu.data.1.AllItems",
    "CUUR0000SAF1": "cu/cu.data.11.USFoodBeverage",
    "CUUR0000SAH1": "cu/cu.data.12.USHousing",
    "CUUR0000SA0E": "cu/cu.data.20.USCommoditiesServicesSpecial",
    "CUUR0000SAM": "cu/cu.data.15.USMedical",
    "CUUR0000SAE1": "cu/cu.data.17.USEducationAndCommunication",
}

WAGE_FILES = {
    "ce/ce.data.05b.TotalPrivate.AllEmployeeHoursAndEarnings": [
        "CEU0500000003",
        "CEU0500000013",
    ],
    "ce/ce.data.05c.TotalPrivate.ProductionEmployeeHoursAndEarnings": [
        "CEU0500000008",
        "CEU0500000032",
    ],
}

UNEMPLOYMENT_SERIES = "LNS14000000"


def parse_series_file(text: str) -> dict[str, dict]:
    lines = text.splitlines()
    header = lines[0].split("\t")
    header = [cell.strip() for cell in header]
    out: dict[str, dict] = {}
    for line in lines[1:]:
        if not line.strip():
            continue
        parts = [cell.strip() for cell in line.split("\t")]
        if not parts or not parts[0]:
            continue
        row = {header[i]: parts[i] if i < len(parts) else "" for i in range(len(header))}
        out[parts[0]] = row
    return out


def filter_data_lines(payload: bytes, series_ids: set[str]) -> bytes:
    wanted = {sid.encode("ascii") for sid in series_ids}
    header = None
    kept: list[bytes] = []
    for line in payload.splitlines():
        if header is None:
            header = line
            continue
        sid = line.split(b"\t", 1)[0].strip()
        if sid in wanted:
            kept.append(line)
    found = {line.split(b"\t", 1)[0].strip() for line in kept}
    missing = sorted(sid for sid in series_ids if sid.encode("ascii") not in found)
    if header is None or missing:
        raise RuntimeError("BLS file did not contain series: " + ", ".join(missing))
    body = header + b"\n" + b"\n".join(kept) + b"\n"
    return body


def parse_observations(text: str) -> dict[str, list[dict]]:
    lines = text.splitlines()
    grouped: dict[str, list[dict]] = {}
    for line in lines[1:]:
        if not line.strip() or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) < 4:
            continue
        series_id = parts[0].strip()
        year = parts[1].strip()
        period = parts[2].strip()
        value = number_text(parts[3])
        if value is None or not year.isdigit() or not period.startswith("M"):
            continue
        grouped.setdefault(series_id, []).append(
            {"year": year, "period": period, "value": value}
        )
    for rows in grouped.values():
        rows.sort(key=lambda row: (row["year"], row["period"]))
    return grouped


def observations_to_points(rows: list[dict], annual: bool) -> list[dict]:
    points = []
    for row in rows:
        if annual and row["period"] != "M13":
            continue
        if not annual and row["period"] == "M13":
            continue
        if not annual and not (row["period"][1:].isdigit() and 1 <= int(row["period"][1:]) <= 12):
            continue
        if annual:
            date = row["year"]
        else:
            date = f"{row['year']}-{row['period'][1:]}"
        points.append(
            {
                "date": date,
                "value": row["value"],
                "locator": {"year": row["year"], "period": row["period"]},
            }
        )
    return points


def _series_payload(
    series_id: str,
    meta: dict,
    rows: list[dict],
    annual: bool,
    source_id: str,
) -> dict:
    title = meta.get("series_title") or series_id
    base = meta.get("base_period") or ""
    seasonal = meta.get("seasonal") or meta.get("begin_period") or ""
    # cu.series uses seasonal codes U/S. ce.series uses the same field name in a different column.
    seasonal_code = ""
    for key in ("seasonal",):
        if key in meta and meta[key] in {"U", "S"}:
            seasonal_code = meta[key]
    if not seasonal_code:
        # CE files store seasonal in the 5th field, already mapped if the header says so.
        seasonal_code = meta.get("seasonal", "")
    if seasonal_code == "S":
        adjustment = "seasonally adjusted"
    elif seasonal_code == "U":
        adjustment = "not seasonally adjusted"
    else:
        adjustment = meta.get("seasonal") or "see series title"
    if "1982-84" in title or "1982-1984" in title or "1982-84" in base or "1982-1984" in base:
        nominal_or_real = "inflation-adjusted"
    elif base:
        nominal_or_real = "index"
    elif "earnings" in title.lower() and "dollar" in title.lower() and "1982" in title:
        nominal_or_real = "inflation-adjusted"
    elif "earnings" in title.lower():
        nominal_or_real = "nominal"
    elif "unemployment" in title.lower():
        nominal_or_real = "rate"
    else:
        nominal_or_real = "index" if base else "as published"
    units = base if base else "as published by BLS"
    if "earnings" in title.lower() and nominal_or_real == "nominal":
        units = "Dollars"
    if "unemployment" in title.lower():
        units = "Percent"
    points = observations_to_points(rows, annual=annual)
    suffix = "annual" if annual else "monthly"
    return {
        "id": f"bls_{series_id.lower()}_{suffix}",
        "name": title,
        "bls_series_id": series_id,
        "units": units,
        "adjustment": adjustment,
        "nominal_or_real": nominal_or_real,
        "frequency": "annual" if annual else "monthly",
        "source_id": source_id,
        "series_url": f"https://data.bls.gov/timeseries/{series_id}",
        "points": points,
    }


def _write_filtered(url_path: str, series_ids: set[str], dest: Path) -> None:
    payload = download(BASE + url_path, timeout=300)
    filtered = filter_data_lines(payload, series_ids)
    write_bytes(dest, filtered)


def fetch() -> tuple[list[dict], list[dict]]:
    retrieved = utc_now()
    sources: list[dict] = []
    series_out: list[dict] = []

    series_meta_payload = download(BASE + "cu/cu.series", timeout=180)
    series_meta_path = RAW / "bls" / "cu.series.selected.tsv"
    # Keep only the rows this site uses, plus the header, as the snapshot.
    meta = parse_series_file(series_meta_payload.decode("latin1"))
    selected_meta_lines = ["\t".join(series_meta_payload.decode("latin1").splitlines()[0].split("\t"))]
    for sid in list(CPI_FILES) + [
        "CEU0500000003",
        "CEU0500000008",
        "CEU0500000013",
        "CEU0500000032",
        UNEMPLOYMENT_SERIES,
    ]:
        pass
    cu_header = series_meta_payload.decode("latin1").splitlines()[0]
    cu_lines = [cu_header]
    for sid in CPI_FILES:
        if sid not in meta:
            raise RuntimeError(f"Missing BLS series metadata for {sid}")
        for line in series_meta_payload.decode("latin1").splitlines()[1:]:
            if line.split("\t", 1)[0].strip() == sid:
                cu_lines.append(line)
                break
    write_bytes(series_meta_path, ("\n".join(cu_lines) + "\n").encode("utf-8"))
    sources.append(
        source_record(
            "bls_cu_series",
            BLS,
            "CPI series file (cu.series), selected CPI-U series",
            BASE + "cu/cu.series",
            series_meta_path,
            retrieved,
            "bls_series_tsv",
        )
    )

    for sid, url_path in CPI_FILES.items():
        dest = RAW / "bls" / f"{sid}.tsv"
        _write_filtered(url_path, {sid}, dest)
        source_id = f"bls_{sid.lower()}"
        sources.append(
            source_record(
                source_id,
                BLS,
                meta[sid]["series_title"],
                BASE + url_path,
                dest,
                retrieved,
                "bls_tsv",
                {"series_url": f"https://data.bls.gov/timeseries/{sid}", "bls_series_id": sid},
            )
        )
        text = dest.read_text(encoding="utf-8")
        grouped = parse_observations(text)
        rows = grouped[sid]
        # All-items is charted annually and monthly. Components are stored annually;
        # monthly is kept for the all-items 12-month change only.
        series_out.append(_series_payload(sid, meta[sid], rows, annual=True, source_id=source_id))
        if sid == "CUUR0000SA0":
            series_out.append(_series_payload(sid, meta[sid], rows, annual=False, source_id=source_id))

    ce_meta_payload = download(BASE + "ce/ce.series", timeout=180)
    ce_meta = parse_series_file(ce_meta_payload.decode("latin1"))
    wage_ids = ["CEU0500000003", "CEU0500000008", "CEU0500000013", "CEU0500000032"]
    ce_header = ce_meta_payload.decode("latin1").splitlines()[0]
    ce_lines = [ce_header]
    for sid in wage_ids:
        if sid not in ce_meta:
            raise RuntimeError(f"Missing CES series metadata for {sid}")
        for line in ce_meta_payload.decode("latin1").splitlines()[1:]:
            if line.split("\t", 1)[0].strip() == sid:
                ce_lines.append(line)
                break
    ce_meta_path = RAW / "bls" / "ce.series.selected.tsv"
    write_bytes(ce_meta_path, ("\n".join(ce_lines) + "\n").encode("utf-8"))
    sources.append(
        source_record(
            "bls_ce_series",
            BLS,
            "CES series file (ce.series), selected earnings series",
            BASE + "ce/ce.series",
            ce_meta_path,
            retrieved,
            "bls_series_tsv",
        )
    )
    for url_path, ids in WAGE_FILES.items():
        dest = RAW / "bls" / (Path(url_path).name + ".selected.tsv")
        _write_filtered(url_path, set(ids), dest)
        source_id = "bls_" + Path(url_path).name.lower().replace(".", "_")
        titles = "; ".join(ce_meta[sid]["series_title"] for sid in ids)
        sources.append(
            source_record(
                source_id,
                BLS,
                titles,
                BASE + url_path,
                dest,
                retrieved,
                "bls_tsv",
                {"bls_series_ids": ids},
            )
        )
        grouped = parse_observations(dest.read_text(encoding="utf-8"))
        for sid in ids:
            series_out.append(
                _series_payload(sid, ce_meta[sid], grouped[sid], annual=True, source_id=source_id)
            )

    ln_meta_payload = download(BASE + "ln/ln.series", timeout=180)
    ln_meta = parse_series_file(ln_meta_payload.decode("latin1"))
    if UNEMPLOYMENT_SERIES not in ln_meta:
        raise RuntimeError("LNS14000000 was not in ln.series")
    ln_header = ln_meta_payload.decode("latin1").splitlines()[0]
    ln_line = ""
    for line in ln_meta_payload.decode("latin1").splitlines()[1:]:
        if line.split("\t", 1)[0].strip() == UNEMPLOYMENT_SERIES:
            ln_line = line
            break
    ln_meta_path = RAW / "bls" / "ln.series.unemployment.tsv"
    write_bytes(ln_meta_path, (ln_header + "\n" + ln_line + "\n").encode("utf-8"))
    sources.append(
        source_record(
            "bls_ln_series",
            BLS,
            "Labor force series file (ln.series), unemployment rate",
            BASE + "ln/ln.series",
            ln_meta_path,
            retrieved,
            "bls_series_tsv",
        )
    )
    unemp_dest = RAW / "bls" / "LNS14000000.tsv"
    _write_filtered("ln/ln.data.1.AllData", {UNEMPLOYMENT_SERIES}, unemp_dest)
    sources.append(
        source_record(
            "bls_lns14000000",
            BLS,
            ln_meta[UNEMPLOYMENT_SERIES].get("series_title") or "Unemployment Rate",
            BASE + "ln/ln.data.1.AllData",
            unemp_dest,
            retrieved,
            "bls_tsv",
            {
                "series_url": f"https://data.bls.gov/timeseries/{UNEMPLOYMENT_SERIES}",
                "bls_series_id": UNEMPLOYMENT_SERIES,
            },
        )
    )
    grouped = parse_observations(unemp_dest.read_text(encoding="utf-8"))
    series_out.append(
        _series_payload(
            UNEMPLOYMENT_SERIES,
            ln_meta[UNEMPLOYMENT_SERIES],
            grouped[UNEMPLOYMENT_SERIES],
            annual=False,
            source_id="bls_lns14000000",
        )
    )
    return sources, series_out
