"""Tests for housing series configuration."""

from app.services.housing.series_config import (
    CATEGORIES,
    HOUSING_SERIES,
    SERIES_BY_ID,
    get_series_by_category,
)

REQUIRED_KEYS = {"series_id", "title", "category", "frequency", "units", "seasonal_adjustment"}


def test_all_series_have_required_keys():
    for s in HOUSING_SERIES:
        missing = REQUIRED_KEYS - s.keys()
        assert not missing, f"{s.get('series_id', '?')} missing keys: {missing}"


def test_no_duplicate_series_ids():
    ids = [s["series_id"] for s in HOUSING_SERIES]
    assert len(ids) == len(set(ids)), f"Duplicate IDs: {[x for x in ids if ids.count(x) > 1]}"


def test_all_categories_are_valid():
    for s in HOUSING_SERIES:
        assert s["category"] in CATEGORIES, f"Unknown category: {s['category']}"


def test_series_by_id_count_matches():
    assert len(SERIES_BY_ID) == len(HOUSING_SERIES)


def test_get_series_by_category():
    for cat in CATEGORIES:
        series = get_series_by_category(cat)
        assert len(series) > 0, f"Category {cat} has no series"
        assert all(s["category"] == cat for s in series)


def test_categories_have_title_and_description():
    for key, meta in CATEGORIES.items():
        assert "title" in meta, f"{key} missing title"
        assert "description" in meta, f"{key} missing description"
