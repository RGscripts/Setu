from backend.evidence.data_loader import build_evidence_records_from_raw, raw_files_available


def test_raw_files_available_and_build_records():
    assert raw_files_available() is True
    records = build_evidence_records_from_raw()
    assert len(records) >= 3
    assert {"citizen_signal", "independent_corroboration", "investment", "outcome"} <= set(records[0])
