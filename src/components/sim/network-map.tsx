"use client";

import { BUYERS, COLLECTION_POINTS, PLANT, truckPosition } from "@/sim";
import { fmt } from "./format";
import { useSim } from "./sim-store";

// Stylised map bounds in km (see src/sim/layout.ts).
const X0 = -24;
const X1 = 29;
const Y0 = -26;
const Y1 = 15;
const SCALE = 10;
const sx = (x: number) => (x - X0) * SCALE;
const sy = (y: number) => (Y1 - y) * SCALE;

export function NetworkMap() {
  const sim = useSim();
  if (!sim) return null;
  const s = sim.state;
  const minLoad = (sim.params.minLoadPct / 100) * sim.params.inboundPayloadKg;

  return (
    <svg viewBox={`0 0 ${(X1 - X0) * SCALE} ${(Y1 - Y0) * SCALE}`} className="h-auto w-full" role="img" aria-label="Stylised Bengaluru feedstock network with live trucks">
      <rect width="100%" height="100%" rx={16} fill="var(--muted)" opacity={0.35} />
      {/* Roads */}
      {[...COLLECTION_POINTS, ...BUYERS].map((p) => (
        <line key={p.id} x1={sx(PLANT.x)} y1={sy(PLANT.y)} x2={sx(p.x)} y2={sy(p.y)} stroke="var(--border)" strokeWidth={3} strokeDasharray="2 6" strokeLinecap="round" />
      ))}

      {COLLECTION_POINTS.map((p, i) => {
        const stock = s.points[i].stockKg;
        return (
          <g key={p.id}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={9} fill="var(--card)" stroke="var(--chart-2)" strokeWidth={2.5} />
            <circle cx={sx(p.x)} cy={sy(p.y)} r={4} fill={stock >= minLoad ? "var(--chart-2)" : "var(--muted-foreground)"} />
            <text x={sx(p.x) + 13} y={sy(p.y) + 4} fontSize={11} fill="var(--foreground)">
              {p.name.replace(" (sample)", "")}
            </text>
            <text x={sx(p.x) + 13} y={sy(p.y) + 17} fontSize={10} fill="var(--muted-foreground)">
              {fmt.t(stock)} ready
            </text>
          </g>
        );
      })}

      {BUYERS.map((b) => (
        <g key={b.id}>
          <rect x={sx(b.x) - 7} y={sy(b.y) - 7} width={14} height={14} transform={`rotate(45 ${sx(b.x)} ${sy(b.y)})`} fill="var(--chart-3)" />
          <text x={sx(b.x) + (b.x < 0 ? -12 : 13)} y={sy(b.y) + 4} textAnchor={b.x < 0 ? "end" : "start"} fontSize={11} fill="var(--foreground)">
            Buyer
          </text>
        </g>
      ))}

      <rect x={sx(0) - 11} y={sy(0) - 11} width={22} height={22} rx={6} fill="var(--primary)" />
      <text x={sx(0) - 16} y={sy(0) - 16} textAnchor="end" fontSize={11} fontWeight={600} fill="var(--foreground)">
        Plant
      </text>

      {s.trucks.map((t) => {
        const pos = truckPosition(t);
        if (pos.atPlant && t.phase === "parked") return null;
        const loaded = t.cargoKg > 0;
        const color = t.kind === "inbound" ? "var(--chart-2)" : "var(--chart-3)";
        return (
          <g key={t.id} style={{ transform: `translate(${sx(pos.x)}px, ${sy(pos.y)}px)`, transition: "transform 120ms linear" }}>
            <rect x={-8} y={-5} width={16} height={10} rx={3} fill={loaded ? color : "var(--card)"} stroke={color} strokeWidth={2} />
          </g>
        );
      })}

      <g fontSize={10} fill="var(--muted-foreground)">
        <circle cx={14} cy={(Y1 - Y0) * SCALE - 34} r={4} fill="var(--chart-2)" />
        <text x={24} y={(Y1 - Y0) * SCALE - 30}>Collection point (sample) · inbound truck</text>
        <rect x={10} y={(Y1 - Y0) * SCALE - 20} width={8} height={8} fill="var(--chart-3)" />
        <text x={24} y={(Y1 - Y0) * SCALE - 12}>Buyer (sample) · outbound truck · filled = loaded</text>
      </g>
    </svg>
  );
}
