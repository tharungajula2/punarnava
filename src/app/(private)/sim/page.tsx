import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/private/page-shell";
import { SimDashboard } from "@/components/sim/sim-dashboard";
import { assumptions } from "@/data/assumptions";
import { requireRole } from "@/lib/auth/session";
import { defaultParams, sliderStatuses } from "@/sim/params";

export const metadata: Metadata = { title: "Simulation" };

export default function SimPage() {
  return (
    <>
      <PageHeader
        eyebrow="Simulation · 2D schematic"
        title="A digital twin of the plant"
        description="Follow plastic from collection points to pellets and buyers, minute by minute. Change prices, shifts and feedstock quality, or throw in a breakdown, and watch the numbers move."
      />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/50" aria-label="Loading simulation" />}>
        <SimContent />
      </Suspense>
    </>
  );
}

// Proxy already guards /sim; this re-checks on the server. Parameters are built
// here (server-only) and passed down as plain numbers.
async function SimContent() {
  await requireRole();
  const placeholderCount = assumptions.filter((a) => a.category === "simulation" && a.status === "placeholder").length;
  return <SimDashboard params={defaultParams()} statuses={sliderStatuses()} placeholderCount={placeholderCount} />;
}
