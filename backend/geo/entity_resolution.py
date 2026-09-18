from __future__ import annotations

import csv
from functools import lru_cache
from pathlib import Path

from backend.config import RAW_DATA_DIR

ADMIN_UNITS_PATH = RAW_DATA_DIR / "admin_units.csv"
FALLBACK_UNIT = {
    "lgd_code": "UP_DISTRICT_FALLBACK",
    "state": "Uttar Pradesh",
    "district": "Unknown",
    "block": "Unknown",
    "lat": "26.8467",
    "lng": "80.9462",
}


@lru_cache(maxsize=1)
def load_admin_units() -> list[dict]:
    if not ADMIN_UNITS_PATH.exists():
        return []
    with Path(ADMIN_UNITS_PATH).open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def resolve_admin_unit(location_text: str, lat: float, lng: float) -> dict:
    location_lower = location_text.lower()
    units = load_admin_units()
    for unit in units:
        if unit["district"].lower() in location_lower:
            return {
                "lgd_code": unit["lgd_code"],
                "lgd_resolution_method": "exact_match",
                "admin_unit": {
                    "state": unit["state"],
                    "district": unit["district"],
                    "block": unit.get("block") or "Unknown",
                },
            }

    nearest = _nearest_unit(lat, lng, units)
    if nearest:
        return {
            "lgd_code": nearest["lgd_code"],
            "lgd_resolution_method": "district_fallback",
            "admin_unit": {
                "state": nearest["state"],
                "district": nearest["district"],
                "block": nearest.get("block") or "Unknown",
            },
        }

    return {
        "lgd_code": FALLBACK_UNIT["lgd_code"],
        "lgd_resolution_method": "district_fallback",
        "admin_unit": {
            "state": FALLBACK_UNIT["state"],
            "district": FALLBACK_UNIT["district"],
            "block": FALLBACK_UNIT["block"],
        },
    }


def _nearest_unit(lat: float, lng: float, units: list[dict]) -> dict | None:
    best = None
    best_distance = float("inf")
    for unit in units:
        try:
            unit_lat = float(unit.get("lat") or 0)
            unit_lng = float(unit.get("lng") or 0)
        except ValueError:
            continue
        distance = (unit_lat - lat) ** 2 + (unit_lng - lng) ** 2
        if distance < best_distance:
            best = unit
            best_distance = distance
    return best
