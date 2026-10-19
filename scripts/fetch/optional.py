"""Sources that need a free API key, or that this network may block.

Missing keys and failed downloads become TODO records. They never become charts.
"""

from __future__ import annotations

import os
from urllib.error import HTTPError, URLError

from .common import download

FRED_NOTE = (
    "FRED_API_KEY is not set, so no FRED series were requested. "
    "Gross domestic product on this site comes from BEA NIPA Tables 1.1.5 and 1.1.6 when that file downloads."
)

FBI_NOTE = (
    "Violent crime and property crime charts are omitted. "
    "The FBI Crime Data Explorer estimated-crimes file is issued through a signed download, "
    "and the api.data.gov Crime Data API requires a key. "
    "Set DATA_GOV_API_KEY or FBI_API_KEY to fetch it on a later run. "
    "In 2021 the FBI completed the transition from the Summary Reporting System to the "
    "National Incident Based Reporting System (NIBRS). Many agencies did not submit a full year of "
    "NIBRS data in 2021. The FBI discusses that break on the Crime Data Explorer. "
    "This site does not fill the gap."
)

DHS_PAGE = "https://ohss.dhs.gov/topics/immigration/yearbook/2024"
CBP_PAGE = "https://www.cbp.gov/document/stats/cbp-data-download-portal-library"


def _key_present(*names: str) -> str | None:
    for name in names:
        value = os.environ.get(name, "").strip()
        if value:
            return name
    return None


def collect_todos(bea_ok: bool) -> list[dict]:
    todos = []
    if _key_present("FRED_API_KEY") is None:
        todos.append(
            {
                "id": "fred",
                "dataset": "FRED",
                "url": "https://fred.stlouisfed.org/",
                "reason": FRED_NOTE if bea_ok else FRED_NOTE + " BEA GDP was also unavailable on this run.",
            }
        )
    if _key_present("DATA_GOV_API_KEY", "FBI_API_KEY") is None:
        todos.append(
            {
                "id": "fbi-ucr",
                "dataset": "FBI Crime Data Explorer, estimated violent and property crime",
                "url": "https://cde.ucr.cjis.gov/LATEST/webapp/#/pages/downloads",
                "reason": FBI_NOTE,
            }
        )
    else:
        todos.append(
            {
                "id": "fbi-ucr",
                "dataset": "FBI Crime Data Explorer, estimated violent and property crime",
                "url": "https://api.usa.gov/crime/fbi/cde/",
                "reason": (
                    "A free api.data.gov key is set, but this refresh does not map the Crime Data API "
                    "response into a chart until the response fields are checked against the FBI data dictionary. "
                    "No crime values were written."
                ),
            }
        )
    todos.extend(_try_immigration())
    return todos


def _try_immigration() -> list[dict]:
    todos = []
    for dataset, url in (
        ("DHS Yearbook of Immigration Statistics, Table 1, Persons Obtaining Lawful Permanent Resident Status", DHS_PAGE),
        ("CBP nationwide encounters", CBP_PAGE),
    ):
        try:
            payload = download(url, timeout=60)
        except HTTPError as exc:
            todos.append(
                {
                    "id": "dhs" if "dhs" in url else "cbp",
                    "dataset": dataset,
                    "url": url,
                    "reason": f"Download failed with HTTP {exc.code}. The chart is omitted.",
                }
            )
            continue
        except URLError as exc:
            todos.append(
                {
                    "id": "dhs" if "dhs" in url else "cbp",
                    "dataset": dataset,
                    "url": url,
                    "reason": f"Download failed ({exc.reason}). The chart is omitted.",
                }
            )
            continue
        except Exception as exc:  # noqa: BLE001 - record the failure, do not invent data
            todos.append(
                {
                    "id": "dhs" if "dhs" in url else "cbp",
                    "dataset": dataset,
                    "url": url,
                    "reason": f"Download failed ({exc.__class__.__name__}). The chart is omitted.",
                }
            )
            continue
        # A successful HTML fetch is not parsed into numbers here unless a workbook link is present.
        # Parsing a partial page into counts would risk a wrong series. Record the gap.
        text = payload[:500].decode("utf-8", errors="replace").lower()
        if "xlsx" not in text and "csv" not in text and b"xlsx" not in payload[:2000]:
            todos.append(
                {
                    "id": "dhs" if "dhs" in url else "cbp",
                    "dataset": dataset,
                    "url": url,
                    "reason": "The page downloaded, but this run did not find a workbook link it could parse without guessing. The chart is omitted.",
                }
            )
        else:
            todos.append(
                {
                    "id": "dhs" if "dhs" in url else "cbp",
                    "dataset": dataset,
                    "url": url,
                    "reason": "The page downloaded, but the workbook parser is not confirmed for this file layout. The chart is omitted rather than guessed.",
                }
            )
    return todos
