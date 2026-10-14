import { cn } from "@/lib/utils";

type Step = { id: string; label: string; value: number; start: number; end: number };

const rs = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Pellet price → EBITDA per kg, one bar per cost line (data from data/lab/pricing.ts). */
export function Waterfall({ steps, total, top }: { steps: Step[]; total: number; top: number }) {
  return (
    <ol className="flex flex-col gap-2" aria-label="Waterfall from pellet price to EBITDA per kilogram">
      {steps.map((s) => {
        const lo = Math.min(s.start, s.end);
        const hi = Math.max(s.start, s.end);
        return (
          <li key={s.id} className="grid grid-cols-[minmax(0,13rem)_1fr_5.5rem] items-center gap-3 text-sm">
            <span className="truncate" title={s.label}>
              {s.label}
            </span>
            <span className="relative h-5 rounded bg-foreground/[0.04]">
              <span className={cn("absolute inset-y-0 rounded", s.value >= 0 ? "bg-chart-1" : "bg-destructive/60")} style={{ left: `${(lo / top) * 100}%`, width: `${((hi - lo) / top) * 100}%` }} />
            </span>
            <span className={cn("text-right tabular-nums", s.value < 0 && "text-muted-foreground")}>
              {s.value >= 0 ? "+" : "−"}
              {rs(Math.abs(s.value))}
            </span>
          </li>
        );
      })}
      <li className="grid grid-cols-[minmax(0,13rem)_1fr_5.5rem] items-center gap-3 border-t border-border pt-2 text-sm font-medium">
        <span>EBITDA per kg</span>
        <span className="relative h-5 rounded bg-foreground/[0.04]">
          <span className="absolute inset-y-0 left-0 rounded bg-status-verified" style={{ width: `${(total / top) * 100}%` }} />
        </span>
        <span className="text-right tabular-nums">{rs(total)}</span>
      </li>
    </ol>
  );
}
