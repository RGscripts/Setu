from __future__ import annotations

import math
from datetime import datetime, timedelta
from difflib import SequenceMatcher

from backend.config import (
    DUPLICATE_BURST_WINDOW_HOURS,
    DUPLICATE_THRESHOLD,
    MAX_CHANNELS,
    SIGNAL_FORMULA_VERSION,
    VOLUME_CAP,
)


def band_for_score(score: int) -> str:
    if score >= 70:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"


def compute_signal_confidence(
    channel_count: int,
    persistence_windows: int,
    total_windows: int,
    geographic_spread_score: float,
    report_count: int,
    duplication_penalty: float,
) -> dict:
    if total_windows <= 0:
        raise ValueError("total_windows must be positive")
    if not 0 <= geographic_spread_score <= 1:
        raise ValueError("geographic_spread_score must be between 0 and 1")
    if not 0 <= duplication_penalty <= 1:
        raise ValueError("duplication_penalty must be between 0 and 1")

    channel_diversity = min(channel_count / MAX_CHANNELS, 1.0)
    persistence_ratio = min(persistence_windows / total_windows, 1.0)
    # v1.0 reuses persistence ratio for recurrence consistency until a separate
    # text-similarity consistency metric is piloted and documented.
    recurrence_consistency = persistence_ratio
    volume_score = min(math.log1p(report_count) / math.log1p(VOLUME_CAP), 1.0)

    raw_score = (
        30 * channel_diversity
        + 25 * persistence_ratio
        + 20 * geographic_spread_score
        + 15 * recurrence_consistency
        + 10 * volume_score
        - 100 * duplication_penalty
    )
    score = max(0, min(100, round(raw_score)))
    return {
        "score": score,
        "band": band_for_score(score),
        "formula_version": SIGNAL_FORMULA_VERSION,
        "formula_note": (
            "Transparent heuristic MVP weights; recurrence_consistency reuses "
            "persistence_ratio in v1.0; not statistically calibrated."
        ),
        "components": {
            "channel_diversity": round(channel_diversity, 4),
            "persistence_ratio": round(persistence_ratio, 4),
            "geographic_spread_score": round(geographic_spread_score, 4),
            "recurrence_consistency": round(recurrence_consistency, 4),
            "volume_score": round(volume_score, 4),
            "duplication_penalty": round(duplication_penalty, 4),
            "weights": {
                "source_channel_diversity": 0.30,
                "temporal_persistence": 0.25,
                "geographic_spread": 0.20,
                "recurrence_consistency": 0.15,
                "volume": 0.10,
            },
        },
    }


def normalized_levenshtein_ratio(left: str, right: str) -> float:
    # Named as normalized_Levenshtein_ratio in provenance; SequenceMatcher is a
    # deterministic stdlib implementation suitable for the local MVP fallback.
    return SequenceMatcher(None, left.lower().strip(), right.lower().strip()).ratio()


def compute_duplication_penalty(
    reports: list[dict],
    burst_window_hours: int = DUPLICATE_BURST_WINDOW_HOURS,
    duplicate_threshold: float = DUPLICATE_THRESHOLD,
) -> dict:
    if not reports:
        return {
            "penalty": 0.0,
            "flagged_report_count": 0,
            "method": "normalized_Levenshtein_ratio",
            "burst_window": "48 hours",
            "duplicate_threshold": duplicate_threshold,
        }

    parsed = [
        {
            "idx": idx,
            "text": item["raw_text"],
            "timestamp": datetime.fromisoformat(item["timestamp"].replace("Z", "+00:00")),
        }
        for idx, item in enumerate(reports)
    ]
    flagged: set[int] = set()
    window = timedelta(hours=burst_window_hours)
    for i, left in enumerate(parsed):
        for right in parsed[i + 1 :]:
            if abs(right["timestamp"] - left["timestamp"]) > window:
                continue
            if normalized_levenshtein_ratio(left["text"], right["text"]) >= duplicate_threshold:
                flagged.add(left["idx"])
                flagged.add(right["idx"])

    penalty = len(flagged) / len(parsed)
    return {
        "penalty": round(penalty, 4),
        "flagged_report_count": len(flagged),
        "method": "normalized_Levenshtein_ratio",
        "burst_window": "48 hours",
        "duplicate_threshold": duplicate_threshold,
    }

