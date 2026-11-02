"""U.S. and international electricity generation from EIA bulk files, plus World Bank population.

No API key. The U.S. source series come from the Monthly Energy Review bulk file
(TOTAL.zip). Country generation comes from the international bulk file (INTL.zip).
Population is World Bank SP.POP.TOTL.

Small-scale solar is in TOTAL.SOTEPUS and not in TOTAL.ELETPUS. The U.S. total
used here is TOTAL.ELETPUS + TOTAL.SOTEPUS - TOTAL.SOETPUS when both solar series
publish a number for that year. That total matches EIA international net
generation for the United States in billion kilowatthours.
"""

from __future__ import annotations

import csv
import io
import json
import re
from decimal import Decimal, ROUND_HALF_UP

from .catalog import build as build_charts
from .common import DATA, NORMALIZED, RAW, SITE_JSON, download, load_json, rel, sha256_file, source_record, utc_now, write_bytes, write_json

EIA = "U.S. Energy Information Administration"
WORLD_BANK = "World Bank"

TOTAL_URL = "https://www.eia.gov/opendata/bulk/TOTAL.zip"
INTL_URL = "https://www.eia.gov/opendata/bulk/INTL.zip"
POP_URL = "https://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=csv"

MER_PAGE = "https://www.eia.gov/totalenergy/data/browser/index.php?tbl=T07.02A"
INTL_PAGE = "https://www.eia.gov/international/data/world/electricity/electricity-generation"
POP_PAGE = "https://data.worldbank.org/indicator/SP.POP.TOTL"

TOTAL_SOURCE = "eia_total_bulk"
INTL_SOURCE = "eia_intl_bulk"
POP_SOURCE = "worldbank_sp_pop_totl"

# All-sectors net generation lines in the Monthly Energy Review bulk file.
US_LEVELS = (
    ("eia_us_gen_coal", "Coal", "TOTAL.CLETPUS.A", "Electricity Net Generation From Coal, All Sectors"),
    ("eia_us_gen_natural_gas", "Natural gas", "TOTAL.NGETPUS.A", "Electricity Net Generation From Natural Gas, All Sectors"),
    ("eia_us_gen_nuclear", "Nuclear", "TOTAL.NUETPUS.A", "Electricity Net Generation From Nuclear Electric Power, All Sectors"),
    ("eia_us_gen_hydro", "Conventional hydroelectric", "TOTAL.HVETPUS.A", "Electricity Net Generation From Conventional Hydroelectric Power, All Sectors"),
    ("eia_us_gen_wind", "Wind", "TOTAL.WYETPUS.A", "Electricity Net Generation From Wind, All Sectors"),
    ("eia_us_gen_solar", "Solar", "TOTAL.SOTEPUS.A", "Solar Electricity Net Generation"),
    ("eia_us_gen_petroleum", "Petroleum", "TOTAL.PAETPUS.A", "Electricity Net Generation From Petroleum, All Sectors"),
    ("eia_us_gen_all_sectors", "All sectors total", "TOTAL.ELETPUS.A", "Electricity Net Generation Total (including from sources not shown), All Sectors"),
    ("eia_us_gen_solar_all_sectors", "Solar, all sectors", "TOTAL.SOETPUS.A", "Electricity Net Generation From Solar, All Sectors"),
)

SHARE_ORDER = (
    "eia_us_gen_coal",
    "eia_us_gen_natural_gas",
    "eia_us_gen_nuclear",
    "eia_us_gen_hydro",
    "eia_us_gen_wind",
    "eia_us_gen_solar",
    "eia_us_gen_petroleum",
)

RESIDUAL_PARTS = SHARE_ORDER

PLACE_RE = re.compile(r"^Electricity net generation, (.+), Annual$")
SERIES_RE = re.compile(r"^INTL\.2-12-([A-Z0-9]+)-BKWH\.A$")
COUNTRY_RE = re.compile(r"^[A-Z]{3}$")
REQUIRED = ("USA", "GBR", "DEU", "FRA", "JPN", "CHN", "IND", "CAN")


def _q(value: Decimal, places: str) -> str:
    return format(value.quantize(Decimal(places), rounding=ROUND_HALF_UP), "f")


def _json_loads(line: str) -> dict:
    return json.loads(line, parse_float=Decimal)


def _number_token(value: object) -> str | None:
    if isinstance(value, bool) or value is None or isinstance(value, str):
        return None
    if isinstance(value, int):
        return str(value)
    if isinstance(value, Decimal):
        return format(value, "f")
    return None


def _year_map(obj: dict) -> dict[str, str]:
    found = {}
    for year, value in obj.get("data") or []:
        token = _number_token(value)
        if token is None:
            continue
        found[str(year)] = token
    return found


def _points(year_values: dict[str, str], locator_extra: dict) -> list[dict]:
    points = []
    for year in sorted(year_values):
        locator = {"year": year}
        locator.update(locator_extra)
        points.append({"date": year, "value": year_values[year], "locator": locator})
    return points


def _span_note(points: list[dict]) -> str:
    if not points:
        return "No published number in this file."
    return f"Published years in this file run from {points[0]['date']} to {points[-1]['date']}."


def _read_zip_text(payload: bytes, suffix: str) -> str:
    import zipfile

    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        name = next(item for item in archive.namelist() if item.endswith(suffix))
        return archive.read(name).decode("utf-8")


def _index_total(payload: bytes) -> dict[str, dict]:
    text = _read_zip_text(payload, "TOTAL.txt")
    wanted = {row[2] for row in US_LEVELS}
    found = {}
    for line in text.splitlines():
        if not line.startswith("{") or "TOTAL." not in line:
            continue
        if not any(series_id in line for series_id in wanted):
            continue
        obj = _json_loads(line)
        series_id = obj.get("series_id")
        if series_id in wanted:
            found[series_id] = obj
    missing = sorted(wanted - set(found))
    if missing:
        raise RuntimeError("Monthly Energy Review bulk file is missing " + ", ".join(missing))
    return found


def _us_series(objects: dict[str, dict]) -> list[dict]:
    levels = {}
    series = []
    for series_key, label, eia_id, official_name in US_LEVELS:
        obj = objects[eia_id]
        if obj.get("units") != "Million Kilowatthours":
            raise RuntimeError(f"{eia_id} units were {obj.get('units')}")
        if obj.get("f") != "A":
            raise RuntimeError(f"{eia_id} is not annual")
        if official_name not in str(obj.get("name")):
            raise RuntimeError(f"{eia_id} name was {obj.get('name')}")
        values = _year_map(obj)
        if not values:
            raise RuntimeError(f"{eia_id} has no numbers")
        points = _points(values, {"series_id": eia_id})
        levels[series_key] = {point["date"]: Decimal(point["value"]) for point in points}
        note = f"EIA bulk series {eia_id}, {obj.get('name')}. Annual. {_span_note(points)}"
        if eia_id == "TOTAL.SOTEPUS.A":
            note += " This series includes estimated small-scale solar."
        if eia_id == "TOTAL.SOETPUS.A":
            note += " This line is inside TOTAL.ELETPUS. It is an input to the total, not a separate share."
        if eia_id == "TOTAL.ELETPUS.A":
            note += " Small-scale solar from TOTAL.SOTEPUS is not included in this line."
        series.append(
            {
                "id": series_key,
                "name": label,
                "units": "Million Kilowatthours",
                "adjustment": "annual",
                "nominal_or_real": "generation",
                "frequency": "annual",
                "source_id": TOTAL_SOURCE,
                "series_url": MER_PAGE,
                "eia_series_id": eia_id,
                "notes": note,
                "points": points,
            }
        )

    solar_years = set(levels["eia_us_gen_solar"])
    solar_all_years = set(levels["eia_us_gen_solar_all_sectors"])
    if solar_years != solar_all_years:
        raise RuntimeError("TOTAL.SOTEPUS and TOTAL.SOETPUS do not cover the same years")

    total_points = []
    base = levels["eia_us_gen_all_sectors"]
    solar = levels["eia_us_gen_solar"]
    solar_all = levels["eia_us_gen_solar_all_sectors"]
    for year in sorted(base):
        if year in solar and year in solar_all:
            value = base[year] + solar[year] - solar_all[year]
        else:
            value = base[year]
        total_points.append(
            {
                "date": year,
                "value": _q(value, "0.001"),
                "locator": {"formula": "ELETPUS + SOTEPUS - SOETPUS", "year": year},
            }
        )
    total_by_year = {point["date"]: Decimal(point["value"]) for point in total_points}
    series.append(
        {
            "id": "eia_us_gen_total",
            "name": "Total",
            "units": "Million Kilowatthours",
            "adjustment": "annual",
            "nominal_or_real": "generation",
            "frequency": "annual",
            "source_id": TOTAL_SOURCE,
            "series_url": MER_PAGE,
            "derived": True,
            "formula": "us_total_with_small_scale_solar",
            "inputs": ["eia_us_gen_all_sectors", "eia_us_gen_solar", "eia_us_gen_solar_all_sectors"],
            "notes": (
                "TOTAL.ELETPUS plus TOTAL.SOTEPUS minus TOTAL.SOETPUS when both solar series "
                "publish a number for that year. Otherwise TOTAL.ELETPUS. "
                "Rounded half up to 3 decimals. "
                "The subtraction removes the all-sectors solar already inside TOTAL.ELETPUS "
                "so small-scale solar is added once."
            ),
            "points": total_points,
        }
    )

    other_points = []
    for year in sorted(total_by_year):
        named = Decimal(0)
        for part in RESIDUAL_PARTS:
            if year in levels[part]:
                named += levels[part][year]
        other_points.append(
            {
                "date": year,
                "value": _q(total_by_year[year] - named, "0.001"),
                "locator": {"formula": "total - named sources", "year": year},
            }
        )
    series.append(
        {
            "id": "eia_us_gen_other",
            "name": "Other",
            "units": "Million Kilowatthours",
            "adjustment": "annual",
            "nominal_or_real": "generation",
            "frequency": "annual",
            "source_id": TOTAL_SOURCE,
            "series_url": MER_PAGE,
            "derived": True,
            "formula": "us_generation_residual",
            "inputs": ["eia_us_gen_total", *RESIDUAL_PARTS],
            "notes": (
                "Total minus coal, natural gas, nuclear, conventional hydroelectric, wind, solar, "
                "and petroleum in the years those series publish a number. "
                "An NA source is not subtracted. Rounded half up to 3 decimals. "
                "Pumped storage, wood, waste, geothermal, and other gases stay in this remainder "
                "because they are not separate lines on the chart."
            ),
            "points": other_points,
        }
    )

    share_inputs = {
        "eia_us_gen_coal": "eia_us_share_coal",
        "eia_us_gen_natural_gas": "eia_us_share_natural_gas",
        "eia_us_gen_nuclear": "eia_us_share_nuclear",
        "eia_us_gen_hydro": "eia_us_share_hydro",
        "eia_us_gen_wind": "eia_us_share_wind",
        "eia_us_gen_solar": "eia_us_share_solar",
        "eia_us_gen_petroleum": "eia_us_share_petroleum",
        "eia_us_gen_other": "eia_us_share_other",
    }
    labels = {item["id"]: item["name"] for item in series}
    eia_ids = {series_key: eia_id for series_key, _label, eia_id, _name in US_LEVELS}
    other_by_year = {point["date"]: Decimal(point["value"]) for point in other_points}
    level_values = dict(levels)
    level_values["eia_us_gen_other"] = other_by_year
    for level_id, share_id in share_inputs.items():
        points = []
        for year in sorted(level_values[level_id]):
            if year not in total_by_year or total_by_year[year] == 0:
                continue
            share = level_values[level_id][year] / total_by_year[year] * Decimal(100)
            points.append(
                {
                    "date": year,
                    "value": _q(share, "0.001"),
                    "locator": {"formula": "source / total * 100", "year": year},
                }
            )
        numerator = eia_ids.get(level_id, "the residual series")
        series.append(
            {
                "id": share_id,
                "name": labels[level_id],
                "units": "Percent",
                "adjustment": "annual",
                "nominal_or_real": "share",
                "frequency": "annual",
                "source_id": TOTAL_SOURCE,
                "series_url": MER_PAGE,
                "derived": True,
                "formula": "share_of_total",
                "inputs": [level_id, "eia_us_gen_total"],
                "notes": (
                    f"{labels[level_id]} ({numerator}) divided by the total series, times 100. "
                    "Rounded half up to 3 decimals."
                ),
                "points": points,
            }
        )
    return series


def _check_us_total_matches_international(total_series: dict, usa: dict[str, str]) -> None:
    solar_years = set()
    # The guard compares the unrounded identity, so recompute from the stored inputs is not enough.
    # Caller passes the international map. This function checks the stored total / 1000.
    by_year = {point["date"]: Decimal(point["value"]) for point in total_series["points"]}
    for year, token in usa.items():
        if year not in by_year:
            raise RuntimeError(f"EIA international United States generation has {year}, and the Monthly Energy Review total does not")
        derived_bkwh = by_year[year] / Decimal(1000)
        intl = Decimal(token)
        if abs(derived_bkwh - intl) > Decimal("0.001"):
            raise RuntimeError(
                f"U.S. total does not match INTL.2-12-USA-BKWH.A in {year}: {derived_bkwh} vs {intl}"
            )
        solar_years.add(year)
    if not solar_years:
        raise RuntimeError("EIA international United States generation has no numbers")


def _world_bank_countries(payload: bytes) -> dict[str, str]:
    import zipfile

    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        name = next(item for item in archive.namelist() if item.startswith("Metadata_Country_"))
        text = archive.read(name).decode("utf-8-sig")
    rows = list(csv.reader(io.StringIO(text)))
    header = rows[0]
    code_i = header.index("Country Code")
    region_i = header.index("Region")
    name_i = header.index("TableName")
    countries = {}
    for row in rows[1:]:
        if len(row) <= name_i or not row[code_i].strip():
            continue
        if row[region_i].strip():
            countries[row[code_i].strip()] = row[name_i].strip()
    if "USA" not in countries or "GBR" not in countries:
        raise RuntimeError("World Bank country metadata did not include USA and GBR")
    return countries


def _population_rows(payload: bytes) -> dict[str, dict[str, str]]:
    import zipfile

    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        name = next(
            item
            for item in archive.namelist()
            if item.startswith("API_SP.POP.TOTL") and "Metadata" not in item
        )
        text = archive.read(name).decode("utf-8-sig")
    lines = text.splitlines()
    start = next(index for index, line in enumerate(lines) if line.startswith('"Country Name"') or line.startswith("Country Name"))
    table = {}
    for row in csv.DictReader(lines[start:]):
        code = (row.get("Country Code") or "").strip()
        indicator = (row.get("Indicator Code") or "").strip()
        if not code or indicator != "SP.POP.TOTL":
            continue
        years = {}
        for key, value in row.items():
            if not key or not key.isdigit():
                continue
            token = (value or "").strip().replace(",", "")
            if not token:
                continue
            try:
                Decimal(token)
            except Exception:
                continue
            years[key] = token
        table[code] = years
    if not table:
        raise RuntimeError("World Bank population file has no SP.POP.TOTL rows")
    return table


def _extract_international(payload: bytes, destination) -> dict[str, dict]:
    import zipfile

    found = {}
    lines_out = []
    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        name = next(item for item in archive.namelist() if item.endswith("INTL.txt"))
        with archive.open(name) as handle:
            for raw in handle:
                line = raw.decode("utf-8").strip()
                if "Electricity net generation," not in line or "billion kilowatthours" not in line:
                    continue
                obj = _json_loads(line)
                if obj.get("units") != "billion kilowatthours" or obj.get("f") != "A":
                    continue
                series_name = obj.get("name") or ""
                if not series_name.startswith("Electricity net generation,"):
                    continue
                series_id = obj.get("series_id") or ""
                if not SERIES_RE.match(series_id):
                    continue
                if series_id in found:
                    raise RuntimeError(f"Duplicate international series {series_id}")
                found[series_id] = obj
                lines_out.append(line)
    if not lines_out:
        raise RuntimeError("International bulk file has no electricity net generation series")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text("\n".join(lines_out) + "\n", encoding="utf-8")
    return found


def _country_series(
    objects: dict[str, dict], populations: dict[str, dict[str, str]], wb_countries: dict[str, str]
) -> tuple[list[dict], dict[str, str]]:
    by_code = {}
    for series_id, obj in objects.items():
        match = SERIES_RE.match(series_id)
        if not match:
            continue
        code = match.group(1)
        if not COUNTRY_RE.match(code):
            continue
        place_match = PLACE_RE.match(obj.get("name") or "")
        if not place_match:
            raise RuntimeError(f"Unexpected series name {obj.get('name')}")
        place = place_match.group(1)
        if any(char in place for char in ("\u2013", "\u2014", "\u2015")):
            raise RuntimeError(f"Series name has a dash that cannot be shown: {place}")
        values = _year_map(obj)
        if not values:
            continue
        by_code[code] = (series_id, place, values)

    missing = [code for code in REQUIRED if code not in by_code]
    if missing:
        raise RuntimeError("International generation is missing " + ", ".join(missing))

    usa_values = by_code["USA"][2]
    series = []
    for code in sorted(by_code, key=lambda item: by_code[item][1].casefold()):
        series_id, place, values = by_code[code]
        points = _points(values, {"series_id": series_id})
        population = populations.get(code) if code in wb_countries else None
        if code not in wb_countries:
            status = "no_world_bank_country"
        else:
            overlap = sorted(set(values) & set(population or {}))
            status = "matched" if overlap else "no_overlapping_year"
        series.append(
            {
                "id": f"eia_intl_gen_{code}",
                "name": "Net generation",
                "units": "billion kilowatthours",
                "adjustment": "annual",
                "nominal_or_real": "generation",
                "frequency": "annual",
                "source_id": INTL_SOURCE,
                "series_url": INTL_PAGE,
                "eia_series_id": series_id,
                "country_code": code,
                "country_name": place,
                "population_status": status,
                "notes": (
                    f"EIA bulk series {series_id}, {place}. Annual. Billion kilowatthours. "
                    f"1 billion kilowatthours = 1 terawatthour. {_span_note(points)}"
                ),
                "points": points,
            }
        )
        if status != "matched":
            continue
        per_points = []
        for year in sorted(set(values) & set(population)):
            per_person = Decimal(values[year]) * Decimal(1000000000) / Decimal(population[year])
            per_points.append(
                {
                    "date": year,
                    "value": _q(per_person, "1"),
                    "locator": {"formula": "billion kWh * 1000000000 / population", "year": year},
                }
            )
        pop_points = _points(population, {"country_code": code})
        series.append(
            {
                "id": f"wb_pop_{code}",
                "name": place,
                "units": "people",
                "adjustment": "midyear",
                "nominal_or_real": "count",
                "frequency": "annual",
                "source_id": POP_SOURCE,
                "series_url": POP_PAGE,
                "country_code": code,
                "country_name": place,
                "notes": (
                    f"World Bank World Development Indicators, SP.POP.TOTL, country code {code}. "
                    f"Midyear population. {_span_note(pop_points)}"
                ),
                "points": pop_points,
            }
        )
        series.append(
            {
                "id": f"eia_intl_kwh_person_{code}",
                "name": "Generation per person",
                "units": "kWh per person",
                "adjustment": "annual",
                "nominal_or_real": "ratio",
                "frequency": "annual",
                "source_id": INTL_SOURCE,
                "source_ids": [INTL_SOURCE, POP_SOURCE],
                "series_url": INTL_PAGE,
                "country_code": code,
                "country_name": place,
                "derived": True,
                "formula": "kwh_per_person",
                "inputs": [f"eia_intl_gen_{code}", f"wb_pop_{code}"],
                "notes": (
                    f"{series_id} in billion kilowatthours, times 1,000,000,000, "
                    f"divided by World Bank SP.POP.TOTL for {code}. "
                    "Rounded half up to the nearest kilowatthour. "
                    f"{_span_note(per_points)}"
                ),
                "points": per_points,
            }
        )
    return series, usa_values


def fetch() -> tuple[list[dict], list[dict], list[dict]]:
    retrieved_total = utc_now()
    total_payload = download(TOTAL_URL, timeout=300)
    total_path = RAW / "eia" / "TOTAL.zip"
    write_bytes(total_path, total_payload)
    total_objects = _index_total(total_payload)
    us_series = _us_series(total_objects)

    retrieved_intl = utc_now()
    intl_payload = download(INTL_URL, timeout=300)
    intl_path = RAW / "eia" / "INTL_electricity_net_generation_bkwh_annual.jsonl"
    intl_objects = _extract_international(intl_payload, intl_path)

    retrieved_pop = utc_now()
    pop_payload = download(POP_URL, timeout=180)
    pop_path = RAW / "worldbank" / "SP.POP.TOTL.zip"
    write_bytes(pop_path, pop_payload)
    populations = _population_rows(pop_payload)
    wb_countries = _world_bank_countries(pop_payload)
    country_series, usa_values = _country_series(intl_objects, populations, wb_countries)

    total_series = next(item for item in us_series if item["id"] == "eia_us_gen_total")
    _check_us_total_matches_international(total_series, usa_values)

    sources = [
        source_record(
            TOTAL_SOURCE,
            EIA,
            "Monthly Energy Review bulk file, electricity net generation (TOTAL.zip)",
            TOTAL_URL,
            total_path,
            retrieved_total,
            "eia_bulk_zip",
            {"series_url": MER_PAGE, "page_url": MER_PAGE},
        ),
        source_record(
            INTL_SOURCE,
            EIA,
            "International Energy Data bulk file, electricity net generation, billion kilowatthours, annual",
            INTL_URL,
            intl_path,
            retrieved_intl,
            "eia_intl_jsonl",
            {
                "series_url": INTL_PAGE,
                "page_url": INTL_PAGE,
                "filter": "INTL.txt lines whose series is annual electricity net generation in billion kilowatthours (INTL.2-12-*-BKWH.A). Lines are copied unchanged.",
            },
        ),
        source_record(
            POP_SOURCE,
            WORLD_BANK,
            "World Development Indicators, Population, total (SP.POP.TOTL)",
            POP_URL,
            pop_path,
            retrieved_pop,
            "worldbank_zip",
            {"series_url": POP_PAGE, "page_url": POP_PAGE},
        ),
    ]
    return sources, us_series + country_series, []


def _site_source(source: dict) -> dict:
    return {
        "id": source["id"],
        "publisher": source["publisher"],
        "title": source["title"],
        "url": source["url"],
        "retrieved_at": source["retrieved_at"],
        "sha256": source["sha256"],
        "series_url": source.get("series_url") or source.get("page_url") or source["url"],
    }


def merge() -> None:
    """Add energy series to the saved bundle without refetching the other sources."""
    sources, series, _todos = fetch()
    manifest = load_json(DATA / "manifest.json")
    site = load_json(SITE_JSON)
    drop_sources = {item["id"] for item in sources}
    prefixes = ("eia_us_", "eia_intl_", "wb_pop_")

    manifest["sources"] = [item for item in manifest["sources"] if item["id"] not in drop_sources]
    manifest["sources"].extend(sources)
    manifest["generated_at"] = utc_now()

    site["sources"] = [item for item in site["sources"] if item["id"] not in drop_sources]
    site["sources"].extend(_site_source(item) for item in sources)
    site["generated_at"] = manifest["generated_at"]

    series_dir = NORMALIZED / "series"
    for path in series_dir.glob("*.json"):
        if path.stem.startswith(prefixes):
            path.unlink()
    for key in [key for key in site["series"] if key.startswith(prefixes)]:
        del site["series"][key]
    for item in series:
        site["series"][item["id"]] = item
        write_json(series_dir / f"{item['id']}.json", item)

    old_ids = {chart["id"] for chart in site["charts"] if chart.get("page") != "energy"}
    charts, skipped = build_charts(site["series"])
    missing = old_ids - {chart["id"] for chart in charts}
    if missing:
        raise RuntimeError("Refresh dropped existing charts: " + ", ".join(sorted(missing)))
    if any(item["id"] in old_ids for item in skipped):
        raise RuntimeError("Existing chart was skipped: " + ", ".join(item["id"] for item in skipped if item["id"] in old_ids))
    if "us-electricity-generation-shares" not in {chart["id"] for chart in charts}:
        raise RuntimeError("U.S. generation share chart was not built")
    site["charts"] = charts
    write_json(DATA / "manifest.json", manifest)
    write_json(NORMALIZED / "charts.json", {"charts": charts})
    write_json(SITE_JSON, site)
    print(f"energy series {len(series)} charts {sum(1 for chart in charts if chart['page'] == 'energy')}")
    print(f"files {rel(RAW / 'eia' / 'TOTAL.zip')} {sha256_file(RAW / 'eia' / 'TOTAL.zip')[:12]}")


if __name__ == "__main__":
    merge()
