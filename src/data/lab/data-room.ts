import "server-only";

/**
 * Investor data room index for /lab/data-room. Lists what an investor will ask
 * for (R3: feedstock evidence, trial yields, customer qualification, regulatory
 * readiness, margin sensitivity, working capital, impact) and what exists today.
 * Only things that really exist are marked "Available". Owner notes are
 * stripped for investors by the data layer.
 */

export type DocStatus = "Available" | "Draft" | "Not started";

export type DataRoomDoc = {
  id: string;
  section: "Company" | "Market & strategy" | "Financials" | "Operations & plant" | "Commercial" | "Regulatory" | "Impact";
  title: string;
  status: DocStatus;
  /** Where it lives today (an app page or a repo file). */
  where?: { label: string; href?: string };
  /** What it still needs before an investor sees it. */
  needs?: string;
  ownerNote?: string;
};

export const dataRoom: DataRoomDoc[] = [
  // Company
  { id: "pitch", section: "Company", title: "Investor pitch (landing page)", status: "Available", where: { label: "Landing page", href: "/" }, needs: "Raise amount, team names and contact email still to confirm." },
  { id: "team", section: "Company", title: "Founder and team bios", status: "Not started", needs: "Real bios and roles; no invented advisors.", ownerNote: "Decide who joins before the raise and whether they take equity." },
  { id: "incorporation", section: "Company", title: "Incorporation documents and cap table", status: "Not started", needs: "Company registration, shareholding, any SAFEs or notes." },
  // Market & strategy
  { id: "research", section: "Market & strategy", title: "Three market research reports", status: "Available", where: { label: "/research (R1, R2, R3)" }, needs: "Working source links — the files lost their citations." },
  { id: "market", section: "Market & strategy", title: "Market overview and competitor map", status: "Available", where: { label: "R&D lab", href: "/lab/market" } },
  { id: "strategy", section: "Market & strategy", title: "Strategy decision: HDPE pellets vs PET flake vs network-first", status: "Draft", where: { label: "Decision log", href: "/lab/decisions" }, needs: "Founder confirmation of the base case.", ownerNote: "Alternatives' capex and returns sit in the owner-only assumptions category." },
  // Financials
  { id: "model", section: "Financials", title: "Financial model: capex, P&L, 36-month cash flow", status: "Draft", where: { label: "OS · Finance", href: "/os/finance" }, needs: "Machinery quotes and a confirmed raise to move from researched to verified." },
  { id: "unit", section: "Financials", title: "Unit economics and sensitivity", status: "Available", where: { label: "R&D lab", href: "/lab/unit-economics" } },
  { id: "scenarios", section: "Financials", title: "Best / base / worst scenarios", status: "Available", where: { label: "R&D lab", href: "/lab/scenarios" } },
  { id: "assumptions", section: "Financials", title: "Assumptions register with sources and status", status: "Available", where: { label: "Admin · Assumptions", href: "/admin/assumptions" } },
  { id: "use-of-funds", section: "Financials", title: "Use of funds", status: "Draft", where: { label: "Landing page · The ask", href: "/#ask" }, needs: "Depends on the confirmed raise amount." },
  // Operations & plant
  { id: "sim", section: "Operations & plant", title: "Plant simulation (digital twin)", status: "Available", where: { label: "Simulation", href: "/sim" } },
  { id: "layout", section: "Operations & plant", title: "Site layout and process flow", status: "Draft", where: { label: "3D simulation", href: "/sim" }, needs: "Engineering drawing once a shed is chosen." },
  { id: "quotes", section: "Operations & plant", title: "Machinery quotations (three suppliers)", status: "Not started", needs: "RFQs with guaranteed kg/h, moisture, kW and a wet trial." },
  { id: "trial", section: "Operations & plant", title: "Trial-run yield data on our own feedstock", status: "Not started", needs: "Toll-processing trial; R3 says investors ask for real yields." },
  { id: "lease", section: "Operations & plant", title: "Shed lease term sheet", status: "Not started", needs: "Lease conditional on zoning, ETP construction and discharge route." },
  // Commercial
  { id: "feed-lois", section: "Commercial", title: "Feedstock supply agreements / LOIs", status: "Not started", needs: "Written agreements covering the feedstock gate.", ownerNote: "Start with DWCC and waste-picker partners named in R3." },
  { id: "offtake-lois", section: "Commercial", title: "Pellet offtake LOIs and converter qualification letters", status: "Not started", needs: "Sample pellets to at least the planned number of converters." },
  { id: "epr-buyers", section: "Commercial", title: "EPR certificate buyer list", status: "Not started", needs: "Only possible after PWP registration." },
  // Regulatory
  { id: "licences", section: "Regulatory", title: "Licence and consent tracker", status: "Available", where: { label: "OS · Compliance", href: "/os/compliance" } },
  { id: "kspcb", section: "Regulatory", title: "KSPCB site-specific compliance opinion", status: "Not started", needs: "Before ordering the line (R2)." },
  { id: "risks", section: "Regulatory", title: "Risk register with mitigations", status: "Available", where: { label: "R&D lab", href: "/lab/risks" } },
  // Impact
  { id: "impact", section: "Impact", title: "Impact metrics: tonnes diverted, livelihoods, emissions", status: "Not started", needs: "Method and baseline; investors ask for auditable impact (R3)." },
];
