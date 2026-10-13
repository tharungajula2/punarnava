"use client";

import { memo, useEffect, useRef } from "react";
import type { Scenario, SimParams } from "@/sim";
import { EventButtons, EventLog, PlaybackControls, ScenarioSliders } from "./controls";
import { KpiCards } from "./kpi-cards";
import { LotTimeline } from "./lot-timeline";
import { NetworkMap } from "./network-map";
import { Schematic, nodeDetails, nodeLabel } from "./schematic";
import { Sim3DView, ViewToggle, useCan3D } from "./sim-3d";
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
  const view = useSimStore((s) => s.view);
  const can3d = useCan3D();
  const show3d = can3d && view === "3d";
  useEffect(() => init(params), [init, params]);
  useSimLoop();

  if (!ready) return <div className="h-96 animate-pulse rounded-2xl bg-muted/50" aria-label="Loading simulation" />;

  return (
    <div className="space-y-6">
      <div className={`glass z-30 p-3 sm:p-4 ${show3d ? "" : "md:sticky md:top-16"}`}>
        <PlaybackControls />
      </div>

      <section aria-labelledby="plant-title" className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="plant-title" className="font-sans text-base font-medium">
            {show3d ? "The plant — live 3D" : "Plant flow — live"}
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-muted-foreground">Status lights: green running · grey idle · amber planned stop · red down.</p>
            {can3d ? <ViewToggle /> : <p className="text-xs text-muted-foreground">3D view needs a larger screen.</p>}
          </div>
        </div>
        {show3d && <Sim3DView />}
      </section>

      {!show3d && <KpiCards />}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {show3d ? (
          <Panel title="Feedstock network (stylised Bengaluru)">
            <NetworkMap />
          </Panel>
        ) : (
          <section aria-label="Plant schematic" className="min-w-0 space-y-3">
            <div className="overflow-x-auto rounded-2xl">
              <Schematic />
            </div>
            <Details />
          </section>
        )}

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
        {!show3d && (
          <Panel title="Feedstock network (stylised Bengaluru)">
            <NetworkMap />
          </Panel>
        )}
        <Panel title="Batch tracking" className={show3d ? "xl:col-span-2" : undefined}>
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

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-4 sm:p-5 ${className ?? ""}`}>
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
