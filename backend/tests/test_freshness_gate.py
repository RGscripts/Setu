from backend.classification.need_investment_outcome import classify_need_investment_outcome


def test_stale_case_forces_evidence_conflict():
    result = classify_need_investment_outcome(
        sector="water",
        signal_confidence_band="HIGH",
        persistence_windows=6,
        independent_deficit_indicator=True,
        corroboration_band="HIGH",
        investment_per_target_household=20000,
        state_average_per_target_household=14000,
        comparable_district_count=3,
        investment_quartile=None,
        outcome_change_pct_points=0,
        outcome_data_freshness_days=500,
    )
    assert result["classification"] == "EVIDENCE_CONFLICT_INSUFFICIENT"
    assert result["freshness_gate_triggered"] is True

