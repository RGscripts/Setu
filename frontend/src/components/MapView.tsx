import { Layers, MapPinned } from "lucide-react";
import { useState } from "react";
import type { Classification, SignalSummary } from "../api/client";

type Props = {
  cases: Classification[];
  signalSummary: SignalSummary[];
  selectedId?: string;
  onSelect: (item: Classification) => void;
};

const districtNames: Record<string, string> = {
  "176": "Gorakhpur",
  "166": "Jhansi",
  "175": "Prayagraj"
};

const colors: Record<string, string> = {
  INVESTMENT_OUTCOME_MISMATCH: "bg-amber-500",
  INVESTMENT_BLIND_SPOT: "bg-red-500",
  POSITIVE_TREND: "bg-emerald-500",
  EVIDENCE_CONFLICT_INSUFFICIENT: "bg-sky-500"
};

export function MapView({ cases, signalSummary, selectedId, onSelect }: Props) {
  const [mode, setMode] = useState<"raw" | "evidence">("evidence");
  const signalById = Object.fromEntries(signalSummary.map((item) => [item.admin_unit_id, item]));
  const maxReports = Math.max(1, ...signalSummary.map((item) => item.report_count));

  return (
    <div className="rounded-md bg-white p-4 shadow-sm ring-1 ring-[#d9ded5]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#19201d]">District View</h2>
        <div className="inline-flex rounded-md border border-[#cfd6cc] p-1 text-xs">
          <button
            className={`flex items-center gap-1 rounded px-2 py-1 ${mode === "raw" ? "bg-[#19201d] text-white" : "text-[#536057]"}`}
            title="Raw Citizen Signal"
            onClick={() => setMode("raw")}
          >
            <MapPinned size={14} /> Raw Citizen Signal
          </button>
          <button
            className={`flex items-center gap-1 rounded px-2 py-1 ${mode === "evidence" ? "bg-[#19201d] text-white" : "text-[#536057]"}`}
            title="Evidence-Reconciled View"
            onClick={() => setMode("evidence")}
          >
            <Layers size={14} /> Evidence-Reconciled View
          </button>
        </div>
      </div>
      <div className="grid min-h-[280px] grid-cols-3 gap-3 rounded-md bg-[#eef2ea] p-3">
        {cases.map((item) => {
          const raw = signalById[item.admin_unit_id];
          const reportCount = raw?.report_count ?? 0;
          const bubbleSize = 34 + Math.round((reportCount / maxReports) * 38);
          return (
            <button
              key={item.admin_unit_id}
              onClick={() => onSelect(item)}
              className={`flex min-h-[220px] flex-col justify-between rounded-md border p-3 text-left transition ${
                selectedId === item.admin_unit_id ? "border-[#19201d] bg-white" : "border-[#d9ded5] bg-[#fbfcf9]"
              }`}
            >
              <span className="text-sm font-semibold text-[#19201d]">{districtNames[item.admin_unit_id] ?? item.admin_unit_id}</span>
              {mode === "raw" ? (
                <span
                  className="flex items-center justify-center rounded-full bg-[#2563eb] text-xs font-semibold text-white shadow-sm"
                  style={{ width: bubbleSize, height: bubbleSize }}
                  title={`${reportCount} mock citizen reports`}
                >
                  {reportCount}
                </span>
              ) : (
                <span className={`h-11 w-11 rounded-full ${colors[item.classification]} shadow-sm`} />
              )}
              <span className="text-xs leading-5 text-[#536057]">
                {mode === "raw"
                  ? `${reportCount} citizen reports across ${(raw?.channels ?? []).length} channels`
                  : item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
