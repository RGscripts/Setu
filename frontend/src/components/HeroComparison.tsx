import { ArrowLeft } from "lucide-react";
import { classificationMeta, type District } from "../data/mockDistricts";
import { RawSignalMap } from "./HeroComparison/RawSignalMap";
import { ReconciledMap } from "./HeroComparison/ReconciledMap";

type Props = {
  districts: District[];
  selectedId: string;
  onSelect: (district: District) => void;
};

export function HeroComparison({ districts, selectedId, onSelect }: Props) {
  const rawRanked = [...districts].sort((a, b) => a.rankRaw - b.rankRaw);
  const evidenceRanked = [...districts].sort((a, b) => a.rankReconciled - b.rankReconciled);

  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-6 py-5 lg:grid-cols-2">
      <div className="rounded-md border border-[var(--color-border)] bg-white p-4 shadow-sm">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Raw Citizen Signal</p>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Ranked by complaint volume</h2>
        </div>
        <RawSignalMap districts={districts} selectedId={selectedId} onSelect={onSelect} />
        <ol className="mt-4 space-y-2 text-sm">
          {rawRanked.map((district) => {
            const isSelected = selectedId === district.id;
            return (
              <li key={district.id}>
                <button
                  type="button"
                  onClick={() => onSelect(district)}
                  className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition hover:bg-slate-50 active:scale-[0.995]"
                  style={{ borderColor: isSelected ? "#111827" : "var(--color-border)", background: isSelected ? "#f8fafc" : "#fff" }}
                >
                  <span className="font-medium">{district.rankRaw}. {district.name}</span>
                  <span className="text-[var(--color-text-secondary)]">{district.rawReportCount.toLocaleString()} reports</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="rounded-md border border-[var(--color-border)] bg-white p-4 shadow-sm">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Evidence-Reconciled View</p>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Ranked by evidence</h2>
        </div>
        <ReconciledMap districts={districts} selectedId={selectedId} onSelect={onSelect} />
        <ol className="mt-4 space-y-2 text-sm">
          {evidenceRanked.map((district) => {
            const meta = classificationMeta[district.classification];
            const isSelected = selectedId === district.id;
            return (
              <li key={district.id}>
                <button
                  type="button"
                  onClick={() => onSelect(district)}
                  className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition hover:bg-slate-50 active:scale-[0.995]"
                  style={{ borderColor: isSelected ? meta.color : "var(--color-border)", background: isSelected ? "#f8fafc" : "#fff" }}
                >
                  <span className="font-medium">{district.rankReconciled}. {district.name}</span>
                  <span className="inline-flex items-center gap-2 text-[var(--color-text-secondary)]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                    {meta.shortLabel}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-slate-50 px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)]">
          <ArrowLeft size={16} aria-hidden="true" /> Jhansi moves from LAST to FIRST
        </p>
      </div>
    </section>
  );
}
