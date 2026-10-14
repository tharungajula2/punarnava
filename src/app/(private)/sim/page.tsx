import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/private/page-shell";
import { SimDashboard } from "@/components/sim/sim-dashboard";
import { assumptions } from "@/data/assumptions";
import { SCENARIO_KEYS, simPatch, type ScenarioKey } from "@/lib/lab/scenarios";
import { defaultParams, sliderStatuses } from "@/sim/params";

export const metadata: Metadata = { title: "Simulation" };

type Props = { searchParams: Promise<{ scenario?: string | string[] }> };

export default function SimPage({ searchParams }: Props) {
  return (
    <>
      <PageHeader
        eyebrow="Simulation · 3D + 2D"
        title="A digital twin of the plant"
        description="Follow plastic from collection points to pellets and buyers, minute by minute. Change prices, shifts and feedstock quality, or throw in a breakdown, and watch the numbers move."
      />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/50" aria-label="Loading simulation" />}>
        <SimContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

// Proxy already guards /sim; this re-checks on the server. Parameters are built
// here (server-only) and passed down as plain numbers.
async function SimContent({ searchParams }: Props) {
  const placeholderCount = assumptions.filter((a) => a.category === "simulation" && a.status === "placeholder").length;
  // /sim?scenario=best|worst (from /lab/scenarios) starts the sliders at that case.
  const raw = (await searchParams).scenario;
  const key = SCENARIO_KEYS.find((k) => k === (Array.isArray(raw) ? raw[0] : raw)) as ScenarioKey | undefined;
  return (
    <>
      {key && key !== "base" ? (
        <p role="note" className="mb-4 rounded-2xl border border-primary/25 bg-primary/5 p-3 text-sm">
          Started from the <span className="font-medium">{key} case</span> in the R&amp;D lab scenario planner. Reset the simulation to return to the base case.
        </p>
      ) : null}
      <SimDashboard params={defaultParams()} statuses={sliderStatuses()} placeholderCount={placeholderCount} initialScenario={key ? simPatch(key) : undefined} />
    </>
  );
}
