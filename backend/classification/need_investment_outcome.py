from __future__ import annotations

from backend.classification.freshness_gate import check_freshness
from backend.config import CLASSIFIER_VERSION, MIN_COMPARABLE_DISTRICTS


def classify_need_investment_outcome(
    *,
    sector: str,
    signal_confidence_band: str,
    persistence_windows: int,
    independent_deficit_indicator: bool,
    corroboration_band: str,
    investment_per_target_household: float,
    state_average_per_target_household: float,
    comparable_district_count: int,
    investment_quartile: int | None,
    outcome_change_pct_points: float,
    outcome_data_freshness_days: int,
) -> dict:
    freshness_gate_triggered = check_freshness(outcome_data_freshness_days, sector)
    provenance = {
        "classifier_version": CLASSIFIER_VERSION,
        "freshness_threshold_days": "sector_configured",
    }
    if freshness_gate_triggered:
        return {
            "classification": "EVIDENCE_CONFLICT_INSUFFICIENT",
            "freshness_gate_triggered": True,
            "label": "Evidence is inconsistent or insufficient. Field verification recommended.",
            "provenance": provenance,
        }

    strong_need = (
        signal_confidence_band == "HIGH"
        and persistence_windows >= 2
        and independent_deficit_indicator is True
    )

    if comparable_district_count >= MIN_COMPARABLE_DISTRICTS and investment_quartile is not None:
        is_low_investment = investment_quartile == 1
        investment_method = "bottom_quartile_among_comparable_districts"
    else:
        is_low_investment = investment_per_target_household < state_average_per_target_household
        investment_method = "state_average_fallback (insufficient comparable districts for quartile method)"

    provenance["investment_comparison_method"] = investment_method
    if not strong_need or corroboration_band == "LOW":
        classification = "EVIDENCE_CONFLICT_INSUFFICIENT"
        label = "Evidence is inconsistent or insufficient. Field verification recommended."
    elif is_low_investment:
        classification = "INVESTMENT_BLIND_SPOT"
        label = "Potential investment blind spot - recommend review."
    elif outcome_change_pct_points <= 2:
        classification = "INVESTMENT_OUTCOME_MISMATCH"
        label = "Investment-outcome mismatch flagged for investigation. Causal attribution not established."
    else:
        classification = "POSITIVE_TREND"
        label = "Existing intervention coincides with improving outcome. Causal attribution not established."

    return {
        "classification": classification,
        "freshness_gate_triggered": False,
        "strong_need": strong_need,
        "label": label,
        "provenance": provenance,
    }

