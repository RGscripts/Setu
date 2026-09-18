import { Wrench } from "lucide-react";
import type { Classification } from "../api/client";

type Props = {
  classification: Classification | null;
};

export function InterventionTable({ classification }: Props) {
  const options = classification?.intervention_options ?? [];
  return (
    <div className="rounded-md bg-white p-4 shadow-sm ring-1 ring-[#d9ded5]">
      <div className="mb-3 flex items-center gap-2">
        <Wrench size={18} />
        <h2 className="text-lg font-semibold text-[#19201d]">Intervention Options</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#d9ded5] text-xs text-[#536057]">
              <th className="py-2">Option</th>
              <th className="py-2">Cost</th>
              <th className="py-2">Impact</th>
              <th className="py-2">Confidence</th>
              <th className="py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {options.map((item) => (
              <tr key={item.option} className="border-b border-[#eef2ea]">
                <td className="py-2">{item.option}</td>
                <td className="py-2">{item.cost_band}</td>
                <td className="py-2">{item.potential_impact}</td>
                <td className="py-2">{item.confidence}</td>
                <td className="py-2">{item.time_to_deploy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-[#536057]">All values are illustrative planning values.</p>
    </div>
  );
}

