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
  type LucideIcon,
} from "lucide-react";

export type OsModule = { href: string; label: string; short: string; icon: LucideIcon; description: string };

export const osModules: OsModule[] = [
  { href: "/os", label: "Dashboard", short: "Dashboard", icon: Gauge, description: "KPIs, roadmap progress, top risks, next actions." },
  { href: "/os/feedstock", label: "Feedstock & suppliers", short: "Feedstock", icon: Leaf, description: "Grades, sourcing channels and the supplier register." },
  { href: "/os/logistics", label: "Inbound logistics", short: "Logistics", icon: Truck, description: "Fleet plan, gate process and weighbridge trips." },
  { href: "/os/operations", label: "Plant operations", short: "Operations", icon: Factory, description: "Shifts, machine utilisation, uptime and energy." },
  { href: "/os/quality", label: "Quality", short: "Quality", icon: ClipboardCheck, description: "Pellet spec, checkpoints, yield and lot results." },
  { href: "/os/inventory", label: "Inventory", short: "Inventory", icon: Warehouse, description: "Stock by stage against the holding policy." },
  { href: "/os/sales", label: "Sales & buyers", short: "Sales", icon: Package, description: "Segments, pipeline, prices and dispatches." },
  { href: "/os/epr", label: "EPR credits", short: "EPR", icon: BadgeIndianRupee, description: "Registration path, certificate volumes and prices." },
  { href: "/os/compliance", label: "Compliance & licences", short: "Compliance", icon: FileCheck2, description: "Every licence: authority, documents, timeline." },
  { href: "/os/finance", label: "Finance", short: "Finance", icon: Wallet, description: "Capex, opex, P&L, 36-month cash flow, break-even." },
  { href: "/os/hiring", label: "Hiring plan", short: "Hiring", icon: Users, description: "Roles, headcount, cost and timing." },
  { href: "/os/roadmap", label: "Roadmap & tasks", short: "Roadmap", icon: ListChecks, description: "Phases, gates and the task list." },
];

export function isActive(pathname: string, href: string) {
  return href === "/os" ? pathname === "/os" : pathname === href || pathname.startsWith(`${href}/`);
}
