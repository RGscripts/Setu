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

export async function getEvidence(adminUnitId: string): Promise<Record<string, unknown>> {
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

