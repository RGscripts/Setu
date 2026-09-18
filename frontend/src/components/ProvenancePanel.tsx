import { Search } from "lucide-react";
import type { Classification } from "../api/client";

type Props = {
  classification: Classification | null;
  evidence: Record<string, unknown> | null;
};

type AnyRecord = Record<string, any>;

export function ProvenancePanel({ classification, evidence }: Props) {
  const record = evidence as AnyRecord | null;
  const signal = record?.citizen_signal ?? {};
  const corroboration = record?.independent_corroboration ?? {};
  const investment = record?.investment ?? {};
  const outcome = record?.outcome ?? {};

  return (
    <div className="rounded-md bg-white p-4 shadow-sm ring-1 ring-[#d9ded5]">
      <div className="mb-3 flex items-center gap-2">
        <Search size={18} />
        <h2 className="text-lg font-semibold text-[#19201d]">Why?</h2>
      </div>
      {!classification || !record ? (
        <p className="text-sm text-[#536057]">Select a district to inspect evidence provenance.</p>
      ) : (
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-[#19201d]">{classification.label}</p>
            <p className="mt-1 text-[#536057]">{classification.explanation_text}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <EvidenceBlock title="Citizen Evidence" rows={[
              ["Reports", signal.report_count],
              ["Channels", signal.channel_count],
              ["Persistence", `${signal.persistence_windows}/${signal.total_windows}`],
              ["Signal band", signal.signal_confidence_band],
              ["Signal score", signal.signal_confidence_score]
            ]} />
            <EvidenceBlock title="Independent Corroboration" rows={[
              ["Coverage", `${corroboration.infra_coverage_pct}%`],
              ["Freshness", `${corroboration.infra_data_freshness_days} days`],
              ["Corroboration band", corroboration.corroboration_band],
              ["Corroboration score", corroboration.corroboration_score],
              ["Deficit indicator", String(corroboration.independent_deficit_indicator)]
            ]} />
            <EvidenceBlock title="Investment" rows={[
              ["Amount", `${investment.amount_inr_crore} crore`],
              ["Status", investment.status],
              ["Freshness", `${investment.data_freshness_days} days`],
              ["Per target household", investment.per_target_household]
            ]} />
            <EvidenceBlock title="Outcome" rows={[
              ["Indicator", outcome.indicator_name],
              ["Baseline", `${outcome.baseline_value} (${outcome.baseline_date})`],
              ["Latest", `${outcome.latest_value} (${outcome.latest_date})`],
              ["Change", `${outcome.change_absolute_pct_points} percentage points`],
              ["Freshness", `${outcome.data_freshness_days} days`]
            ]} />
          </div>

          <details className="rounded-md bg-[#f3f5f0] p-3 text-xs text-[#27302b]">
            <summary className="cursor-pointer font-semibold">Audit JSON</summary>
            <pre className="mt-2 max-h-[260px] overflow-auto leading-5">
              {JSON.stringify({ evidence, provenance: classification.provenance }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

function EvidenceBlock({ title, rows }: { title: string; rows: Array<[string, unknown]> }) {
  return (
    <div className="rounded-md border border-[#d9ded5] bg-[#fbfcf9] p-3">
      <h3 className="text-sm font-semibold text-[#19201d]">{title}</h3>
      <dl className="mt-2 space-y-1 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-[#536057]">{label}</dt>
            <dd className="text-right font-medium text-[#19201d]">{String(value ?? "-")}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
