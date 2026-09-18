from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"

load_dotenv(ROOT_DIR / ".env")

SIGNAL_FORMULA_VERSION = "v1.0"
CORROBORATION_FORMULA_VERSION = "v1.0"
CLASSIFIER_VERSION = "v1.0"

VOLUME_CAP = 500
MAX_CHANNELS = 4
DUPLICATE_BURST_WINDOW_HOURS = 48
DUPLICATE_THRESHOLD = 0.90

SECTOR_FRESHNESS_THRESHOLDS_DAYS = {
    "water": 365,
}

MIN_COMPARABLE_DISTRICTS = 5

CLASSIFICATION_SEVERITY_ORDER = {
    "INVESTMENT_OUTCOME_MISMATCH": 4,
    "INVESTMENT_BLIND_SPOT": 3,
    "EVIDENCE_CONFLICT_INSUFFICIENT": 2,
    "POSITIVE_TREND": 1,
}

BAND_ORDER = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}

INTERVENTION_OPTIONS_BY_SECTOR = {
    "water": [
        {
            "option": "Repair existing network",
            "cost_band": "INR_LOW",
            "potential_impact": "Medium",
            "confidence": "High",
            "time_to_deploy": "6 months",
            "label": "illustrative planning value",
        },
        {
            "option": "Expand network",
            "cost_band": "INR_HIGH",
            "potential_impact": "High",
            "confidence": "Medium",
            "time_to_deploy": "18 months",
            "label": "illustrative planning value",
        },
        {
            "option": "Temporary supply intervention",
            "cost_band": "INR_LOW",
            "potential_impact": "Low-Medium",
            "confidence": "High",
            "time_to_deploy": "2 months",
            "label": "illustrative planning value",
        },
    ]
}


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY") or None
    google_maps_api_key: str | None = os.getenv("GOOGLE_MAPS_API_KEY") or None
    gcp_project_id: str | None = os.getenv("GCP_PROJECT_ID") or None
    bigquery_dataset: str = os.getenv("BIGQUERY_DATASET", "setu_mvp")
    use_local_duckdb: bool = os.getenv("USE_LOCAL_DUCKDB", "true").lower() == "true"
    gee_service_account_json: str | None = os.getenv("GEE_SERVICE_ACCOUNT_JSON") or None


settings = Settings()

