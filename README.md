# Setu

Citizen Signal -> Evidence -> Decision Support Layer for infrastructure governance.

This repository implements the MVP described in `Setu_Project_Specification.md` and
`Setu_Implementation_Plan.md`.

## What is real in this MVP

- FastAPI backend with deterministic evidence scoring and classification.
- Mock CPGRAMS/BHASHINI/SabhaSaar-style citizen-signal connector, clearly labeled as mock.
- Rule-based Citizen Signal Confidence and Independent Corroboration kept separate.
- Freshness-gated Need-Investment-Outcome classifier.
- React dashboard components for raw-signal and evidence-reconciled views.

## What is simulated

- Citizen reports are synthetic demo records.
- Local demo data extracts are small curated rows for 2-3 Uttar Pradesh districts.
- Gemini, Google Maps, BigQuery, and Earth Engine paths are implemented as integration
  seams with deterministic local fallbacks when credentials are absent.

## What is roadmap

- Live CPGRAMS/BHASHINI/SabhaSaar credentials.
- Calibrated ML confidence model.
- Manipulation/coordinated-submission detection beyond simple duplicate burst checks.
- Formal DPDP compliance assessment and DPG certification.

## Backend

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```


## Live Integration Steps

### 1. Public source download

```bash
python -m backend.evidence.public_source_downloader
```

This downloads:

- `data/raw/jjm_up_investment.html` from the official JJM Uttar Pradesh expenditure page.
- `data/raw/jjm_dashboard_reference.html` from the public JJM dashboard.
- `data/raw/jjm_up_investment_extracted.csv`, the extracted 75-district expenditure table.
- `data/raw/jjm_up_investment_normalized.csv`, a staging version mapped toward Setu's investment schema.

The normalized investment CSV is not automatically copied into `investment.csv` because the public report's `FHTC Total` field is not independently validated here as the exact target-household denominator required by the spec. Use it after reviewing the denominator choice.

### 2. Raw file loading

The app reads these cleaned contract files when present:

```text
data/raw/infra.csv
data/raw/investment.csv
data/raw/outcome.csv
```

Run:

```bash
python -m backend.evidence.data_loader
```

With `USE_LOCAL_DUCKDB=true`, this writes:

```text
data/evidence_records.local.json
```

With `USE_LOCAL_DUCKDB=false`, `GCP_PROJECT_ID` set, and Google application-default credentials configured, it writes to:

```text
<GCP_PROJECT_ID>.setu_mvp.evidence_records
```

### 3. Gemini

Set `GEMINI_API_KEY` in `.env`. `backend/extraction/gemini_extractor.py` will call Gemini first and fall back to deterministic extraction if the key is missing or the call fails. Numeric confidence values are normalized back to `LOW`, `MEDIUM`, or `HIGH`.

### 4. Google Maps

Set `GOOGLE_MAPS_API_KEY` in `.env`. `backend/geo/geocoder.py` will call Google Maps Geocoding and Distance Matrix first and fall back to demo coordinates if unavailable. Distance/routing responses are explicitly labeled as not evidence of facility functionality.

### 5. BigQuery

Install and authenticate Google Cloud locally:

```bash
gcloud auth application-default login
```

Then set:

```env
GCP_PROJECT_ID=your-project
BIGQUERY_DATASET=setu_mvp
USE_LOCAL_DUCKDB=false
```

Run:

```bash
python -m backend.evidence.data_loader
```
