from backend.geo.geocoder import geocode_location, route_distance


def test_geocoder_falls_back_without_live_failure():
    result = geocode_location("Village Pipraich, Gorakhpur, Uttar Pradesh")
    assert result["lat"]
    assert result["lng"]
    assert "geocode_source" in result


def test_route_distance_never_claims_functionality():
    result = route_distance((26.7606, 83.3732), (26.7, 83.3))
    assert "not evidence of facility functionality" in result["note"]
