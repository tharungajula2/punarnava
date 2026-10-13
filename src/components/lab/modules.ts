import {
  AlertTriangle,
  BookOpen,
  Calculator,
  FlaskConical,
  FolderLock,
  GitBranch,
  Globe,
  SearchCheck,
  Swords,
  Tags,
  type LucideIcon,
} from "lucide-react";

export type LabModule = { href: string; label: string; short: string; icon: LucideIcon; description: string };

export const labModules: LabModule[] = [
  { href: "/lab", label: "Lab overview", short: "Overview", icon: FlaskConical, description: "What the lab holds and how solid the numbers are." },
  { href: "/lab/market", label: "Market overview", short: "Market", icon: Globe, description: "Waste volumes, market size, the recycled-content mandate, buyers." },
  { href: "/lab/competitors", label: "Competitor map", short: "Competitors", icon: Swords, description: "Who recycles what, at what scale, and where they sit." },
  { href: "/lab/pricing", label: "Pricing intelligence", short: "Pricing", icon: Tags, description: "Feedstock vs pellet vs virgin vs EPR prices, and the spreads." },
  { href: "/lab/unit-economics", label: "Unit-economics model", short: "Unit model", icon: Calculator, description: "Change inputs; margin/kg, break-even and payback update live." },
  { href: "/lab/scenarios", label: "Scenario planner", short: "Scenarios", icon: GitBranch, description: "Best, base and worst side by side, run through the sim engine." },
  { href: "/lab/risks", label: "Risk register", short: "Risks", icon: AlertTriangle, description: "Likelihood × impact matrix with mitigations." },
  { href: "/lab/data-room", label: "Investor data room", short: "Data room", icon: FolderLock, description: "Documents we have, and what is still needed." },
  { href: "/lab/decisions", label: "Decision log", short: "Decisions", icon: BookOpen, description: "What was decided, when, why, and its status." },
  { href: "/lab/research-gaps", label: "Research gaps", short: "Gaps", icon: SearchCheck, description: "Missing data as ready-to-paste ChatGPT prompts." },
];

export function isLabActive(pathname: string, href: string) {
  return href === "/lab" ? pathname === "/lab" : pathname === href || pathname.startsWith(`${href}/`);
}
