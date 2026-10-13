"use client";

import { memo, useEffect, useRef } from "react";
import type { Scenario, SimParams } from "@/sim";
import { EventButtons, EventLog, PlaybackControls, ScenarioSliders } from "./controls";
import { KpiCards } from "./kpi-cards";
import { LotTimeline } from "./lot-timeline";
import { NetworkMap } from "./network-map";
import { Schematic, nodeDetails, nodeLabel } from "./schematic";
import { SimCharts } from "./sim-charts";
import { useSim, useSimStore } from "./sim-store";

type Status = "placeholder" | "researched" | "verified";

const UI_MS = 100; // schematic + KPIs refresh at ~10 Hz
const CHART_MS = 500; // charts at ~2 Hz

/** Drives the engine from requestAnimationFrame: speed × elapsed seconds = simulated minutes. */
function useSimLoop() {
  const playing = useSimStore((s) => s.playing);
  const acc = useRef(0);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let lastUi = 0;
    let lastChart = 0;
    const frame = (now: number) => {
      const dt = Math.min(1, (now - last) / 1000); // cap catch-up after a background tab
      last = now;
      const { sim, speed } = useSimStore.getState();
      if (sim) {
        acc.current += dt * speed;
        const steps = Math.floor(acc.current);
        acc.current -= steps;
        sim.run(steps);
        if (now - lastUi >= UI_MS) {
          lastUi = now;
          const bumpCharts = now - lastChart >= CHART_MS;
          if (bumpCharts) lastChart = now;
          useSimStore.setState((s) => ({ version: s.version + 1, chartVersion: bumpCharts ? s.chartVersion + 1 : s.chartVersion }));
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
}

const Charts = memo(SimCharts);

export function SimDashboard({ params, statuses, placeholderCount }: { params: SimParams; statuses: Record<keyof Scenario, Status>; placeholderCount: number }) {
  const init = useSimStore((s) => s.init);
  const ready = useSimStore((s) => s.sim !== null);
  useEffect(() => init(params), [init, params]);
  useSimLoop();

  if (!ready) return <div className="h-96 animate-pulse rounded-2xl bg-muted/50" aria-label="Loading simulation" />;

  return (
    <div className="space-y-6">
      <div className="glass z-30 p-3 sm:p-4 md:sticky md:top-16">
        <PlaybackControls />
      </div>

      <KpiCards />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="schematic-title" className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="schematic-title" className="font-sans text-base font-medium">
              Plant flow — live
            </h2>
            <p className="text-xs text-muted-foreground">Click any stage for details. Green running · grey idle · amber planned stop · red down.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl">
            <Schematic />
          </div>
          <Details />
        </section>

        <aside className="space-y-6">
          <Panel title="Scenario">
            <ScenarioSliders params={params} statuses={statuses} />
          </Panel>
          <Panel title="Events">
            <EventButtons />
          </Panel>
        </aside>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Panel title="Feedstock network (stylised Bengaluru)">
          <NetworkMap />
        </Panel>
        <Panel title="Batch tracking">
          <LotTimeline />
          <h3 className="mt-6 mb-2 font-sans text-sm font-medium">Event log</h3>
          <EventLog />
        </Panel>
      </div>

      <Charts />

      <p className="text-xs leading-relaxed text-muted-foreground">
        Every input comes from <code>src/data/assumptions.ts</code>. {placeholderCount} simulation parameters (truck sizes, breakdown rates, energy split,
        event sizes and so on) are still placeholders — modelling choices, not research. Collection points and buyers are sample locations: Punarnava has no
        suppliers or customers yet. Outputs are model results, not forecasts.
      </p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h2 className="mb-4 font-sans text-base font-medium">{title}</h2>
      {children}
    </section>
  );
}

function Details() {
  const sim = useSim();
  const selected = useSimStore((s) => s.selected);
  const select = useSimStore((s) => s.select);
  if (!sim || !selected) return null;
  return (
    <div className="glass flex flex-wrap items-start gap-x-8 gap-y-2 p-4 text-sm">
      <div className="flex w-full items-center justify-between">
        <h3 className="font-sans font-medium">{nodeLabel(selected)}</h3>
        <button type="button" onClick={() => select(null)} className="text-xs text-muted-foreground hover:text-foreground">
          Close
        </button>
      </div>
      <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
        {nodeDetails(sim.state, selected).map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
