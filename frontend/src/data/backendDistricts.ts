import type { Classification, EvidenceRecord, PriorityCasesResponse } from "../api/client";
import { MOCK_DISTRICTS, type ClassificationState, type District } from "./mockDistricts";

const COORDINATES_BY_ID: Record<string, Pick<District, "lat" | "lng">> = Object.fromEntries(
  MOCK_DISTRICTS.map((district) => [district.id, { lat: district.lat, lng: district.lng }])
);

const COORDINATES_BY_NAME: Record<string, Pick<District, "lat" | "lng">> = Object.fromEntries(
  MOCK_DISTRICTS.map((district) => [district.name.toLowerCase(), { lat: district.lat, lng: district.lng }])
);

const VALID_CLASSIFICATIONS: ClassificationState[] = [
  "INVESTMENT_OUTCOME_MISMATCH",
  "INVESTMENT_BLIND_SPOT",
  "EVIDENCE_CONFLICT_INSUFFICIENT",
  "POSITIVE_TREND"
];

export function buildDistrictsFromApi(priority: PriorityCasesResponse, evidenceRecords: EvidenceRecord[]): District[] {
  const casesById = new Map(priority.cases.map((item) => [item.admin_unit_id, item]));
  const reconciledRankById = new Map(priority.cases.map((item, index) => [item.admin_unit_id, index + 1]));
  const rawRankById = new Map(
    [...evidenceRecords]
      .sort((a, b) => b.citizen_signal.report_count - a.citizen_signal.report_count)
      .map((record, index) => [record.admin_unit_id, index + 1])
  );

  return evidenceRecords.map((record) => {
    const classification = casesById.get(record.admin_unit_id);
    return districtFromApiRecord({
      record,
      classification,
      rankRaw: rawRankById.get(record.admin_unit_id) ?? evidenceRecords.length,
      rankReconciled: reconciledRankById.get(record.admin_unit_id) ?? evidenceRecords.length,
      rankingMethod: priority.ranking_method
    });
  });
}

function districtFromApiRecord({
  record,
  classification,
  rankRaw,
  rankReconciled,
  rankingMethod
}: {
  record: EvidenceRecord;
  classification?: Classification;
  rankRaw: number;
  rankReconciled: number;
  rankingMethod: string;
}): District {
  const coordinates = coordinatesFor(record);
  const stateAvg = record.investment.state_average_per_target_household ?? record.investment.state_average_per_household ?? 0;
  const coveragePct = record.independent_corroboration.infra_coverage_pct ?? record.independent_corroboration.coverage_pct ?? 0;
  const classificationState = normalizeClassification(classification?.classification);

  return {
    id: record.admin_unit_id,
    name: record.admin_unit_name ?? `Admin unit ${record.admin_unit_id}`,
    lat: coordinates.lat,
    lng: coordinates.lng,
    rawReportCount: record.citizen_signal.report_count,
    citizenFreshnessDays: freshnessDaysFromProvenance(record.provenance),
    channelCount: record.citizen_signal.channel_count,
    persistenceWindows: record.citizen_signal.persistence_windows,
    totalWindows: record.citizen_signal.total_windows,
    geographicSpread: record.citizen_signal.geographic_spread_score ?? record.citizen_signal.geographic_spread ?? 0,
    signalConfidenceScore: record.citizen_signal.signal_confidence_score,
    signalConfidenceBand: record.citizen_signal.signal_confidence_band,
    corroborationScore: record.independent_corroboration.corroboration_score,
    corroborationBand: record.independent_corroboration.corroboration_band,
    coveragePct,
    infraFreshnessDays: record.independent_corroboration.infra_data_freshness_days,
    investmentCrore: record.investment.amount_inr_crore,
    investmentStatus: record.investment.status,
    investmentFreshnessDays: record.investment.data_freshness_days,
    perTargetHousehold: record.investment.per_target_household,
    stateAvgPerHousehold: stateAvg,
    outcomeIndicator: record.outcome.indicator_name,
    outcomeBaseline: record.outcome.baseline_value,
    outcomeBaselineDate: record.outcome.baseline_date,
    outcomeLatest: record.outcome.latest_value,
    outcomeLatestDate: record.outcome.latest_date,
    outcomeFreshnessDays: record.outcome.data_freshness_days,
    classification: classificationState,
    rankRaw,
    rankReconciled,
    explanationText: classification?.explanation_text,
    rankingMethod,
    auditPayload: {
      evidence_record: record,
      classification_output: classification,
      ranking_method: rankingMethod
    }
  };
}

function normalizeClassification(value: string | undefined): ClassificationState {
  return VALID_CLASSIFICATIONS.find((item) => item === value) ?? "EVIDENCE_CONFLICT_INSUFFICIENT";
}

function coordinatesFor(record: EvidenceRecord) {
  const name = record.admin_unit_name?.toLowerCase();
  return COORDINATES_BY_ID[record.admin_unit_id] ?? (name ? COORDINATES_BY_NAME[name] : undefined) ?? { lat: 26.1, lng: 80.9 };
}

function freshnessDaysFromProvenance(provenance: Record<string, unknown> | undefined) {
  const timestamps = provenance?.timestamps;
  if (!timestamps || typeof timestamps !== "object" || !("citizen_signal" in timestamps)) return 0;

  const value = (timestamps as Record<string, unknown>).citizen_signal;
  if (typeof value !== "string") return 0;

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 0;

  return Math.max(0, Math.round((Date.now() - timestamp) / 86_400_000));
}
