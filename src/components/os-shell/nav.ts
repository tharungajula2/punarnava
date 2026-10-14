import { Archive, Boxes, Gauge, Globe, ListChecks, Settings2, Wallet, type LucideIcon } from "lucide-react";

// Punarnava OS information architecture: 7 sections, each with tabs.
// One source for the sidebar, tab bars, command palette and keyboard shortcuts.

export type OsTab = { href: string; label: string; question: string };
export type OsSection = { id: string; label: string; key: string; icon: LucideIcon; href: string; blurb: string; tabs: OsTab[] };

export const sections: OsSection[] = [
  {
    id: "command",
    label: "Command",
    key: "1",
    icon: Gauge,
    href: "/os",
    blurb: "Today at a glance",
    tabs: [{ href: "/os", label: "Command", question: "Where does Punarnava stand today?" }],
  },
  {
    id: "factory",
    label: "Factory",
    key: "2",
    icon: Boxes,
    href: "/os/factory",
    blurb: "Live plant simulation",
    tabs: [{ href: "/os/factory", label: "Simulation", question: "What does the plant look like running?" }],
  },
  {
    id: "money",
    label: "Money",
    key: "3",
    icon: Wallet,
    href: "/os/money",
    blurb: "Margins, cash, scenarios",
    tabs: [
      { href: "/os/money", label: "Unit economics", question: "Do we make money on every kilogram?" },
      { href: "/os/money/finance", label: "Finance", question: "How much cash do we need, and when do we break even?" },
      { href: "/os/money/scenarios", label: "Scenarios", question: "What happens if things go wrong?" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    key: "4",
    icon: Settings2,
    href: "/os/operations",
    blurb: "Supply, plant, sales, EPR",
    tabs: [
      { href: "/os/operations", label: "Supply", question: "Can we get enough clean plastic?" },
      { href: "/os/operations/plant", label: "Plant", question: "How well will the line run?" },
      { href: "/os/operations/stock-sales", label: "Stock & Sales", question: "Can we sell what we make?" },
      { href: "/os/operations/epr", label: "EPR credits", question: "How much do EPR credits add?" },
    ],
  },
  {
    id: "market",
    label: "Market",
    key: "5",
    icon: Globe,
    href: "/os/market",
    blurb: "Demand, rivals, prices",
    tabs: [
      { href: "/os/market", label: "Overview", question: "Is the market big enough, and growing?" },
      { href: "/os/market/competitors", label: "Competitors", question: "Who else does this, and where do we fit?" },
      { href: "/os/market/pricing", label: "Pricing", question: "Where do our prices sit?" },
    ],
  },
  {
    id: "execution",
    label: "Execution",
    key: "6",
    icon: ListChecks,
    href: "/os/execution",
    blurb: "Plan, licences, people, risks",
    tabs: [
      { href: "/os/execution", label: "Roadmap", question: "What do we do next?" },
      { href: "/os/execution/licences", label: "Licences", question: "What approvals stand between us and production?" },
      { href: "/os/execution/hiring", label: "Hiring", question: "Who do we need, and what do they cost?" },
      { href: "/os/execution/risks", label: "Risks", question: "What could sink us?" },
      { href: "/os/execution/decisions", label: "Decisions", question: "What have we decided, and what is still open?" },
    ],
  },
  {
    id: "vault",
    label: "Vault",
    key: "7",
    icon: Archive,
    href: "/os/vault",
    blurb: "Evidence and assumptions",
    tabs: [
      { href: "/os/vault", label: "Data room", question: "What can we show an investor today?" },
      { href: "/os/vault/assumptions", label: "Assumptions", question: "How solid are our numbers?" },
      { href: "/os/vault/sources", label: "Sources", question: "Where do the numbers come from?" },
      { href: "/os/vault/research-gaps", label: "Research gaps", question: "What do we still need to find out?" },
    ],
  },
];

/** The section a path belongs to (longest href match; /os itself is Command). */
export function sectionFor(pathname: string): OsSection {
  return sections.slice(1).find((s) => pathname === s.href || pathname.startsWith(`${s.href}/`)) ?? sections[0];
}

export function tabFor(pathname: string): { section: OsSection; tab: OsTab } {
  const section = sectionFor(pathname);
  const tab = section.tabs.find((t) => t.href === pathname) ?? section.tabs[0];
  return { section, tab };
}

/** Scripted story for presentation mode (P): Command → Factory → Money → Market → Execution. */
export const story: { href: string; title: string; say: string }[] = [
  { href: "/os", title: "Where we stand", say: "One screen: the numbers that matter, the plan's progress, the biggest risks and what happens next." },
  { href: "/os/factory", title: "The plant, running", say: "A digital twin of the planned line: plastic in from the city, pellets out to buyers, minute by minute." },
  { href: "/os/money", title: "Money per kilogram", say: "Every kilogram from pellet price to profit. Move a price and the margin updates live." },
  { href: "/os/money/finance", title: "Cash and break-even", say: "What the plant costs, when it breaks even, and where cash is tightest." },
  { href: "/os/money/scenarios", title: "When things go wrong", say: "Best, base and worst cases, each checked against the simulation." },
  { href: "/os/market", title: "The market", say: "How much plastic there is, and why recycled-content rules make demand rise." },
  { href: "/os/market/competitors", title: "Where we fit", say: "Who already recycles, at what scale, and where a focused plant can win." },
  { href: "/os/execution", title: "The plan", say: "Four phases, each unlocked by a gate. Signed supply and offtake come before machines." },
  { href: "/os/execution/risks", title: "What could sink us", say: "The risks we rate highest, and what we do about each one." },
];

export const allTabs = sections.flatMap((s) => s.tabs.map((t) => ({ ...t, section: s })));
