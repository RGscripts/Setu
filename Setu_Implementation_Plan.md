# Setu — Implementation Plan (v1.0)
### Hand this file directly to your coding agent. Build phases in order. Do not skip acceptance criteria.

This plan implements the locked design in `Setu_Project_Specification.md` (v5). It assumes that document as the source of truth for *what* and *why*; this document is the *how*, broken into buildable phases with exact files, schemas, and pass/fail criteria.

---

## 0. Non-Negotiable Constraints (read before writing any code)

1. **Never fabricate a numeric probability.** Extraction confidence and Signal Confidence are qualitative bands (Low/Medium/High) unless a formula in this document explicitly produces a number — and where it does, the formula and weights must be shown in the UI, not hidden.
2. **Never let Google Maps output be treated as facility-functionality data.** Maps gives geocoding/routing only. Functionality/coverage comes from the infrastructure dataset.
3. **Never skip the freshness gate.** If outcome data is older than the sector threshold, classification MUST resolve to "Evidence Conflict / Insufficient Evidence" — this is a hard rule in code, not a UI label applied after the fact.
4. **Never merge Citizen Signal Confidence and Independent Corroboration into one score.** They are two separate fields, computed by two separate functions, stored in two separate columns.
5. **Never claim a live CPGRAMS/BHASHINI API connection unless real credentials are configured.** Default to the mock connector (Section 2) and label all demo data as such in the UI.
6. **Every classification output must carry a `provenance` object** (data sources, timestamps, freshness, formula version) — no classification is emitted without one.

---

## 1. Tech Stack (locked)

| Layer | Choice | Reason |
|---|---|---|
| Backend language/framework | Python 3.11 + FastAPI | Fast to build, good Google client library support |
| AI | `google-genai` SDK (Gemini API, via Google AI Studio key for dev, Vertex AI for prod path) | Matches Tier 1 stack in spec |
| Geospatial | `googlemaps` Python client (Geocoding + Distance Matrix API) | Matches spec — routing/geocoding only |
| Data warehouse | Google BigQuery (`google-cloud-bigquery`) — **DuckDB permitted only as a local-development fallback (identical schema) when BigQuery credentials aren't yet configured; it is not a substitute for the final implementation.** | Matches Tier 1 stack. Before the final demo, the evidence reconciliation pipeline MUST be tested successfully against real BigQuery — the submitted architecture/demo must run on BigQuery as the primary warehouse, not silently ship on DuckDB. |
| Remote sensing (Tier 2, optional) | Google Earth Engine Python API (`earthengine-api`) | Only for one physically-observable corroboration example |
| Frontend | React 18 + Vite + TypeScript + TailwindCSS | Fast to build a dashboard; Tailwind matches frontend-design conventions |
| Map rendering | Google Maps JavaScript API (`@react-google-maps/api`) | Consistent with Maps Platform usage |
| Charts | Recharts | Simple, sufficient for the demo |
| Hosting (if deployed) | Cloud Run (backend), Cloud Run or Firebase Hosting (frontend) | Matches Tier 1 stack |

**Environment variables required (create `.env`, never commit it):**
```
GEMINI_API_KEY=              # from Google AI Studio
GOOGLE_MAPS_API_KEY=
GCP_PROJECT_ID=              # for BigQuery/Earth Engine, optional in local-dev mode
BIGQUERY_DATASET=setu_mvp
USE_LOCAL_DUCKDB=true        # set false once BigQuery is confirmed working
GEE_SERVICE_ACCOUNT_JSON=    # optional, only if Tier 2 Earth Engine demo is attempted
```

---

## 2. Repository Structure (create exactly this layout)

```
setu/
├── README.md
├── .env.example
├── backend/
│   ├── requirements.txt
│   ├── main.py                        # FastAPI app entrypoint
│   ├── config.py                      # env loading, constants (thresholds, weights)
│   ├── connectors/
│   │   ├── mock_cprams_connector.py   # emits CPGRAMS-schema JSON from sample data
│   │   └── schemas.py                 # Pydantic models for connector payloads
│   ├── extraction/
│   │   ├── gemini_extractor.py        # structured extraction from citizen text
│   │   └── multimodal_verifier.py     # Tier 2: photo cross-check
│   ├── geo/
│   │   ├── geocoder.py                # Google Maps geocode + routing
│   │   └── entity_resolution.py       # lat/long -> LGD/district fallback matching
│   ├── evidence/
│   │   ├── data_loader.py             # loads the 6 confirmed datasets into BigQuery/DuckDB
│   │   ├── signal_confidence.py       # Section 3.1 formula, isolated pure function
│   │   ├── independent_corroboration.py # Section 3.2 formula, isolated pure function
│   │   └── remote_sensing.py          # Tier 2: Earth Engine corroboration
│   ├── classification/
│   │   ├── freshness_gate.py          # hard gate, runs BEFORE classification
│   │   └── need_investment_outcome.py # four-state classifier
│   ├── explanation/
│   │   └── gemini_explainer.py        # evidence-grounded explanation + intervention options
│   ├── api/
│   │   └── routes.py                  # REST endpoints consumed by frontend
│   └── tests/
│       ├── test_signal_confidence.py
│       ├── test_freshness_gate.py
│       ├── test_classification_states.py
│       └── test_no_fabricated_precision.py   # guards Non-Negotiable Constraint #1
├── data/
│   ├── raw/                           # confirmed source files (Section 6 of spec)
│   ├── mock_citizen_signals.json      # synthetic demo data, clearly labeled
│   └── data_matrix.md                 # exact filled-in version of Section 6 table
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── MapView.tsx            # raw-signal vs evidence-reconciled toggle
│   │   │   ├── PriorityCaseList.tsx   # ranked flagged cases
│   │   │   ├── ProvenancePanel.tsx    # "Why?" drill-down
│   │   │   ├── InterventionTable.tsx  # comparison table, labeled illustrative
│   │   │   └── WhyRawCountInsufficient.tsx  # explainer panel, Demo Scene 3
│   │   └── api/client.ts              # calls backend REST endpoints
└── docs/
    └── demo_script.md                 # copy of Section 12 from the spec, presenter-ready
```

---

## 3. Data Contracts (implement exactly — these are the interfaces between phases)

### 3.1 Citizen Signal (connector output)
```json
{
  "source": "CPGRAMS_MOCK | BHASHINI_MOCK | SABHASAAR_MOCK",
  "signal_id": "uuid",
  "language": "hi",
  "raw_text": "Humare gaon mein paani teen din mein ek baar aata hai",
  "location_text": "Village X, District Y",
  "timestamp": "2026-01-15T10:00:00Z",
  "channel": "voice | text | whatsapp",
  "attached_photo_url": null
}
```

### 3.2 Extraction Output (Gemini)
```json
{
  "signal_id": "uuid",
  "issue_category": "water_supply",
  "frequency": "every_3_days",
  "severity": "high",
  "requested_action": "pipeline_repair",
  "extraction_confidence": "HIGH",
  "extraction_confidence_note": "qualitative label only — not a calibrated probability"
}
```

### 3.3 Geo-Resolved Signal
```json
{
  "signal_id": "uuid",
  "lat": 26.123,
  "lng": 80.456,
  "geocode_source": "google_maps",
  "lgd_code": "123456",
  "lgd_resolution_method": "exact_match | fuzzy_match | district_fallback",
  "admin_unit": { "state": "...", "district": "...", "block": "..." }
}
```

### 3.4 Evidence Record (post-reconciliation, stored in BigQuery/DuckDB)
**Note on the example below:** every numeric value shown (`signal_confidence_score: 78`, `corroboration_score: 65`, etc.) is a *worked example of what the formula in Phase 5/6 should output* for illustration only. These values must never be hard-coded in code or demo data — they must always be the computed result of `compute_signal_confidence()` / the corroboration function running against the stored raw components (`report_count`, `channel_count`, `persistence_windows`, etc.). If a review finds a literal `78` or `65` written into source code or seed data instead of computed at runtime, that is a bug.
```json
{
  "admin_unit_id": "lgd_or_district_code",
  "sector": "water",
  "citizen_signal": {
    "report_count": 327,
    "channel_count": 4,
    "persistence_windows": 6,
    "geographic_spread_score": 0.7,
    "duplication_flag": false,
    "signal_confidence_score": 78,
    "signal_confidence_band": "HIGH",
    "formula_version": "v1.0"
  },
  "independent_corroboration": {
    "infra_coverage_pct": 38,
    "infra_data_freshness_days": 90,
    "remote_sensing_corroboration": null,
    "corroboration_score": 65,
    "corroboration_band": "MEDIUM",
    "formula_version": "v1.0"
  },
  "investment": {
    "amount_inr_crore": 12.4,
    "status": "ongoing",
    "data_freshness_days": 60,
    "per_target_household_rank_quartile": 1
  },
  "outcome": {
    "indicator_name": "household_tap_water_coverage_pct",
    "baseline_value": 34,
    "baseline_date": "2024-01-01",
    "latest_value": 38,
    "latest_date": "2026-01-01",
    "change_absolute_pct_points": 4,
    "data_freshness_days": 240
  }
}
```

### 3.5 Classification Output
```json
{
  "admin_unit_id": "...",
  "sector": "water",
  "classification": "INVESTMENT_OUTCOME_MISMATCH | INVESTMENT_BLIND_SPOT | POSITIVE_TREND | EVIDENCE_CONFLICT_INSUFFICIENT",
  "freshness_gate_triggered": false,
  "explanation_text": "generated by Gemini, grounded only in the evidence record above",
  "intervention_options": [
    {"option": "Repair existing network", "cost_band": "₹", "potential_impact": "Medium", "confidence": "High", "time_to_deploy": "6 months", "label": "illustrative planning value"}
  ],
  "provenance": {
    "sources": ["mock_cprams_connector", "jjm_dataset_v1", "sdg_india_index_v1"],
    "timestamps": {"citizen_signal": "...", "infra": "...", "investment": "...", "outcome": "..."},
    "formula_versions": {"signal_confidence": "v1.0", "corroboration": "v1.0", "classifier": "v1.0"}
  }
}
```

---

## 4. Build Phases (in order — each phase has a hard stop / acceptance test before moving on)

### Phase 0 — Environment & scaffolding
**Tasks:**
- Create repo structure exactly as Section 2.
- `backend/requirements.txt`: `fastapi`, `uvicorn`, `google-genai`, `googlemaps`, `google-cloud-bigquery`, `duckdb`, `pydantic`, `python-dotenv`, `pytest`.
- `frontend`: scaffold with `npm create vite@latest frontend -- --template react-ts`, add Tailwind, Recharts, `@react-google-maps/api`.
- `.env.example` with all variables from Section 1.
**Acceptance criteria:** `uvicorn backend.main:app --reload` runs and returns `{"status": "ok"}` on `GET /health`. `npm run dev` in `frontend/` renders a blank page without errors.

### Phase 1 — Confirm and load the data matrix (BLOCKING — do this before any AI/logic code)
**Tasks:**
- Fill in `data/data_matrix.md` with the **actual confirmed dataset URLs/files** for the chosen state (per spec Section 6). Do not proceed with placeholder data sources.
- **This phase remains a hard blocker until the investment/expenditure dataset specifically is verified** — the investment dataset is marked `[TO CONFIRM]` in the spec and must be resolved to a real, downloadable source before Phase 2 begins. Do not substitute a placeholder or synthetic investment dataset and proceed silently.
- Download/place raw files in `data/raw/`.
- Write `backend/evidence/data_loader.py` to load all confirmed datasets in the data matrix — JJM coverage data, SDG India Index/Census demographic data, the investment dataset once verified, and IMD data (if used) — into BigQuery tables (or DuckDB tables if `USE_LOCAL_DUCKDB=true`), keyed by district/LGD code.
**Acceptance criteria:** running `python -m backend.evidence.data_loader` populates at least 3 tables (`infra`, `investment`, `outcome`) queryable via a test script, for at least 2-3 real districts in the chosen state. The `investment` table must be loaded from a verified real source, not a placeholder.

### Phase 2 — Mock connector + citizen signal data
**Tasks:**
- Write `backend/connectors/mock_cprams_connector.py`: reads `data/mock_citizen_signals.json` (create ~50-100 synthetic but realistic entries across the 2-3 chosen districts, in Hindi/English/one regional language, matching schema in 3.1) and serves them via a function `get_signals(district=None) -> List[CitizenSignal]`.
- Explicitly label every synthetic record with `"source": "CPGRAMS_MOCK"` etc. — never `"CPGRAMS"` alone, to avoid implying live integration.
**Acceptance criteria:** `get_signals()` returns valid Pydantic-validated objects matching schema 3.1; at least one district has deliberately sparse/low-volume signals (for the Evidence Conflict / blind-spot demo case) and one has deliberately high-volume signals (for the mismatch demo case).

### Phase 3 — Gemini extraction
**Tasks:**
- Write `backend/extraction/gemini_extractor.py`: takes `raw_text` + `language`, calls Gemini with a prompt that outputs strictly the JSON schema in 3.2, using qualitative confidence labels only.
- Prompt must explicitly instruct: *"Return extraction_confidence as one of HIGH/MEDIUM/LOW based on how unambiguous the text is. Do not return a numeric probability."*
- Add a validation step: if Gemini returns a numeric confidence despite instructions, convert it to a band (e.g., >0.7 → HIGH) and log a warning — never pass a raw decimal to the frontend.
**Acceptance criteria:** running extraction on 10 sample signals produces valid schema-3.2 JSON for all 10, with `extraction_confidence` always one of `HIGH|MEDIUM|LOW`. `tests/test_no_fabricated_precision.py` asserts no numeric confidence ever reaches the API response.

### Phase 4 — Geo resolution
**Tasks:**
- Write `backend/geo/geocoder.py`: calls Google Maps Geocoding API on `location_text`, returns lat/lng.
- Write `backend/geo/entity_resolution.py`: matches lat/lng to the nearest known admin boundary/LGD code from a reference table (download India's LGD/admin boundary reference for the chosen state — add to `data/raw/`); falls back to district-level matching with a `lgd_resolution_method` flag if no exact match.
**Acceptance criteria:** all 50-100 mock signals resolve to one of the 2-3 target districts with a non-null `admin_unit`; at least one test case demonstrates the fuzzy/fallback path explicitly (not just exact matches).

### Phase 5 — Signal Confidence (Section 3.1) — pure function, unit-testable
**Tasks:**
- Implement `backend/evidence/signal_confidence.py` exactly per the disclosed formula:
```python
def compute_signal_confidence(
    channel_count: int,
    persistence_windows: int,   # out of total windows observed, e.g. 6/8
    total_windows: int,
    geographic_spread_score: float,  # 0-1, pre-computed from distinct locations within unit
    report_count: int,
    duplication_penalty: float,  # 0-1, from a simple duplicate-text-similarity check
) -> dict:
    """Returns {"score": int, "band": "LOW|MEDIUM|HIGH", "formula_version": "v1.0",
    "components": {...}}  -- components MUST be included for the provenance panel."""
```
- Weights: 30% channel diversity (normalized to a max of e.g. 4 channels), 25% persistence ratio, 20% geographic spread, 15% recurrence consistency, 10% volume (log-normalized, capped), minus duplication penalty. **Sub-formulas, made explicit for v1.0 (do not leave any of these implicit):**
  - `recurrence_consistency = persistence_ratio` in v1.0 (i.e., it reuses the same persistence-windows ratio used for the 25% component) **unless and until a separate text-similarity-based consistency metric is implemented** — this reuse must be stated in a code comment and in the provenance `formula_version` note, not left ambiguous.
  - `volume_score = min(log1p(report_count) / log1p(VOLUME_CAP), 1.0)`, with `VOLUME_CAP` defined as a named constant in `config.py` (e.g., `VOLUME_CAP = 500`) — not an unspecified "cap."
  - `duplication_penalty = (number of unique reports classified as near-duplicates within the configured burst window) / (total reports in that window)`. **Each report counts at most once toward the numerator, even if it matches multiple other reports as a near-duplicate** (i.e., use the count of distinct reports flagged, not the count of duplicate pairs/groups). **v1.0 implementation, fixed and not left to interpretation:** `burst_window = 48 hours`, `similarity_method = normalized_Levenshtein_ratio`, `duplicate_threshold = 0.90` — no embedding model is needed for the hackathon; this simple method must be named exactly this way in code comments and in provenance.
- **Do NOT implement `strong_need` inside `signal_confidence.py`.** `strong_need` depends on `independent_deficit_indicator`, which is independent (non-citizen) evidence — putting it here would violate the separation principle this phase exists to enforce. `signal_confidence.py` must remain completely independent of all non-citizen evidence; it produces only `signal_confidence_score` and `signal_confidence_band`. The classifier in Phase 7 is responsible for computing `strong_need` by combining this phase's output with the independent deficit indicator (see Phase 7 below).
- **This function must NOT take any independent-evidence input as an argument** — this is the enforcement mechanism for Non-Negotiable Constraint #4.
**Acceptance criteria:** `tests/test_signal_confidence.py` includes at least: (a) a high-diversity/high-persistence case scoring HIGH, (b) a single-channel/single-burst case scoring LOW, (c) a duplication-heavy case demonstrably lowering the score vs. an identical case without duplication.

### Phase 6 — Independent Corroboration (Section 3.2) — separate pure function
**Tasks:**
- Implement `backend/evidence/independent_corroboration.py`, taking ONLY infra/outcome/remote-sensing inputs, never citizen signal data.
- Optional Tier 2: `backend/evidence/remote_sensing.py` using Earth Engine for one physically-observable check (e.g., surface water extent via a public Sentinel/Landsat water-index dataset) — build this last, and only if Phases 1-8 (excluding this) are done.
**Acceptance criteria:** function signature contains zero citizen-signal parameters (enforced by code review / a test that inspects the function's argument names).

### Phase 7 — Freshness gate + Need-Investment-Outcome classifier (Section 4)
**Tasks:**
- Implement `backend/classification/freshness_gate.py`: `def check_freshness(outcome_data_freshness_days: int, sector: str) -> bool` — returns `True` (gate triggered → force Evidence Conflict/Insufficient) if freshness exceeds a per-sector threshold defined in `config.py` (e.g., water sector: 365 days).
- `backend/classification/need_investment_outcome.py`: implements the exact decision table from spec Section 4, calling `check_freshness` FIRST, before any other branch. **This module — not `signal_confidence.py` — computes `strong_need` as a literal deterministic boolean, combining this phase's independent deficit indicator with Phase 5's output:**
```python
strong_need = (
    signal_confidence_band == "HIGH"
    and persistence_windows >= 2
    and independent_deficit_indicator is True
)
```
**Low-investment fallback rule (explicit, do not skip):** the "bottom quartile among comparable districts" test requires a minimum number of comparable districts (define `MIN_COMPARABLE_DISTRICTS = 5` or similar in `config.py`) to be statistically meaningful. With only 2-3 demo districts, quartile comparison is not meaningful — the implementation MUST fall back to: `is_low_investment = investment_per_target_household < state_average_per_target_household`, and this fallback methodology must be explicitly recorded in the `provenance` object (e.g., `"investment_comparison_method": "state_average_fallback (insufficient comparable districts for quartile method)"`) so the dashboard never silently implies a quartile analysis that wasn't actually performed.
**Acceptance criteria:** `tests/test_freshness_gate.py` proves that a case which would otherwise classify as MISMATCH is forced to EVIDENCE_CONFLICT_INSUFFICIENT when outcome freshness exceeds the threshold — this is the single most important test in the whole codebase, do not skip it. `tests/test_classification_states.py` covers all four states with at least one example each, using the demo districts from Phase 2.

### Phase 8 — Evidence-grounded explanation + intervention options (Section 4.2)
**Tasks:**
- `backend/explanation/gemini_explainer.py`: takes the full Evidence Record + Classification Output as structured JSON, sends to Gemini with a prompt that **forbids adding any fact not present in the input JSON** and requires the exact hedged phrasing from spec Section 4 ("flagged for investigation," "causal attribution not established," etc.).
- Intervention options table: hard-code as configuration data per sector (`config.py` or a small YAML file) rather than having Gemini invent cost/impact/time figures — label these `"illustrative planning value"` explicitly in the API response, per spec Section 4.2's own instruction.
**Acceptance criteria:** explanation text for a MISMATCH case is checked (manually or via a keyword assertion test) to contain the phrase "not established" and to NOT contain words like "failed," "proves," or "caused."

### Phase 9 — API layer
**Tasks:**
- `backend/api/routes.py`: expose
  - `GET /signals?district=` → raw signal list (for the "raw complaint count" view)
  - `GET /evidence/{admin_unit_id}` → full Evidence Record
  - `GET /classification/{admin_unit_id}` → Classification Output incl. provenance
  - `GET /priority-cases` → ranked list per spec Section 4.2 format. **Ranking rule (must be disclosed in provenance, never a mystery score):** lexicographic ranking by, in order: (1) classification severity order — **fixed for v1.0 as `MISMATCH > BLIND_SPOT > EVIDENCE_CONFLICT_INSUFFICIENT > POSITIVE_TREND`, defined once in `config.py`, and must not be dynamically altered by Gemini or any other model at runtime** — (2) Citizen Signal Confidence band (HIGH > MEDIUM > LOW), (3) Independent Corroboration band, (4) persistence_windows, (5) report_count as the final tie-breaker. This exact rule must appear in the API response's provenance object (e.g., `"ranking_method": "lexicographic: classification_severity > signal_confidence_band > corroboration_band > persistence > report_count"`) so the dashboard can display *why* one case outranks another — never present a ranked list without the rule visible on request
**Acceptance criteria:** all four endpoints return valid JSON matching the schemas in Section 3, tested with the 2-3 demo districts.

### Phase 10 — Frontend
**Tasks (build in this order):**
1. `MapView.tsx` — toggle between "Raw Citizen Signal" (bubble size = report count) and "Evidence-Reconciled View" (color = classification state) for the 2-3 demo districts. **Label toggle exactly**: "Raw Citizen Signal" / "Evidence-Reconciled View" — never "corrected" or "true demand" anywhere in the UI copy.
2. `PriorityCaseList.tsx` — ranked cases per Section 4.2 format.
3. `ProvenancePanel.tsx` — the "Why?" drill-down, rendering the full provenance object including data freshness per source, and the disclosed Signal Confidence formula components.
4. `InterventionTable.tsx` — comparison table, with a visible "illustrative planning value" caption.
5. `WhyRawCountInsufficient.tsx` — static explainer panel matching Demo Scene 3 in the spec.
**Acceptance criteria:** clicking District B in the map opens the Provenance Panel and shows the exact worked example structure from spec Section 5 (with corrected math: +4 percentage points, not +4.2).

### Phase 11 — Demo data assembly & rehearsal
**Tasks:**
- Confirm the 2-3 demo districts produce exactly: one BLIND_SPOT case, one MISMATCH case, one EVIDENCE_CONFLICT_INSUFFICIENT case. **Adjust synthetic citizen-signal data within the predefined v1.0 rules if necessary to demonstrate the required states. Do NOT alter classification thresholds, scoring weights, or the fixed severity ordering specifically to force a desired demo result** — any synthetic/demo-specific data adjustment must be documented in `data/mock_citizen_signals.json`'s accompanying notes as simulated, and the scoring logic itself must remain exactly as specified regardless of what result it produces.
- Copy `docs/demo_script.md` from spec Section 12, verify every line matches actual on-screen behavior.
**Acceptance criteria:** a full run-through of the six demo scenes completes without errors, using only features that are actually implemented and tested; no demo scene may depend on an unbuilt Tier 2 or Tier 3 feature. If a Tier 2 item (e.g., Earth Engine corroboration) isn't finished in time, cut it from the demo script rather than scripting around a feature that doesn't work live.

---

## 5. Cross-Verification — Nothing Left Behind

| Spec requirement (v5) | Implemented in | Verified by |
|---|---|---|
| No fabricated numeric probability | Phase 3 (extraction), `test_no_fabricated_precision.py` | Automated test |
| Signal Confidence formula disclosed, not hidden | Phase 5, `ProvenancePanel.tsx` | Manual UI check |
| Signal Confidence ≠ Independent Corroboration (separate) | Phase 5 & 6, separate files/functions | Function signature test |
| "327 citizen reports across 4 channels" phrasing (never "independent") | Phase 2 mock data labels, Phase 9 API response text | Manual copy review |
| Percentage-point math correct | Phase 1 data loader (store raw values, compute change in code, not hardcoded strings) | Unit test on outcome computation |
| Investment dataset confirmed, not placeholder | Phase 1 (BLOCKING) | `data/data_matrix.md` filled in before Phase 2 starts |
| Maps never implies facility functionality | Phase 4 (`geocoder.py` returns distance/routing only), Phase 6 (functionality comes from infra dataset) | Code review of field names |
| Freshness gates classification, not just displays it | Phase 7, `test_freshness_gate.py` | Automated test (critical) |
| No absolute "no one else does this" claims | Phase 8 prompt constraints, Phase 10 UI copy | Manual copy review |
| Explicit priority-case + intervention-options output (satisfies "recommend high-priority projects") | Phase 8 & 9 (`/priority-cases` endpoint), Phase 10 (`PriorityCaseList.tsx`) | Endpoint schema test |
| Google AI stack — Tier 1 actually built, Tier 2/3 honestly scoped | Phases 3, 4, 9 (Tier 1); Phase 5/11 notes (Tier 2/3) | README accurately lists what's real vs. roadmap |
| Mock connector clearly labeled, not implying live CPGRAMS/BHASHINI access | Phase 2 | Manual UI/API copy review |
| DPDP/privacy language not overclaiming legal compliance | `docs/demo_script.md` + any pitch materials | Manual copy review against spec Section 11 |
| Scalability claim scoped honestly ("designed for," not "demonstrated") | README + pitch materials | Manual copy review |
| Evidence Conflict state exists as a first-class output | Phase 7 | `test_classification_states.py` covers it explicitly |
| Demo proves "complaint volume ≠ unmet need" | Phase 11 | Full demo run-through |

---

## 6. Definition of Done (for hackathon submission)

- [ ] All Phase 0-9 acceptance criteria pass.
- [ ] BigQuery mode successfully tested end-to-end before final submission — DuckDB, if used during development, has been fully replaced or verified equivalent for the actual demo run.
- [ ] All items in Section 5's cross-verification table are checked off.
- [ ] `README.md` states, in plain language: what is real (Tier 1/2), what is simulated (mock connectors, labeled), and what is roadmap (Tier 3, ML calibration, manipulation detection, DPG certification).
- [ ] Demo rehearsed at least twice end-to-end without relying on anything not actually built.
- [ ] No sentence in any pitch material, README, or UI copy contradicts the "What we deliberately do not claim" list in spec Section 1.
