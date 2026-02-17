"""
Named SQL constants for the housing schema.

All queries target the ``housing`` schema and must match the actual column
names in ``housing.series_registry``, ``housing.observations``, and
``housing.sync_log``.
"""

# ---------------------------------------------------------------------------
# series_registry
# ---------------------------------------------------------------------------

UPSERT_SERIES = """
INSERT INTO housing.series_registry
    (series_id, title, category, frequency, units, seasonal_adjustment, last_synced_at)
VALUES ($1, $2, $3, $4, $5, $6, NOW())
ON CONFLICT (series_id) DO UPDATE SET
    title              = EXCLUDED.title,
    category           = EXCLUDED.category,
    frequency          = EXCLUDED.frequency,
    units              = EXCLUDED.units,
    seasonal_adjustment = EXCLUDED.seasonal_adjustment,
    last_synced_at     = NOW()
"""

SELECT_ALL_ACTIVE_SERIES = """
SELECT series_id, title, category, frequency, units, seasonal_adjustment, last_synced_at
FROM housing.series_registry
ORDER BY category, title
"""

SELECT_SERIES_BY_CATEGORY = """
SELECT series_id, title, category, frequency, units, seasonal_adjustment, last_synced_at
FROM housing.series_registry
WHERE category = $1
ORDER BY title
"""

SELECT_LAST_SYNCED_AT = """
SELECT last_synced_at
FROM housing.series_registry
WHERE series_id = $1
"""

# ---------------------------------------------------------------------------
# observations
# ---------------------------------------------------------------------------

UPSERT_OBSERVATIONS = """
INSERT INTO housing.observations (series_id, date, value)
VALUES ($1, $2, $3)
ON CONFLICT (series_id, date) DO UPDATE SET value = EXCLUDED.value
"""

SELECT_OBSERVATIONS = """
SELECT date, value
FROM housing.observations
WHERE series_id = $1
ORDER BY date
"""

SELECT_OBSERVATIONS_RANGE = """
SELECT date, value
FROM housing.observations
WHERE series_id = $1
  AND ($2::date IS NULL OR date >= $2)
  AND ($3::date IS NULL OR date <= $3)
ORDER BY date
"""

SELECT_LATEST_OBSERVATION = """
SELECT date, value
FROM housing.observations
WHERE series_id = $1
ORDER BY date DESC
LIMIT 1
"""

SELECT_OBSERVATIONS_MULTI = """
SELECT series_id, date, value
FROM housing.observations
WHERE series_id = ANY($1)
  AND ($2::date IS NULL OR date >= $2)
  AND ($3::date IS NULL OR date <= $3)
ORDER BY series_id, date
"""

# ---------------------------------------------------------------------------
# sync_log
# ---------------------------------------------------------------------------

INSERT_SYNC_LOG = """
INSERT INTO housing.sync_log
    (run_started_at, run_finished_at, series_synced, observations_upserted, errors, status)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id
"""

SELECT_LATEST_SYNC = """
SELECT id, run_started_at, run_finished_at, series_synced,
       observations_upserted, errors, status
FROM housing.sync_log
ORDER BY run_started_at DESC
LIMIT 1
"""
