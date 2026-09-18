from __future__ import annotations

import json

from backend.classification.need_investment_outcome import classify_need_investment_outcome
from backend.evidence.data_loader import load_evidence_records
from backend.explanation.gemini_explainer import build_explanation


def main() -> None:
    record = load_evidence_records()[0]
    signal = record["citizen_signal"]
    corroboration = record["independent_corroboration"]
    investment = record["investment"]
    outcome = record["outcome"]
    classification = classify_need_investment_outcome(
        sector=record["sector"],
        signal_confidence_band=signal["signal_confidence_band"],
        persistence_windows=signal["persistence_windows"],
        independent_deficit_indicator=corroboration["independent_deficit_indicator"],
        corroboration_band=corroboration["corroboration_band"],
        investment_per_target_household=investment["per_target_household"],
        state_average_per_target_household=investment["state_average_per_target_household"],
        comparable_district_count=investment["comparable_district_count"],
        investment_quartile=investment["per_target_household_rank_quartile"],
        outcome_change_pct_points=outcome["change_absolute_pct_points"],
        outcome_data_freshness_days=outcome["data_freshness_days"],
    )
    print(json.dumps(build_explanation(record, classification), indent=2))


if __name__ == "__main__":
    main()
