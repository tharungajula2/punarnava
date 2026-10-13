/**
 * Punarnava — single source of truth for every number in the app.
 *
 * Rules (see CLAUDE.md §7):
 * - Every figure shown anywhere comes from this file.
 * - status: "placeholder" = not researched yet (founder to confirm);
 *           "researched"  = taken from /research, not independently checked;
 *           "verified"    = confirmed against a quote, contract or filing.
 * - Never present a placeholder as fact.
 *
 * Base case (decision pending, see "strategy_base_case"): a ~5 tonne/day rigid
 * HDPE wash-and-pelletise plant in outer Bengaluru, feedstock network first.
 * Research sources: research/01-market.md (R1), 02-unit-economics.md (R2),
 * 03-competitors-investors.md (R3).
 */

export type Confidence = "low" | "medium" | "high";
export type Status = "placeholder" | "researched" | "verified";
export type Category =
  | "market"
  | "regulation"
  | "prices"
  | "plant"
  | "capex"
  | "economics"
  | "roadmap"
  | "funding";

export type Assumption = {
  id: string;
  label: string;
  value: number;
  unit: string;
  category: Category;
  source: string;
  sourceUrl?: string;
  confidence: Confidence;
  status: Status;
  notes?: string;
  ownerOnly?: boolean;
};

const R1 = "research/01-market.md";
const R2 = "research/02-unit-economics.md";
const R3 = "research/03-competitors-investors.md";

export const assumptions = [
  // ── Market ────────────────────────────────────────────────────────────────
  {
    id: "india_plastic_waste_fy23",
    label: "India plastic-waste generation, FY2022-23",
    value: 4.136,
    unit: "million t/yr",
    category: "market",
    source: `CPCB / MoEFCC reported data, via ${R1}`,
    confidence: "high",
    status: "researched",
  },
  {
    id: "karnataka_plastic_waste_fy23",
    label: "Karnataka plastic-waste generation, FY2022-23",
    value: 360781,
    unit: "t/yr",
    category: "market",
    source: `CPCB / MoEFCC reported data, via ${R1}`,
    confidence: "medium",
    status: "researched",
    notes: "Reported series is volatile (528,031 t in FY2021-22). Treat as order of magnitude.",
  },
  {
    id: "karnataka_share_national_waste",
    label: "Karnataka share of India's reported plastic waste (3-yr avg)",
    value: 10.4,
    unit: "%",
    category: "market",
    source: `Derived from CPCB data, ${R1}`,
    confidence: "medium",
    status: "researched",
  },
  {
    id: "bengaluru_plastic_waste_low",
    label: "Bengaluru plastic waste — low estimate",
    value: 500,
    unit: "t/day",
    category: "market",
    source: `BSWML CEO estimate, via ${R2}`,
    confidence: "low",
    status: "researched",
    notes: "Official statements, not an audited material-flow study.",
  },
  {
    id: "bengaluru_plastic_waste_high",
    label: "Bengaluru plastic waste — high estimate",
    value: 900,
    unit: "t/day",
    category: "market",
    source: `Karnataka Chief Minister statement (late 2025), via ${R1}`,
    confidence: "low",
    status: "researched",
  },
  {
    id: "flexible_share_consumer_packaging",
    label: "Share of Indian consumer packaging that is flexible",
    value: 70,
    unit: "%",
    category: "market",
    source: `India Plastics Pact landscape assessment, via ${R2}`,
    confidence: "medium",
    status: "researched",
  },
  {
    id: "india_recycled_plastics_market_2026",
    label: "India recycled-plastics market, 2026",
    value: 4.64,
    unit: "US$ bn",
    category: "market",
    source: `IMARC 2026 estimate, via ${R1}`,
    confidence: "medium",
    status: "researched",
    notes: "MarketsandMarkets gives a higher US$6.57bn; IMARC used as the lower, internally consistent base.",
  },
  {
    id: "india_recycled_plastics_market_2031",
    label: "India recycled-plastics market, 2031 forecast",
    value: 5.77,
    unit: "US$ bn",
    category: "market",
    source: `IMARC trajectory at 4.45% CAGR, ${R1}`,
    confidence: "low",
    status: "researched",
  },
  {
    id: "karnataka_recycled_market_2026",
    label: "Karnataka recycled-plastics market, 2026 (proxy)",
    value: 4340,
    unit: "₹ crore",
    category: "market",
    source: `${R1}: 10.39% of India value at ₹90/US$`,
    confidence: "low",
    status: "researched",
    notes: "Proxy: no published state-level figure exists.",
  },

  // ── Regulation (EPR) ──────────────────────────────────────────────────────
  {
    id: "epr_cat1_recycled_content_fy26",
    label: "Mandatory recycled content, Cat I rigid packaging, FY2025-26",
    value: 30,
    unit: "%",
    category: "regulation",
    source: `PWM (Amendment) Rules, G.S.R. 237(E), 31 Mar 2026, via ${R1}`,
    confidence: "high",
    status: "researched",
  },
  {
    id: "epr_cat1_recycled_content_fy27",
    label: "Mandatory recycled content, Cat I rigid packaging, FY2026-27",
    value: 40,
    unit: "%",
    category: "regulation",
    source: `PWM (Amendment) Rules, G.S.R. 237(E), via ${R1}`,
    confidence: "high",
    status: "researched",
  },
  {
    id: "epr_cat1_recycled_content_fy28",
    label: "Mandatory recycled content, Cat I rigid packaging, FY2027-28",
    value: 50,
    unit: "%",
    category: "regulation",
    source: `PWM (Amendment) Rules, G.S.R. 237(E), via ${R1}`,
    confidence: "high",
    status: "researched",
  },
  {
    id: "epr_cat1_recycled_content_fy29",
    label: "Mandatory recycled content, Cat I rigid packaging, FY2028-29 onward",
    value: 60,
    unit: "%",
    category: "regulation",
    source: `PWM (Amendment) Rules, G.S.R. 237(E), via ${R1}`,
    confidence: "high",
    status: "researched",
  },
  {
    id: "epr_cat1_min_recycling_fy27",
    label: "Minimum share of Cat I EPR target met by recycling, FY2026-27",
    value: 70,
    unit: "%",
    category: "regulation",
    source: `MoEFCC Lok Sabha reply, Mar 2026, via ${R1}`,
    confidence: "high",
    status: "researched",
  },
  {
    id: "registered_pibos",
    label: "Registered producers, importers & brand owners (Aug 2026)",
    value: 65241,
    unit: "PIBOs",
    category: "regulation",
    source: `Government of India, Aug 2026, via ${R1}`,
    confidence: "high",
    status: "researched",
  },
  {
    id: "registered_pwps",
    label: "Registered plastic waste processors (Aug 2026)",
    value: 3117,
    unit: "processors",
    category: "regulation",
    source: `Government of India, Aug 2026, via ${R1}`,
    confidence: "high",
    status: "researched",
  },

  // ── Prices ────────────────────────────────────────────────────────────────
  {
    id: "feedstock_price",
    label: "Sorted rigid HDPE feedstock, ex-source",
    value: 38,
    unit: "₹/kg input",
    category: "prices",
    source: `Planning assumption above Bengaluru listings, ${R2}`,
    confidence: "medium",
    status: "researched",
  },
  {
    id: "inbound_freight",
    label: "Inbound collection / freight",
    value: 2.5,
    unit: "₹/kg input",
    category: "prices",
    source: R2,
    confidence: "medium",
    status: "researched",
  },
  {
    id: "pellet_price",
    label: "Blended recycled HDPE pellet price, ex-GST",
    value: 82,
    unit: "₹/kg",
    category: "prices",
    source: `Below Bengaluru quotes of ₹85-98/kg, ${R2}`,
    confidence: "medium",
    status: "researched",
  },
  {
    id: "epr_credit_price",
    label: "EPR certificate income, base case",
    value: 1.1,
    unit: "₹/kg",
    category: "prices",
    source: `Deliberately conservative, ${R2}`,
    confidence: "medium",
    status: "researched",
    notes: "2026 market commentary quotes ₹3-20/kg; we do not underwrite above ₹1.10.",
  },
  {
    id: "epr_market_low",
    label: "EPR certificate market range 2026 — low",
    value: 3,
    unit: "₹/kg",
    category: "prices",
    source: `Market intermediaries (IncorpX, Aug 2026), via ${R1}`,
    confidence: "low",
    status: "researched",
  },
  {
    id: "epr_market_high",
    label: "EPR certificate market range 2026 — high",
    value: 20,
    unit: "₹/kg",
    category: "prices",
    source: `Market intermediaries (Seyecs, Apr 2026), via ${R1}`,
    confidence: "low",
    status: "researched",
  },

  // ── Plant (base case ~5 t/day) ────────────────────────────────────────────
  {
    id: "plant_input_tpd",
    label: "Plant input capacity",
    value: 5,
    unit: "t/day",
    category: "plant",
    source: R2,
    confidence: "medium",
    status: "researched",
  },
  {
    id: "line_rate",
    label: "Nominal wash-and-pellet line rate",
    value: 500,
    unit: "kg/h",
    category: "plant",
    source: R2,
    confidence: "medium",
    status: "researched",
  },
  {
    id: "operating_days_month",
    label: "Operating days per month",
    value: 26,
    unit: "days",
    category: "plant",
    source: R2,
    confidence: "high",
    status: "researched",
  },
  {
    id: "yield",
    label: "Saleable pellet yield",
    value: 80,
    unit: "% of input",
    category: "plant",
    source: R2,
    confidence: "medium",
    status: "researched",
  },
  {
    id: "output_t_month",
    label: "Saleable pellet output",
    value: 104,
    unit: "t/month",
    category: "plant",
    source: R2,
    confidence: "medium",
    status: "researched",
  },
  {
    id: "employees",
    label: "Plant team at base scale",
    value: 21,
    unit: "FTE",
    category: "plant",
    source: R2,
    confidence: "medium",
    status: "researched",
  },
  {
    id: "electricity_kwh_t",
    label: "Specific electricity use",
    value: 310,
    unit: "kWh/t input",
    category: "plant",
    source: `Engineering assumption, ${R2}`,
    confidence: "low",
    status: "researched",
  },
  {
    id: "water_makeup_m3_t",
    label: "Fresh-water make-up (closed-loop wash)",
    value: 2,
    unit: "m³/t input",
    category: "plant",
    source: `Engineering assumption, ${R2}`,
    confidence: "low",
    status: "researched",
  },
  {
    id: "etp_capacity_kld",
    label: "Effluent treatment plant capacity",
    value: 20,
    unit: "KLD",
    category: "plant",
    source: R2,
    confidence: "medium",
    status: "researched",
  },

  // ── CAPEX & funding envelope (₹ lakh) ─────────────────────────────────────
  { id: "capex_machinery", label: "Installed processing line", value: 96.5, unit: "₹ lakh", category: "capex", source: R2, confidence: "medium", status: "researched", notes: "±20-25% pre-RFQ accuracy." },
  { id: "capex_etp", label: "Effluent treatment & water recycling", value: 15, unit: "₹ lakh", category: "capex", source: R2, confidence: "medium", status: "researched" },
  { id: "capex_civil", label: "Civil works & shed retrofit", value: 28, unit: "₹ lakh", category: "capex", source: R2, confidence: "medium", status: "researched" },
  { id: "capex_electrical", label: "Power connection & electricals", value: 15, unit: "₹ lakh", category: "capex", source: R2, confidence: "medium", status: "researched" },
  { id: "capex_handling", label: "Forklift, handling & weighing", value: 10, unit: "₹ lakh", category: "capex", source: R2, confidence: "medium", status: "researched" },
  { id: "capex_safety_permits", label: "Fire safety, permits & contingency", value: 15, unit: "₹ lakh", category: "capex", source: R2, confidence: "medium", status: "researched" },
  { id: "working_capital", label: "Working capital", value: 83.4, unit: "₹ lakh", category: "funding", source: R2, confidence: "medium", status: "researched" },
  { id: "lease_deposit", label: "Refundable lease deposit", value: 16.8, unit: "₹ lakh", category: "funding", source: R2, confidence: "medium", status: "researched" },
  {
    id: "raise_amount",
    label: "Seed raise (target)",
    value: 2.8,
    unit: "₹ crore",
    category: "funding",
    source: "Founder decision pending — set equal to the modelled funding envelope",
    confidence: "low",
    status: "placeholder",
    notes: "Founder to confirm round size and equity/debt split.",
  },

  // ── Economics (base case, steady state) ───────────────────────────────────
  // Cash cost per kg of saleable output
  { id: "cost_feedstock_kg", label: "Feedstock", value: 47.5, unit: "₹/kg output", category: "economics", source: R2, confidence: "medium", status: "researched" },
  { id: "cost_inbound_kg", label: "Inbound logistics", value: 3.13, unit: "₹/kg output", category: "economics", source: R2, confidence: "medium", status: "researched" },
  { id: "cost_labour_kg", label: "Labour", value: 5.9, unit: "₹/kg output", category: "economics", source: R2, confidence: "medium", status: "researched" },
  { id: "cost_power_kg", label: "Electricity", value: 4.11, unit: "₹/kg output", category: "economics", source: R2, confidence: "medium", status: "researched" },
  { id: "cost_overhead_kg", label: "Admin, QC & compliance", value: 2.4, unit: "₹/kg output", category: "economics", source: R2, confidence: "medium", status: "researched" },
  { id: "cost_rent_kg", label: "Shed rent", value: 2.02, unit: "₹/kg output", category: "economics", source: R2, confidence: "medium", status: "researched" },
  { id: "cost_other_kg", label: "Water, consumables, maintenance, outbound", value: 3.14, unit: "₹/kg output", category: "economics", source: `${R2} (0.58 + 1.30 + 0.51 + 0.75)`, confidence: "medium", status: "researched" },
  { id: "annual_revenue", label: "Annual revenue at steady state", value: 10.37, unit: "₹ crore", category: "economics", source: R2, confidence: "medium", status: "researched" },
  { id: "annual_ebitda", label: "Annual EBITDA at steady state", value: 1.86, unit: "₹ crore", category: "economics", source: R2, confidence: "medium", status: "researched" },
  { id: "breakeven_utilisation", label: "Cash break-even utilisation", value: 44, unit: "%", category: "economics", source: R2, confidence: "medium", status: "researched" },
  {
    id: "payback_practical",
    label: "Practical payback target incl. ramp-up and financing",
    value: 3.5,
    unit: "years",
    category: "economics",
    source: `${R1} recommends underwriting to 3-4 years; ${R2} steady-state simple payback is 1.5 years`,
    confidence: "low",
    status: "researched",
  },
  { id: "payback_steady_state", label: "All-in simple payback at steady state", value: 1.5, unit: "years", category: "economics", source: R2, confidence: "low", status: "researched", notes: "Excludes ramp-up, interest and tax — not a realistic commissioning-to-cash payback." },
  { id: "stress_feed_pct", label: "Stress test: feedstock price rise", value: 20, unit: "%", category: "economics", source: R2, confidence: "medium", status: "researched" },
  { id: "stress_yield_pp", label: "Stress test: yield drop", value: 5, unit: "percentage points", category: "economics", source: R2, confidence: "medium", status: "researched" },
  { id: "stress_price_pct", label: "Stress test: pellet price fall", value: 10, unit: "%", category: "economics", source: R2, confidence: "medium", status: "researched" },
  {
    id: "stress_ebitda_kg",
    label: "EBITDA in combined stress case (feed +20%, yield −5pp, price −10%)",
    value: -7.85,
    unit: "₹/kg output",
    category: "economics",
    source: R2,
    confidence: "medium",
    status: "researched",
  },

  // ── Roadmap gates ─────────────────────────────────────────────────────────
  { id: "gate_feedstock_contracted", label: "Feedstock under written agreement before ordering the line", value: 60, unit: "%", category: "roadmap", source: R1, confidence: "medium", status: "researched" },
  { id: "gate_offtake_contracted", label: "Pellet offtake under agreement before ordering the line", value: 50, unit: "%", category: "roadmap", source: R1, confidence: "medium", status: "researched" },
  { id: "procurement_trial_weeks", label: "Live procurement trial before committing capex", value: 8, unit: "weeks", category: "roadmap", source: `${R1} (6-8 weeks)`, confidence: "medium", status: "researched" },
  { id: "sample_converters", label: "Converters receiving trial pellet samples", value: 5, unit: "converters", category: "roadmap", source: R3, confidence: "medium", status: "researched" },
  { id: "time_to_production_months", label: "Leased shed: site commitment to compliant production (upper bound)", value: 8, unit: "months", category: "roadmap", source: `${R1} (4-8 months)`, confidence: "medium", status: "researched" },
  { id: "expansion_input_tpd", label: "Expansion scale", value: 10, unit: "t/day", category: "roadmap", source: R2, confidence: "medium", status: "researched" },
  { id: "expansion_yield_gate", label: "Sustained yield needed before expanding", value: 80, unit: "%", category: "roadmap", source: R2, confidence: "medium", status: "researched" },
] as const satisfies readonly Assumption[];

export type AssumptionId = (typeof assumptions)[number]["id"];

const byId = new Map<string, Assumption>(assumptions.map((a) => [a.id, a]));

export function getAssumption(id: AssumptionId): Assumption {
  const a = byId.get(id);
  if (!a) throw new Error(`Unknown assumption: ${id}`);
  return a;
}

/** Shorthand for the raw value. */
export function v(id: AssumptionId): number {
  return getAssumption(id).value;
}

/** Indian-style grouping (1,23,456) with sensible decimals. */
export function num(value: number, maxDecimals = 2): string {
  return value.toLocaleString("en-IN", { maximumFractionDigits: maxDecimals });
}

/** Rupee amounts: whole numbers stay whole, otherwise always two decimals (₹1.10, not ₹1.1). */
export function money(value: number): string {
  if (Number.isInteger(value)) return num(value);
  return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** All assumptions safe to show publicly (never ownerOnly). */
export function publicAssumptions(): Assumption[] {
  return (assumptions as readonly Assumption[]).filter((a) => !a.ownerOnly);
}
