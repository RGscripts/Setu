import inspect

from backend.evidence.independent_corroboration import compute_independent_corroboration


def test_independent_corroboration_has_no_citizen_signal_parameters():
    params = inspect.signature(compute_independent_corroboration).parameters
    assert not any("citizen" in name or "signal" in name or "report" in name for name in params)

