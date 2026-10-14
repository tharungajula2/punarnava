"use client";

import { CloudRain, FastForward, Pause, Play, RotateCcw, TrendingDown, Wrench } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LINE_UNITS, clock, unitLabel, type LineUnitId, type Scenario, type SimParams } from "@/sim";
import { fmt } from "./format";
import { SimClock } from "./kpi-cards";
import { SPEEDS, useSim, useSimStore } from "./sim-store";

type Status = "placeholder" | "researched" | "verified";

export function PlaybackControls() {
  const { playing, speed, setPlaying, setSpeed, advance, reset, seed } = useSimStore();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SimClock />
      <span className="mx-1 hidden h-8 w-px bg-border sm:block" aria-hidden />
      <Button onClick={() => setPlaying(!playing)} size="lg" className="min-w-24" aria-pressed={playing}>
        {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
        {playing ? "Pause" : "Play"}
      </Button>
      <div role="group" aria-label="Simulation speed" className="flex rounded-lg border border-border p-0.5">
        {SPEEDS.map((x) => (
          <button
            key={x}
            type="button"
            onClick={() => setSpeed(x)}
            aria-pressed={speed === x}
            className={`rounded-md px-2.5 py-1 font-mono text-xs tabular-nums transition-colors ${speed === x ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            {x}×
          </button>
        ))}
      </div>
      <Button variant="outline" size="lg" onClick={() => advance(24 * 60)}>
        <FastForward aria-hidden /> +1 day
      </Button>
      <Button variant="ghost" size="lg" onClick={() => reset()} title={`Restart from day 1 (seed ${seed})`}>
        <RotateCcw aria-hidden /> Restart
      </Button>
      <p className="w-full text-xs text-muted-foreground 2xl:w-auto">1× = one simulated minute per second · 1000× ≈ 17 simulated hours per second.</p>
    </div>
  );
}

const STATUS_STYLE: Record<Status, string> = {
  placeholder: "bg-status-placeholder/15 text-status-placeholder",
  researched: "bg-status-researched/15 text-status-researched",
  verified: "bg-status-verified/15 text-status-verified",
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLE[status]}`}>{status}</span>;
}

export function ScenarioSliders({ params, statuses, compact }: { params: SimParams; statuses: Record<keyof Scenario, Status>; compact?: boolean }) {
  const sim = useSim();
  const setScenario = useSimStore((s) => s.setScenario);
  if (!sim) return null;
  const sc = sim.state.scenario;

  // Ranges are stretched around the researched base value of each slider.
  const sliders: { key: keyof Scenario; label: string; unit: string; min: number; max: number; step: number; format: (x: number) => string }[] = [
    { key: "feedstockPrice", label: "Feedstock price", unit: "per kg", min: Math.round(params.feedstockPrice * 0.6), max: Math.round(params.feedstockPrice * 1.6), step: 1, format: (x) => `₹${x}` },
    { key: "pelletPrice", label: "Pellet price", unit: "per kg", min: Math.round(params.pelletPrice * 0.7), max: Math.round(params.pelletPrice * 1.35), step: 1, format: (x) => `₹${x}` },
    { key: "throughputTpd", label: "Feedstock intake", unit: "per day", min: params.throughputTpd * 0.4, max: params.throughputTpd * 2, step: 0.5, format: (x) => `${x} t` },
    { key: "shifts", label: "Shifts", unit: "per day", min: 1, max: 3, step: 1, format: (x) => String(x) },
    { key: "powerTariff", label: "Power tariff", unit: "per kWh", min: +(params.powerTariff * 0.6).toFixed(1), max: +(params.powerTariff * 1.5).toFixed(1), step: 0.1, format: (x) => `₹${x.toFixed(1)}` },
    { key: "contaminationPct", label: "Contamination", unit: "rejected", min: Math.round(params.contaminationPct * 0.45), max: Math.round(params.contaminationPct * 2.7), step: 1, format: (x) => `${x}%` },
  ];

  const changed = sliders.some((s) => sc[s.key] !== params[s.key]);

  return (
    <div className="space-y-4">
      {sliders.map((s) => (
        <label key={s.key} className="block">
          <span className={`flex items-baseline justify-between gap-2 ${compact ? "text-[13px]" : "text-sm"}`}>
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate">{s.label}</span> <StatusBadge status={statuses[s.key]} />
            </span>
            <span className="shrink-0 font-mono tabular-nums">
              {s.format(sc[s.key])} {compact ? null : <span className="text-xs text-muted-foreground">{s.unit}</span>}
            </span>
          </span>
          <input
            type="range"
            min={s.min}
            max={s.max}
            step={s.step}
            value={sc[s.key]}
            onChange={(e) => setScenario({ [s.key]: Number(e.target.value) })}
            className="mt-1.5 w-full accent-primary"
          />
          <span className="text-[11px] text-muted-foreground">
            Base case {s.format(params[s.key])}
            {compact ? ` · ${s.unit}` : ""}
          </span>
        </label>
      ))}
      <Button variant="outline" size="sm" disabled={!changed} onClick={() => setScenario(Object.fromEntries(sliders.map((s) => [s.key, params[s.key]])))}>
        Back to base case
      </Button>
    </div>
  );
}

export function EventButtons() {
  const sim = useSim();
  const trigger = useSimStore((s) => s.trigger);
  const [unit, setUnit] = useState<LineUnitId | "random">("random");
  if (!sim) return null;
  const p = sim.params;
  const s = sim.state;
  const daysLeft = (end: number) => Math.max(0, Math.ceil((end - s.t) / 1440));

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as LineUnitId | "random")}
          aria-label="Machine to break"
          className="h-8 min-w-0 flex-1 rounded-lg border border-border bg-background px-2 text-sm"
        >
          <option value="random">Random machine</option>
          {LINE_UNITS.map((id) => (
            <option key={id} value={id}>
              {unitLabel(id)}
            </option>
          ))}
        </select>
        <Button variant="destructive" onClick={() => trigger({ kind: "breakdown", unit: unit === "random" ? undefined : unit })}>
          <Wrench aria-hidden /> Breakdown
        </Button>
      </div>
      <Button variant="outline" className="w-full justify-start" onClick={() => trigger({ kind: "monsoon" })}>
        <CloudRain aria-hidden /> Monsoon supply dip <span className="ml-auto text-xs text-muted-foreground">−{p.monsoonDipPct}% · {p.monsoonDays} d</span>
      </Button>
      <Button variant="outline" className="w-full justify-start" onClick={() => trigger({ kind: "priceShock" })}>
        <TrendingDown aria-hidden /> Pellet price shock <span className="ml-auto text-xs text-muted-foreground">−{p.priceShockPct}% · {p.priceShockDays} d</span>
      </Button>
      {s.events.some((e) => e.end > s.t) && (
        <ul className="flex flex-wrap gap-2 text-xs">
          {s.events.filter((e) => e.end > s.t).map((e) => (
            <li key={e.kind} className="rounded-full bg-status-placeholder/15 px-2 py-0.5 text-status-placeholder">
              {e.kind === "monsoon" ? "Monsoon" : "Price shock"} · {daysLeft(e.end)} d left
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EventLog() {
  const sim = useSim();
  if (!sim) return null;
  const tone = { info: "text-muted-foreground", warn: "text-status-placeholder", bad: "text-destructive", good: "text-primary" };
  return (
    <ol className="max-h-56 space-y-1.5 overflow-y-auto text-xs" aria-live="off">
      {sim.state.log.map((l, i) => {
        const c = clock(l.t);
        return (
          <li key={`${l.t}-${i}`} className="flex gap-2">
            <span className="shrink-0 font-mono text-muted-foreground tabular-nums">
              D{c.day} {fmt.clock(c.hour, c.minute)}
            </span>
            <span className={tone[l.kind]}>{l.text}</span>
          </li>
        );
      })}
    </ol>
  );
}
