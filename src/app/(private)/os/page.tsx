import {
  BadgeIndianRupee,
  ClipboardCheck,
  Factory,
  FileCheck2,
  Gauge,
  Leaf,
  ListChecks,
  Package,
  Truck,
  Users,
  Warehouse,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import { ModuleCard, ModuleGrid, PageHeader } from "@/components/private/page-shell";

export const metadata: Metadata = { title: "Operating system" };

const modules = [
  { icon: Gauge, title: "Dashboard", description: "KPIs and roadmap progress at a glance." },
  { icon: Leaf, title: "Feedstock & suppliers", description: "Aggregators, sources and feedstock grades." },
  { icon: Truck, title: "Inbound logistics", description: "Pickups, routes and weighbridge records." },
  { icon: Factory, title: "Plant operations", description: "Line status, throughput and shifts." },
  { icon: ClipboardCheck, title: "Quality", description: "Batch tests, melt-flow and contamination." },
  { icon: Warehouse, title: "Inventory", description: "Stock by stage, from bales to pellets." },
  { icon: Package, title: "Sales & buyers", description: "Buyer pipeline, orders and dispatches." },
  { icon: BadgeIndianRupee, title: "EPR credits", description: "Certificates generated and sold." },
  { icon: FileCheck2, title: "Compliance & licences", description: "Consents, registrations and renewals." },
  { icon: Wallet, title: "Finance", description: "Capex, opex, P&L and cash flow from assumptions." },
  { icon: Users, title: "Hiring plan", description: "Roles, timing and cost by phase." },
  { icon: ListChecks, title: "Roadmap & tasks", description: "Milestones, gates and next actions." },
];

export default function OsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operating system"
        title="Run the business from one place"
        description="Each module below will be driven by typed data and the shared assumptions file. Sample data will be clearly marked until real data exists."
      />
      <ModuleGrid>
        {modules.map((m) => (
          <ModuleCard key={m.title} {...m} phase="Phase 7" />
        ))}
      </ModuleGrid>
    </>
  );
}
