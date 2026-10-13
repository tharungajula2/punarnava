import { Box, Cpu, Map } from "lucide-react";
import type { Metadata } from "next";
import { ModuleCard, ModuleGrid, PageHeader } from "@/components/private/page-shell";

export const metadata: Metadata = { title: "Simulation" };

export default function SimPage() {
  return (
    <>
      <PageHeader
        eyebrow="Simulation"
        title="A digital twin of the plant"
        description="Follow plastic from collection points to pellets and buyers, and test scenarios before spending a rupee."
      />
      <ModuleGrid>
        <ModuleCard icon={Cpu} title="Simulation engine" description="Deterministic, seedable model of every stage and its costs." phase="Phase 5" />
        <ModuleCard icon={Map} title="2D schematic view" description="Live flow diagram with KPIs and scenario controls." phase="Phase 5" />
        <ModuleCard icon={Box} title="3D plant view" description="Isometric factory with trucks, machines and material flow." phase="Phase 6" />
      </ModuleGrid>
    </>
  );
}
