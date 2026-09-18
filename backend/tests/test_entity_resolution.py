from backend.geo.entity_resolution import load_admin_units, resolve_admin_unit


def test_admin_units_load_from_raw_reference():
    units = load_admin_units()
    assert len(units) >= 3
    assert any(unit["district"] == "Gorakhpur" for unit in units)


def test_resolve_admin_unit_exact_and_fallback():
    exact = resolve_admin_unit("Village Pipraich, Gorakhpur, Uttar Pradesh", 26.76, 83.37)
    assert exact["lgd_code"] == "176"
    assert exact["lgd_resolution_method"] == "exact_match"

    fallback = resolve_admin_unit("Unknown village, Uttar Pradesh", 25.44, 78.56)
    assert fallback["lgd_resolution_method"] == "district_fallback"
