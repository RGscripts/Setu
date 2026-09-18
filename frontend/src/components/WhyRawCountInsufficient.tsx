import { ArrowRight } from "lucide-react";

const steps = ["Raw volume", "Source diversity", "Persistence", "Independent corroboration", "Investment", "Outcome", "Evidence-reconciled priority"];

export function WhyRawCountInsufficient() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-5">
      <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Why Raw Complaint Count Is Insufficient</h2>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          {steps.map((step, index) => (
            <span key={step} className="flex items-center gap-2">
              <span className="rounded-md border border-[var(--color-border)] bg-slate-50 px-3 py-2">{step}</span>
              {index < steps.length - 1 ? <ArrowRight size={15} aria-hidden="true" /> : null}
            </span>
          ))}
        </div>
        <p className="mt-4 max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">
          Jhansi had the fewest complaints (150) but ranked #1 after evidence reconciliation because coverage is 31%, investment is INR 6,200 per household versus a state average of INR 24,000, and the outcome indicator is nearly flat. Complaint volume starts the inquiry; it does not settle it.
        </p>
      </div>
    </section>
  );
}
