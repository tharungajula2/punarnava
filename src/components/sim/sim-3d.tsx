"use client";

import { ChevronDown, House, Minus, Plus, RotateCcw, RotateCw, X } from "lucide-react";
import dynamic from "next/dynamic";
import { Component, useState, useSyncExternalStore, type ReactNode } from "react";
import { BUFFER_ORDER, bufferKg, clock, placeById, type BufferId, type Lot, type Milestone, type UnitId } from "@/sim";
import { fmt, reasonLabel, statusColor, statusLabel } from "./format";
import { kpiCards } from "./kpi-cards";
import { nodeDetails, nodeLabel, truckActivity } from "./schematic";
import { useSim, useSimStore } from "./sim-store";
import { truckSpots, useSceneStore, type CameraCmd } from "./three/camera-store";
import { SPOTS } from "./three/site";

const PlantScene = dynamic(() => import("./three/plant-scene"), {
  ssr: false,
  loading: () => <SceneMessage>Building the plant…</SceneMessage>,
});

function SceneMessage({ children }: { children: ReactNode }) {
  return <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">{children}</div>;
}

// ── Can this device run the 3D view? ─────────────────────────────────────────

let webgl: boolean | null = null;
function hasWebGL() {
  if (webgl === null) {
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") ?? c.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

const WIDE = "(min-width: 768px)";
function subscribeWide(cb: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** 3D needs WebGL and a tablet-or-larger screen; phones get the 2D schematic. */
export function useCan3D(): boolean {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches && hasWebGL(),
    () => false,
  );
}

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? <SceneMessage>The 3D view could not start on this device.</SceneMessage> : this.props.children;
  }
}

// ── The view ─────────────────────────────────────────────────────────────────

export function Sim3DView() {
  const setView = useSimStore((s) => s.setView);
  return (
    <div className="relative h-[calc(100svh-6rem)] max-h-[920px] min-h-[600px] overflow-hidden rounded-2xl border border-border bg-[#e3ece8] dark:bg-[#1d2833]">
      <SceneBoundary onError={() => setView("2d")}>
        <PlantScene />
      </SceneBoundary>
      <KpiStrip />
      <CameraButtons />
      <DetailPanel />
      <BatchTimeline />
      <BottomTabs />
      <Hint />
    </div>
  );
}

function Hint() {
  const selected = useSimStore((s) => s.selected);
  if (selected) return null;
  return (
    <p className="pointer-events-none absolute right-3 bottom-[11.25rem] glass hidden px-2.5 py-1 text-[11px] text-muted-foreground lg:block">
      Drag to pan · right-drag to rotate · scroll to zoom · click anything for details
    </p>
  );
}

export function ViewToggle() {
  const view = useSimStore((s) => s.view);
  const setView = useSimStore((s) => s.setView);
  return (
    <div role="group" aria-label="View" className="flex rounded-lg border border-border p-0.5">
      {(["3d", "2d"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setView(v)}
          aria-pressed={view === v}
          className={`rounded-md px-3 py-1 text-xs font-medium uppercase transition-colors ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

// ── Overlays ─────────────────────────────────────────────────────────────────

const TOP_KPIS = ["Tonnes in", "Tonnes out", "Yield", "Uptime", "Margin / kg", "Cash"];

function KpiStrip() {
  const sim = useSim();
  const [all, setAll] = useState(false);
  if (!sim) return null;
  const cards = kpiCards(sim);
  const shown = all ? cards : cards.filter((c) => TOP_KPIS.includes(c.label));
  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start gap-2">
      <div className={`pointer-events-auto min-w-0 flex-1 gap-2 ${all ? "grid grid-cols-3 xl:grid-cols-6" : "flex [scrollbar-width:none] overflow-x-auto"}`}>
        {shown.map((c) => (
          <div key={c.label} className={`glass px-3 py-2 ${all ? "" : "min-w-[7.25rem] flex-1"}`} title={c.hint}>
            <p className="truncate text-[10.5px] text-muted-foreground">{c.label}</p>
            <p className={`font-display text-base tabular-nums leading-tight ${c.tone === "bad" ? "text-destructive" : c.tone === "good" ? "text-primary" : "text-foreground"}`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setAll(!all)}
        aria-expanded={all}
        className="glass pointer-events-auto flex shrink-0 items-center gap-1 px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {all ? "Fewer" : "All KPIs"}
        <ChevronDown className={`size-3.5 transition-transform ${all ? "rotate-180" : ""}`} aria-hidden />
      </button>
    </div>
  );
}

const CAMERA_BUTTONS: { cmd: CameraCmd; label: string; icon: typeof Plus }[] = [
  { cmd: "zoomIn", label: "Zoom in", icon: Plus },
  { cmd: "zoomOut", label: "Zoom out", icon: Minus },
  { cmd: "rotateLeft", label: "Rotate left", icon: RotateCcw },
  { cmd: "rotateRight", label: "Rotate right", icon: RotateCw },
  { cmd: "reset", label: "Reset camera", icon: House },
];

function CameraButtons() {
  const command = useSceneStore((s) => s.command);
  return (
    <div className="glass absolute top-1/2 left-3 flex -translate-y-1/2 flex-col gap-0.5 p-1" role="group" aria-label="Camera">
      {CAMERA_BUTTONS.map(({ cmd, label, icon: Icon }) => (
        <button
          key={cmd}
          type="button"
          onClick={() => command(cmd)}
          title={label}
          aria-label={label}
          className="grid size-9 place-items-center rounded-xl text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Icon className="size-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}

function DetailPanel() {
  const sim = useSim();
  const selected = useSimStore((s) => s.selected);
  const select = useSimStore((s) => s.select);
  if (!sim || !selected) return null;
  const s = sim.state;
  const unit = selected in s.units ? s.units[selected as UnitId] : null;
  const util = unit && unit.scheduledMin + unit.downScheduledMin > 0 ? unit.runningMin / (unit.scheduledMin + unit.downScheduledMin) : null;
  return (
    <aside
      className="glass absolute top-[5.25rem] right-3 max-h-[calc(100%-18rem)] w-72 overflow-y-auto p-4 animate-in fade-in slide-in-from-right-4 duration-200"
      aria-label={`${nodeLabel(selected)} details`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Selected</p>
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
      {util !== null && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Utilisation</span>
            <span className="tabular-nums">{fmt.n(util * 100)}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${Math.min(100, util * 100)}%` }} />
          </div>
        </div>
      )}
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

const STEPS: { key: Milestone; label: string }[] = [
  { key: "received", label: "Received" },
  { key: "sorted", label: "Sorted" },
  { key: "washed", label: "Washed" },
  { key: "pelletized", label: "Pelletized" },
  { key: "qc", label: "QC" },
  { key: "dispatched", label: "Dispatched" },
];

function BatchTimeline() {
  const sim = useSim();
  if (!sim) return null;
  const lots: Lot[] = [...sim.state.lots.slice(-3).reverse(), ...sim.state.doneLots].slice(0, 3);
  return (
    <section className="glass absolute right-[21rem] bottom-3 left-3 hidden p-3 lg:block" aria-label="Batch tracking">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-sans text-sm font-medium">Batch tracking</h3>
        <span className="text-[11px] text-muted-foreground">one lot = one truckload</span>
      </div>
      {lots.length === 0 ? (
        <p className="py-3 text-xs text-muted-foreground">No lots yet — the first truck reaches the weighbridge mid-morning on day 1. Press Play.</p>
      ) : (
        <table className="w-full table-fixed text-[10.5px]">
          <thead>
            <tr className="text-muted-foreground">
              <th className="w-28 pb-1 text-left font-normal">Lot</th>
              {STEPS.map((st) => (
                <th key={st.key} className="truncate pb-1 font-normal">
                  {st.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lots.map((lot) => {
              const done = STEPS.filter((st) => lot.milestones[st.key] !== undefined).length;
              return (
                <tr key={lot.id}>
                  <td className="truncate py-1 pr-2 text-xs">
                    <span className="font-medium">#{lot.id}</span>{" "}
                    <span className="text-muted-foreground">{placeById(lot.pointId).name.replace(" (sample)", "")}</span>
                  </td>
                  {STEPS.map((st, i) => {
                    const t = lot.milestones[st.key];
                    const c = t === undefined ? null : clock(t);
                    return (
                      <td key={st.key} className="relative py-1 text-center" title={c ? `${st.label}: day ${c.day} ${fmt.clock(c.hour, c.minute)}` : `${st.label}: not yet`}>
                        {i > 0 && <span className={`absolute top-[11px] right-1/2 left-[-50%] h-0.5 ${i < done ? "bg-primary" : "bg-border"}`} aria-hidden />}
                        <span className={`relative mx-auto block size-2.5 rounded-full border-2 ${c ? "border-primary bg-primary" : "border-border bg-card"}`} aria-hidden />
                        <span className="mt-0.5 hidden font-mono text-[9.5px] text-muted-foreground tabular-nums xl:block">{c ? `D${c.day} ${fmt.clock(c.hour, c.minute)}` : "—"}</span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

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

function BottomTabs() {
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
        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-primary/10 ${selected === id ? "bg-primary/10" : ""}`}
      >
        {children}
      </button>
    </li>
  );

  return (
    <section className="glass absolute right-3 bottom-3 flex h-[10.25rem] w-[19.5rem] flex-col p-2" aria-label="Plant lists">
      <div role="tablist" className="flex gap-1 border-b border-border/60 pb-2">
        {(["Trucks", "Machines", "Inventory"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <ul className="mt-1 flex-1 space-y-0.5 overflow-y-auto" role="tabpanel">
        {tab === "Trucks" &&
          s.trucks.map((t) =>
            row(
              t.id,
              <>
                <span className={`size-2 shrink-0 rounded-full ${t.kind === "inbound" ? "bg-primary" : "bg-chart-2"}`} aria-hidden />
                <span className="w-[6.5rem] shrink-0 font-medium">{nodeLabel(t.id)}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{truckActivity(t)}</span>
                <span className="shrink-0 tabular-nums">{t.cargoKg > 0 ? fmt.t(t.cargoKg) : ""}</span>
              </>,
            ),
          )}
        {tab === "Machines" &&
          UNIT_ORDER.map((id) => {
            const u = s.units[id];
            return row(
              id,
              <>
                <span className="size-2 shrink-0 rounded-full" style={{ background: statusColor[u.status] }} aria-hidden />
                <span className="w-24 shrink-0 font-medium">{nodeLabel(id)}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{u.status === "running" ? statusLabel.running : u.reason ? reasonLabel[u.reason] : statusLabel[u.status]}</span>
                <span className="shrink-0 tabular-nums">{u.status === "running" ? `${fmt.n(u.rateKgH)} kg/h` : ""}</span>
              </>,
            );
          })}
        {tab === "Inventory" &&
          BUFFER_ORDER.map((b) => {
            const kg = bufferKg(s, b);
            const max = b === "finishedGoods" ? sim.params.outboundPayloadKg : b === "baleYard" ? 20_000 : sim.params.bufferKg;
            const id = BUFFER_SPOT[b] ?? b;
            return row(
              `${id}`,
              <>
                <span className="w-28 shrink-0 font-medium">{BUFFER_LABEL[b]}</span>
                <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <span className="block h-full rounded-full bg-chart-1" style={{ width: `${Math.min(100, (kg / max) * 100)}%` }} />
                </span>
                <span className="w-14 shrink-0 text-right tabular-nums">{fmt.t(kg)}</span>
              </>,
            );
          })}
      </ul>
    </section>
  );
}
