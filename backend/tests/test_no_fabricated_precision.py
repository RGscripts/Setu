from backend.connectors.mock_cprams_connector import get_signals
from backend.extraction.gemini_extractor import extract_signal, normalize_confidence


def test_numeric_confidence_is_banded():
    assert normalize_confidence(0.82) == "HIGH"
    assert normalize_confidence("0.5") == "MEDIUM"


def test_extraction_confidence_is_qualitative():
    extracted = [extract_signal(signal) for signal in get_signals()[:3]]
    assert all(item.extraction_confidence in {"HIGH", "MEDIUM", "LOW"} for item in extracted)

