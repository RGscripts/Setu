import { useEffect, useMemo, useState } from "react";
import { getEvidence, getPriorityCases } from "./api/client";
import { Header } from "./components/Header";
import { HeroComparison } from "./components/HeroComparison";
import { PriorityCaseList } from "./components/PriorityCaseList";
import { SelectedCasePanel } from "./components/SelectedCasePanel";
import { WhyRawCountInsufficient } from "./components/WhyRawCountInsufficient";
import { buildDistrictsFromApi } from "./data/backendDistricts";
import { MOCK_DISTRICTS, type District } from "./data/mockDistricts";

export default function App() {
  const [districts, setDistricts] = useState<District[]>(MOCK_DISTRICTS);
  const [selectedId, setSelectedId] = useState(() => firstRankedDistrict(MOCK_DISTRICTS).id);
  const [dataStatus, setDataStatus] = useState<"loading" | "api" | "fallback">("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadBackendData() {
      try {
        const priority = await getPriorityCases();
        const evidenceRecords = await Promise.all(priority.cases.map((item) => getEvidence(item.admin_unit_id)));
        const apiDistricts = buildDistrictsFromApi(priority, evidenceRecords);
        if (cancelled) return;
        if (apiDistricts.length === 0) {
          setDataStatus("fallback");
          return;
        }

        setDistricts(apiDistricts);
        setSelectedId((current) => apiDistricts.some((district) => district.id === current) ? current : firstRankedDistrict(apiDistricts).id);
        setDataStatus("api");
      } catch (error) {
        console.warn("Using local demo fallback because the Setu API did not load.", error);
        if (!cancelled) setDataStatus("fallback");
      }
    }

    loadBackendData();
    return () => {
      cancelled = true;
    };
  }, []);

  const initialDistrict = useMemo(() => firstRankedDistrict(districts), [districts]);
  const selected = districts.find((district) => district.id === selectedId) ?? initialDistrict;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Header dataStatus={dataStatus} />
      <HeroComparison districts={districts} selectedId={selected.id} onSelect={(district) => setSelectedId(district.id)} />
      <WhyRawCountInsufficient />
      <div className="mx-auto grid max-w-7xl gap-6 px-6 pb-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <PriorityCaseList districts={districts} selectedId={selected.id} onSelect={(district) => setSelectedId(district.id)} />
        </div>
        <div className="lg:col-span-2">
          <SelectedCasePanel district={selected} />
        </div>
      </div>
    </main>
  );
}

function firstRankedDistrict(districts: District[]) {
  return [...districts].sort((a, b) => a.rankReconciled - b.rankReconciled)[0];
}
