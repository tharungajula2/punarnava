"use client";

import { SUNRISE_HOUR, SUNSET_HOUR, bufferKg, clock, unitLabel, type BufferId, type SimState, type UnitId } from "@/sim";
import { fmt, reasonLabel, statusColor, statusLabel } from "./format";
import { useSim, useSimStore } from "./sim-store";

const W = 100;
const H = 88;
const ROW1 = 84;
const ROW2 = 250;

type NodeDef = { id: string; cx: number; cy: number };

const ROW1_NODES: NodeDef[] = [
  { id: "weighbridge", cx: 60, cy: ROW1 },
  { id: "baleYard", cx: 180, cy: ROW1 },
  { id: "sorting", cx: 300, cy: ROW1 },
  { id: "shredder", cx: 420, cy: ROW1 },
  { id: "wash", cx: 540, cy: ROW1 },
  { id: "dryer", cx: 660, cy: ROW1 },
  { id: "extruder", cx: 780, cy: ROW1 },
  { id: "pelletizer", cx: 900, cy: ROW1 },
];
const ROW2_NODES: NodeDef[] = [
  { id: "qc", cx: 900, cy: ROW2 },
  { id: "packing", cx: 740, cy: ROW2 },
  { id: "finishedGoods", cx: 580, cy: ROW2 },
  { id: "dock", cx: 420, cy: ROW2 },
];
const SURGE: { id: BufferId; cx: number }[] = [
  { id: "sorted", cx: 360 },
  { id: "flakes", cx: 480 },
  { id: "washed", cx: 600 },
  { id: "silo", cx: 720 },
  { id: "melt", cx: 840 },
];

export const NODE_LABELS: Record<string, string> = {
  weighbridge: "Weighbridge",
  baleYard: "Bale yard",
  finishedGoods: "Finished goods",
  dock: "Outbound dock",
};

export function nodeLabel(id: string) {
  return NODE_LABELS[id] ?? unitLabel(id as UnitId);
}

function daylight(hour: number) {
  if (hour < SUNRISE_HOUR - 0.5 || hour > SUNSET_HOUR + 0.5) return 0;
  if (hour < SUNRISE_HOUR + 0.5) return hour - (SUNRISE_HOUR - 0.5);
  if (hour > SUNSET_HOUR - 0.5) return SUNSET_HOUR + 0.5 - hour;
  return 1;
}

export function Schematic() {
  const sim = useSim();
  const selected = useSimStore((s) => s.selected);
  const select = useSimStore((s) => s.select);
  if (!sim) return null;
  const s = sim.state;
  const p = sim.params;
  const c = clock(s.t);
  const night = 1 - daylight(c.hourFloat);

  const isUnit = (id: string): id is UnitId => id in s.units;
  const queued = s.trucks.filter((t) => t.kind === "inbound" && t.phase === "queued").length;
  const outTruck = s.trucks.find((t) => t.kind === "outbound")!;
  const fgKg = bufferKg(s, "finishedGoods");

  const flowing: Record<string, boolean> = {
    "weighbridge>baleYard": s.weighbridge.truckId !== null,
    "finishedGoods>dock": outTruck.phase === "loading",
  };
  const unitFlow = (id: UnitId) => s.units[id].status === "running";

  const sub = (id: string): { text: string; status?: keyof typeof statusColor; util?: number } => {
    if (isUnit(id)) {
      const u = s.units[id];
      const util = u.scheduledMin + u.downScheduledMin > 0 ? u.runningMin / (u.scheduledMin + u.downScheduledMin) : 0;
      const text = u.status === "running" ? `${fmt.n(u.rateKgH)} kg/h` : u.reason ? reasonLabel[u.reason] : statusLabel[u.status];
      return { text, status: u.status, util };
    }
    if (id === "weighbridge") {
      return { text: s.weighbridge.truckId ? "Weighing truck" : queued ? `${queued} waiting` : "Free", status: s.weighbridge.truckId ? "running" : "idle" };
    }
    if (id === "dock") {
      const label = { parked: "Truck parked", loading: "Loading", "to-buyer": "To buyer", unloading: "At buyer", returning: "Returning" }[outTruck.phase as string];
      return { text: label ?? "", status: outTruck.phase === "loading" ? "running" : "idle" };
    }
    if (id === "baleYard") return { text: fmt.t(bufferKg(s, "baleYard")) };
    if (id === "finishedGoods") return { text: `${fmt.t(fgKg)} · ${fmt.n(Math.floor(fgKg / p.bagKg))} bags` };
    return { text: "" };
  };

  const node = (n: NodeDef) => {
    const info = sub(n.id);
    const active = selected === n.id;
    const x = n.cx - W / 2;
    const y = n.cy - H / 2;
    return (
      <g
        key={n.id}
        role="button"
        tabIndex={0}
        aria-label={`${nodeLabel(n.id)}: ${info.text}`}
        onClick={() => select(active ? null : n.id)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && select(active ? null : n.id)}
        className="cursor-pointer outline-none [&:focus-visible>rect:first-child]:stroke-ring"
      >
        <rect x={x} y={y} width={W} height={H} rx={14} fill="var(--card)" stroke={active ? "var(--primary)" : "var(--border)"} strokeWidth={active ? 2 : 1} />
        {info.status && (
          <circle cx={x + W - 12} cy={y + 12} r={5} fill={statusColor[info.status]}>
            {info.status === "down" && <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />}
          </circle>
        )}
        <text x={x + 10} y={y + 22} fontSize={11.5} fontWeight={600} fill="var(--foreground)">
          {nodeLabel(n.id)}
        </text>
        <text x={x + 10} y={y + 42} fontSize={10.5} fill="var(--muted-foreground)">
          {info.text}
        </text>
        {(n.id === "baleYard" || n.id === "finishedGoods") && (
          <StockBar x={x + 10} y={y + 58} w={W - 20} value={bufferKg(s, n.id as BufferId)} max={n.id === "baleYard" ? 20_000 : p.outboundPayloadKg} />
        )}
        {info.util !== undefined && (
          <>
            <rect x={x + 10} y={y + 64} width={W - 20} height={5} rx={2.5} fill="var(--muted)" />
            <rect x={x + 10} y={y + 64} width={(W - 20) * Math.min(1, info.util)} height={5} rx={2.5} fill="var(--chart-1)" />
            <text x={x + 10} y={y + 80} fontSize={9.5} fill="var(--muted-foreground)">
              {fmt.n(info.util * 100)}% utilised
            </text>
          </>
        )}
      </g>
    );
  };

  const link = (x1: number, y1: number, x2: number, y2: number, on: boolean, key: string) => (
    <g key={key}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--border)" strokeWidth={4} strokeLinecap="round" />
      {on && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--chart-1)" strokeWidth={3} className="sim-flow" />}
    </g>
  );

  const unitOrder: (UnitId | "baleYard")[] = ["baleYard", "sorting", "shredder", "wash", "dryer", "extruder", "pelletizer"];

  return (
    <svg viewBox="0 0 1000 320" className="h-auto w-full min-w-[760px]" role="img" aria-label="Live plant schematic">
      <rect x={0} y={0} width={1000} height={320} rx={16} fill="var(--muted)" opacity={0.35} />
      <rect x={0} y={0} width={1000} height={320} rx={16} fill="oklch(0.25 0.06 260)" opacity={night * 0.16} />

      {/* Row 1 links */}
      {link(60 + W / 2, ROW1, 180 - W / 2, ROW1, flowing["weighbridge>baleYard"], "l0")}
      {unitOrder.slice(1).map((id, i) => {
        const from = ROW1_NODES[i + 1].cx + W / 2;
        const to = ROW1_NODES[i + 2].cx - W / 2;
        return link(from, ROW1, to, ROW1, unitFlow(id as UnitId), `l${i + 1}`);
      })}
      {link(900, ROW1 + H / 2, 900, ROW2 - H / 2, unitFlow("pelletizer"), "down")}
      {link(900 - W / 2, ROW2, 740 + W / 2, ROW2, unitFlow("qc"), "r1")}
      {link(740 - W / 2, ROW2, 580 + W / 2, ROW2, unitFlow("packing"), "r2")}
      {link(580 - W / 2, ROW2, 420 + W / 2, ROW2, flowing["finishedGoods>dock"], "r3")}

      {/* Surge buffers between machines */}
      {SURGE.map((b) => {
        const kg = bufferKg(s, b.id);
        const f = Math.min(1, kg / p.bufferKg);
        return (
          <g key={b.id} aria-label={`${b.id} buffer ${fmt.n(kg)} kg`}>
            <rect x={b.cx - 6} y={ROW1 + 14} width={12} height={28} rx={3} fill="var(--card)" stroke="var(--border)" />
            <rect x={b.cx - 5} y={ROW1 + 15 + 26 * (1 - f)} width={10} height={26 * f} rx={2} fill="var(--chart-2)" opacity={0.85} />
          </g>
        );
      })}

      {ROW1_NODES.map(node)}
      {ROW2_NODES.map(node)}

      {/* Losses + clock panel */}
      <g>
        <rect x={14} y={206} width={330} height={88} rx={14} fill="var(--card)" stroke="var(--border)" />
        <text x={28} y={228} fontSize={11.5} fontWeight={600} fill="var(--foreground)">
          Losses (no revenue)
        </text>
        {[
          ["Sorting rejects", s.mass.losses.sortRejects],
          ["Wash: dirt + moisture", s.mass.losses.washLoss],
          ["Extrusion: fines + purge", s.mass.losses.processLoss],
        ].map(([label, kg], i) => (
          <text key={label as string} x={28} y={248 + i * 16} fontSize={10.5} fill="var(--muted-foreground)">
            {label}: <tspan fill="var(--foreground)">{fmt.t(kg as number)}</tspan>
          </text>
        ))}
        <text x={330} y={228} textAnchor="end" fontSize={11} fill="var(--muted-foreground)">
          {night > 0.5 ? "Night" : "Day"} · {fmt.clock(c.hour, c.minute)}
        </text>
      </g>
    </svg>
  );
}

function StockBar({ x, y, w, value, max }: { x: number; y: number; w: number; value: number; max: number }) {
  const f = Math.min(1, value / max);
  return (
    <>
      <rect x={x} y={y} width={w} height={8} rx={4} fill="var(--muted)" />
      <rect x={x} y={y} width={w * f} height={8} rx={4} fill={f >= 1 ? "var(--chart-4)" : "var(--chart-2)"} />
    </>
  );
}

/** Text details for whatever node is selected. */
export function nodeDetails(s: SimState, id: string): [string, string][] {
  if (id in s.units) {
    const u = s.units[id as UnitId];
    const sched = u.scheduledMin + u.downScheduledMin;
    return [
      ["Status", `${statusLabel[u.status]}${u.reason ? ` — ${reasonLabel[u.reason]}` : ""}`],
      ["Throughput now", `${fmt.n(u.rateKgH)} kg/h`],
      ["Processed", fmt.t(u.processedKg)],
      ["Utilisation", sched ? `${fmt.n((u.runningMin / sched) * 100)}% of productive time` : "—"],
      ["Energy", `${fmt.n(u.energyKwh)} kWh`],
      ["Breakdowns", String(u.breakdowns)],
      ...(u.repairLeft > 0 ? ([["Repair left", `${fmt.n(u.repairLeft)} min`]] as [string, string][]) : []),
    ];
  }
  if (id === "weighbridge") {
    return [
      ["Weighings", String(s.weighbridge.weighings)],
      ["Weighed in", fmt.t(s.mass.weighedIn)],
      ["Trucks waiting", String(s.trucks.filter((t) => t.phase === "queued").length)],
    ];
  }
  if (id === "dock") {
    const t = s.trucks.find((x) => x.kind === "outbound")!;
    return [
      ["Truck", t.phase],
      ["Trips completed", String(t.trips)],
      ["Dispatched", fmt.t(s.mass.dispatched)],
    ];
  }
  const kg = bufferKg(s, id as BufferId);
  const lots = new Set(s.buffers[id as BufferId].map((p) => p.lot));
  return [
    ["In stock", fmt.t(kg, 2)],
    ["Lots present", lots.size ? [...lots].map((l) => `#${l}`).join(", ") : "none"],
  ];
}
