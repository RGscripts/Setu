from backend.evidence.signal_confidence import compute_signal_confidence


def test_high_diversity_persistence_scores_high():
    result = compute_signal_confidence(4, 6, 8, 0.8, 327, 0)
    assert result["band"] == "HIGH"
    assert result["score"] >= 70


def test_single_channel_single_burst_scores_low():
    result = compute_signal_confidence(1, 1, 8, 0.1, 5, 0)
    assert result["band"] == "LOW"


def test_duplication_penalty_lowers_score():
    clean = compute_signal_confidence(4, 6, 8, 0.8, 327, 0)
    duplicate_heavy = compute_signal_confidence(4, 6, 8, 0.8, 327, 0.4)
    assert duplicate_heavy["score"] < clean["score"]

