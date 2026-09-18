import { ChevronDown } from "lucide-react";
import { auditRecord, type District } from "../../data/mockDistricts";

export function AuditRecord({ district }: { district: District }) {
  const json = JSON.stringify(auditRecord(district), null, 2);
  const highlighted = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(\"[^\"]+\"):/g, '<span class="text-sky-700">$1</span>:')
    .replace(/: (\"[^\"]*\")/g, ': <span class="text-emerald-700">$1</span>')
    .replace(/: (true|false|null|\d+(?:\.\d+)?)/g, ': <span class="text-amber-700">$1</span>');

  return (
    <details className="rounded-md border border-[var(--color-border)] bg-white p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-[var(--color-text-primary)]">
        Full audit record
        <ChevronDown size={18} aria-hidden="true" />
      </summary>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Full audit record - all classification inputs and formula versions.
      </p>
      <pre
        className="mt-4 max-h-[360px] overflow-auto rounded-md bg-slate-950 p-4 font-mono text-xs leading-5 text-slate-100"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </details>
  );
}
