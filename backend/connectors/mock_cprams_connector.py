from __future__ import annotations

import json
from pathlib import Path

from backend.config import DATA_DIR
from backend.connectors.schemas import CitizenSignal

SIGNALS_PATH = DATA_DIR / "mock_citizen_signals.json"


def get_signals(district: str | None = None) -> list[CitizenSignal]:
    with Path(SIGNALS_PATH).open("r", encoding="utf-8-sig") as handle:
        raw = json.load(handle)
    signals = [CitizenSignal.model_validate(item) for item in raw]
    if district:
        district_lower = district.lower()
        signals = [
            signal
            for signal in signals
            if district_lower in signal.location_text.lower()
        ]
    return signals


