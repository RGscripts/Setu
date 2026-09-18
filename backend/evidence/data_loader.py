from __future__ import annotations

import csv
import json
import re
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from backend.config import DATA_DIR, RAW_DATA_DIR, settings
from backend.evidence.independent_corroboration import compute_independent_corroboration

DEMO_EVIDENCE_PATH = DATA_DIR / "demo_evidence_records.json"
LOCAL_EVIDENCE_PATH = DATA_DIR / "evidence_records.local.json"
RAW_FILE_CANDIDATES = {
    "infra": ["infra.csv", "jjm_infra.csv", "coverage.csv", "jjm_coverage.csv"],
    "investment": ["investment.csv", "jjm_up_investment.csv", "expenditure.csv"],
    "outcome": ["outcome.csv", "jjm_outcome.csv", "coverage_outcome.csv"],
}

REQUIRED_RAW_COLUMNS = {
    "infra": {"admin_unit_id", "admin_unit_name", "infra_coverage_pct", "infra_data_freshness_days"},
    "investment": {
        "admin_unit_id",
        "amount_inr_crore",
        "status",
        "data_freshness_days",
        "per_target_household",
        "state_average_per_target_household",
    },
    "outcome": {
        "admin_unit_id",
        "baseline_value",
        "baseline_date",
        "latest_value",
        "latest_date",
        "data_freshness_days",
    },
}


def _read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _write_json(path: Path, value: Any) -> None:
    with path.open("w", encoding="utf-8") as handle:
        json.dump(value, handle, indent=2)


def _clean_key(value: str) -> str:
    key = re.sub(r"[^a-zA-Z0-9]+", "_", value.strip().lower()).strip("_")
    aliases = {
        "district_name": "admin_unit_name",
        "district": "admin_unit_name",
        "lgd_code": "admin_unit_id",
        "district_lgd_code": "admin_unit_id",
        "coverage_pct": "infra_coverage_pct",
        "households_with_tap_water_supply_pct": "infra_coverage_pct",
        "expenditure_till_date": "amount_inr_crore",
        "fund_released": "amount_inr_crore",
        "investment_amount_inr_crore": "amount_inr_crore",
    }
    return aliases.get(key, key)


def _to_float(value: Any, default: float = 0.0) -> float:
    if value is None or value == "":
        return default
    cleaned = re.sub(r"[^0-9.\-]", "", str(value))
    if cleaned in {"", ".", "-"}:
        return default
    return float(cleaned)


def _to_int(value: Any, default: int = 0) -> int:
    return int(round(_to_float(value, default)))


def _today_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def load_demo_evidence_records() -> list[dict]:
    return _read_json(DEMO_EVIDENCE_PATH)


def _find_raw_file(kind: str) -> Path | None:
    for name in RAW_FILE_CANDIDATES[kind]:
        path = RAW_DATA_DIR / name
        if path.exists():
            return path
    return None


def _read_csv_records(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = []
        for row in reader:
            normalized = {_clean_key(key): value for key, value in row.items() if key is not None}
            rows.append(normalized)
        return rows


def _load_raw_table(kind: str) -> list[dict]:
    path = _find_raw_file(kind)
    if path is None:
        return []
    rows = _read_csv_records(path)
    missing = REQUIRED_RAW_COLUMNS[kind] - set(rows[0].keys() if rows else [])
    if missing:
        raise ValueError(f"{path.name} missing required columns for {kind}: {sorted(missing)}")
    return rows


def raw_files_available() -> bool:
    return all(_find_raw_file(kind) is not None for kind in RAW_FILE_CANDIDATES)


def build_evidence_records_from_raw() -> list[dict]:
    infra_rows = {str(row["admin_unit_id"]): row for row in _load_raw_table("infra")}
    investment_rows = {str(row["admin_unit_id"]): row for row in _load_raw_table("investment")}
    outcome_rows = {str(row["admin_unit_id"]): row for row in _load_raw_table("outcome")}
    common_ids = sorted(set(infra_rows) & set(investment_rows) & set(outcome_rows))
    if not common_ids:
        raise ValueError("No matching admin_unit_id values across infra, investment, and outcome raw files")

    coverage_values = [_to_float(infra_rows[item]["infra_coverage_pct"]) for item in common_ids]
    state_median_coverage = sorted(coverage_values)[len(coverage_values) // 2]
    records: list[dict] = []
    for admin_unit_id in common_ids:
        infra = infra_rows[admin_unit_id]
        investment = investment_rows[admin_unit_id]
        outcome = outcome_rows[admin_unit_id]
        baseline = _to_float(outcome["baseline_value"])
        latest = _to_float(outcome["latest_value"])
        change = latest - baseline
        corroboration = compute_independent_corroboration(
            infra_coverage_pct=_to_float(infra["infra_coverage_pct"]),
            state_median_coverage_pct=state_median_coverage,
            outcome_change_pct_points=change,
            remote_sensing_support=None,
        )
        records.append(
            {
                "admin_unit_id": admin_unit_id,
                "admin_unit_name": infra.get("admin_unit_name", admin_unit_id),
                "sector": infra.get("sector", "water"),
                "citizen_signal": {
                    "report_count": _to_int(infra.get("report_count", 0)),
                    "channel_count": _to_int(infra.get("channel_count", 1)),
                    "persistence_windows": _to_int(infra.get("persistence_windows", 1)),
                    "total_windows": _to_int(infra.get("total_windows", 1)),
                    "geographic_spread_score": _to_float(infra.get("geographic_spread_score", 0)),
                    "duplication_flag": str(infra.get("duplication_flag", "false")).lower() == "true",
                    "signal_confidence_score": _to_int(infra.get("signal_confidence_score", 0)),
                    "signal_confidence_band": infra.get("signal_confidence_band", "LOW").upper(),
                    "formula_version": "v1.0",
                },
                "independent_corroboration": {
                    "infra_coverage_pct": _to_float(infra["infra_coverage_pct"]),
                    "infra_data_freshness_days": _to_int(infra["infra_data_freshness_days"]),
                    "remote_sensing_corroboration": None,
                    "corroboration_score": corroboration["score"],
                    "corroboration_band": corroboration["band"],
                    "independent_deficit_indicator": corroboration["independent_deficit_indicator"],
                    "formula_version": corroboration["formula_version"],
                },
                "investment": {
                    "amount_inr_crore": _to_float(investment["amount_inr_crore"]),
                    "status": investment.get("status", "unknown"),
                    "data_freshness_days": _to_int(investment["data_freshness_days"]),
                    "per_target_household": _to_float(investment["per_target_household"]),
                    "state_average_per_target_household": _to_float(investment["state_average_per_target_household"]),
                    "per_target_household_rank_quartile": None,
                    "comparable_district_count": len(common_ids),
                },
                "outcome": {
                    "indicator_name": outcome.get("indicator_name", "household_tap_water_coverage_pct"),
                    "baseline_value": baseline,
                    "baseline_date": outcome["baseline_date"],
                    "latest_value": latest,
                    "latest_date": outcome["latest_date"],
                    "change_absolute_pct_points": round(change, 2),
                    "data_freshness_days": _to_int(outcome["data_freshness_days"]),
                },
                "provenance": {
                    "sources": ["raw_infra_file", "raw_investment_file", "raw_outcome_file"],
                    "timestamps": {
                        "citizen_signal": infra.get("citizen_signal_timestamp", _today_iso()),
                        "infra": infra.get("source_timestamp", _today_iso()),
                        "investment": investment.get("source_timestamp", _today_iso()),
                        "outcome": outcome.get("source_timestamp", _today_iso()),
                    },
                },
            }
        )
    return records


def _write_bigquery(records: list[dict]) -> dict:
    from google.cloud import bigquery

    if not settings.gcp_project_id:
        raise ValueError("GCP_PROJECT_ID is required when USE_LOCAL_DUCKDB=false")
    client = bigquery.Client(project=settings.gcp_project_id)
    dataset_id = f"{settings.gcp_project_id}.{settings.bigquery_dataset}"
    dataset = bigquery.Dataset(dataset_id)
    dataset.location = "asia-south1"
    client.create_dataset(dataset, exists_ok=True)
    table_id = f"{dataset_id}.evidence_records"
    job_config = bigquery.LoadJobConfig(
        source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
        autodetect=True,
        write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
    )
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".jsonl", delete=False) as handle:
        temp_path = Path(handle.name)
        for record in records:
            handle.write(json.dumps(record) + "\n")
    with temp_path.open("rb") as handle:
        job = client.load_table_from_file(handle, table_id, job_config=job_config)
    job.result()
    return {"warehouse": "bigquery", "table": table_id, "rows": len(records)}


def _read_bigquery_records() -> list[dict]:
    from google.cloud import bigquery

    if not settings.gcp_project_id:
        return []
    client = bigquery.Client(project=settings.gcp_project_id)
    table_id = f"{settings.gcp_project_id}.{settings.bigquery_dataset}.evidence_records"
    query = f"SELECT TO_JSON_STRING(t) AS record FROM `{table_id}` AS t"
    return [json.loads(row.record) for row in client.query(query).result()]


def load_evidence_records() -> list[dict]:
    if not settings.use_local_duckdb:
        try:
            records = _read_bigquery_records()
            if records:
                return records
        except Exception:
            pass
    if LOCAL_EVIDENCE_PATH.exists():
        return _read_json(LOCAL_EVIDENCE_PATH)
    return load_demo_evidence_records()


def get_evidence_record(admin_unit_id: str) -> dict | None:
    for record in load_evidence_records():
        if str(record["admin_unit_id"]) == str(admin_unit_id):
            return record
    return None


def main() -> None:
    if raw_files_available():
        records = build_evidence_records_from_raw()
        _write_json(LOCAL_EVIDENCE_PATH, records)
        source = "raw_files"
    else:
        records = load_demo_evidence_records()
        source = "demo_fallback_missing_raw_files"

    result = {"source": source, "rows": len(records), "local_cache": str(LOCAL_EVIDENCE_PATH)}
    if not settings.use_local_duckdb:
        result["warehouse_load"] = _write_bigquery(records)
    else:
        result["warehouse_load"] = {"warehouse": "local_json", "rows": len(records)}
    result["loaded_tables"] = {"infra": len(records), "investment": len(records), "outcome": len(records)}
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
