"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { int, lakh, pct } from "@/lib/format";

export type Unit = "lakh" | "t" | "pct" | "count" | "kg";

export type Series = {
  key: string;
  label: string;
  color: string; // a CSS variable, e.g. var(--chart-1)
  kind?: "bar" | "line" | "area";
  stack?: string;
};

type Props = {
  data: Record<string, unknown>[];
  xKey: string;
  series: Series[];
  unit: Unit;
  kind?: "bar" | "line" | "area" | "composed";
  height?: number;
  refY?: { value: number; label: string };
  refX?: { value: string | number; label: string };
  ariaLabel: string;
};

const fmtFor = (unit: Unit, short = false) => (v: unknown) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  switch (unit) {
    case "lakh":
      return short ? `${int(n / 100_000)}L` : lakh(n, 2);
    case "t":
      return `${int(n, short ? 0 : 1)} t`;
    case "pct":
      return pct(n, short ? 0 : 1);
    case "kg":
      return `${int(n)} kg`;
    default:
      return int(n, short ? 0 : 1);
  }
};

const axis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const;
const tooltip = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--popover-foreground)" },
  labelStyle: { color: "var(--muted-foreground)" },
  cursor: { fill: "var(--muted)", opacity: 0.5 },
};

/** One chart wrapper for every OS module: brand colours, themed axes, accessible label. */
export function Chart({ data, xKey, series, unit, kind = "bar", height = 260, refY, refX, ariaLabel }: Props) {
  if (data.length === 0) {
    return <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">No data to chart yet.</div>;
  }
  const C = kind === "line" ? LineChart : kind === "area" ? AreaChart : kind === "composed" ? ComposedChart : BarChart;
  return (
    <div role="img" aria-label={ariaLabel} style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <C data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} {...axis} minTickGap={16} />
          <YAxis {...axis} width={52} tickFormatter={fmtFor(unit, true)} />
          <Tooltip {...tooltip} formatter={fmtFor(unit)} />
          {series.length > 1 ? <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} /> : null}
          {refY ? <ReferenceLine y={refY.value} stroke="var(--destructive)" strokeDasharray="4 4" label={{ value: refY.label, fontSize: 11, fill: "var(--muted-foreground)", position: "insideTopRight" }} /> : null}
          {refX ? <ReferenceLine x={refX.value} stroke="var(--primary)" strokeDasharray="4 4" label={{ value: refX.label, fontSize: 11, fill: "var(--muted-foreground)", position: "insideTopLeft" }} /> : null}
          {series.map((s) => {
            const k = s.kind ?? (kind === "composed" ? "bar" : kind);
            if (k === "line")
              return <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />;
            if (k === "area")
              return <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} fill={s.color} fillOpacity={0.25} stackId={s.stack} isAnimationActive={false} />;
            return <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} stackId={s.stack} radius={s.stack ? 0 : [4, 4, 0, 0]} isAnimationActive={false} />;
          })}
        </C>
      </ResponsiveContainer>
    </div>
  );
}

export function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <figure className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-soft backdrop-blur-sm sm:p-5">
      <figcaption className="mb-3">
        <span className="font-medium">{title}</span>
        {subtitle ? <span className="block text-xs text-muted-foreground">{subtitle}</span> : null}
      </figcaption>
      {children}
    </figure>
  );
}
