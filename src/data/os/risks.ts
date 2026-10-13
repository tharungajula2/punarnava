/**
 * Risk register (shared by the OS dashboard and, later, the /lab risk page).
 * Risks and mitigations from research/01-market.md (R1) and
 * 02-unit-economics.md (R2). Ratings are the reports' qualitative ratings.
 */
export type Level = "low" | "medium" | "high" | "very-high";

export type Risk = {
  id: string;
  title: string;
  likelihood: Level;
  impact: Level;
  why: string;
  mitigation: string;
  module: string;
  href: string;
  source: string;
};

export const levelLabel: Record<Level, string> = { low: "Low", medium: "Medium", high: "High", "very-high": "Very high" };
const rank: Record<Level, number> = { low: 1, medium: 2, high: 3, "very-high": 4 };

export const risks: Risk[] = [
  {
    id: "feed-shortage",
    title: "Feedstock shortage or bidding war",
    likelihood: "high",
    impact: "very-high",
    why: "Recycled-content mandates raise demand for clean HDPE/PET; large recyclers are expanding in South India.",
    mitigation: "Contract most first-year supply before capex; diversify MRFs, aggregators and institutions; formula pricing.",
    module: "Feedstock",
    href: "/os/feedstock",
    source: "R1, R3",
  },
  {
    id: "spread",
    title: "Feedstock price rises without a pellet price rise",
    likelihood: "high",
    impact: "very-high",
    why: "The spread between contracted feed and contracted output decides returns, not either price alone.",
    mitigation: "Minimum conversion-spread clauses; buy to specification; daily contribution-margin view.",
    module: "Finance",
    href: "/os/finance",
    source: "R1, R2",
  },
  {
    id: "wc-squeeze",
    title: "Working-capital squeeze",
    likelihood: "high",
    impact: "high",
    why: "Suppliers want fast payment, buyers pay later, and EPR income lags audit.",
    mitigation: "Cash-credit line before commissioning; cap receivable days; no speculative stock.",
    module: "Finance",
    href: "/os/finance",
    source: "R1, R2",
  },
  {
    id: "resin-price",
    title: "Recycled resin price falls / cheap virgin polymer",
    likelihood: "medium",
    impact: "very-high",
    why: "Virgin HDPE prices are revised often and pull recycled prices with them.",
    mitigation: "Mix formula-linked and fixed-volume offtake; several buyer segments; no single buyer.",
    module: "Sales",
    href: "/os/sales",
    source: "R1, R2",
  },
  {
    id: "wastewater",
    title: "Wastewater, wash fines and sludge",
    likelihood: "medium",
    impact: "very-high",
    why: "Washing creates polluted water under KSPCB control; some industrial areas lack a common ETP.",
    mitigation: "Own ETP and water recirculation designed before CFE; lease conditional on a legal discharge route.",
    module: "Compliance",
    href: "/os/compliance",
    source: "R1, R2",
  },
  {
    id: "fire",
    title: "Fire and stockpile loss",
    likelihood: "medium",
    impact: "very-high",
    why: "Baled plastic is a high fire load and stock can pile up when buying is opportunistic.",
    mitigation: "Separate raw and finished zones, stack-height limits, hydrants, monitoring, insurance, capped stock days.",
    module: "Inventory",
    href: "/os/inventory",
    source: "R1, R2",
  },
  {
    id: "audit",
    title: "EPR certificate invalidation / audit failure",
    likelihood: "medium",
    impact: "very-high",
    why: "Certificates depend on registration, declared capacity, audit and validated records.",
    mitigation: "Weighbridge data, supplier KYC, lot IDs, GST reconciliation, daily mass balance, periodic audit.",
    module: "EPR credits",
    href: "/os/epr",
    source: "R1",
  },
  {
    id: "epr-price",
    title: "EPR certificate price collapse",
    likelihood: "high",
    impact: "medium",
    why: "Public price indications vary widely; price discovery is weak.",
    mitigation: "Plan on the low base price (and a zero-EPR case); sell periodically to several PIBOs.",
    module: "EPR credits",
    href: "/os/epr",
    source: "R1, R2",
  },
  {
    id: "quality",
    title: "Quality and yield below plan",
    likelihood: "medium",
    impact: "high",
    why: "Natural / controlled-MFI pellets earn much more than mixed black; contamination cuts yield.",
    mitigation: "Supplier bale specs, keep natural/light bottles separate, sell against a technical data sheet.",
    module: "Quality",
    href: "/os/quality",
    source: "R2",
  },
  {
    id: "machinery",
    title: "Machinery quotation and performance risk",
    likelihood: "medium",
    impact: "high",
    why: "Indian listings for similar capacities vary widely because line scope differs.",
    mitigation: "Competitive RFQ; contract guarantees on kg/h, moisture, kW; wet trial with our own material.",
    module: "Plant operations",
    href: "/os/operations",
    source: "R2",
  },
  {
    id: "regulatory",
    title: "Regulatory or portal changes",
    likelihood: "medium",
    impact: "high",
    why: "The EPR portal changed in June 2026 and rules were amended in March 2026.",
    mitigation: "One owner for compliance; monthly CPCB/KSPCB review; digital records.",
    module: "Compliance",
    href: "/os/compliance",
    source: "R1",
  },
];

export const riskScore = (r: Risk) => rank[r.likelihood] * rank[r.impact];

export function topRisks(n = 5) {
  return [...risks].sort((a, b) => riskScore(b) - riskScore(a)).slice(0, n);
}
