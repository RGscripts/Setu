import { EvidenceCard, Row } from "./CitizenEvidenceCard";
import type { District } from "../../data/mockDistricts";

export function InvestmentCard({ district }: { district: District }) {
  const assessment = district.perTargetHousehold < district.stateAvgPerHousehold ? "Below state average" : "At or above state average";

  return (
    <EvidenceCard title="Investment">
      <Row label="Amount" value={`INR ${district.investmentCrore} crore`} />
      <Row label="Status" value={district.investmentStatus} />
      <Row label="Per target HH" value={`INR ${district.perTargetHousehold.toLocaleString()}`} />
      <Row label="State average HH" value={`INR ${district.stateAvgPerHousehold.toLocaleString()}`} />
      <Row label="Assessment" value={assessment} />
      <Row label="Method" value="state_average_fallback" />
      <p className="pt-3 text-sm leading-6 text-[var(--color-text-muted)]">
        Fewer than five comparable districts are in this demo sample; quartile method is not used.
      </p>
      <Row label="Data freshness" value={`${district.investmentFreshnessDays} days`} />
    </EvidenceCard>
  );
}
