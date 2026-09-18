from __future__ import annotations

from backend.config import SECTOR_FRESHNESS_THRESHOLDS_DAYS


def check_freshness(outcome_data_freshness_days: int, sector: str) -> bool:
    threshold = SECTOR_FRESHNESS_THRESHOLDS_DAYS.get(sector)
    if threshold is None:
        raise ValueError(f"No freshness threshold configured for sector: {sector}")
    return outcome_data_freshness_days > threshold

