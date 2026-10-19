"""Each chart has a share image rendered from the saved series."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_every_chart_has_a_png():
    site = json.loads((ROOT / "frontend" / "data" / "site.json").read_text(encoding="utf-8"))
    missing = [
        chart["id"]
        for chart in site["charts"]
        if not (ROOT / "frontend" / "public" / "charts" / f"{chart['id']}.png").is_file()
    ]
    assert missing == []
