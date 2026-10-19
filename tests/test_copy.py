"""User-facing copy does not use em dashes or en dashes."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANNED = ("\u2013", "\u2014", "\u2015")


def test_no_em_or_en_dashes_in_copy():
    paths = [ROOT / "README.md", ROOT / "frontend" / "public" / "llms.txt", ROOT / "frontend" / "data" / "site.json"]
    paths += list((ROOT / "frontend" / "app").rglob("*"))
    paths += list((ROOT / "frontend" / "components").rglob("*"))
    paths += list((ROOT / "frontend" / "lib").rglob("*"))
    offenders = []
    for path in paths:
        if not path.is_file():
            continue
        if path.suffix not in {".md", ".txt", ".json", ".tsx", ".ts"}:
            continue
        text = path.read_text(encoding="utf-8")
        for char in BANNED:
            if char in text:
                offenders.append(f"{path.relative_to(ROOT)} contains U+{ord(char):04X}")
                break
    assert offenders == []
