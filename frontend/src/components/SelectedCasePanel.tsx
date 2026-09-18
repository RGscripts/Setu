import { Search } from "lucide-react";
import { caseExplanation, classificationMeta, type District } from "../data/mockDistricts";
import { AuditRecord } from "./SelectedCasePanel/AuditRecord";
import { CitizenEvidenceCard } from "./SelectedCasePanel/CitizenEvidenceCard";
import { CorroborationCard } from "./SelectedCasePanel/CorroborationCard";
import { FreshnessGateIndicator } from "./SelectedCasePanel/FreshnessGateIndicator";
import { InterventionTable } from "./SelectedCasePanel/InterventionTable";
import { InvestmentCard } from "./SelectedCasePanel/InvestmentCard";
import { OutcomeCard } from "./SelectedCasePanel/OutcomeCard";
import { SignalFormulaBreakdown } from "./SelectedCasePanel/SignalFormulaBreakdown";

type Props = {
  district: District;
};

export function SelectedCasePanel({ district }: Props) {
  const meta = classificationMeta[district.classification];

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Search size={18} aria-hidden="true" />
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Why {district.name} is flagged</h2>
            </div>
            <p className="mt-2 text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</p>
          </div>
          <span className="rounded-md border border-[var(--color-border)] bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            Water - Rank #{district.rankReconciled}
          </span>
        </div>
        <p className="mt-4 max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">{caseExplanation(district)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CitizenEvidenceCard district={district} />
        <CorroborationCard district={district} />
        <InvestmentCard district={district} />
        <OutcomeCard district={district} />
      </div>

      <FreshnessGateIndicator district={district} />
      <SignalFormulaBreakdown district={district} />
      <InterventionTable district={district} />
      <AuditRecord district={district} />
    </section>
  );
}
