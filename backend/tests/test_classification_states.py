from backend.classification.need_investment_outcome import classify_need_investment_outcome


def base_case(**overrides):
    values = {
        "sector": "water",
        "signal_confidence_band": "HIGH",
        "persistence_windows": 4,
        "independent_deficit_indicator": True,
        "corroboration_band": "HIGH",
        "investment_per_target_household": 20000,
        "state_average_per_target_household": 14000,
        "comparable_district_count": 3,
        "investment_quartile": None,
        "outcome_change_pct_points": 0,
        "outcome_data_freshness_days": 120,
    }
    values.update(overrides)
    return classify_need_investment_outcome(**values)


def test_mismatch():
    assert base_case()["classification"] == "INVESTMENT_OUTCOME_MISMATCH"


def test_blind_spot():
    result = base_case(investment_per_target_household=8000)
    assert result["classification"] == "INVESTMENT_BLIND_SPOT"


def test_positive_trend():
    result = base_case(outcome_change_pct_points=7)
    assert result["classification"] == "POSITIVE_TREND"


def test_evidence_conflict():
    result = base_case(signal_confidence_band="MEDIUM", independent_deficit_indicator=False)
    assert result["classification"] == "EVIDENCE_CONFLICT_INSUFFICIENT"

