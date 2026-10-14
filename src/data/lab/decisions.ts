/**
 * Decision log for /lab/decisions. Only decisions actually taken (or formally
 * proposed) while building Punarnava — taken from the CLAUDE.md progress log
 * and the research files. "Proposed" = recommended, waiting for the founder.
 * Add new decisions at the top.
 */
import { v } from "../assumptions";

export type DecisionStatus = "Decided" | "Proposed" | "Open" | "Superseded";

export type Decision = {
  id: string;
  date: string; // ISO date
  decision: string;
  reason: string;
  status: DecisionStatus;
  source: string;
  href?: string;
};

export function decisions(): Decision[] {
  return [
    {
      id: "D-010",
      date: "2026-10-14",
      decision: "Seed raise amount stays a placeholder until the founder confirms it.",
      reason: `The model shows a funding envelope of ₹${v("funding_total")} L (capex + deposit + working capital); the ask must be set by the founder, not inferred.`,
      status: "Open",
      source: "assumptions.ts (raise_amount, funding_total)",
      href: "/os/money/finance",
    },
    {
      id: "D-009",
      date: "2026-10-14",
      decision: "Sample OS records (trips, lots, dispatches) come from a fixed-seed simulation run, not invented data.",
      reason: "Pre-revenue: no real records exist. Simulated samples stay traceable to the assumptions and are labelled as samples.",
      status: "Decided",
      source: "Progress log, Phase 7",
      href: "/os",
    },
    {
      id: "D-008",
      date: "2026-10-13",
      decision: `Order the processing line only after ${v("gate_feedstock_contracted")}% of feedstock and ${v("gate_offtake_contracted")}% of offtake are under written agreement.`,
      reason: "All three reports say feedstock and buyers, not machinery, decide survival. Investors fund offtake, not capacity.",
      status: "Proposed",
      source: "R2, R3; assumptions gate_feedstock_contracted, gate_offtake_contracted",
      href: "/os/execution",
    },
    {
      id: "D-007",
      date: "2026-10-13",
      decision: `Plan on a low EPR price (₹${v("epr_credit_price")}/kg) and check the plant still works at zero EPR income.`,
      reason: `EPR prices are opaque and can collapse; R2 margin is ₹${v("ebitda_kg_no_epr")}/kg even with no EPR income.`,
      status: "Decided",
      source: "R1, R2, R3",
      href: "/os/market/pricing",
    },
    {
      id: "D-006",
      date: "2026-10-13",
      decision: "Use IMARC's lower market estimate, not MarketsandMarkets.",
      reason: "MarketsandMarkets' stated growth rate does not match its own endpoints; IMARC is internally consistent.",
      status: "Decided",
      source: "R1",
      href: "/os/market",
    },
    {
      id: "D-005",
      date: "2026-10-13",
      decision: "Landing page speaks in the future tense and scopes the mandate to rigid Category I packaging.",
      reason: "Pre-revenue company; the food-contact exemption and audit-based EPR mean broader claims would overstate the opportunity.",
      status: "Decided",
      source: "Progress log, Phase 4",
      href: "/",
    },
    {
      id: "D-004",
      date: "2026-10-13",
      decision: "No database yet; all data sits in typed files behind a small data layer.",
      reason: "Nothing to store yet; the data layer lets Supabase replace the files later without touching the UI.",
      status: "Decided",
      source: "CLAUDE.md §5",
    },
    {
      id: "D-003",
      date: "2026-10-13",
      decision: `Shed in the Nelamangala corridor (≈₹${v("rent_corridor")}/sq ft/month) rather than an industrial area without a common effluent plant.`,
      reason: "Washing creates effluent; the lease must allow an own ETP and a legal discharge route.",
      status: "Proposed",
      source: "R2",
      href: "/os/execution/licences",
    },
    {
      id: "D-002",
      date: "2026-10-13",
      decision: "PET bottle-to-flake (R1's first choice) kept as an alternative, not the base case.",
      reason: "Large PET recyclers already compete hard for bottles; R2 and R3 point to polyolefins and feedstock first.",
      status: "Proposed",
      source: "R1 vs R2 vs R3",
    },
    {
      id: "D-001",
      date: "2026-10-13",
      decision: `Base case: build the Bengaluru feedstock network first, then a ~${v("plant_input_tpd")} t/day rigid HDPE wash-and-pelletise line.`,
      reason: "R2's economics are best at this scale; R3 says feedstock control is the moat. The three reports disagree, so the founder must confirm.",
      status: "Proposed",
      source: "R1, R2, R3",
      href: "/os/money/scenarios",
    },
  ];
}
