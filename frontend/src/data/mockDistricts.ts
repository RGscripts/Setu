export type ClassificationState =
  | "INVESTMENT_OUTCOME_MISMATCH"
  | "INVESTMENT_BLIND_SPOT"
  | "EVIDENCE_CONFLICT_INSUFFICIENT"
  | "POSITIVE_TREND";

export type District = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rawReportCount: number;
  citizenFreshnessDays: number;
  channelCount: number;
  persistenceWindows: number;
  totalWindows: number;
  geographicSpread: number;
  signalConfidenceScore: number;
  signalConfidenceBand: "HIGH" | "MEDIUM" | "LOW";
  corroborationScore: number;
  corroborationBand: "HIGH" | "MEDIUM" | "LOW";
  coveragePct: number;
  infraFreshnessDays: number;
  investmentCrore: number;
  investmentStatus: string;
  investmentFreshnessDays: number;
  perTargetHousehold: number;
  stateAvgPerHousehold: number;
  outcomeIndicator: string;
  outcomeBaseline: number;
  outcomeBaselineDate: string;
  outcomeLatest: number;
  outcomeLatestDate: string;
  outcomeFreshnessDays: number;
  classification: ClassificationState;
  rankRaw: number;
  rankReconciled: number;
  explanationText?: string;
  rankingMethod?: string;
  auditPayload?: unknown;
};

export const FRESHNESS_THRESHOLD_DAYS = 365;
export const STATE_AVG_PER_HOUSEHOLD = 24000;

export const MOCK_DISTRICTS: District[] = [
  {
    id: "176",
    name: "Gorakhpur",
    lat: 26.7606,
    lng: 83.3732,
    rawReportCount: 1000,
    citizenFreshnessDays: 12,
    channelCount: 4,
    persistenceWindows: 7,
    totalWindows: 8,
    geographicSpread: 0.85,
    signalConfidenceScore: 82,
    signalConfidenceBand: "HIGH",
    corroborationScore: 71,
    corroborationBand: "HIGH",
    coveragePct: 65,
    infraFreshnessDays: 60,
    investmentCrore: 42,
    investmentStatus: "ongoing",
    investmentFreshnessDays: 45,
    perTargetHousehold: 28000,
    stateAvgPerHousehold: STATE_AVG_PER_HOUSEHOLD,
    outcomeIndicator: "household_tap_water_coverage_pct",
    outcomeBaseline: 60,
    outcomeBaselineDate: "2024-01-01",
    outcomeLatest: 64,
    outcomeLatestDate: "2026-01-01",
    outcomeFreshnessDays: 180,
    classification: "POSITIVE_TREND",
    rankRaw: 1,
    rankReconciled: 3
  },
  {
    id: "177",
    name: "Jhansi",
    lat: 25.4484,
    lng: 78.5685,
    rawReportCount: 150,
    citizenFreshnessDays: 12,
    channelCount: 3,
    persistenceWindows: 6,
    totalWindows: 8,
    geographicSpread: 0.55,
    signalConfidenceScore: 73,
    signalConfidenceBand: "HIGH",
    corroborationScore: 48,
    corroborationBand: "MEDIUM",
    coveragePct: 31,
    infraFreshnessDays: 90,
    investmentCrore: 4.2,
    investmentStatus: "planned",
    investmentFreshnessDays: 60,
    perTargetHousehold: 6200,
    stateAvgPerHousehold: STATE_AVG_PER_HOUSEHOLD,
    outcomeIndicator: "household_tap_water_coverage_pct",
    outcomeBaseline: 28,
    outcomeBaselineDate: "2024-01-01",
    outcomeLatest: 30,
    outcomeLatestDate: "2026-01-01",
    outcomeFreshnessDays: 200,
    classification: "INVESTMENT_BLIND_SPOT",
    rankRaw: 3,
    rankReconciled: 1
  },
  {
    id: "178",
    name: "Prayagraj",
    lat: 25.4358,
    lng: 81.8463,
    rawReportCount: 400,
    citizenFreshnessDays: 12,
    channelCount: 2,
    persistenceWindows: 5,
    totalWindows: 8,
    geographicSpread: 0.4,
    signalConfidenceScore: 61,
    signalConfidenceBand: "MEDIUM",
    corroborationScore: 55,
    corroborationBand: "MEDIUM",
    coveragePct: 38,
    infraFreshnessDays: 90,
    investmentCrore: 36.55,
    investmentStatus: "ongoing",
    investmentFreshnessDays: 60,
    perTargetHousehold: 18000,
    stateAvgPerHousehold: STATE_AVG_PER_HOUSEHOLD,
    outcomeIndicator: "household_tap_water_coverage_pct",
    outcomeBaseline: 34,
    outcomeBaselineDate: "2024-01-01",
    outcomeLatest: 35,
    outcomeLatestDate: "2026-01-01",
    outcomeFreshnessDays: 240,
    classification: "INVESTMENT_OUTCOME_MISMATCH",
    rankRaw: 2,
    rankReconciled: 2
  }
];

export const classificationMeta: Record<ClassificationState, { label: string; shortLabel: string; color: string }> = {
  INVESTMENT_OUTCOME_MISMATCH: {
    label: "Investment-outcome mismatch",
    shortLabel: "Mismatch",
    color: "var(--color-mismatch)"
  },
  INVESTMENT_BLIND_SPOT: {
    label: "Investment blind spot",
    shortLabel: "Blind Spot",
    color: "var(--color-blindspot)"
  },
  EVIDENCE_CONFLICT_INSUFFICIENT: {
    label: "Evidence conflict / insufficient",
    shortLabel: "Evidence Conflict",
    color: "var(--color-conflict)"
  },
  POSITIVE_TREND: {
    label: "Positive outcome trend",
    shortLabel: "Positive Trend",
    color: "var(--color-positive)"
  }
};

export function outcomeChange(district: District) {
  return district.outcomeLatest - district.outcomeBaseline;
}

export function caseExplanation(district: District) {
  if (district.explanationText) return district.explanationText;

  if (district.classification === "INVESTMENT_BLIND_SPOT") {
    return "Strong citizen signal plus supporting deficit evidence coincide with low investment. Prioritize this case for planning review; causal attribution not established.";
  }

  if (district.classification === "INVESTMENT_OUTCOME_MISMATCH") {
    return `High-confidence citizen signal, ongoing spend, and only +${outcomeChange(district)} percentage point outcome change. Flagged for investigation; causal attribution not established.`;
  }

  if (district.classification === "POSITIVE_TREND") {
    return "High complaint volume remains visible, but independent evidence shows above-average investment and improving outcomes. Continue monitoring existing intervention.";
  }

  return "Evidence is inconsistent, thin, or stale. Field verification recommended before drawing a planning conclusion.";
}

export function auditRecord(district: District) {
  if (district.auditPayload) return district.auditPayload;

  return {
    admin_unit_id: district.id,
    admin_unit_name: district.name,
    sector: "water",
    citizen_signal: {
      report_count: district.rawReportCount,
      channel_count: district.channelCount,
      persistence_windows: district.persistenceWindows,
      total_windows: district.totalWindows,
      geographic_spread: district.geographicSpread,
      signal_confidence_score: district.signalConfidenceScore,
      signal_confidence_band: district.signalConfidenceBand
    },
    independent_corroboration: {
      coverage_pct: district.coveragePct,
      infra_data_freshness_days: district.infraFreshnessDays,
      corroboration_score: district.corroborationScore,
      corroboration_band: district.corroborationBand,
      independent_deficit_indicator: district.coveragePct < 50
    },
    investment: {
      amount_inr_crore: district.investmentCrore,
      status: district.investmentStatus,
      data_freshness_days: district.investmentFreshnessDays,
      per_target_household: district.perTargetHousehold,
      state_average_per_household: district.stateAvgPerHousehold,
      method: "state_average_fallback"
    },
    outcome: {
      indicator_name: district.outcomeIndicator,
      baseline_value: district.outcomeBaseline,
      baseline_date: district.outcomeBaselineDate,
      latest_value: district.outcomeLatest,
      latest_date: district.outcomeLatestDate,
      change_absolute_pct_points: outcomeChange(district),
      data_freshness_days: district.outcomeFreshnessDays
    },
    formula_versions: {
      signal_confidence: "v1.0-weighted-heuristic",
      classification: "bigquery-deterministic-v1",
      freshness_gate: "water-365-day-threshold-v1"
    },
    ranking_method: "classification_severity > signal_confidence_band > corroboration_band > persistence > report_count",
    freshness_gate_triggered: district.outcomeFreshnessDays > FRESHNESS_THRESHOLD_DAYS
  };
}
