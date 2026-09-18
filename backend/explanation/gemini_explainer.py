from __future__ import annotations

import json
import re

from backend.config import INTERVENTION_OPTIONS_BY_SECTOR, settings

BANNED_ASSERTIONS = ("failed", "proves", "caused")
EXPLAINER_INSTRUCTION = """Generate a concise policymaker explanation grounded only in the
provided evidence JSON and classification JSON. Do not add facts, datasets,
numbers, causes, or recommendations that are not present in the input. Use hedged
phrasing such as 'flagged for investigation' and 'causal attribution not
established' where relevant. Do not use the words failed, proves, or caused."""


def build_explanation(evidence_record: dict, classification_output: dict) -> dict:
    explanation = None
    if settings.gemini_api_key:
        try:
            explanation = _build_gemini_explanation(evidence_record, classification_output)
        except Exception:
            explanation = None
    if not explanation:
        explanation = _build_local_explanation(evidence_record, classification_output)
    _assert_safe_explanation(explanation)
    return {
        "explanation_text": explanation,
        "intervention_options": INTERVENTION_OPTIONS_BY_SECTOR.get(evidence_record["sector"], []),
    }


def _build_gemini_explanation(evidence_record: dict, classification_output: dict) -> str:
    from google import genai

    client = genai.Client(api_key=settings.gemini_api_key)
    payload = {
        "instruction": EXPLAINER_INSTRUCTION,
        "evidence_record": evidence_record,
        "classification_output": classification_output,
    }
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=json.dumps(payload, ensure_ascii=False),
    )
    text = (response.text or "").strip()
    text = re.sub(r"^```(?:text|markdown)?\s*|\s*```$", "", text, flags=re.IGNORECASE | re.DOTALL).strip()
    if not text:
        raise ValueError("Gemini returned empty explanation")
    return text


def _build_local_explanation(evidence_record: dict, classification_output: dict) -> str:
    outcome = evidence_record["outcome"]
    signal = evidence_record["citizen_signal"]
    corroboration = evidence_record["independent_corroboration"]
    classification = classification_output["classification"]
    if classification == "INVESTMENT_OUTCOME_MISMATCH":
        return (
            f"{signal['signal_confidence_band'].title()}-confidence citizen signal, "
            f"{corroboration['corroboration_band'].lower()} independent corroboration, "
            f"and a {outcome['change_absolute_pct_points']} percentage point outcome change. "
            "Flagged for investigation; causal attribution not established."
        )
    if classification == "INVESTMENT_BLIND_SPOT":
        return (
            "Strong citizen signal and supporting deficit evidence coincide with low investment. "
            "Prioritize this case for planning review; causal attribution not established."
        )
    if classification == "POSITIVE_TREND":
        return (
            "Strong citizen signal appears alongside investment and improving fresh outcome data. "
            "Existing intervention coincides with improvement; causal attribution not established."
        )
    return (
        "Evidence is inconsistent, thin, or stale. Field verification recommended before "
        "drawing a planning conclusion."
    )


def _assert_safe_explanation(explanation: str) -> None:
    lowered = explanation.lower()
    for banned in BANNED_ASSERTIONS:
        if banned in lowered:
            raise ValueError(f"Explanation contains banned assertion: {banned}")
