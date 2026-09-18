# Setu MVP Data Matrix

Chosen MVP geography: Uttar Pradesh, water sector, 3 demo districts.

All local records in `data/demo_evidence_records.json` are small demo extracts shaped
to the confirmed public-source fields below. They are not a substitute for final
BigQuery ingestion before submission.

| Evidence type | Exact dataset/source | Geography | Time coverage | MVP status |
|---|---|---|---|---|
| Citizen signal | Mock CPGRAMS/BHASHINI/SabhaSaar schema in `data/mock_citizen_signals.json` | Village/District | 2025-26 | Synthetic, clearly labeled |
| Infrastructure/coverage | Jal Jeevan Mission public dashboard / OGD JJM catalog: https://tn.data.gov.in/catalog/jal-jeevan-mission-jjm and JJM public dashboard reference from PIB: https://ejalshakti.gov.in/jjmreport/JJMIndia.aspx | District/block/village | Latest available | Confirmed public source, local extract used |
| Outcome indicator | JJM household tap-water coverage over two dates | District | Historical + latest | Local extract used |
| Demographics/vulnerability | Census/SDG India Index compatible district indicators | District | Latest available | Local demo field only |
| Investment/expenditure | Official JJM Uttar Pradesh district expenditure report: https://www.jjmup.com/ChiefHO/DistrictWise10LakhFormate?M_Scheme_Status_Id=1 | District | Current JJM-UP dashboard | Confirmed public source, local extract used |
| Weather | IMD district rainfall data, optional for water sector | District | Historical | Not used in Tier 1 classifier |
| Satellite corroboration | Sentinel/Landsat via Google Earth Engine | Spatial | Monthly | Tier 2 only, not configured |

Investment dataset blocker status: official district expenditure source resolved;
investment-per-target-household normalization remains deliberately blocked until
an official target-household denominator is supplied. The active MVP classifier
therefore continues to use the reviewed 3-district `investment.csv` contract file,
while `jjm_up_investment_normalized.csv` is expenditure-only staging with an
explicit denominator validation status.


## Official Source Download Status

The downloader has saved official public pages into `data/raw/`:

- `jjm_up_investment.html`: official JJM Uttar Pradesh district expenditure report.
- `jjm_dashboard_reference.html`: public JJM dashboard reference page.
- `jjm_up_investment_extracted.csv`: extracted 75-row district expenditure table.
- `jjm_up_investment_normalized.csv`: staging normalization for review.

`jjm_up_investment_normalized.csv` now records expenditure and denominator-review metadata only; `per_target_household` fields are intentionally blank because the official page does not expose a validated target-household denominator. The active contract file remains `investment.csv`.

