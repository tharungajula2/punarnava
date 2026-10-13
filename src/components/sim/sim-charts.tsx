"use client";

import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { clock, type HourSample } from "@/sim";
import { useSimStore } from "./sim-store";

const axis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const;
const grid = <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />;
const tooltipStyle = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--popover-foreground)" },
  labelStyle: { color: "var(--muted-foreground)" },
};

const dayLabel = (t: number) => {
  const c = clock(t);
  return `D${c.day} ${String(c.hour).padStart(2, "0")}h`;
};

/** Sums/averages hourly samples into buckets of `size` hours. */
function bucket(rows: HourSample[], size: number) {
  const out: (HourSample & { label: string })[] = [];
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const last = chunk[chunk.length - 1];
    out.push({
      ...last,
      inKg: chunk.reduce((a, r) => a + r.inKg, 0) / chunk.length,
      outKg: chunk.reduce((a, r) => a + r.outKg, 0) / chunk.length,
      lineKg: chunk.reduce((a, r) => a + r.lineKg, 0) / chunk.length,
      label: dayLabel(last.t),
    });
  }
  return out;
}

export function SimCharts() {
  useSimStore((s) => s.chartVersion);
  const sim = useSimStore((s) => s.sim);
  const hourly = sim?.state.hourly ?? [];
  const n = hourly.length;

  // Re-computed only when chartVersion bumps (about twice a second while playing).
  const data = {
    throughput: bucket(hourly.slice(-72), 1),
    inventory: bucket(hourly.slice(-24 * 7), 2),
    margin: bucket(hourly.slice(-24 * 30), 6).map((r) => ({ label: r.label, margin: r.marginPerKg === null ? null : +r.marginPerKg.toFixed(2) })),
    cash: bucket(hourly, 6).map((r) => ({ label: r.label, cash: +(r.cash / 100_000).toFixed(2) })),
  };

  if (n < 2) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        Charts appear after the first simulated hours. Press play.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Throughput" subtitle="kg/h, last 72 hours" legend={[["var(--chart-1)", "Line feed (sorting)"], ["var(--chart-2)", "Pellets packed"]]}>
        <LineChart data={data.throughput} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          {grid}
          <XAxis dataKey="label" {...axis} minTickGap={40} />
          <YAxis {...axis} width={48} />
          <Tooltip {...tooltipStyle} formatter={(v) => `${Math.round(Number(v))} kg/h`} />
          <Line type="stepAfter" dataKey="lineKg" name="Line feed" stroke="var(--chart-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="stepAfter" dataKey="outKg" name="Packed" stroke="var(--chart-2)" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ChartCard>

      <ChartCard
        title="Inventory"
        subtitle="tonnes on site, last 7 days"
        legend={[["var(--chart-2)", "Bale yard"], ["var(--chart-1)", "In process"], ["var(--chart-3)", "Finished goods"]]}
      >
        <AreaChart data={data.inventory} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          {grid}
          <XAxis dataKey="label" {...axis} minTickGap={40} />
          <YAxis {...axis} width={48} />
          <Tooltip {...tooltipStyle} formatter={(v) => `${Number(v).toFixed(2)} t`} />
          <Area type="monotone" dataKey="baleYardT" name="Bale yard" stackId="1" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.35} strokeWidth={2} isAnimationActive={false} />
          <Area type="monotone" dataKey="wipT" name="In process" stackId="1" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.35} strokeWidth={2} isAnimationActive={false} />
          <Area type="monotone" dataKey="finishedT" name="Finished goods" stackId="1" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.35} strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ChartCard>

      <ChartCard title="Margin per kg" subtitle="₹/kg, trailing 7 days (price − cost)">
        <LineChart data={data.margin} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          {grid}
          <XAxis dataKey="label" {...axis} minTickGap={40} />
          <YAxis {...axis} width={48} />
          <ReferenceLine y={0} stroke="var(--muted-foreground)" />
          <Tooltip {...tooltipStyle} formatter={(v) => `₹${Number(v).toFixed(2)}/kg`} />
          <Line type="monotone" dataKey="margin" name="Margin" stroke="var(--chart-1)" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
        </LineChart>
      </ChartCard>

      <ChartCard title="Cash" subtitle="₹ lakh in the bank, whole run">
        <AreaChart data={data.cash} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          {grid}
          <XAxis dataKey="label" {...axis} minTickGap={40} />
          <YAxis {...axis} width={48} />
          <ReferenceLine y={0} stroke="var(--destructive)" />
          <Tooltip {...tooltipStyle} formatter={(v) => `₹${Number(v).toFixed(1)} L`} />
          <Area type="monotone" dataKey="cash" name="Cash" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, subtitle, legend, children }: { title: string; subtitle: string; legend?: [string, string][]; children: React.ReactElement }) {
  return (
    <figure className="rounded-2xl border border-border bg-card p-4">
      <figcaption className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span>
          <span className="text-sm font-medium">{title}</span> <span className="text-xs text-muted-foreground">{subtitle}</span>
        </span>
        {legend && (
          <span className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {legend.map(([color, label]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: color }} aria-hidden />
                {label}
              </span>
            ))}
          </span>
        )}
      </figcaption>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
