from __future__ import annotations

import json

from backend.config import settings
from backend.evidence import data_loader


def main() -> None:
    result = {
        "use_local_duckdb": settings.use_local_duckdb,
        "gcp_project_id_configured": bool(settings.gcp_project_id),
        "bigquery_dataset": settings.bigquery_dataset,
        "raw_files_available": data_loader.raw_files_available(),
    }
    try:
        if data_loader.raw_files_available():
            records = data_loader.build_evidence_records_from_raw()
        else:
            records = data_loader.load_demo_evidence_records()
        result["record_count"] = len(records)
        if settings.use_local_duckdb:
            result["status"] = "local_mode"
            result["message"] = "Set USE_LOCAL_DUCKDB=false and GCP_PROJECT_ID to verify BigQuery load."
        else:
            result["warehouse_load"] = data_loader._write_bigquery(records)
            result["status"] = "bigquery_loaded"
    except Exception as exc:
        result["status"] = "error"
        result["error"] = str(exc)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
