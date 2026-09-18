from backend.evidence.public_source_downloader import normalize_jjm_up_investment_table


def test_jjm_up_normalization_does_not_fabricate_household_denominator():
    pd = __import__("pandas")
    table = pd.DataFrame(
        [
            {
                "District Name": "Gorakhpur",
                "Expenditure Till Date": "3503.88",
                "FHTC Total": "25",
                "Total Village": "853",
            }
        ]
    )

    normalized = normalize_jjm_up_investment_table(table)
    row = normalized.iloc[0].to_dict()

    assert row["admin_unit_id"] == "176"
    assert row["amount_inr_crore"] == 3503.88
    assert row["fhtc_work_item_count"] == 25
    assert row["per_target_household"] == ""
    assert row["state_average_per_target_household"] == ""
    assert row["denominator_validation_status"] == "not_validated_for_target_household_normalization"
