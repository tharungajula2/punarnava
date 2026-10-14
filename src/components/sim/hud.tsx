"use client";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  FastForward,
  House,
  Maximize,
  Minimize,
  Minus,
  Moon,
  Navigation,
  Pause,
  Play,
  Plus,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Sun,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import {
  BUFFER_ORDER,
  SUNRISE_HOUR,
  SUNSET_HOUR,
  bufferKg,
  clock,
  getKpis,
  placeById,
  type BufferId,
  type HourSample,
  type Lot,
  type Milestone,
  type PlantSim,
  type Scenario,
  type SimParams,
  type Truck,
  type UnitId,
} from "@/sim";
import { EventButtons, EventLog, ScenarioSliders } from "./controls";
import { fmt, reasonLabel, statusColor, statusLabel } from "./format";
import { nodeDetails, nodeLabel, truckActivity } from "./schematic";
import { SPEEDS, useSim, useSimStore } from "./sim-store";
import { truckSpots, useSceneStore, type CameraCmd } from "./three/camera-store";
import { SPOTS } from "./three/site";
import { TOUR, TOUR_STOP_S } from "./tour";

type Status = "placeholder" | "researched" | "verified";

// ── KPI tiles ────────────────────────────────────────────────────────────────

type Trend = { dir: -1 | 0 | 1; note: string };
type Tile = { label: string; value: string; sub: string; trend: Trend | null; spark: (number | null)[]; bars?: boolean; tone?: "bad" };

const DAY = 1440;

/** Latest hourly sample that is at least 24 sim-hours old. */
function dayAgo(h: HourSample[], now: number): HourSample | null {
  for (let i = h.length - 1; i >= 0; i--) if (h[i].t <= now - DAY) return h[i];
  return null;
}

function trend(now: number | null, then: number | null | undefined, eps: number, note: (d: number) => string): Trend | null {
  if (now === null || then === null || then === undefined) return null;
  const d = now - then;
  return { dir: Math.abs(d) < eps ? 0 : d > 0 ? 1 : -1, note: note(d) };
}

const signed = (d: number, f: (x: number) => string) => `${d >= 0 ? "+" : "−"}${f(Math.abs(d))}`;

/** The five headline numbers. Everything comes from the engine (getKpis + its hourly samples). */
export function kpiTiles(sim: PlantSim): Tile[] {
  const s = sim.state;
  const k = getKpis(s, sim.params);
  const H = s.hourly;
  const now = s.t;
  const dayStart = Math.floor(now / DAY) * DAY;
  let today = s.hour.lineKg;
  let yesterday = 0;
  for (const h of H) {
    if (h.t > dayStart) today += h.lineKg;
    else if (h.t > dayStart - DAY && h.t <= now - DAY) yesterday += h.lineKg;
  }
  const old = dayAgo(H, now);
  const last = H.slice(-24);
  return [
    {
      label: "Processed today",
      value: fmt.t(today),
      sub: `${fmt.t(k.tonnesIn * 1000)} in since day 1`,
      trend: now >= DAY ? trend(today, yesterday, 50, (d) => `${signed(d, (x) => fmt.t(x))} vs this time yesterday`) : null,
      spark: last.map((h) => h.lineKg),
      bars: true,
    },
    {
      label: "Yield",
      value: k.yieldPct === null ? "—" : `${fmt.n(k.yieldPct, 1)}%`,
      sub: "pellets ÷ feedstock",
      trend: trend(k.yieldPct, old?.yieldPct, 0.05, (d) => `${signed(d, (x) => fmt.n(x, 1))} pp vs 24 h ago`),
      spark: last.map((h) => h.yieldPct),
    },
    {
      label: "Margin / kg",
      value: k.marginPerKg === null ? "—" : fmt.rs(k.marginPerKg),
      sub: "price − cost, last 7 days",
      trend: trend(k.marginPerKg, old?.marginPerKg, 0.01, (d) => `${signed(d, (x) => fmt.rs(x))} vs 24 h ago`),
      spark: last.map((h) => h.marginPerKg),
      tone: k.marginPerKg !== null && k.marginPerKg < 0 ? "bad" : undefined,
    },
    {
      label: "EPR credits",
      value: fmt.t(k.eprCreditsT * 1000),
      sub: "eligible output dispatched",
      trend: trend(s.eprCreditsKg, old?.eprKg, 1, (d) => `${signed(d, (x) => fmt.t(x))} in 24 h`),
      spark: last.map((h) => h.eprKg),
    },
    {
      label: "Cash",
      value: fmt.lakh(k.cash),
      sub: `owed to us ${fmt.lakh(k.receivables)}`,
      trend: trend(k.cash, old?.cash, 500, (d) => `${signed(d, (x) => fmt.lakh(x).replace("₹", "₹"))} vs 24 h ago`),
      spark: last.map((h) => h.cash),
      tone: k.cash < 0 ? "bad" : undefined,
    },
  ];
}

function Spark({ values, bars }: { values: (number | null)[]; bars?: boolean }) {
  const v = values.filter((x): x is number => x !== null);
  if (v.length < 2) return null;
  const W = 64;
  const Hh = 22;
  const min = bars ? 0 : Math.min(...v);
  const max = Math.max(...v);
  const span = max - min || 1;
  const y = (x: number) => Hh - 2 - ((x - min) / span) * (Hh - 4);
  if (bars) {
    const w = W / values.length;
    return (
      <svg width={W} height={Hh} className="shrink-0 text-primary" aria-hidden>
        {values.map((x, i) => (x === null ? null : <rect key={i} x={i * w + 0.5} y={y(x)} width={Math.max(1, w - 1)} height={Hh - 2 - y(x)} rx={0.5} fill="currentColor" opacity={0.55} />))}
      </svg>
    );
  }
  const pts = values.map((x, i) => (x === null ? null : `${(i / (values.length - 1)) * W},${y(x)}`)).filter(Boolean);
  return (
    <svg width={W} height={Hh} className="shrink-0 text-primary" aria-hidden>
      <polyline points={pts.join(" ")} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function TrendChip({ t }: { t: Trend | null }) {
  if (!t) return null;
  const Icon = t.dir > 0 ? ArrowUpRight : t.dir < 0 ? ArrowDownRight : ArrowRight;
  return (
    <span
      title={t.note}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full",
        t.dir > 0 ? "bg-status-verified/15 text-status-verified" : t.dir < 0 ? "bg-destructive/12 text-destructive" : "bg-muted text-muted-foreground",
      )}
    >
      <Icon className="size-3.5" aria-label={t.note} />
    </span>
  );
}

export function KpiStrip() {
  const sim = useSim();
  if (!sim) return null;
  return (
    <div className="hud pointer-events-none absolute inset-x-3 top-3 z-10 grid grid-cols-5 gap-2">
      {kpiTiles(sim).map((c) => (
        <div key={c.label} className="glass pointer-events-auto min-w-0 px-3 py-2">
          <div className="flex items-center justify-between gap-1.5">
            <p className="truncate text-[10.5px] font-medium tracking-wide text-muted-foreground uppercase">{c.label}</p>
            <TrendChip t={c.trend} />
          </div>
          <div className="mt-0.5 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className={cn("font-display text-[1.35rem] leading-none tabular-nums", c.tone === "bad" ? "text-destructive" : "text-foreground")}>{c.value}</p>
              <p className="mt-1 truncate text-[10.5px] text-muted-foreground">{c.sub}</p>
            </div>
            <span className="hidden 2xl:block">
              <Spark values={c.spark} bars={c.bars} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Control dock + show-mode buttons ─────────────────────────────────────────

const ROW2 = "top-[5.6rem]";

function IconBtn({ label, onClick, children, active, className }: { label: string; onClick: () => void; children: ReactNode; active?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-xl text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active && "bg-primary/12 text-primary",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ControlDock() {
  const sim = useSim();
  const { playing, speed, setPlaying, setSpeed, advance, reset } = useSimStore();
  if (!sim) return null;
  const c = clock(sim.state.t);
  const isDay = c.hourFloat >= SUNRISE_HOUR && c.hourFloat < SUNSET_HOUR;
  return (
    <div className={cn("hud glass absolute left-3 z-10 flex items-center gap-1 p-1", ROW2)} role="group" aria-label="Simulation controls">
      <button
        type="button"
        onClick={() => setPlaying(!playing)}
        aria-label={playing ? "Pause" : "Play"}
        title={playing ? "Pause" : "Play"}
        className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
      >
        {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4 translate-x-px" aria-hidden />}
      </button>
      <div role="group" aria-label="Simulation speed" className="flex rounded-xl bg-muted/60 p-0.5">
        {SPEEDS.map((x) => (
          <button
            key={x}
            type="button"
            onClick={() => setSpeed(x)}
            aria-pressed={speed === x}
            title={x === 1 ? "1 simulated minute per second" : `${x} simulated minutes per second`}
            className={cn("rounded-[10px] px-2 py-1 font-mono text-[11px] tabular-nums transition-colors", speed === x ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {x}×
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 px-2" aria-label={`Day ${c.day}, ${c.weekday} ${fmt.clock(c.hour, c.minute)}`}>
        {isDay ? <Sun className="size-4 text-chart-2" aria-hidden /> : <Moon className="size-4 text-chart-3" aria-hidden />}
        <span className="leading-none">
          <span className="block text-[10px] text-muted-foreground">
            Day {c.day} · {c.weekday}
          </span>
          <span className="font-mono text-sm tabular-nums">{fmt.clock(c.hour, c.minute)}</span>
        </span>
      </div>
      <IconBtn label="Skip ahead one day" onClick={() => advance(DAY)}>
        <FastForward className="size-4" aria-hidden />
      </IconBtn>
      <IconBtn label="Restart the simulation" onClick={() => reset()}>
        <RotateCcw className="size-4" aria-hidden />
      </IconBtn>
    </div>
  );
}

export function ModeButtons({ fullscreen, onFullscreen, canFullscreen }: { fullscreen: boolean; onFullscreen: () => void; canFullscreen: boolean }) {
  const mode = useSceneStore((s) => s.mode);
  const startTour = useStartTour();
  const startCinematic = useStartCinematic();
  const btn = "flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium transition-colors";
  return (
    <div className={cn("hud glass absolute right-3 z-10 flex items-center gap-1 p-1", ROW2)} role="group" aria-label="Show modes">
      <button type="button" onClick={startTour} title="Guided tour (T)" className={cn(btn, mode === "tour" ? "bg-primary text-primary-foreground" : "text-foreground/85 hover:bg-primary/10 hover:text-primary")}>
        <Navigation className="size-3.5" aria-hidden /> Guided tour
      </button>
      <button type="button" onClick={startCinematic} title="Cinematic mode (C)" className={cn(btn, "text-foreground/85 hover:bg-primary/10 hover:text-primary")}>
        <Clapperboard className="size-3.5" aria-hidden /> Cinematic
      </button>
      {canFullscreen ? (
        <IconBtn label={fullscreen ? "Exit full screen (F)" : "Full screen (F)"} onClick={onFullscreen}>
          {fullscreen ? <Minimize className="size-4" aria-hidden /> : <Maximize className="size-4" aria-hidden />}
        </IconBtn>
      ) : null}
    </div>
  );
}

export function useStartTour() {
  return () => {
    const { mode, setMode } = useSceneStore.getState();
    if (mode === "tour") return setMode("explore");
    const sim = useSimStore.getState();
    sim.select(null);
    if (!sim.playing) sim.setPlaying(true);
    // A calm pace for narration: 10 simulated minutes per second.
    if (sim.speed > 10) sim.setSpeed(10);
    setMode("tour");
  };
}

export function useStartCinematic() {
  return () => {
    const { mode, setMode } = useSceneStore.getState();
    if (mode === "cinematic") return setMode("explore");
    const sim = useSimStore.getState();
    sim.select(null);
    if (!sim.playing) sim.setPlaying(true);
    if (sim.speed > 60) sim.setSpeed(60);
    setMode("cinematic");
  };
}

// ── Left rail: camera + scenario / events drawer ─────────────────────────────

const CAMERA_BUTTONS: { cmd: CameraCmd; label: string; icon: typeof Plus }[] = [
  { cmd: "zoomIn", label: "Zoom in", icon: Plus },
  { cmd: "zoomOut", label: "Zoom out", icon: Minus },
  { cmd: "rotateLeft", label: "Rotate left", icon: RotateCcw },
  { cmd: "rotateRight", label: "Rotate right", icon: RotateCw },
  { cmd: "reset", label: "Reset camera", icon: House },
];

type Drawer = "scenario" | "events" | null;

export function LeftRail({ params, statuses }: { params: SimParams; statuses: Record<keyof Scenario, Status> }) {
  const command = useSceneStore((s) => s.command);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const sim = useSim();
  const activeEvents = sim ? sim.state.events.filter((e) => e.end > sim.state.t).length : 0;
  const changed = sim ? (Object.keys(sim.state.scenario) as (keyof Scenario)[]).some((k) => sim.state.scenario[k] !== params[k]) : false;
  const toggle = (d: Exclude<Drawer, null>) => setDrawer(drawer === d ? null : d);
  return (
    <>
      <div className="hud glass absolute top-1/2 left-3 z-10 flex -translate-y-1/2 flex-col gap-0.5 p-1">
        {CAMERA_BUTTONS.map(({ cmd, label, icon: Icon }) => (
          <IconBtn key={cmd} label={label} onClick={() => command(cmd)} className="size-9">
            <Icon className="size-4" aria-hidden />
          </IconBtn>
        ))}
        <span className="mx-2 my-1 h-px bg-border" aria-hidden />
        <IconBtn label="Scenario sliders" onClick={() => toggle("scenario")} active={drawer === "scenario"} className="relative size-9">
          <SlidersHorizontal className="size-4" aria-hidden />
          {changed ? <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-chart-2" aria-hidden /> : null}
        </IconBtn>
        <IconBtn label="Events: breakdown, monsoon, price shock" onClick={() => toggle("events")} active={drawer === "events"} className="relative size-9">
          <Zap className="size-4" aria-hidden />
          {activeEvents ? <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive" aria-hidden /> : null}
        </IconBtn>
      </div>
      {drawer ? (
        <aside
          className="hud hud-explore glass absolute top-[8.6rem] bottom-[calc(var(--hud-b)+11.5rem)] left-[3.9rem] z-20 flex w-[20rem] flex-col animate-in fade-in slide-in-from-left-2 duration-200"
          aria-label={drawer === "scenario" ? "Scenario" : "Events"}
        >
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
            <h3 className="font-sans text-sm font-medium">{drawer === "scenario" ? "Scenario" : "Events"}</h3>
            <button type="button" onClick={() => setDrawer(null)} aria-label="Close" className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {drawer === "scenario" ? (
              <ScenarioSliders params={params} statuses={statuses} compact />
            ) : (
              <>
                <EventButtons />
                <h4 className="mt-5 mb-2 text-xs font-medium text-muted-foreground">Event log</h4>
                <EventLog />
              </>
            )}
          </div>
        </aside>
      ) : null}
    </>
  );
}

// ── Right: detail panel ──────────────────────────────────────────────────────

export function DetailPanel() {
  const sim = useSim();
  const selected = useSimStore((s) => s.selected);
  const select = useSimStore((s) => s.select);
  if (!sim || !selected) return null;
  const s = sim.state;
  const unit = selected in s.units ? s.units[selected as UnitId] : null;
  const util = unit && unit.scheduledMin + unit.downScheduledMin > 0 ? unit.runningMin / (unit.scheduledMin + unit.downScheduledMin) : null;
  const truck = s.trucks.find((t) => t.id === selected);
  return (
    <aside
      className="hud hud-explore glass absolute top-[8.6rem] right-3 bottom-[calc(var(--hud-b)+13rem)] z-20 w-72 overflow-y-auto p-4 animate-in fade-in slide-in-from-right-4 duration-200"
      aria-label={`${nodeLabel(selected)} details`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10.5px] font-medium tracking-wide text-muted-foreground uppercase">{truck ? "Truck" : unit ? "Machine" : "Zone"}</p>
          <h3 className="font-display text-lg leading-tight">{nodeLabel(selected)}</h3>
        </div>
        <button type="button" onClick={() => select(null)} aria-label="Close details" className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      {unit && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="size-2.5 rounded-full" style={{ background: statusColor[unit.status] }} aria-hidden />
          <span className="font-medium">{statusLabel[unit.status]}</span>
          {unit.reason && <span className="text-muted-foreground">· {reasonLabel[unit.reason]}</span>}
        </div>
      )}
      {util !== null && <Meter label="Utilisation" value={util} />}
      {truck && truck.phaseMinutes > 0 && <Meter label={truckActivity(truck)} value={phaseProgress(truck)} />}
      <dl className="mt-3 space-y-1.5 text-sm">
        {nodeDetails(s, selected)
          .filter(([k]) => !(unit && (k === "Status" || k === "Utilisation")))
          .map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right tabular-nums">{v}</dd>
            </div>
          ))}
      </dl>
    </aside>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between gap-2 text-xs text-muted-foreground">
        <span className="truncate">{label}</span>
        <span className="tabular-nums">{fmt.n(value * 100)}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${Math.min(100, value * 100)}%` }} />
      </div>
    </div>
  );
}

const phaseProgress = (t: Truck) => (t.phaseMinutes > 0 ? Math.max(0, Math.min(1, 1 - t.timer / t.phaseMinutes)) : 0);

// ── Bottom: batch tracker ────────────────────────────────────────────────────

const STEPS: { key: Milestone; label: string }[] = [
  { key: "received", label: "Received" },
  { key: "sorted", label: "Sorted" },
  { key: "washed", label: "Washed" },
  { key: "pelletized", label: "Pelletized" },
  { key: "qc", label: "QC" },
  { key: "dispatched", label: "Dispatched" },
];

/** Typical minutes between consecutive milestones, from lots that have both. */
function typicalGaps(lots: Lot[]): (number | null)[] {
  return STEPS.slice(0, -1).map((st, i) => {
    const next = STEPS[i + 1].key;
    const gaps = lots.map((l) => (l.milestones[st.key] !== undefined && l.milestones[next] !== undefined ? l.milestones[next]! - l.milestones[st.key]! : null)).filter((g): g is number => g !== null);
    return gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null;
  });
}

/** Position along the 6-step track: last milestone reached + how far into the next leg (vs the typical leg time, capped). */
function lotPosition(lot: Lot, now: number, gaps: (number | null)[]) {
  let i = -1;
  STEPS.forEach((st, k) => {
    if (lot.milestones[st.key] !== undefined) i = k;
  });
  if (i < 0) return 0;
  if (i >= STEPS.length - 1) return STEPS.length - 1;
  const typical = gaps[i];
  const since = now - lot.milestones[STEPS[i].key]!;
  return i + (typical ? Math.min(0.88, since / typical) : 0.35);
}

export function BatchTracker() {
  const sim = useSim();
  const [focusId, setFocusId] = useState<number | null>(null);
  if (!sim) return null;
  const s = sim.state;
  const active = s.lots.slice(-6);
  const gaps = typicalGaps([...s.doneLots, ...s.lots]);
  const fallback = [...active].reverse().find((l) => l.milestones.sorted !== undefined) ?? active[active.length - 1] ?? s.doneLots[0];
  const lot = active.find((l) => l.id === focusId) ?? fallback;
  const pct = (p: number) => `${(p / (STEPS.length - 1)) * 100}%`;
  const pos = lot ? lotPosition(lot, s.t, gaps) : 0;

  return (
    <section className="hud hud-explore glass absolute bottom-[var(--hud-b)] left-3 z-10 right-[21.5rem] px-4 pt-2.5 pb-3" aria-label="Batch tracker">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-sans text-sm font-medium">Batch tracker</h3>
        {lot ? (
          <p className="truncate text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Lot #{lot.id}</span> · {placeById(lot.pointId).name.replace(" (sample)", "")} · {fmt.t(lot.kgIn)} in · {fmt.t(lot.kgPacked)} packed
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">One lot = one truckload</p>
        )}
      </div>
      {!lot ? (
        <p className="py-4 text-xs text-muted-foreground">No lots yet — the first truck reaches the weighbridge mid-morning. Press play.</p>
      ) : (
        <div className="relative mx-4 mt-3 mb-1 h-[3.1rem]">
          <span className="absolute top-[7px] right-0 left-0 h-1 rounded-full bg-muted" aria-hidden />
          <span className="absolute top-[7px] left-0 h-1 rounded-full bg-gradient-to-r from-primary/70 to-primary transition-[width] duration-500" style={{ width: pct(pos) }} aria-hidden />
          {STEPS.map((st, i) => {
            const t = lot.milestones[st.key];
            const c = t === undefined ? null : clock(t);
            return (
              <div key={st.key} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: pct(i) }}>
                <span className={cn("size-[18px] rounded-full border-[3px]", c ? "border-primary bg-card" : "border-muted bg-card")} aria-hidden />
                <span className={cn("mt-1 text-[11px] whitespace-nowrap", c ? "font-medium text-foreground" : "text-muted-foreground")}>{st.label}</span>
                <span className="font-mono text-[9.5px] whitespace-nowrap text-muted-foreground tabular-nums">{c ? `D${c.day} ${fmt.clock(c.hour, c.minute)}` : "—"}</span>
              </div>
            );
          })}
          {active
            .filter((l) => l.id !== lot.id)
            .map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setFocusId(l.id)}
                title={`Lot #${l.id} — click to follow`}
                className="absolute top-[3px] size-3 -translate-x-1/2 rounded-full border-2 border-card bg-chart-2 transition-[left] duration-500 hover:scale-125"
                style={{ left: pct(lotPosition(l, s.t, gaps)) }}
              />
            ))}
          {pos < STEPS.length - 1 ? (
            <span
              className="absolute -top-[5px] flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 font-mono text-[10px] text-primary-foreground shadow-soft transition-[left] duration-500"
              style={{ left: pct(pos) }}
            >
              <span className="size-1.5 animate-pulse rounded-full bg-primary-foreground" aria-hidden />#{lot.id}
            </span>
          ) : null}
        </div>
      )}
    </section>
  );
}

// ── Bottom-right: live tabs ──────────────────────────────────────────────────

type Tab = "Trucks" | "Machines" | "Inventory";
const UNIT_ORDER: UnitId[] = ["sorting", "shredder", "wash", "dryer", "extruder", "pelletizer", "qc", "packing"];
const BUFFER_LABEL: Record<BufferId, string> = {
  baleYard: "Bale yard",
  sorted: "Sorted bin",
  flakes: "Flake bin",
  washed: "Washed flakes",
  silo: "Dry-flake silo",
  melt: "Strand buffer",
  qcHold: "QC hold",
  packQueue: "Released, to pack",
  finishedGoods: "Finished goods",
};
const BUFFER_SPOT: Partial<Record<BufferId, string>> = { baleYard: "baleYard", silo: "silo", qcHold: "qc", packQueue: "packing", finishedGoods: "finishedGoods" };

function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <span className="block h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
      <span className={cn("block h-full rounded-full transition-[width] duration-300", className ?? "bg-primary")} style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }} />
    </span>
  );
}

export function PlantTabs() {
  const sim = useSim();
  const [tab, setTab] = useState<Tab>("Trucks");
  const selected = useSimStore((s) => s.selected);
  const select = useSimStore((s) => s.select);
  const focusOn = useSceneStore((s) => s.focusOn);
  if (!sim) return null;
  const s = sim.state;

  const pick = (id: string) => {
    select(id);
    const t = truckSpots.get(id);
    const spot = t?.visible ? t : SPOTS[id];
    if (spot) focusOn(spot.x, spot.z);
  };
  const row = (id: string, children: ReactNode) => (
    <li key={id}>
      <button
        type="button"
        onClick={() => pick(id)}
        className={cn("w-full rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-primary/10", selected === id && "bg-primary/10")}
      >
        {children}
      </button>
    </li>
  );

  return (
    <section className="hud hud-explore glass absolute right-3 bottom-[var(--hud-b)] z-10 flex h-[12.25rem] w-[20.25rem] flex-col p-2" aria-label="Plant lists">
      <div role="tablist" className="flex gap-1 rounded-xl bg-muted/60 p-0.5">
        {(["Trucks", "Machines", "Inventory"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn("flex-1 rounded-[10px] px-2 py-1 text-xs font-medium transition-colors", tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {t}
          </button>
        ))}
      </div>
      <ul className="mt-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto" role="tabpanel">
        {tab === "Trucks" &&
          s.trucks.map((t) =>
            row(
              t.id,
              <>
                <span className="flex items-center gap-2">
                  <span className={cn("size-2 shrink-0 rounded-full", t.kind === "inbound" ? "bg-primary" : "bg-chart-2")} aria-hidden />
                  <span className="min-w-0 flex-1 truncate font-medium">{nodeLabel(t.id)}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">{t.cargoKg > 0 ? fmt.t(t.cargoKg) : "empty"}</span>
                </span>
                <span className="mt-1 flex items-center gap-2 pl-4">
                  <span className="w-[8.5rem] shrink-0 truncate text-[11px] text-muted-foreground">{truckActivity(t)}</span>
                  <Bar value={phaseProgress(t)} className={t.kind === "inbound" ? "bg-primary" : "bg-chart-2"} />
                </span>
              </>,
            ),
          )}
        {tab === "Machines" && (
          <>
            {UNIT_ORDER.map((id) => {
              const u = s.units[id];
              return row(
                id,
                <span className="flex items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: statusColor[u.status] }} aria-hidden />
                  <span className="w-[5.5rem] shrink-0 truncate font-medium">{nodeLabel(id)}</span>
                  <Bar value={u.rateKgH / Math.max(1, sim.params.lineRateKgH)} className="bg-status-verified" />
                  <span className="w-[4.4rem] shrink-0 truncate text-right text-muted-foreground tabular-nums" title={u.reason ? reasonLabel[u.reason] : statusLabel[u.status]}>
                    {u.status === "running" ? `${fmt.n(u.rateKgH)} kg/h` : u.reason ? reasonLabel[u.reason] : statusLabel[u.status]}
                  </span>
                </span>,
              );
            })}
            <li className="flex gap-3 px-2 pt-1 text-[10.5px] text-muted-foreground">
              {(["running", "idle", "down"] as const).map((st) => (
                <span key={st} className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full" style={{ background: statusColor[st] }} aria-hidden />
                  {st === "idle" ? "idle / planned stop" : statusLabel[st].toLowerCase()}
                </span>
              ))}
            </li>
          </>
        )}
        {tab === "Inventory" &&
          BUFFER_ORDER.map((b) => {
            const kg = bufferKg(s, b);
            const max = b === "finishedGoods" ? sim.params.outboundPayloadKg : b === "baleYard" ? 20_000 : sim.params.bufferKg;
            const id = BUFFER_SPOT[b] ?? b;
            return row(
              id,
              <span className="flex items-center gap-2">
                <span className="w-[6.5rem] shrink-0 truncate font-medium">{BUFFER_LABEL[b]}</span>
                <Bar value={kg / max} className={kg >= max ? "bg-chart-2" : "bg-chart-1"} />
                <span className="w-14 shrink-0 text-right tabular-nums">{fmt.t(kg)}</span>
              </span>,
            );
          })}
      </ul>
    </section>
  );
}

// ── Guided tour ──────────────────────────────────────────────────────────────

/** Drives the tour: frames each stop, rings its machine, advances on a timer. */
export function TourCaption() {
  const sim = useSim();
  const mode = useSceneStore((s) => s.mode);
  const step = useSceneStore((s) => s.tourStep);
  const paused = useSceneStore((s) => s.tourPaused);
  const bar = useRef<HTMLSpanElement>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    if (mode !== "tour") return;
    const stop = TOUR[step];
    const scene = useSceneStore.getState();
    scene.frame(stop.shot);
    scene.setSpotlight(stop.spot ?? null);
    elapsed.current = 0;
  }, [mode, step]);

  useEffect(() => {
    if (mode !== "tour") return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Wall-clock based (capped), so a throttled tab still advances at the right pace.
      const dt = Math.min(0.5, (now - last) / 1000);
      last = now;
      const st = useSceneStore.getState();
      if (!st.tourPaused) elapsed.current += dt;
      const f = Math.min(1, elapsed.current / TOUR_STOP_S);
      if (bar.current) bar.current.style.width = `${f * 100}%`;
      if (f >= 1) {
        if (st.tourStep < TOUR.length - 1) st.setTourStep(st.tourStep + 1);
        else st.setMode("explore");
        elapsed.current = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  if (mode !== "tour" || !sim) return null;
  const stop = TOUR[step];
  const go = (d: number) => {
    const st = useSceneStore.getState();
    const next = st.tourStep + d;
    if (next < 0) return;
    if (next >= TOUR.length) st.setMode("explore");
    else st.setTourStep(next);
  };
  const scene = useSceneStore.getState();
  return (
    <div className="absolute inset-x-0 bottom-[var(--hud-b)] z-30 flex justify-center px-3">
      <div className="glass flex w-full max-w-[44rem] items-center gap-3 px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300" role="status" aria-live="polite">
        <button type="button" onClick={() => go(-1)} disabled={step === 0} aria-label="Previous stop" className="grid size-9 shrink-0 place-items-center rounded-xl hover:bg-foreground/5 disabled:opacity-30">
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex items-baseline gap-2.5">
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {step + 1} / {TOUR.length}
            </span>
            <span className="font-display text-lg leading-tight">{stop.title}</span>
          </p>
          <p key={stop.id} className="mt-0.5 text-sm leading-snug text-foreground/85 animate-in fade-in duration-500">
            {stop.say(sim)}
          </p>
          <span className="mt-2 block h-1 overflow-hidden rounded-full bg-foreground/10" aria-hidden>
            <span ref={bar} className="block h-full rounded-full bg-primary" style={{ width: 0 }} />
          </span>
        </div>
        <button
          type="button"
          onClick={() => scene.setTourPaused(!paused)}
          aria-label={paused ? "Resume tour" : "Pause tour"}
          className="grid size-9 shrink-0 place-items-center rounded-xl hover:bg-foreground/5"
        >
          {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next stop" className="grid size-9 shrink-0 place-items-center rounded-xl hover:bg-foreground/5">
          <ChevronRight className="size-5" aria-hidden />
        </button>
        <button type="button" onClick={() => scene.setMode("explore")} aria-label="End tour" className="grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-foreground/5">
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

// ── Cinematic overlay ────────────────────────────────────────────────────────

export function CinematicOverlay() {
  const sim = useSim();
  const mode = useSceneStore((s) => s.mode);
  const [awake, setAwake] = useState(true);
  useEffect(() => {
    if (mode !== "cinematic") return;
    let timer = window.setTimeout(() => setAwake(false), 2500);
    const wake = () => {
      setAwake(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setAwake(false), 2500);
    };
    window.addEventListener("pointermove", wake);
    return () => {
      window.removeEventListener("pointermove", wake);
      window.clearTimeout(timer);
    };
  }, [mode]);
  if (mode !== "cinematic" || !sim) return null;
  const c = clock(sim.state.t);
  return (
    <>
      <div className="pointer-events-none absolute bottom-[var(--hud-b)] left-4 z-30 flex items-center gap-3 rounded-2xl bg-card/45 px-3.5 py-2.5 backdrop-blur-md animate-in fade-in duration-700">
        <LogoMark className="size-7" />
        <div className="leading-tight">
          <p className="font-display text-base">Punarnava</p>
          <p className="text-[11px] text-muted-foreground">
            Plant digital twin · Day {c.day} · {fmt.clock(c.hour, c.minute)}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => useSceneStore.getState().setMode("explore")}
        className={cn("glass absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 text-xs transition-opacity duration-500", awake ? "opacity-100" : "pointer-events-none opacity-0")}
      >
        <X className="size-3.5" aria-hidden /> Exit cinematic <kbd className="ml-1 rounded bg-muted px-1 font-mono text-[10px]">Esc</kbd>
      </button>
    </>
  );
}

// ── Loading screen ───────────────────────────────────────────────────────────

const LOAD_STEPS = ["Pouring the ground slab", "Raising the hall", "Setting out the machines", "Calling in the trucks", "Switching on the line"];

export function SceneLoader() {
  const ready = useSceneStore((s) => s.ready);
  const [gone, setGone] = useState(false);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (ready) {
      const t = window.setTimeout(() => setGone(true), 700);
      return () => window.clearTimeout(t);
    }
    const t = window.setInterval(() => setI((x) => Math.min(LOAD_STEPS.length - 1, x + 1)), 650);
    return () => window.clearInterval(t);
  }, [ready]);
  if (gone) return null;
  return (
    <div
      className={cn(
        "absolute inset-0 z-40 grid place-items-center bg-[radial-gradient(ellipse_at_center,var(--card)_0%,var(--background)_75%)] transition-opacity duration-700",
        ready ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      role="status"
      aria-label="Loading the 3D plant"
    >
      <div className="flex flex-col items-center gap-5">
        <svg viewBox="0 0 64 64" className="size-16 text-primary" aria-hidden>
          <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="6" />
          <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeDasharray="40 111" className="origin-center animate-spin [animation-duration:1.4s]" />
          <circle cx="32" cy="8" r="4" className="fill-accent" />
        </svg>
        <div className="text-center">
          <p className="font-display text-xl">Building the plant</p>
          <p key={i} className="mt-1 text-sm text-muted-foreground animate-in fade-in duration-300">
            {LOAD_STEPS[i]}…
          </p>
        </div>
        <span className="block h-1 w-48 overflow-hidden rounded-full bg-muted" aria-hidden>
          <span className="block h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${ready ? 100 : 15 + (i / LOAD_STEPS.length) * 70}%` }} />
        </span>
      </div>
    </div>
  );
}

/** Stage keys: T tour · C cinematic · in a show, ←/→ step, Space pause, Esc exit (captured before presentation mode sees them). */
export function useStageKeys() {
  const startTour = useStartTour();
  const startCinematic = useStartCinematic();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const st = useSceneStore.getState();
      const take = () => {
        e.preventDefault();
        e.stopImmediatePropagation();
      };
      if (st.mode === "tour") {
        if (e.key === "ArrowRight") {
          take();
          if (st.tourStep < TOUR.length - 1) st.setTourStep(st.tourStep + 1);
          else st.setMode("explore");
        } else if (e.key === "ArrowLeft") {
          take();
          if (st.tourStep > 0) st.setTourStep(st.tourStep - 1);
        } else if (e.key === " ") {
          take();
          st.setTourPaused(!st.tourPaused);
        } else if (e.key === "Escape") {
          take();
          st.setMode("explore");
        }
      } else if (st.mode === "cinematic" && e.key === "Escape") {
        take();
        st.setMode("explore");
      }
      if (e.defaultPrevented) return;
      if (e.key === "t" || e.key === "T") {
        take();
        startTour();
      } else if (e.key === "c" || e.key === "C") {
        take();
        startCinematic();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [startTour, startCinematic]);
}
