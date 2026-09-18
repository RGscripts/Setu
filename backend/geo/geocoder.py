from __future__ import annotations

from backend.config import settings

DEMO_COORDINATES = {
    "Gorakhpur": (26.7606, 83.3732),
    "Jhansi": (25.4484, 78.5685),
    "Prayagraj": (25.4358, 81.8463),
}


def _fallback_geocode(location_text: str) -> dict:
    for district, (lat, lng) in DEMO_COORDINATES.items():
        if district.lower() in location_text.lower():
            return {"lat": lat, "lng": lng, "geocode_source": "demo_fallback_google_maps_compatible"}
    return {"lat": 26.8467, "lng": 80.9462, "geocode_source": "district_fallback"}


def geocode_location(location_text: str) -> dict:
    if settings.google_maps_api_key:
        try:
            import googlemaps

            client = googlemaps.Client(key=settings.google_maps_api_key)
            results = client.geocode(location_text)
            if results:
                location = results[0]["geometry"]["location"]
                return {
                    "lat": location["lat"],
                    "lng": location["lng"],
                    "geocode_source": "google_maps",
                    "formatted_address": results[0].get("formatted_address"),
                    "place_id": results[0].get("place_id"),
                }
        except Exception:
            pass
    return _fallback_geocode(location_text)


def route_distance(origin: tuple[float, float], destination: tuple[float, float]) -> dict:
    if settings.google_maps_api_key:
        try:
            import googlemaps

            client = googlemaps.Client(key=settings.google_maps_api_key)
            result = client.distance_matrix([origin], [destination], mode="driving")
            element = result["rows"][0]["elements"][0]
            return {
                "routing_source": "google_maps_distance_matrix",
                "distance_meters": element.get("distance", {}).get("value"),
                "duration_seconds": element.get("duration", {}).get("value"),
                "status": element.get("status"),
                "note": "Routing only; not evidence of facility functionality.",
            }
        except Exception:
            pass
    return {
        "routing_source": "unavailable",
        "distance_meters": None,
        "duration_seconds": None,
        "status": "NOT_CONFIGURED",
        "note": "Routing only; not evidence of facility functionality.",
    }
