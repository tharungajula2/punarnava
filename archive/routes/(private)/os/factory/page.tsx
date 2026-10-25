import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/os-shell/page";
import { SimDashboard } from "@/components/sim/sim-dashboard";
import { assumptions, getAssumption, v } from "@/data/assumptions";
import { int, pct } from "@/lib/format";
import { SCENARIO_KEYS, simPatch, type ScenarioKey } from "@/lib/lab/scenarios";
import { defaultParams, sliderStatuses } from "@/sim/params";

export const metadata: Metadata = { title: "Factory" };

type Props = { searchParams: Promise<{ scenario?: string | string[] }> };

export default function FactoryPage({ searchParams }: Props) {
  const yieldPct = v("yield");
  return (
    <>
      <PageHeader
        href="/os/factory"
        insight={
          <>
            A {int(v("plant_input_tpd"))} t/day line that turns {pct(yieldPct)} of the plastic we buy into pellets.
          </>
        }
        status={getAssumption("plant_input_tpd").status}
        context="Follow plastic from Bengaluru collection points to pellets and buyers, minute by minute. Change prices or shifts, or throw in a breakdown, and watch the numbers move."
      />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/50" aria-label="Loading simulation" />}>
        <SimContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

// Parameters are built here (server-only) and passed down as plain numbers.
async function SimContent({ searchParams }: Props) {
  const placeholderCount = assumptions.filter((a) => a.category === "simulation" && a.status === "placeholder").length;
  // ?scenario=best|worst (from Money · Scenarios) starts the sliders at that case.
  const raw = (await searchParams).scenario;
  const key = SCENARIO_KEYS.find((k) => k === (Array.isArray(raw) ? raw[0] : raw)) as ScenarioKey | undefined;
  return (
    <>
      {key && key !== "base" ? (
        <p role="note" className="mb-4 rounded-2xl border border-primary/25 bg-primary/5 p-3 text-sm">
          Started from the <span className="font-medium">{key} case</span> in Money · Scenarios. Reset the simulation to return to the base case.
        </p>
      ) : null}
      <SimDashboard params={defaultParams()} statuses={sliderStatuses()} placeholderCount={placeholderCount} initialScenario={key ? simPatch(key) : undefined} />
    </>
  );
}
