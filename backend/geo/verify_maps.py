from __future__ import annotations

import json

from backend.geo.entity_resolution import resolve_admin_unit
from backend.geo.geocoder import geocode_location, route_distance


def main() -> None:
    location_text = "Village Pipraich, Gorakhpur, Uttar Pradesh"
    geocode = geocode_location(location_text)
    admin = resolve_admin_unit(location_text, geocode["lat"], geocode["lng"])
    routing = route_distance((geocode["lat"], geocode["lng"]), (26.7606, 83.3732))
    print(
        json.dumps(
            {
                "location_text": location_text,
                "geocode": geocode,
                "admin_resolution": admin,
                "routing": routing,
                "facility_functionality_note": "Google Maps is used for geocoding/routing only, not facility operational status.",
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
