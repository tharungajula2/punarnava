"use client";

import { clock, placeById, type Lot, type Milestone } from "@/sim";
import { fmt } from "./format";
import { useSim } from "./sim-store";

const STEPS: { key: Milestone; label: string }[] = [
  { key: "received", label: "Received" },
  { key: "sorted", label: "Sorted" },
  { key: "washed", label: "Washed" },
  { key: "pelletized", label: "Pelletized" },
  { key: "qc", label: "QC" },
  { key: "dispatched", label: "Dispatched" },
];

/** Batch tracking: each truckload (lot) through the plant. */
export function LotTimeline() {
  const sim = useSim();
  if (!sim) return null;
  const lots: Lot[] = [...sim.state.lots.slice(-4).reverse(), ...sim.state.doneLots].slice(0, 6);

  if (lots.length === 0) {
    return <p className="text-sm text-muted-foreground">No lots yet — the first truck reaches the weighbridge mid-morning on day 1.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-xs">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="py-1.5 pr-3 font-normal">Lot</th>
            {STEPS.map((s) => (
              <th key={s.key} className="px-1 py-1.5 font-normal">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lots.map((lot) => (
            <tr key={lot.id} className="border-t border-border/60">
              <td className="py-2 pr-3">
                <span className="font-medium">#{lot.id}</span>{" "}
                <span className="text-muted-foreground">
                  {placeById(lot.pointId).name.replace(" (sample)", "")} · {fmt.t(lot.kgIn, 2)}
                </span>
              </td>
              {STEPS.map((s) => {
                const t = lot.milestones[s.key];
                const c = t === undefined ? null : clock(t);
                return (
                  <td key={s.key} className="px-1 py-2">
                    <span className="flex items-center gap-1.5">
                      <span className={`size-2 shrink-0 rounded-full ${c ? "bg-primary" : "border border-border"}`} aria-hidden />
                      <span className={`font-mono tabular-nums ${c ? "" : "text-muted-foreground"}`}>{c ? `D${c.day} ${fmt.clock(c.hour, c.minute)}` : "—"}</span>
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
