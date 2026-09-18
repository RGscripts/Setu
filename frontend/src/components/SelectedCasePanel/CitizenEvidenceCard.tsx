import type { ReactNode } from "react";
import type { District } from "../../data/mockDistricts";

export function CitizenEvidenceCard({ district }: { district: District }) {
  return (
    <EvidenceCard title="Citizen Evidence">
      <Row label="Reports" value={district.rawReportCount.toLocaleString()} />
      <Row label="Channels" value={district.channelCount} />
      <Row label="Persistence" value={`${district.persistenceWindows}/${district.totalWindows}`} />
      <Row label="Geographic spread" value={`${Math.round(district.geographicSpread * 100)}%`} />
      <Row label="Signal band" value={district.signalConfidenceBand} />
      <Row label="Signal score" value={`${district.signalConfidenceScore} / 100`} />
    </EvidenceCard>
  );
}

export function EvidenceCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-[var(--color-border)] bg-white p-4">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <dl className="mt-3 space-y-2 text-sm">{children}</dl>
    </section>
  );
}

export function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[var(--color-text-secondary)]">{label}</dt>
      <dd className="text-right font-semibold text-[var(--color-text-primary)]">{value}</dd>
    </div>
  );
}
