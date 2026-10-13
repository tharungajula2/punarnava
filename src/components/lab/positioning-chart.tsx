"use client";

import { CartesianGrid, LabelList, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";

export type Point = { name: string; tpa: number; chain: number; group: "bengaluru" | "other" | "us"; detail: string };

const axis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const;
const fmtT = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v)));
const rowName = ["", "Collect", "Services", "Mechanical", "Premium"];

const groups = [
  { key: "other", label: "Elsewhere in India", color: "var(--chart-3)" },
  { key: "bengaluru", label: "Present in Bengaluru", color: "var(--chart-1)" },
  { key: "us", label: "Punarnava (planned)", color: "var(--chart-4)" },
] as const;

/**
 * Scale (log, t/yr) against value-chain position. Points sharing a row are
 * nudged vertically so labels do not collide — the nudge has no meaning.
 */
export function PositioningChart({ points, chainLabels }: { points: Point[]; chainLabels: Record<number, string> }) {
  const seen: Record<number, number> = {};
  const data = [...points]
    .sort((a, b) => a.tpa - b.tpa)
    .map((p) => {
      const k = (seen[p.chain] = (seen[p.chain] ?? 0) + 1);
      return { ...p, y: p.chain + ((k % 3) - 1) * 0.3 };
    });

  return (
    <div>
      <div role="img" aria-label="Competitors plotted by annual tonnes (log scale) against value-chain position" className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis type="number" dataKey="tpa" scale="log" domain={[500, 300000]} ticks={[1000, 3000, 10000, 30000, 100000, 300000]} tickFormatter={fmtT} {...axis} name="t/yr" />
            <YAxis type="number" dataKey="y" domain={[0.5, 4.5]} ticks={[1, 2, 3, 4]} tickFormatter={(v: number) => rowName[v] ?? ""} width={78} {...axis} />
            <ZAxis range={[90, 90]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                const p = payload?.[0]?.payload as Point | undefined;
                if (!p) return null;
                return (
                  <div className="max-w-64 rounded-xl border border-border bg-popover p-3 text-xs text-popover-foreground shadow-sm">
                    <p className="font-medium">{p.name}</p>
                    <p className="mt-1">{p.tpa.toLocaleString("en-IN")} t/yr</p>
                    <p className="text-muted-foreground">{chainLabels[p.chain]}</p>
                    <p className="mt-1 text-muted-foreground">{p.detail}</p>
                  </div>
                );
              }}
            />
            {groups.map((g) => (
              <Scatter key={g.key} name={g.label} data={data.filter((d) => d.group === g.key)} fill={g.color} isAnimationActive={false}>
                <LabelList dataKey="name" position="right" fontSize={10} fill="var(--foreground)" />
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {groups.map((g) => (
          <li key={g.key} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: g.color }} aria-hidden />
            {g.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
