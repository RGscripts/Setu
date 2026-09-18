import { EvidenceCard, Row } from "./CitizenEvidenceCard";
import type { District } from "../../data/mockDistricts";

export function CorroborationCard({ district }: { district: District }) {
  return (
    <EvidenceCard title="Independent Corroboration">
      <Row label="Coverage" value={`${district.coveragePct}%`} />
      <Row label="Deficit indicator" value={`${district.coveragePct < 50} (below 50% threshold)`} />
      <Row label="Corroboration band" value={district.corroborationBand} />
      <Row label="Corroboration score" value={`${district.corroborationScore} / 100`} />
      <Row label="Data freshness" value={`${district.infraFreshnessDays} days`} />
      <p className="pt-3 text-sm leading-6 text-[var(--color-text-muted)]">
        This score is computed independently of the citizen signal. High citizen signal plus low corroboration is an evidence conflict, not low-confidence citizen data.
      </p>
    </EvidenceCard>
  );
}
