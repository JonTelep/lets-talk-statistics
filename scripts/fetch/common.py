"""Shared download, hashing, and JSON helpers. No statistical values live here."""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"
RAW = DATA / "raw"
NORMALIZED = DATA / "normalized"
SITE_JSON = ROOT / "frontend" / "data" / "site.json"

USER_AGENT = "LetsTalkStatistics/1.0 (+https://letstalkstatistics.com; official-data fetch)"


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def download(url: str, timeout: int = 180) -> bytes:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
    with urlopen(request, timeout=timeout) as response:
        return response.read()


def write_bytes(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(payload)


def write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def load_json(path: Path) -> object:
    return json.loads(path.read_text(encoding="utf-8"))


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def source_record(
    source_id: str,
    publisher: str,
    title: str,
    url: str,
    path: Path,
    retrieved_at: str,
    fmt: str,
    extra: dict | None = None,
) -> dict:
    record = {
        "id": source_id,
        "publisher": publisher,
        "title": title,
        "url": url,
        "retrieved_at": retrieved_at,
        "sha256": sha256_file(path),
        "bytes": path.stat().st_size,
        "path": rel(path),
        "format": fmt,
    }
    if extra:
        record.update(extra)
    return record


def number_text(value: object) -> str | None:
    """Render a parsed number the way it should be stored. None if it is not a number."""
    from decimal import Decimal

    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, int):
        return str(value)
    if isinstance(value, float):
        if value != value:  # NaN
            return None
        text = str(value)
        if text.endswith(".0"):
            text = text[:-2]
    else:
        text = str(value).strip().replace(",", "").replace("$", "")
    if not text or set(text) <= {"."}:
        return None
    try:
        Decimal(text)
    except Exception:
        return None
    return text


def is_year(value: object) -> bool:
    text = str(value).strip() if value is not None else ""
    return len(text) == 4 and text.isdigit()
