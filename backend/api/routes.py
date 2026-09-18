from __future__ import annotations

from fastapi import APIRouter, HTTPException

from backend.classification.need_investment_outcome import classify_need_investment_outcome
from backend.config import BAND_ORDER, CLASSIFICATION_SEVERITY_ORDER, CLASSIFIER_VERSION
from backend.connectors.mock_cprams_connector import get_signals
from backend.evidence.data_loader import get_evidence_record, load_evidence_records
from backend.explanation.gemini_explainer import build_explanation

router = APIRouter()


def _classify_record(record: dict) -> dict:
    signal = record["citizen_signal"]
    corroboration = record["independent_corroboration"]
    investment = record["investment"]
    outcome = record["outcome"]
    result = classify_need_investment_outcome(
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
    explanation = build_explanation(record, result)
    return {
        "admin_unit_id": record["admin_unit_id"],
        "sector": record["sector"],
        **result,
        **explanation,
        "provenance": {
            "sources": record["provenance"]["sources"],
            "timestamps": record["provenance"]["timestamps"],
            "formula_versions": {
                "signal_confidence": signal["formula_version"],
                "corroboration": corroboration["formula_version"],
                "classifier": CLASSIFIER_VERSION,
            },
            **result["provenance"],
        },
    }



@router.get("/signals/summary")
def signal_summary() -> list[dict]:
    summary: dict[str, dict] = {}
    district_to_id = {"Gorakhpur": "176", "Jhansi": "166", "Prayagraj": "175"}
    for signal in get_signals():
        district = next((name for name in district_to_id if name in signal.location_text), "Unknown")
        admin_unit_id = district_to_id.get(district, "UNKNOWN")
        item = summary.setdefault(
            admin_unit_id,
            {
                "admin_unit_id": admin_unit_id,
                "district": district,
                "report_count": 0,
                "channels": set(),
                "sources": set(),
            },
        )
        item["report_count"] += 1
        item["channels"].add(signal.channel)
        item["sources"].add(signal.source)
    return [
        {
            **item,
            "channels": sorted(item["channels"]),
            "sources": sorted(item["sources"]),
        }
        for item in summary.values()
    ]

@router.get("/signals")
def signals(district: str | None = None) -> list[dict]:
    return [signal.model_dump(mode="json") for signal in get_signals(district)]


@router.get("/evidence/{admin_unit_id}")
def evidence(admin_unit_id: str) -> dict:
    record = get_evidence_record(admin_unit_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Evidence record not found")
    return record


@router.get("/classification/{admin_unit_id}")
def classification(admin_unit_id: str) -> dict:
    record = get_evidence_record(admin_unit_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Evidence record not found")
    return _classify_record(record)


@router.get("/priority-cases")
def priority_cases() -> dict:
    cases = [_classify_record(record) for record in load_evidence_records()]
    cases.sort(
        key=lambda item: (
            CLASSIFICATION_SEVERITY_ORDER[item["classification"]],
            BAND_ORDER[get_evidence_record(item["admin_unit_id"])["citizen_signal"]["signal_confidence_band"]],
            BAND_ORDER[get_evidence_record(item["admin_unit_id"])["independent_corroboration"]["corroboration_band"]],
            get_evidence_record(item["admin_unit_id"])["citizen_signal"]["persistence_windows"],
            get_evidence_record(item["admin_unit_id"])["citizen_signal"]["report_count"],
        ),
        reverse=True,
    )
    return {
        "ranking_method": (
            "lexicographic: classification_severity > signal_confidence_band > "
            "corroboration_band > persistence > report_count"
        ),
        "cases": cases,
    }



