from __future__ import annotations

from backend.config import CORROBORATION_FORMULA_VERSION


def _band(score: int) -> str:
    if score >= 70:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"


def compute_independent_corroboration(
    infra_coverage_pct: float,
    state_median_coverage_pct: float,
    outcome_change_pct_points: float,
    remote_sensing_support: bool | None = None,
) -> dict:
    # v1.0 uses both relative deficit vs. the observed state median and absolute
    # coverage deficit vs. an 80% planning benchmark. This prevents tiny demo
    # samples from hiding obviously low coverage merely because the median is low.
    relative_deficit = max(state_median_coverage_pct - infra_coverage_pct, 0) / max(state_median_coverage_pct, 1)
    absolute_deficit = max(80 - infra_coverage_pct, 0) / 80
    coverage_score = min(max(relative_deficit, absolute_deficit), 1.0)
    flat_or_declining_score = 1.0 if outcome_change_pct_points <= 2 else 0.4
    remote_score = 0.0
    if remote_sensing_support is True:
        remote_score = 1.0
    elif remote_sensing_support is None:
        remote_score = 0.5

    score = round(100 * (0.65 * coverage_score + 0.25 * flat_or_declining_score + 0.10 * remote_score))
    score = max(0, min(100, score))
    return {
        "score": score,
        "band": _band(score),
        "formula_version": CORROBORATION_FORMULA_VERSION,
        "independent_deficit_indicator": infra_coverage_pct < max(state_median_coverage_pct, 60),
        "components": {
            "relative_coverage_deficit_score": round(relative_deficit, 4),
            "absolute_coverage_deficit_score": round(absolute_deficit, 4),
            "coverage_score": round(coverage_score, 4),
            "flat_or_declining_score": flat_or_declining_score,
            "remote_sensing_score": remote_score,
        },
    }
