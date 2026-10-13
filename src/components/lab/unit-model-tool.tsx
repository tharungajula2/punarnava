"use client";

import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Pill, StatusBadge } from "@/components/os/ui";
import type { Status } from "@/data/assumptions";
import { crore, lakh, pct } from "@/lib/format";
import { shortSource } from "@/lib/lab/format";
import { applyShock, unitModel, type Shock, type UnitInputs } from "@/lib/lab/unit-model";
import { cn } from "@/lib/utils";

type Slider = {
  key: keyof UnitInputs;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  source: { id: string; text: string; status: Status } | null;
};

type Checks = {
  ebitdaKg: number;
  ebitdaKgNoEpr: number;
  breakevenPct: number;
  paybackYears: number;
  stress: { feed: number; yield: number; price: number; combined: number };
  shocks: Shock;
};

const rs = (n: number) => `${n < 0 ? "−" : ""}₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const costColors = ["bg-chart-3", "bg-chart-5", "bg-chart-2", "bg-chart-4", "bg-muted-foreground/60"];

export function UnitModelTool({ base, sliders, checks }: { base: UnitInputs; sliders: Slider[]; checks: Checks }) {
  const [inputs, setInputs] = useState<UnitInputs>(base);
  const r = useMemo(() => unitModel(inputs), [inputs]);
  const isBase = sliders.every((s) => inputs[s.key] === base[s.key]);

  const presets: { label: string; apply: () => UnitInputs }[] = [
    { label: "Base case", apply: () => base },
    { label: "R2 combined stress", apply: () => applyShock(base, { feedPct: checks.shocks.feedPct, yieldPp: -checks.shocks.yieldPp, pricePct: -checks.shocks.pricePct }) },
    { label: "No EPR income", apply: () => ({ ...base, eprPrice: 0 }) },
    { label: "Year-1 ramp (70%)", apply: () => ({ ...base, utilisationPct: 70 }) },
  ];

  const sens = useMemo(() => {
    const s = checks.shocks;
    const at = (shock: Shock) => unitModel(applyShock(inputs, shock)).marginKg;
    return [
      { label: `Feedstock price ±${s.feedPct}%`, down: at({ feedPct: s.feedPct, yieldPp: 0, pricePct: 0 }), up: at({ feedPct: -s.feedPct, yieldPp: 0, pricePct: 0 }), r2: checks.stress.feed },
      { label: `Yield ±${s.yieldPp} pp`, down: at({ feedPct: 0, yieldPp: -s.yieldPp, pricePct: 0 }), up: at({ feedPct: 0, yieldPp: s.yieldPp, pricePct: 0 }), r2: checks.stress.yield },
      { label: `Pellet price ±${s.pricePct}%`, down: at({ feedPct: 0, yieldPp: 0, pricePct: -s.pricePct }), up: at({ feedPct: 0, yieldPp: 0, pricePct: s.pricePct }), r2: checks.stress.price },
    ];
  }, [inputs, checks]);
  const span = Math.max(1, ...sens.flatMap((x) => [Math.abs(x.down - r.marginKg), Math.abs(x.up - r.marginKg)]));

  const costTotal = r.costLines.reduce((a, c) => a + c.perKg, 0);
  const beOk = r.breakevenPct !== null && r.breakevenPct <= 100;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
      {/* Inputs */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">Inputs</p>
          <button
            type="button"
            onClick={() => setInputs(base)}
            disabled={isBase}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Reset
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button key={p.label} type="button" onClick={() => setInputs(p.apply())} className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-muted">
              {p.label}
            </button>
          ))}
        </div>
        {sliders.map((s) => {
          const val = inputs[s.key];
          const changed = val !== base[s.key];
          const id = `in-${s.key}`;
          return (
            <div key={s.key}>
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor={id} className="text-sm">
                  {s.label}
                </label>
                <span className={cn("text-sm tabular-nums", changed && "font-medium text-primary")}>
                  {Number(val.toFixed(2)).toLocaleString("en-IN")} <span className="text-xs text-muted-foreground">{s.unit}</span>
                </span>
              </div>
              <input
                id={id}
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={val}
                onChange={(e) => setInputs((x) => ({ ...x, [s.key]: Number(e.target.value) }))}
                className="mt-1.5 w-full accent-[var(--primary)]"
              />
              <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                {s.source ? (
                  <>
                    Base {Number(base[s.key].toFixed(2)).toLocaleString("en-IN")} · {shortSource(s.source.text)} <StatusBadge status={s.source.status} />
                  </>
                ) : (
                  <>Model setting — 100% = steady state in R2</>
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* Outputs */}
      <div className="flex min-w-0 flex-col gap-4" aria-live="polite">
        <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Out label="EBITDA margin per kg" value={rs(r.marginKg)} bad={r.marginKg < 0} hint={`${pct(r.marginPct, 1)} of revenue`} />
          <Out label="EBITDA per month" value={lakh(r.ebitda, 2)} bad={r.ebitda < 0} hint={`${crore(r.annualEbitda)} a year`} />
          <Out label="Cash break-even" value={beOk ? pct(r.breakevenPct!, 1) : "Not reachable"} bad={!beOk} hint={beOk ? "of plant capacity" : "Costs exceed revenue even at full capacity"} />
          <Out label="All-in payback" value={r.paybackYears !== null ? `${r.paybackYears.toFixed(1)} yrs` : "Never"} bad={r.paybackYears === null} hint={`on ${lakh(r.funding, 1)} funding`} />
        </dl>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium">Where each ₹ of revenue goes, per kg</p>
            <p className="text-xs text-muted-foreground">
              Revenue {rs(r.pricePerKg)} · cost {rs(r.costPerKg)}
            </p>
          </div>
          <div className="mt-3 flex h-5 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label={`Cost per kilogram ${rs(r.costPerKg)} against revenue ${rs(r.pricePerKg)}`}>
            {r.costLines.map((c, i) => (
              <span key={c.key} className={costColors[i]} style={{ width: `${(c.perKg / Math.max(costTotal, r.pricePerKg)) * 100}%` }} />
            ))}
          </div>
          <ul className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2">
            {r.costLines.map((c, i) => (
              <li key={c.key} className="flex items-center gap-2">
                <span className={cn("size-2.5 shrink-0 rounded-full", costColors[i])} aria-hidden />
                <span className="flex-1 text-muted-foreground">{c.label}</span>
                <span className="tabular-nums">{rs(c.perKg)}</span>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full bg-muted ring-1 ring-border" aria-hidden />
              <span className="flex-1 text-muted-foreground">{r.marginKg >= 0 ? "Left as EBITDA" : "Shortfall"}</span>
              <span className={cn("tabular-nums", r.marginKg < 0 && "text-destructive")}>{rs(r.marginKg)}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <p className="font-medium">What moves the margin most</p>
          <p className="text-xs text-muted-foreground">R2&apos;s one-factor shocks applied to the inputs on the left. Bar = change in EBITDA per kg.</p>
          <ul className="mt-4 flex flex-col gap-3">
            {sens.map((s) => (
              <li key={s.label} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 text-xs sm:grid-cols-[9rem_1fr]">
                <span>{s.label}</span>
                <div>
                  <div className="relative h-4">
                    <span className="absolute inset-y-0 left-1/2 w-px bg-border" />
                    <span className="absolute inset-y-0.5 rounded-l bg-destructive/70" style={{ right: "50%", width: `${(Math.abs(s.down - r.marginKg) / span) * 50}%` }} />
                    <span className="absolute inset-y-0.5 rounded-r bg-status-verified/80" style={{ left: "50%", width: `${(Math.abs(s.up - r.marginKg) / span) * 50}%` }} />
                  </div>
                  <p className="mt-0.5 flex justify-between tabular-nums text-muted-foreground">
                    <span>{rs(s.down)}</span>
                    <span>{rs(s.up)}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {isBase ? (
            <p className="mt-3 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
              <Pill tone="good">Matches R2</Pill> Adverse cases: {rs(checks.stress.feed)}, {rs(checks.stress.yield)}, {rs(checks.stress.price)}; all three at once {rs(checks.stress.combined)}/kg.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Out({ label, value, hint, bad }: { label: string; value: string; hint?: string; bad?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-xs">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("mt-1.5 truncate font-display text-2xl tabular-nums", bad && "text-destructive")}>{value}</dd>
      {hint ? <dd className="mt-1 text-xs text-muted-foreground">{hint}</dd> : null}
    </div>
  );
}
