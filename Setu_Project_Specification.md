# Setu — Citizen Signal → Evidence → Decision Support Layer
### A Digital Public Good for AI-Driven Infrastructure Governance in India
### v5 — LOCKED FINAL VERSION (build from this)

---

## 1. Executive Summary

**Setu** is a cross-system reconciliation and decision-support layer. It does not replace CPGRAMS, BHASHINI/VoicERA, SabhaSaar, or PM Gati Shakti — it consumes signals from them and reconciles those signals against infrastructure, investment, and outcome data to answer one question:

> Where is the evidence of unmet public need strongest, does existing investment address it, and where do citizen signal, investment, and outcomes fail to line up?

**One-line pitch:** *"Setu doesn't count complaints. It builds the evidence behind public need — and shows policymakers where citizen signal, investment, and outcomes don't add up."*

**Setu's analytical contribution, stated precisely:** it reconciles heterogeneous evidence — citizen signal, infrastructure data, investment records, outcome indicators — on a common geography, and assesses confidence and surfaces uncertainty around what that evidence shows, before any of it reaches a policymaker. It does not correct demand for bias, does not establish causation, and does not claim to be the only system attempting this — its contribution is the reconciliation workflow itself, not an assertion that no one else has thought of it.

**What we deliberately do not claim:**
- Not "investment failure" — only "flagged for investigation," with confounders explicitly named as unresolved.
- Not "no existing Indian system does this" — CPGRAMS, BHASHINI, and Gati Shakti are large and improving fast; our contribution is the reconciliation, not exclusivity.
- Not a "true" level of citizen need — only a confidence assessment of what was observed, using auditable, disclosed rules.
- No numeric probability is shown unless it has been statistically validated. The MVP uses qualitative bands (Low/Medium/High) throughout.
- Not "327 independent reports" — independence of sources cannot be verified without manipulation-detection work that is explicitly out of scope. We say "327 citizen reports across 4 channels," with duplication/burst checks applied where technically detectable.

---

## 2. What We Are Building

| Module | What it does |
|---|---|
| **1. Signal Intake (connectors)** | Pulls citizen input from CPGRAMS/BHASHINI/SabhaSaar via a **connector interface using their public schemas** — for the MVP, this is a mock connector emitting CPGRAMS-compatible JSON, since we do not have production API credentials. This is stated openly, not disguised as live integration. |
| **2. Structuring & Extraction** | Gemini converts raw text/speech into structured fields with **qualitative** extraction-confidence labels (High/Medium/Low) — never a fabricated decimal probability. |
| **3. Evidence Reconciliation** | Joins citizen signal with infrastructure, demographic, investment, and outcome data on the best available geographic key, keeping **citizen evidence and independent evidence as two separate, clearly labeled inputs** (see Section 4). |
| **4. Signal Confidence + Independent Corroboration + Need–Investment–Outcome Engine** | Two separate scores (not conflated), feeding a four-state classifier that is also **gated by data freshness** — stale evidence cannot produce a confident mismatch/blind-spot verdict. This is Setu's core analytical contribution. |
| **5. Evidence-Grounded Explanation + Feedback Loop** | Ranks flagged cases, presents labeled intervention options, and re-measures outcomes post-implementation. |

---

## 3. Signal Confidence — Corrected Architecture (Critical Fix)

**Previous versions incorrectly conflated two different things.** They are now separated:

### 3.1 Citizen Signal Confidence
Measures only properties of the **citizen-generated signal itself** — it does NOT depend on whether independent data agrees or disagrees with it. High-confidence citizen signal + contradicting government data is a valid combination (it produces the Evidence Conflict state, Section 5 — it does not automatically lower citizen signal confidence).

**Explicit MVP formula (disclosed, not hidden):**
```
Citizen Signal Confidence Score =
    30% × Source/Channel Diversity      (how many distinct channels reported this)
  + 25% × Temporal Persistence          (recurs across ≥2 time windows vs. single burst)
  + 20% × Geographic Spread             (multiple locations within the unit vs. one point)
  + 15% × Recurrence Consistency        (same issue described consistently over time)
  + 10% × Volume (report count)         (floor/ceiling normalized, not raw count)
  − Duplication/Burst-Pattern Penalty   (detectable near-identical submissions in a short window)

Bands: 0–39 = Low | 40–69 = Medium | 70–100 = High
```
**Explicit disclosure shown on the dashboard:** *"These weights are transparent heuristic weights chosen for the MVP. They are not statistically calibrated against validated outcomes. Future pilots should calibrate them against field-verification data."*

### 3.2 Independent Corroboration (separate axis)
Measures whether **non-citizen-generated evidence** supports the claim: infrastructure/coverage records, outcome indicators, remote sensing (only for physically observable claims). This is scored separately and can directly disagree with Citizen Signal Confidence — that disagreement is a first-class output (the Evidence Conflict state), not something the model has to resolve by picking a winner.

### 3.3 Why this separation matters
500 citizen reports of poor water supply, even if infrastructure records claim "adequate coverage," does **not** mean the citizen signal was low-confidence. It means: high-confidence citizen signal + low independent corroboration = **Evidence Conflict, recommend field verification.** Conflating the two axes would have silently let government data overrule citizen evidence by construction — exactly the failure mode this system exists to avoid.

---

## 4. Need–Investment–Outcome Classification — With Freshness Gating

Four states. **Critical addition: data freshness gates the classification, not just the display.**

```
IF outcome_data_freshness > threshold (e.g., 12 months for this sector):
    → classification = "Insufficient/Stale Evidence — do not classify as mismatch or blind spot"
ELSE:
    → proceed to normal four-state classification
```

| State | Condition | Label shown |
|---|---|---|
| 🔴 Potential investment blind spot | Strong citizen signal + supporting deficit indicator + Low investment (see 4.1 for "low") | "Potential investment blind spot — recommend review" |
| 🟡 Investment–outcome mismatch | Strong citizen signal + High investment + flat/declining **fresh** outcome data | "Investment–outcome mismatch flagged for investigation. Causal attribution not established." |
| 🟢 Positive outcome trend observed | Strong citizen signal + High investment + improving **fresh** outcome data | "Existing intervention coincides with improving outcome. Causal attribution not established." |
| 🔵 Evidence conflict / insufficient evidence | Citizen and independent evidence disagree, OR outcome data is stale, OR coverage is too thin | "Evidence is inconsistent or insufficient. Field verification recommended." |

### 4.1 Precise definitions (previously undefined — now fixed)
- **"Strong evidence of unmet need"** = Citizen Signal Confidence ≥ High AND persists across ≥2 time windows AND at least one independent deficit indicator supports it (e.g., coverage % below district/state median).
- **"Low investment"** = investment-per-target-household in the bottom quartile among comparable districts (normalized, not an absolute ₹ figure) — or, if comparable-district data isn't available for the MVP, explicitly labeled as "below state average" rather than an unexplained "low."

### 4.2 Satisfying "recommend high-priority development projects" — explicit final output format
```
PRIORITY DEVELOPMENT CASE
District B — Rural Water Access
Classification: Investment–outcome mismatch flagged for investigation
Setu recommendation: Prioritize this case for planning review.

Intervention options for review:
  • Repair existing network       — ₹, Medium potential impact, High confidence, 6 mo
  • Expand network                — ₹₹₹, High potential impact, Medium confidence, 18 mo
  • Temporary supply intervention — ₹, Low–Medium potential impact, High confidence, 2 mo

(Options are illustrative planning values configured for this MVP, not
AI-calculated impact estimates.)
```
This satisfies "recommend high-priority projects to policymakers" explicitly, without asserting a single AI-decided answer.

---

## 5. Evidence Provenance — Corrected Example (Fixed Math + Fixed Overclaims)

```
FLAGGED: Investment–outcome mismatch — Village X, District Y

Citizen evidence
  • 327 citizen reports across 4 channels, over 8 months
  • Duplication/burst-pattern check: no significant anomaly detected
  • Recurs across 6 of 8 monthly windows
  • Citizen Signal Confidence: HIGH (score: 78/100 — see formula, Section 3.1)

Independent corroboration
  • Nearest mapped water facility: 4.7 km by road (Google Maps routing)
  • Facility operational status: per government infrastructure dataset,
    last updated 3 months ago — NOT established by Maps
  • Household tap-water coverage: 38% (Jal Jeevan Mission data)
  • Independent Corroboration: MEDIUM (infra data supports deficit; no conflicting signal)

Investment
  • ₹X crore allocated, project status: ongoing

Outcome
  • Indicator: household tap-water coverage
  • Baseline: 34% (Jan 2024) → Latest: 38% (Jan 2026)
  • Change: +4 percentage points (NOT +4.2 — corrected)
  • Data freshness: 8 months (within threshold — classification proceeds)

Interpretation shown to user:
"High-confidence citizen signal, supporting independent evidence, ongoing
investment, and only a +4 percentage point change in the tracked indicator
over 2 years. Flagged for investigation — not a conclusion that the project
failed. Recommend planning review with intervention options below."
```

---

## 6. Data Sources — Explicit MVP Data Matrix (Previously Undefined — Now Fixed)

**This must be locked before any code is written.** Choose one state and confirm actual dataset availability first.

| Evidence type | Exact dataset (to confirm before build) | Geography | Time coverage |
|---|---|---|---|
| Citizen signal | Mock CPGRAMS-schema connector (synthetic/scraped-sample data, clearly labeled) | Village/District | 2025–26 |
| Infrastructure/coverage | Jal Jeevan Mission household connection data | District/block | Latest available |
| Outcome indicator | Same JJM coverage metric tracked over 2 time points, OR SDG India Index water-related indicator | District | Historical + latest |
| Demographics/vulnerability | Census (latest available) / SDG India Index | District | Latest available |
| Investment/expenditure | **[TO CONFIRM]** — candidate: state PHED budget data or data.gov.in scheme allocation dataset for the chosen state | District/scheme | FY-wise |
| Weather (if relevant to water sector) | IMD district rainfall data | District | Historical |
| Satellite corroboration | Sentinel/Landsat via Google Earth Engine | Spatial | Monthly, physically-observable claims only |

**Action item before build starts:** confirm the investment/expenditure dataset with an actual downloadable source — do not proceed to build the reconciliation layer with a placeholder here.

---

## 7. Tech Stack — Split by What Is Actually Built (Not Every Category Claimed as "Used")

**Framing correction:** the hackathon requires Google AI integration and recommends a technology list — it does not mandate every category be used. Setu uses Google technologies where they materially improve the workflow.

### Tier 1 — MUST WORK in the demo
| Technology | Role |
|---|---|
| Gemini API (via Google AI Studio for prototyping, Vertex AI for serving) | Structured extraction + evidence-grounded explanation |
| BigQuery | Evidence reconciliation warehouse; Signal Confidence Index computed via transparent SQL |
| Google Maps Platform | Geocoding + routing (explicitly not used to establish facility functionality) |
| Cloud Run | Dashboard + API backend |

### Tier 2 — SHOULD WORK if time allows
| Technology | Role |
|---|---|
| Gemini multimodal | One live photo-verification demo |
| Google Earth Engine | One corroboration example, limited to a physically observable claim |
| Cloud Speech-to-Text | Transcribes a single 10–15 second live voice demo clip |

### Tier 3 — Roadmap / not built for MVP (stated openly, not faked)
| Technology | Why deferred |
|---|---|
| Vertex AI custom training | No labelled ground truth exists yet to train against; Signal Confidence stays rule-based until pilot data exists |
| Dialogflow CX | Full conversational flow not needed to demonstrate the core reconciliation engine |
| Translation API / Text-to-Speech | Only relevant if the live voice demo needs a translation step; not central to the differentiator |
| Firebase citizen account system | A single static "status" screen suffices for the demo; a full auth/real-time system is unnecessary scope |
| WhatsApp intake channel | Positioned as a future channel for unreached populations, not required to prove the core hypothesis |

---

## 8. Corrected Architecture Diagram

```
CITIZEN SIGNAL SOURCES
  CPGRAMS-compatible mock connector / BHASHINI-compatible voice input /
  SabhaSaar-style structured meeting extracts
              │
              ▼
      GEMINI STRUCTURING          ← [AI]
   issue / location / severity
   qualitative extraction confidence
              │
              ▼
   GEO / ENTITY RESOLUTION        ← [Google Maps + deterministic matching]
   lat/long (Maps) → spatial/admin
   boundary match → LGD where available
              │
              ▼
   ┌──────────────────────────────────────────┐
   │         EVIDENCE RECONCILIATION           │  ← [BigQuery, deterministic]
   │                                            │
   │  CITIZEN EVIDENCE  │  INDEPENDENT EVIDENCE │
   │  (signal itself)   │  (infra, investment,  │
   │                     │   outcome, remote     │
   │                     │   sensing)            │
   └────────┬───────────────────────┬───────────┘
            ▼                       ▼
   CITIZEN SIGNAL              INDEPENDENT
   CONFIDENCE (3.1)            CORROBORATION (3.2)
   [rule-based, disclosed]     [rule-based, disclosed]
            │                       │
            └───────────┬───────────┘
                         ▼
       NEED–INVESTMENT–OUTCOME CLASSIFIER   ← [deterministic + freshness gate]
       (stale data → forced to Evidence
        Conflict/Insufficient state)
                         │
       ┌─────────┬───────────────┬─────────┐
       ▼         ▼               ▼         ▼
  BLIND SPOT  MISMATCH       POSITIVE   EVIDENCE
              FLAGGED         TREND     CONFLICT
       └─────────┴───────────────┴─────────┘
                         ▼
       GEMINI EXPLANATION (evidence-grounded,   ← [AI]
       constrained to retrieved evidence only)
                         │
                         ▼
       PRIORITY CASE + INTERVENTION OPTIONS      ← [deterministic, labeled
                                                     "illustrative planning values"]
                         │
                         ▼
       POLICYMAKER DASHBOARD                    ← [HUMAN DECISION POINT]
                         │
                         ▼
                  IMPLEMENTATION
                         │
                         ▼
       RE-MEASUREMENT against original
       baseline + citizen-signal assessment
```
Legend: **[AI]** = Gemini-generated. **[Google Maps + deterministic]** / **[BigQuery, deterministic]** / **[deterministic]** = rule-based logic, no ML. **[HUMAN DECISION POINT]** = the only place a project gets chosen.

---

## 9. MVP Build Priority (Locked)

**Central hypothesis the entire demo exists to prove:**
> "Complaint volume alone is an unreliable indicator of unmet need."

**Tier 1 — must work, do not sacrifice for anything else:**
1. Gemini extraction (qualitative confidence labels)
2. BigQuery evidence reconciliation (using the confirmed dataset matrix, Section 6)
3. Citizen Signal Confidence (Section 3.1, disclosed formula)
4. Independent Corroboration (Section 3.2, kept separate)
5. Need–Investment–Outcome classifier with freshness gating (Section 4)
6. Dashboard showing raw-signal vs. evidence-reconciled view + Evidence Provenance drill-down

**Tier 2 — should work:**
7. Google Maps geocoding/routing
8. One live Gemini multimodal photo-verification demo
9. One Earth Engine corroboration example (physically observable claim only)

**Tier 3 — nice to have, cut first if time runs short:**
10. Live voice demo (10–15 seconds, not the hero feature)
11. Static citizen status screen
12. Any Dialogflow/TTS/Translation/WhatsApp integration

**Explicitly not built, stated as roadmap:**
- Manipulation/coordinated-submission detection
- Trained ML confidence model (no ground truth exists yet)
- Real closed-loop outcome monitoring (simulated only, labeled as simulated)
- Formal DPG Standard certification
- National-scale data coverage (architecture supports it; MVP demonstrates one state, 2–3 districts, one sector)

---

## 10. Requirements Cross-Verification (Final)

| Requirement | Status | Note |
|---|---|---|
| Voice/text/messaging aggregation, multilingual | ✅ Architecture-level; MVP demonstrates via mock connector + one short live voice clip | Messaging-app connector is simulated, stated openly |
| Combine with demographic/infrastructure/investment data | ✅ Strongest part of the build | Investment dataset must be confirmed before coding (Section 6) |
| Surface demand hotspots | ✅ | Framed as priority-investigation ranking, not a false-precision single score |
| Recommend high-priority development projects | ✅ | Explicit output format in Section 4.2 satisfies this directly |
| Google AI integration | ✅ | Tier 1 stack is real and demonstrable; Tier 2/3 honestly scoped |
| Scalable | ⚠️ Designed for horizontal scale; not load-tested in MVP | State this exact caveat if asked |
| Digital Public Good | ⚠️ DPG-oriented design (open source, transparent logic, privacy-by-design); formal certification out of scope | Do not claim DPG status |

---

## 11. Governance & Privacy — Corrected Language

1. Setu flags; it does not decide, and it does not diagnose causation.
2. The policymaker view excludes direct citizen identifiers (names, phone numbers) and separates personal data from analytical records with access controls — this is **not** a claim of legal anonymization under DPDP Act 2023, which requires a formal assessment outside hackathon scope. State it as: *"Designed with DPDP Act principles in mind; not independently assessed for legal compliance."*
3. Every number is traceable to source, timestamp, and freshness (Evidence Provenance layer).
4. When evidence conflicts, or is too stale, the system says so rather than forcing a confident-looking classification (Section 4, freshness gating).
5. No exclusivity claims. Setu's contribution is the reconciliation workflow, not an assertion of being first or only.
6. No numeric probability is shown without statistical validation; the MVP is qualitative throughout.

---

## 12. Demo Script (Corrected)

**Scene 1 (10–15 seconds — intentionally brief, not the differentiator):**
Citizen: *"Humare gaon mein paani teen din mein ek baar aata hai."*
Gemini extracts: `Issue: Water access | Location: Village X | Frequency: Every 3 days | Severity: High | Extraction confidence: High`
Presenter line: *"Now watch what Setu does with this signal — this is where our reconciliation layer begins."*

**Scene 2 — The reconciliation reveal (hero moment):**
```
                  Raw citizen reports        Evidence-reconciled view
District A              1,000                Signal: High | Coverage: Good |
                                              Investment: High | Outcome: Improving | 🟢
District B                150                Signal: MEDIUM | Coverage: Poor |
                                              Investment: Low | Outcome: Flat | 🔴
```
(Bands are strictly LOW / MEDIUM / HIGH throughout — no intermediate "Med-High" label exists in this system.)

Presenter line: *"District B becomes the higher-priority case despite fewer reports — ranked ahead by a disclosed rule, not a guess. That's the entire reason Setu exists."*

**Scene 3 — Why raw complaint count is insufficient (explainer panel):**
```
Raw volume → Source diversity/persistence → Independent corroboration →
Infrastructure → Investment → Outcome → Evidence-reconciled priority
```

**Scene 4 — Provenance:** Click "Why?" on District B → full trail from Section 5, with corrected math and honest sourcing.

**Scene 5 — Intervention options:** the comparison table from Section 4.2, explicitly labeled as illustrative planning values.

**Scene 6 — Human decision:** the policymaker selects an option on camera — making the governance principle real, not just a README claim.
