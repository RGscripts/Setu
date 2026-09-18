import { CheckCircle2, Wrench } from "lucide-react";
import { useState } from "react";
import type { District } from "../../data/mockDistricts";

const options = [
  { option: "Repair existing network", cost: "INR LOW", impact: "Medium", confidence: "High", time: "6 months" },
  { option: "Expand network", cost: "INR HIGH", impact: "High", confidence: "Medium", time: "18 months" },
  { option: "Temporary supply intervention", cost: "INR LOW", impact: "Low-Medium", confidence: "High", time: "2 months" }
];

export function InterventionTable({ district }: { district: District }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section className="rounded-md border border-[var(--color-border)] bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Wrench size={18} aria-hidden="true" />
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Intervention Options</h3>
      </div>
      <p className="mb-4 rounded-md bg-slate-50 p-3 text-sm text-[var(--color-text-secondary)]">
        All values are illustrative planning values, not AI-calculated impact estimates.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              <th className="py-2 pr-3">Option</th>
              <th className="py-2 pr-3">Cost</th>
              <th className="py-2 pr-3">Impact</th>
              <th className="py-2 pr-3">Confidence</th>
              <th className="py-2 pr-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {options.map((item) => (
              <tr key={item.option} className="border-b border-slate-100">
                <td className="py-3 pr-3 font-medium">{item.option}</td>
                <td className="py-3 pr-3">{item.cost}</td>
                <td className="py-3 pr-3">{item.impact}</td>
                <td className="py-3 pr-3">{item.confidence}</td>
                <td className="py-3 pr-3">{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {options.map((item) => {
          const isSelected = selected === item.option;
          return (
            <button
              key={item.option}
              onClick={() => setSelected(item.option)}
              className="flex min-h-14 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition"
              style={{ borderColor: isSelected ? "var(--color-positive)" : "var(--color-border)", background: isSelected ? "#f0fdf4" : "#fff" }}
            >
              {isSelected ? <CheckCircle2 size={16} className="text-[var(--color-positive)]" aria-hidden="true" /> : null}
              Select: {item.option}
            </button>
          );
        })}
      </div>
      {selected ? (
        <p className="mt-4 rounded-md border border-[var(--color-positive)] bg-green-50 p-3 text-sm font-semibold text-green-800">
          {district.name} - Water - {selected} marked for planning review
        </p>
      ) : null}
    </section>
  );
}
