from __future__ import annotations

import json
import urllib.request
from pathlib import Path

from backend.config import RAW_DATA_DIR

PUBLIC_SOURCES = {
    "jjm_up_investment_html": {
        "url": "https://www.jjmup.com/ChiefHO/DistrictWise10LakhFormate?M_Scheme_Status_Id=1",
        "path": RAW_DATA_DIR / "jjm_up_investment.html",
        "description": "Official JJM Uttar Pradesh district expenditure report HTML",
    },
    "jjm_dashboard_reference_html": {
        "url": "https://www.ejalshakti.gov.in/JJMReport/JJMIndia.aspx",
        "path": RAW_DATA_DIR / "jjm_dashboard_reference.html",
        "description": "Public JJM dashboard reference page for household tap-water coverage",
    },
}

TARGET_DISTRICT_IDS = {
    "gorakhpur": "176",
    "jhansi": "166",
    "prayagraj": "175",
}


def download_public_sources() -> dict:
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    results = {}
    for key, source in PUBLIC_SOURCES.items():
        request = urllib.request.Request(
            source["url"],
            headers={"User-Agent": "Setu-MVP/0.1 public-data-loader"},
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            content = response.read()
        Path(source["path"]).write_bytes(content)
        results[key] = {
            "url": source["url"],
            "path": str(source["path"]),
            "bytes": len(content),
            "description": source["description"],
        }
    return results


def convert_jjm_up_investment_html_to_csv() -> dict:
    try:
        import pandas as pd
    except ImportError as exc:
        raise RuntimeError("Install pandas and lxml to convert the official HTML table to CSV") from exc

    html_path = PUBLIC_SOURCES["jjm_up_investment_html"]["path"]
    if not html_path.exists():
        raise FileNotFoundError(f"Download first: {html_path}")
    tables = pd.read_html(html_path)
    if not tables:
        raise ValueError("No tables found in JJM-UP investment HTML")
    table = max(tables, key=len)
    if hasattr(table.columns, "levels"):
        table.columns = [str(col[0]).strip() for col in table.columns]
    table = table[table["District Name"].astype(str).str.lower() != "total"].copy()
    table = table[table["District Name"].astype(str).str.lower() != "2"].copy()
    csv_path = RAW_DATA_DIR / "jjm_up_investment_extracted.csv"
    table.to_csv(csv_path, index=False)
    normalized = normalize_jjm_up_investment_table(table)
    normalized_path = RAW_DATA_DIR / "jjm_up_investment_normalized.csv"
    normalized.to_csv(normalized_path, index=False)
    return {
        "source": str(html_path),
        "csv": str(csv_path),
        "normalized_csv": str(normalized_path),
        "rows": len(table),
        "normalized_rows": len(normalized),
        "columns": list(map(str, table.columns)),
    }


def normalize_jjm_up_investment_table(table):
    import pandas as pd

    rows = []
    for _, row in table.iterrows():
        district = str(row.get("District Name", "")).strip()
        if not district or district.lower() == "nan":
            continue
        district_key = district.lower()
        expenditure_crore = pd.to_numeric(row.get("Expenditure Till Date"), errors="coerce")
        fhtc_total = pd.to_numeric(row.get("FHTC Total"), errors="coerce")
        total_village = pd.to_numeric(row.get("Total Village"), errors="coerce")
        rows.append(
            {
                "admin_unit_id": TARGET_DISTRICT_IDS.get(district_key, district_key.replace(" ", "_")),
                "admin_unit_name": district,
                "amount_inr_crore": float(expenditure_crore) if pd.notna(expenditure_crore) else 0,
                "status": "reported_by_jjm_up_expenditure_only",
                "data_freshness_days": 30,
                "fhtc_work_item_count": int(fhtc_total) if pd.notna(fhtc_total) else None,
                "total_village_count": int(total_village) if pd.notna(total_village) else None,
                "per_target_household": "",
                "state_average_per_target_household": "",
                "denominator_validation_status": "not_validated_for_target_household_normalization",
                "denominator_review_note": "JJM-UP repair/expenditure table does not expose an official target-household denominator; FHTC Total is retained as a work-item count only.",
                "source_timestamp": "downloaded_public_jjm_up_page",
            }
        )
    return pd.DataFrame(rows)


def main() -> None:
    downloaded = download_public_sources()
    result = {"downloaded": downloaded}
    try:
        result["investment_csv"] = convert_jjm_up_investment_html_to_csv()
    except Exception as exc:
        result["investment_csv_error"] = str(exc)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()

