import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { District } from "../../data/mockDistricts";

export function SignalFormulaBreakdown({ district }: { district: District }) {
  const [open, setOpen] = useState(false);
  const persistenceRatio = district.persistenceWindows / district.totalWindows;
  const channelDiversity = Math.min(1, district.channelCount / 4);
  const volume = Math.min(1, district.rawReportCount / 1000);
  const rows = [
    ["Channel diversity", "30%", channelDiversity, 30 * channelDiversity],
    ["Persistence ratio", "25%", persistenceRatio, 25 * persistenceRatio],
    ["Geographic spread", "20%", district.geographicSpread, 20 * district.geographicSpread],
    ["Recurrence", "15%", persistenceRatio, 15 * persistenceRatio],
    ["Volume", "10%", volume, 10 * volume]
  ] as const;

  return (
    <section className="rounded-md border border-[var(--color-border)] bg-white p-4">
      <button
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-[var(--color-text-primary)]">
          How was {district.signalConfidenceScore} calculated?
        </span>
        <ChevronDown size={18} className={open ? "rotate-180 transition" : "transition"} aria-hidden="true" />
      </button>
      {open ? (
        <div className="mt-4 overflow-hidden rounded-md border border-[var(--color-border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              <tr>
                <th className="px-3 py-2">Component</th>
                <th className="px-3 py-2">Weight</th>
                <th className="px-3 py-2">Input</th>
                <th className="px-3 py-2 text-right">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, weight, input, contribution]) => (
                <tr key={label} className="border-t border-[var(--color-border)]">
                  <td className="px-3 py-2">{label}</td>
                  <td className="px-3 py-2">{weight}</td>
                  <td className="px-3 py-2">{input.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{contribution.toFixed(1)}</td>
                </tr>
              ))}
              <tr className="border-t border-[var(--color-border)] bg-slate-50 font-semibold">
                <td className="px-3 py-2" colSpan={3}>Stored backend score</td>
                <td className="px-3 py-2 text-right">{district.signalConfidenceScore}</td>
              </tr>
            </tbody>
          </table>
          <p className="p-3 text-xs leading-5 text-[var(--color-text-muted)]">
            Recurrence equals persistence ratio in v1.0. Weights are heuristic and not statistically calibrated; they will be updated from pilot field-validation data.
          </p>
        </div>
      ) : null}
    </section>
  );
}
