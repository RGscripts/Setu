import { outcomeChange, type District } from "../../data/mockDistricts";
import { EvidenceCard, Row } from "./CitizenEvidenceCard";

export function OutcomeCard({ district }: { district: District }) {
  const change = outcomeChange(district);
  const label = `${change > 0 ? "+" : ""}${change} percentage ${Math.abs(change) === 1 ? "point" : "points"}`;

  return (
    <EvidenceCard title="Outcome">
      <Row label="Indicator" value={district.outcomeIndicator} />
      <Row label="Baseline" value={`${district.outcomeBaseline}% (${district.outcomeBaselineDate})`} />
      <Row label="Latest" value={`${district.outcomeLatest}% (${district.outcomeLatestDate})`} />
      <Row label="Change" value={label} />
      <Row label="Data freshness" value={`${district.outcomeFreshnessDays} days`} />
    </EvidenceCard>
  );
}
