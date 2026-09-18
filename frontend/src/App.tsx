import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { HeroComparison } from "./components/HeroComparison";
import { PriorityCaseList } from "./components/PriorityCaseList";
import { SelectedCasePanel } from "./components/SelectedCasePanel";
import { WhyRawCountInsufficient } from "./components/WhyRawCountInsufficient";
import { MOCK_DISTRICTS } from "./data/mockDistricts";

export default function App() {
  const initialDistrict = useMemo(() => [...MOCK_DISTRICTS].sort((a, b) => a.rankReconciled - b.rankReconciled)[0], []);
  const [selectedId, setSelectedId] = useState(initialDistrict.id);
  const selected = MOCK_DISTRICTS.find((district) => district.id === selectedId) ?? initialDistrict;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Header />
      <HeroComparison districts={MOCK_DISTRICTS} selectedId={selected.id} onSelect={(district) => setSelectedId(district.id)} />
      <WhyRawCountInsufficient />
      <div className="mx-auto grid max-w-7xl gap-6 px-6 pb-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <PriorityCaseList districts={MOCK_DISTRICTS} selectedId={selected.id} onSelect={(district) => setSelectedId(district.id)} />
        </div>
        <div className="lg:col-span-2">
          <SelectedCasePanel district={selected} />
        </div>
      </div>
    </main>
  );
}
