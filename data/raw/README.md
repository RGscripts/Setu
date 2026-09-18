# Raw Data Contract

`backend.evidence.data_loader` will use these files automatically when present:

- `infra.csv`
- `investment.csv`
- `outcome.csv`

The files currently contain the same small 3-district demo extract used by the app,
but in the same contract expected from real cleaned source exports. Replace their
rows with cleaned official exports after downloading from the sources listed in
`data/data_matrix.md`.

Required columns:

`infra.csv`

```csv
admin_unit_id,admin_unit_name,sector,infra_coverage_pct,infra_data_freshness_days,report_count,channel_count,persistence_windows,total_windows,geographic_spread_score,duplication_flag,signal_confidence_score,signal_confidence_band,source_timestamp
```

`investment.csv`

```csv
admin_unit_id,amount_inr_crore,status,data_freshness_days,per_target_household,state_average_per_target_household,source_timestamp
```

`outcome.csv`

```csv
admin_unit_id,indicator_name,baseline_value,baseline_date,latest_value,latest_date,data_freshness_days,source_timestamp
```

Downloader:

```bash
python -m backend.evidence.public_source_downloader
```

That command saves the official JJM-UP expenditure HTML and JJM dashboard reference
HTML in `data/raw/`. If pandas/lxml are installed, it also extracts the largest
investment table to `data/raw/jjm_up_investment_extracted.csv` and writes
`data/raw/jjm_up_investment_normalized.csv` as expenditure-only staging.

The JJM-UP page does not expose a validated target-household denominator in this
repair/expenditure report. Do not map `FHTC Total`, `Total Village`, or work-item
counts into `per_target_household`; the normalizer intentionally leaves household
normalization fields blank and marks the denominator status for review.

