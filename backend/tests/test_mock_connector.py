from backend.connectors.mock_cprams_connector import get_signals


def test_mock_connector_has_required_demo_volume_and_labels():
    signals = get_signals()
    assert 50 <= len(signals) <= 100
    assert all(signal.source.endswith('_MOCK') for signal in signals)
    districts = {name for signal in signals for name in ['Gorakhpur', 'Jhansi', 'Prayagraj'] if name in signal.location_text}
    assert districts == {'Gorakhpur', 'Jhansi', 'Prayagraj'}
