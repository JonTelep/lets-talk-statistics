"""Fetch official sources and write data/ plus frontend/data/site.json."""

from __future__ import annotations

import traceback

from .bea import fetch as fetch_bea
from .bls import fetch as fetch_bls
from .catalog import build as build_charts
from .census import fetch as fetch_census
from .common import DATA, NORMALIZED, SITE_JSON, utc_now, write_json
from .derive import rebase_to_common_year, real_home_price, twelve_month_change
from .omb import fetch as fetch_omb
from .immigration import fetch as fetch_immigration
from .optional import collect_todos
from .presidents import payload as presidents_payload
from .treasury import fetch as fetch_treasury


def _run(name: str, func):
    try:
        sources, series = func()
        print(f"ok {name}: {len(series)} series")
        return sources, series, None
    except Exception as exc:  # noqa: BLE001
        print(f"FAIL {name}: {exc}")
        traceback.print_exc()
        return [], [], {
            "id": name,
            "dataset": name,
            "url": "",
            "reason": f"Fetch failed ({exc.__class__.__name__}: {exc}). Charts from this source are omitted.",
        }


def main() -> None:
    all_sources: list[dict] = []
    all_series: list[dict] = []
    todos: list[dict] = []
    for name, func in (
        ("bls", fetch_bls),
        ("treasury", fetch_treasury),
        ("omb", fetch_omb),
        ("bea", fetch_bea),
        ("census", fetch_census),
    ):
        sources, series, todo = _run(name, func)
        all_sources.extend(sources)
        all_series.extend(series)
        if todo:
            todos.append(todo)

    im_sources, im_series, im_todos = fetch_immigration()
    all_sources.extend(im_sources)
    all_series.extend(im_series)

    by_id = {item["id"]: item for item in all_series}
    if "bls_cuur0000sa0_monthly" in by_id:
        derived = twelve_month_change(by_id["bls_cuur0000sa0_monthly"])
        by_id[derived["id"]] = derived
    component_ids = [
        "bls_cuur0000saf1_annual",
        "bls_cuur0000sah1_annual",
        "bls_cuur0000sa0e_annual",
        "bls_cuur0000sam_annual",
        "bls_cuur0000sae1_annual",
    ]
    if all(sid in by_id for sid in component_ids):
        for derived in rebase_to_common_year([by_id[sid] for sid in component_ids]):
            by_id[derived["id"]] = derived
    if "census_new_home_median" in by_id and "bls_cuur0000sa0_annual" in by_id:
        derived = real_home_price(by_id["census_new_home_median"], by_id["bls_cuur0000sa0_annual"])
        by_id[derived["id"]] = derived

    charts, skipped = build_charts(by_id)
    todos.extend(skipped)
    todos.extend(collect_todos(bea_ok="bea_gdp_nominal" in by_id))
    todos.extend(im_todos)

    generated_at = utc_now()
    manifest = {"generated_at": generated_at, "sources": all_sources}
    write_json(DATA / "manifest.json", manifest)
    write_json(DATA / "todos.json", todos)
    write_json(DATA / "annotations" / "presidents.json", presidents_payload())
    write_json(NORMALIZED / "charts.json", {"charts": charts})
    for series in by_id.values():
        write_json(NORMALIZED / "series" / f"{series['id']}.json", series)

    site_sources = []
    for source in all_sources:
        site_sources.append(
            {
                "id": source["id"],
                "publisher": source["publisher"],
                "title": source["title"],
                "url": source["url"],
                "retrieved_at": source["retrieved_at"],
                "sha256": source["sha256"],
                "series_url": source.get("series_url") or source.get("page_url") or source["url"],
            }
        )
    site = {
        "generated_at": generated_at,
        "presidents": presidents_payload(),
        "todos": todos,
        "sources": site_sources,
        "series": by_id,
        "charts": charts,
    }
    write_json(SITE_JSON, site)
    print(f"charts {len(charts)} todos {len(todos)} series {len(by_id)}")


if __name__ == "__main__":
    main()
