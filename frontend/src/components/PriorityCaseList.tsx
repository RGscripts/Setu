import { CheckCircle2, ListFilter } from "lucide-react";
import { caseExplanation, classificationMeta, type District } from "../data/mockDistricts";

type Props = {
  districts: District[];
  selectedId: string;
  onSelect: (district: District) => void;
};

export function PriorityCaseList({ districts, selectedId, onSelect }: Props) {
  const ranked = [...districts].sort((a, b) => a.rankReconciled - b.rankReconciled);
  const selected = districts.find((district) => district.id === selectedId);

  return (
    <aside className="rounded-md border border-[var(--color-border)] bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <ListFilter size={18} aria-hidden="true" />
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Priority Cases</h2>
      </div>
      <p className="mb-4 text-xs leading-5 text-[var(--color-text-muted)]">
        Ranked by: classification severity - signal confidence - corroboration - persistence - report count
      </p>
      <div className="space-y-3">
        {ranked.map((district) => {
          const meta = classificationMeta[district.classification];
          const isSelected = selectedId === district.id;
          return (
            <article
              key={district.id}
              className="rounded-md border bg-white p-4 text-left transition"
              style={{
                borderColor: isSelected ? meta.color : "var(--color-border)",
                borderLeftColor: meta.color,
                borderLeftWidth: 6,
                background: isSelected ? "#f8fafc" : "#fff"
              }}
            >
              <button type="button" onClick={() => onSelect(district)} className="block w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-[var(--color-text-primary)]">{district.name} - Water</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      #{district.rankReconciled} {meta.label}
                    </p>
                  </div>
                  <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{caseExplanation(district)}</p>
              </button>
              <button
                type="button"
                onClick={() => onSelect(district)}
                className="mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 active:scale-[0.99]"
                style={{ borderColor: isSelected ? meta.color : "var(--color-border)", color: isSelected ? meta.color : "var(--color-text-primary)" }}
              >
                {isSelected ? <CheckCircle2 size={14} aria-hidden="true" /> : null}
                {isSelected ? "Selected for review" : "Select for planning review"}
              </button>
            </article>
          );
        })}
      </div>
      {selected ? (
        <p className="mt-4 rounded-md bg-slate-50 p-3 text-xs font-semibold text-[var(--color-text-primary)]">
          Active case: {selected.name} - Water - planning review context loaded
        </p>
      ) : null}
      <p className="mt-4 text-xs leading-5 text-[var(--color-text-muted)]">
        Lexicographic: classification_severity &gt; signal_confidence_band &gt; corroboration_band &gt; persistence &gt; report_count
      </p>
    </aside>
  );
}
