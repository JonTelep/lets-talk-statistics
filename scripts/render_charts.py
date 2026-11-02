"""Render one PNG per chart from frontend/data/site.json.

The image plots the same points the page plots. It does not add values.
"""

from __future__ import annotations

import json
import textwrap
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[1]
SITE_PATH = ROOT / "frontend" / "data" / "site.json"
CHART_DIR = ROOT / "frontend" / "public" / "charts"

LINE_COLORS = ["#3b82f6", "#d4d4d4", "#60a5fa", "#a3a3a3", "#93c5fd", "#737373"]
PARTY_COLORS = {
    "Democratic": (37 / 255, 99 / 255, 235 / 255, 0.12),
    "Republican": (220 / 255, 38 / 255, 38 / 255, 0.12),
}


def anchor_date(date: str, shade: str) -> str:
    if shade == "month":
        return f"{date}-01"
    if shade == "calendar":
        return f"{date}-07-01"
    year = int(date)
    return f"{year - 1}-10-01"


def president_on(date: str, shade: str, terms: list[dict]) -> dict | None:
    anchor = anchor_date(date, shade)
    for term in terms:
        if term["start"] <= anchor and (term["end"] is None or anchor < term["end"]):
            return term
    return None


def short_name(name: str) -> str:
    return (
        name.replace(" in U.S. city average, all urban consumers, not seasonally adjusted", "")
        .replace(", total private, not seasonally adjusted", "")
        .replace(", total private, seasonally adjusted", "")
        .replace("(Seas) ", "")
    )


def line_label(series: dict, peers: list[dict]) -> str:
    base = short_name(series["name"])
    duplicates = sum(1 for item in peers if short_name(item["name"]) == base)
    if duplicates > 1:
        return f"{base} ({series['units']})"
    return base


def tick_label(date: str, frequency: str) -> str:
    if frequency == "fiscal_year":
        return f"FY {date}"
    if len(date) == 7:
        return date
    return date


def shade_bands(ax, dates: list[str], shade: str, terms: list[dict]) -> None:
    current = None
    start = 0
    for index, date in enumerate(dates):
        term = president_on(date, shade, terms)
        party = term["party"] if term else None
        if party != current:
            if current:
                ax.axvspan(start - 0.5, index - 0.5, color=PARTY_COLORS[current], lw=0, zorder=0)
            current = party
            start = index
    if current:
        ax.axvspan(start - 0.5, len(dates) - 0.5, color=PARTY_COLORS[current], lw=0, zorder=0)


def compact_tick(value: float, _pos: int) -> str:
    absolute = abs(value)
    sign = "-" if value < 0 else ""
    for size, suffix in ((1e12, "T"), (1e9, "B"), (1e6, "M"), (1e3, "k")):
        if absolute >= size:
            scaled = absolute / size
            digits = 0 if scaled >= 100 else 1
            return f"{sign}{scaled:.{digits}f}{suffix}"
    return f"{sign}{absolute:.1f}"


def render_chart(chart: dict, site: dict, destination: Path) -> None:
    series = [site["series"][sid] for sid in chart["series"]]
    dates = sorted({point["date"] for item in series for point in item["points"]})
    fig = plt.figure(figsize=(12, 6.75), dpi=100, facecolor="#0a0a0a")
    ax = fig.add_axes((0.08, 0.28, 0.88, 0.58))
    ax.set_facecolor("#0a0a0a")
    shade_bands(ax, dates, chart["shade"], site["presidents"]["terms"])
    index = {date: position for position, date in enumerate(dates)}
    for color, item in zip(LINE_COLORS, series):
        lookup = {point["date"]: float(point["value"]) for point in item["points"]}
        xs = [index[point["date"]] for point in item["points"] if point["date"] in index]
        ys = [lookup[point["date"]] for point in item["points"] if point["date"] in index]
        ax.plot(xs, ys, color=color, lw=1.6, label=line_label(item, series), zorder=2)
    step = max(1, len(dates) // 6)
    ticks = list(range(0, len(dates), step))
    ax.set_xticks(ticks)
    ax.set_xticklabels([tick_label(dates[i], chart["frequency"]) for i in ticks], color="#a3a3a3", fontsize=8)
    ax.yaxis.set_major_formatter(plt.FuncFormatter(compact_tick))
    ax.tick_params(axis="y", colors="#a3a3a3", labelsize=8)
    ax.grid(axis="y", color="#222222", lw=0.6)
    for spine in ax.spines.values():
        spine.set_color("#222222")
    legend = ax.legend(loc="upper left", frameon=False, fontsize=8)
    for text in legend.get_texts():
        text.set_color("#e5e5e5")
    ax.set_title(chart["title"], color="#ffffff", loc="left", fontsize=14, pad=12)

    sources = []
    for item in series:
        for source in site["sources"]:
            if source["id"] == item["source_id"] and source not in sources:
                sources.append(source)
    retrieved = ", ".join(sorted({source["retrieved_at"][:10] for source in sources}))
    publishers = ", ".join(dict.fromkeys(source["publisher"] for source in sources))
    units = "; ".join(dict.fromkeys(item["units"] for item in series))
    footer = (
        f"{publishers}. Retrieved {retrieved}. Units: {units}. "
        "Bands mark the president in office. They are not an attribution of cause. "
        f"letstalkstatistics.com/c/{chart['id']}"
    )
    wrapped = "\n".join(textwrap.wrap(footer, width=115))
    fig.text(0.08, 0.03, wrapped, color="#a3a3a3", fontsize=8, va="bottom")
    destination.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(destination, facecolor=fig.get_facecolor())
    plt.close(fig)


def render_home(site: dict, destination: Path) -> None:
    cards = [
        "cpi_u_all_items_12_month_change",
        "treasury_debt_total_monthly",
        "bls_lns14000000_monthly",
        "census_median_income_adjusted",
    ]
    fig = plt.figure(figsize=(12, 6.3), dpi=100, facecolor="#0a0a0a")
    fig.text(0.06, 0.86, "Let's Talk Statistics", color="#ffffff", fontsize=22)
    fig.text(0.06, 0.78, "Latest point in each saved series", color="#a3a3a3", fontsize=11)
    y = 0.62
    for sid in cards:
        series = site["series"].get(sid)
        if not series or not series["points"]:
            continue
        point = series["points"][-1]
        fig.text(0.06, y, series["name"], color="#a3a3a3", fontsize=10)
        fig.text(0.06, y - 0.06, f"{point['value']}  {point['date']}  {series['units']}", color="#ffffff", fontsize=14)
        y -= 0.14
    fig.text(0.06, 0.06, "letstalkstatistics.com", color="#737373", fontsize=10)
    destination.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(destination, facecolor=fig.get_facecolor())
    plt.close(fig)


def main() -> None:
    site = json.loads(SITE_PATH.read_text(encoding="utf-8"))
    for chart in site["charts"]:
        render_chart(chart, site, CHART_DIR / f"{chart['id']}.png")
        print(chart["id"])
    render_home(site, ROOT / "frontend" / "public" / "og-image.png")
    missing = [chart["id"] for chart in site["charts"] if not (CHART_DIR / f"{chart['id']}.png").is_file()]
    if missing:
        raise SystemExit(f"missing images: {missing}")
    for chart in site["charts"]:
        _assert_footer_visible(CHART_DIR / f"{chart['id']}.png")


def _assert_footer_visible(path: Path) -> None:
    image = plt.imread(path)
    gray = image[..., :3].mean(axis=2)
    background = float(gray[0, 0])
    ink_rows = (gray > background + 0.04).any(axis=1)
    last_ink = len(ink_rows) - 1 - int(ink_rows[::-1].argmax())
    if last_ink > len(ink_rows) - 8:
        raise SystemExit(f"footer clipped in {path.name}: last ink row {last_ink} of {len(ink_rows)}")


if __name__ == "__main__":
    main()
