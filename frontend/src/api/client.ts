export type Classification = {
  admin_unit_id: string;
  sector: string;
  classification: string;
  label: string;
  explanation_text: string;
  intervention_options: Array<Record<string, string>>;
  provenance: Record<string, unknown>;
};

export type PriorityCasesResponse = {
  ranking_method: string;
  cases: Classification[];
};

export type EvidenceRecord = {
  admin_unit_id: string;
  admin_unit_name?: string;
  sector: string;
  citizen_signal: {
    report_count: number;
    channel_count: number;
    persistence_windows: number;
    total_windows: number;
    geographic_spread_score?: number;
    geographic_spread?: number;
    signal_confidence_score: number;
    signal_confidence_band: "HIGH" | "MEDIUM" | "LOW";
  };
  independent_corroboration: {
    infra_coverage_pct?: number;
    coverage_pct?: number;
    infra_data_freshness_days: number;
    corroboration_score: number;
    corroboration_band: "HIGH" | "MEDIUM" | "LOW";
    independent_deficit_indicator: boolean;
  };
  investment: {
    amount_inr_crore: number;
    status: string;
    data_freshness_days: number;
    per_target_household: number;
    state_average_per_target_household?: number;
    state_average_per_household?: number;
  };
  outcome: {
    indicator_name: string;
    baseline_value: number;
    baseline_date: string;
    latest_value: number;
    latest_date: string;
    change_absolute_pct_points: number;
    data_freshness_days: number;
  };
  provenance?: Record<string, unknown>;
};

function resolveApiBase() {
  const configured = import.meta.env.VITE_API_BASE;
  if (configured) return configured.replace(/\/$/, "");

  const { hostname, protocol } = window.location;
  if (hostname === "127.0.0.1" || hostname === "localhost") {
    return `${protocol}//${hostname}:8000`;
  }

  return "";
}

const API_BASE = resolveApiBase();

export async function getPriorityCases(): Promise<PriorityCasesResponse> {
  const response = await fetch(`${API_BASE}/priority-cases`);
  if (!response.ok) throw new Error("Failed to load priority cases");
  return response.json();
}

export async function getEvidence(adminUnitId: string): Promise<EvidenceRecord> {
  const response = await fetch(`${API_BASE}/evidence/${adminUnitId}`);
  if (!response.ok) throw new Error("Failed to load evidence");
  return response.json();
}

export type SignalSummary = {
  admin_unit_id: string;
  district: string;
  report_count: number;
  channels: string[];
  sources: string[];
};

export async function getSignalSummary(): Promise<SignalSummary[]> {
  const response = await fetch(`${API_BASE}/signals/summary`);
  if (!response.ok) throw new Error("Failed to load signal summary");
  return response.json();
}
