from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


SourceType = Literal["CPGRAMS_MOCK", "BHASHINI_MOCK", "SABHASAAR_MOCK"]
ChannelType = Literal["voice", "text", "whatsapp"]
ConfidenceBand = Literal["LOW", "MEDIUM", "HIGH"]


class CitizenSignal(BaseModel):
    source: SourceType
    signal_id: str
    language: str
    raw_text: str
    location_text: str
    timestamp: datetime
    channel: ChannelType
    attached_photo_url: str | None = None


class ExtractionOutput(BaseModel):
    signal_id: str
    issue_category: str
    frequency: str
    severity: str
    requested_action: str
    extraction_confidence: ConfidenceBand
    extraction_confidence_note: str = Field(
        default="qualitative label only - not a calibrated probability"
    )


class GeoResolvedSignal(BaseModel):
    signal_id: str
    lat: float
    lng: float
    geocode_source: str
    lgd_code: str
    lgd_resolution_method: Literal["exact_match", "fuzzy_match", "district_fallback"]
    admin_unit: dict[str, str]

