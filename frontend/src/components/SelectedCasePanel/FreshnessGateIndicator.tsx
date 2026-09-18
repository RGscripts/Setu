import { Ban, CheckCircle2 } from "lucide-react";
import { FRESHNESS_THRESHOLD_DAYS, type District } from "../../data/mockDistricts";

export function FreshnessGateIndicator({ district }: { district: District }) {
  const rows = [
    ["Citizen signal freshness", district.citizenFreshnessDays],
    ["Infrastructure freshness", district.infraFreshnessDays],
    ["Investment freshness", district.investmentFreshnessDays],
    ["Outcome freshness", district.outcomeFreshnessDays]
  ] as const;
  const triggered = rows.some(([, days]) => days > FRESHNESS_THRESHOLD_DAYS);

  return (
    <section className="rounded-md border border-[var(--color-border)] bg-white p-4">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Freshness Gate</h3>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Sector threshold (water): {FRESHNESS_THRESHOLD_DAYS} days</p>
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map(([label, days]) => {
          const stale = days > FRESHNESS_THRESHOLD_DAYS;
          return <FreshnessRow key={label} label={label} days={days} stale={stale} />;
        })}
      </dl>
      <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm font-semibold text-[var(--color-text-primary)]">
        Gate status: {triggered ? "TRIGGERED - classification set to evidence conflict / insufficient" : "CLEARED - classification proceeds"}
      </p>
      <div className="mt-3 rounded-md border border-[var(--color-conflict)] bg-blue-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-conflict)]">Stale-data demo guardrail</p>
        <dl className="mt-2 space-y-2 text-sm">
          <FreshnessRow label="Outcome freshness" days={410} stale />
        </dl>
        <p className="mt-3 rounded-md bg-white p-3 text-sm font-semibold text-[var(--color-text-primary)]">
          Gate status: TRIGGERED - classification set to evidence conflict / insufficient
        </p>
        <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
          Do not draw a planning conclusion from stale outcome data.
        </p>
      </div>
    </section>
  );
}

function FreshnessRow({ label, days, stale }: { label: string; days: number; stale: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[var(--color-text-secondary)]">{label}</dt>
      <dd className="inline-flex items-center gap-2 font-semibold text-[var(--color-text-primary)]">
        {days} days {stale ? <Ban size={16} className="text-[var(--color-blindspot)]" aria-hidden="true" /> : <CheckCircle2 size={16} className="text-[var(--color-positive)]" aria-hidden="true" />}
        {stale ? "STALE" : "within threshold"}
      </dd>
    </div>
  );
}
