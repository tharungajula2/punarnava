import { StatusBadge } from "@/components/os/ui";
import type { Status } from "@/data/assumptions";
import { shortSource } from "@/lib/lab/format";
import { cn } from "@/lib/utils";

type End = { value: number; status: Status; source: string };
export type RangeRow = { key: string; label: string; kind: string; low: End; high: End | null; base: End | null; tone: string };

const money = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/**
 * Horizontal price ranges on one ₹/kg axis (no JS). A bar = low–high band,
 * a dot = single observation, a ring = the price we plan on.
 */
export function RangeChart({ rows, max, ticks, ariaLabel }: { rows: RangeRow[]; max: number; ticks: number[]; ariaLabel: string }) {
  const x = (v: number) => `${Math.max(0, Math.min(100, (v / max) * 100))}%`;
  return (
    <div role="img" aria-label={ariaLabel}>
      <ul className="flex flex-col gap-4">
        {rows.map((r) => {
          const lo = r.low.value;
          const hi = r.high?.value ?? lo;
          return (
            <li key={r.key} className="grid gap-1.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-center sm:gap-4">
              <div className="min-w-0 text-sm">
                <p className="font-medium">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.kind}</p>
              </div>
              <div>
                <div className="relative h-6 rounded-full bg-muted/50">
                  {r.high ? (
                    <span className={cn("absolute top-1.5 h-3 rounded-full opacity-70", r.tone)} style={{ left: x(lo), width: `calc(${x(hi)} - ${x(lo)})` }} />
                  ) : (
                    <span className={cn("absolute top-1.5 size-3 -translate-x-1/2 rounded-full", r.tone)} style={{ left: x(lo) }} />
                  )}
                  {r.base ? (
                    <span className="absolute top-0.5 size-5 -translate-x-1/2 rounded-full border-2 border-foreground bg-background/40" style={{ left: x(r.base.value) }} title="Planning price" />
                  ) : null}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{r.high ? `${money(lo)}–${money(hi)}/kg` : `${money(lo)}/kg`}</span>
                  {r.base ? <span>· plan {money(r.base.value)}/kg</span> : null}
                  <StatusBadge status={r.base?.status ?? r.low.status} />
                  <span>{shortSource(r.low.source)}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 hidden grid-cols-[14rem_1fr] gap-4 sm:grid" aria-hidden>
        <span />
        <div className="relative h-4 text-[10px] text-muted-foreground">
          {ticks.map((t) => (
            <span key={t} className="absolute -translate-x-1/2" style={{ left: x(t) }}>
              ₹{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
