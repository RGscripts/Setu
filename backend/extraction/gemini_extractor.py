from __future__ import annotations

import json
import re

from backend.config import settings
from backend.connectors.schemas import CitizenSignal, ExtractionOutput

SYSTEM_INSTRUCTION = """Return only JSON with keys: signal_id, issue_category, frequency,
severity, requested_action, extraction_confidence, extraction_confidence_note.
Return extraction_confidence as exactly one of HIGH, MEDIUM, LOW based on how
unambiguous the text is. Do not return a numeric probability."""


def _band_from_numeric(value: float) -> str:
    if value > 0.7:
        return "HIGH"
    if value >= 0.4:
        return "MEDIUM"
    return "LOW"


def normalize_confidence(value: str | int | float) -> str:
    if isinstance(value, (int, float)):
        return _band_from_numeric(float(value))
    upper = str(value).strip().upper()
    if upper in {"HIGH", "MEDIUM", "LOW"}:
        return upper
    numeric_match = re.fullmatch(r"0?\.\d+|1(?:\.0+)?", upper)
    if numeric_match:
        return _band_from_numeric(float(upper))
    return "MEDIUM"


def _local_extract(signal: CitizenSignal) -> ExtractionOutput:
    text = signal.raw_text.lower()
    issue_category = "water_supply" if any(word in text for word in ["water", "paani", "पानी"]) else "other"
    frequency = "every_3_days" if any(token in text for token in ["three days", "3 days", "teen din", "तीन दिन"]) else "recurring"
    severity = "high" if any(token in text for token in ["no water", "high", "bahut", "severe", "नहीं"]) else "medium"
    requested_action = "pipeline_repair" if any(token in text for token in ["repair", "leak", "pipeline", "pipe"]) else "field_verification"
    confidence = "HIGH" if issue_category == "water_supply" and signal.location_text else "MEDIUM"
    return ExtractionOutput(
        signal_id=signal.signal_id,
        issue_category=issue_category,
        frequency=frequency,
        severity=severity,
        requested_action=requested_action,
        extraction_confidence=normalize_confidence(confidence),
    )


def _extract_with_gemini(signal: CitizenSignal) -> ExtractionOutput:
    from google import genai

    client = genai.Client(api_key=settings.gemini_api_key)
    prompt = {
        "instruction": SYSTEM_INSTRUCTION,
        "signal": signal.model_dump(mode="json"),
    }
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=json.dumps(prompt, ensure_ascii=False),
    )
    text = (response.text or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.IGNORECASE | re.DOTALL).strip()
    payload = json.loads(text)
    payload["signal_id"] = signal.signal_id
    payload["extraction_confidence"] = normalize_confidence(payload.get("extraction_confidence", "MEDIUM"))
    payload.setdefault("extraction_confidence_note", "qualitative label only - not a calibrated probability")
    return ExtractionOutput.model_validate(payload)


def extract_signal(signal: CitizenSignal) -> ExtractionOutput:
    if settings.gemini_api_key:
        try:
            return _extract_with_gemini(signal)
        except Exception:
            return _local_extract(signal)
    return _local_extract(signal)
