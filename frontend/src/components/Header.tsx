import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

const stateOptions = ["Uttar Pradesh"];
const sectorOptions = ["Water"];

export function Header({ dataStatus = "fallback" }: { dataStatus?: "loading" | "api" | "fallback" }) {
  const [openMenu, setOpenMenu] = useState<"state" | "sector" | null>(null);
  const [state, setState] = useState(stateOptions[0]);
  const [sector, setSector] = useState(sectorOptions[0]);

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-4 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-[var(--color-text-primary)]">Setu</h1>
          <p className="mt-1 text-sm font-medium text-[var(--color-text-secondary)]">
            Citizen Signal - Evidence - Decision Support Layer
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Demo data is mock-labeled. Setu flags; it does not decide.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterMenu
            label="State"
            value={state}
            options={stateOptions}
            open={openMenu === "state"}
            onToggle={() => setOpenMenu(openMenu === "state" ? null : "state")}
            onSelect={(value) => {
              setState(value);
              setOpenMenu(null);
            }}
          />
          <FilterMenu
            label="Sector"
            value={sector}
            options={sectorOptions}
            open={openMenu === "sector"}
            onToggle={() => setOpenMenu(openMenu === "sector" ? null : "sector")}
            onSelect={(value) => {
              setSector(value);
              setOpenMenu(null);
            }}
          />
          <span className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-xs text-[var(--color-text-muted)] shadow-sm">
            {dataStatus === "api" ? "Local API connected" : dataStatus === "loading" ? "Loading local API" : "Local mock fallback"}
          </span>
          <span className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-xs text-[var(--color-text-muted)] shadow-sm">
            Human decision point. Setu flags; it does not decide.
          </span>
        </div>
      </div>
    </header>
  );
}

function FilterMenu({
  label,
  value,
  options,
  open,
  onToggle,
  onSelect
}: {
  label: string;
  value: string;
  options: string[];
  open: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99]"
        aria-expanded={open}
      >
        {label}: {value} <ChevronDown size={14} className={open ? "rotate-180 transition" : "transition"} aria-hidden="true" />
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 min-w-56 rounded-md border border-[var(--color-border)] bg-white p-2 shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm text-[var(--color-text-primary)] transition hover:bg-slate-50"
            >
              <span>{option}</span>
              {option === value ? <Check size={15} className="text-[var(--color-positive)]" aria-hidden="true" /> : null}
            </button>
          ))}
          <p className="border-t border-[var(--color-border)] px-3 pt-2 text-xs leading-5 text-[var(--color-text-muted)]">
            Demo scope is fixed for this build.
          </p>
        </div>
      ) : null}
    </div>
  );
}
