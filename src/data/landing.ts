/**
 * Landing page content. Copy lives here; every number is read from assumptions.ts.
 * Edit wording here — components only handle layout.
 */
import { money, num, v, type AssumptionId } from "@/data/assumptions";

/** Assumption ids behind a figure (its footnote reads their sources and status). */
const figIds = (...ids: AssumptionId[]) => ids;

const lakhToCrore = (lakh: number) => lakh / 100;

export const nav = [
  { href: "/#problem", label: "Problem" },
  { href: "/#why-now", label: "Opportunity" },
  { href: "/#how", label: "Process" },
  { href: "/#roadmap", label: "Plan" },
] as const;

export const hero = {
  eyebrow: "A proposed recycling plant · Bengaluru",
  title: "Plastic that becomes",
  titleEmphasis: "new again.",
  promise: "We want to turn used rigid plastic into reliable material that manufacturers can use again. Here is the opportunity, the proposed plant, and what we need to prove before building it.",
  primaryCta: { href: "/factory", label: "Tour the proposed factory" },
  secondaryCta: { href: "#roadmap", label: "See the plan" },
  facts: [
    { value: "One material", label: "rigid HDPE to start" },
    { value: "One line", label: "a focused first plant" },
    { value: "Full trace", label: "from arrival to dispatch" },
  ],
  loopStages: ["Collect", "Sort", "Wash", "Extrude", "Pellet", "Supply"],
};

export const problem = {
  kicker: "The problem",
  title: "Good plastic gets lost in the mix.",
  body: "Bengaluru already collects plastic. The missing step is turning uneven scrap into clean, consistent material that manufacturers can buy with confidence.",
  stats: [
    {
      value: `${num(v("bengaluru_plastic_waste_low"))}–${num(v("bengaluru_plastic_waste_high"))}`,
      unit: "t/day",
      label: "tonnes of plastic waste a day in Bengaluru, based on two estimates",
    },
    {
      value: num(v("india_plastic_waste_fy23")),
      unit: "million t",
      label: "tonnes of plastic waste reported across India in FY2022-23",
    },
    {
      value: `~${num(v("karnataka_share_national_waste"), 0)}%`,
      unit: "",
      label: "of reported plastic waste comes from Karnataka",
    },
    {
      value: `~${num(v("flexible_share_consumer_packaging"))}%`,
      unit: "",
      label: "of consumer packaging is flexible; our first focus is rigid plastic",
    },
  ],
  figure: {
    karnatakaPct: v("karnataka_share_national_waste"),
    cityLow: v("bengaluru_plastic_waste_low"),
    cityHigh: v("bengaluru_plastic_waste_high"),
    plantTpd: v("plant_input_tpd"),
    plantNote: "The proposed first plant would need only a small share of the city's supply. The challenge is securing the right plastic, consistently.",
    flexiblePct: v("flexible_share_consumer_packaging"),
    ids: [
      "india_plastic_waste_fy23",
      "karnataka_share_national_waste",
      "bengaluru_plastic_waste_low",
      "bengaluru_plastic_waste_high",
      "plant_input_tpd",
      "flexible_share_consumer_packaging",
    ],
  },
} as const;

export const whyNow = {
  kicker: "The opportunity",
  title: "Manufacturers need recycled plastic they can trust.",
  body: "India's rules call for more recycled material in rigid packaging. A rule creates a reason to buy; consistent quality and clear records are what could win the order.",
  chartTitle: "Required recycled content in rigid plastic packaging",
  chart: [
    { year: "FY26", value: v("epr_cat1_recycled_content_fy26") },
    { year: "FY27", value: v("epr_cat1_recycled_content_fy27") },
    { year: "FY28", value: v("epr_cat1_recycled_content_fy28") },
    { year: "FY29+", value: v("epr_cat1_recycled_content_fy29") },
  ],
  points: [
    {
      title: "A clear reason to buy",
      body: "The required recycled share rises over time. Manufacturers will need suitable material to meet it.",
    },
    {
      title: "A reason to choose us",
      body: "Each batch should come with a quality check and a clear record of where it came from.",
    },
    {
      title: "The test is commercial",
      body: "We still need to prove the right supply, repeatable quality and paying buyers before committing to a plant.",
    },
  ],
  ids: [
    "epr_cat1_recycled_content_fy26",
    "epr_cat1_recycled_content_fy27",
    "epr_cat1_recycled_content_fy28",
    "epr_cat1_recycled_content_fy29",
  ],
} as const;
export const how = {
  kicker: "The process",
  title: "From used plastic to useful material.",
  body: "Each step has one job. Follow the line below, then open the factory to see why we placed each area where it is.",
  steps: [
    { title: "Collect", body: "Buy rigid plastic from existing collectors." },
    { title: "Sort", body: "Keep the right plastic and colours together." },
    { title: "Shred", body: "Cut containers into small, even pieces." },
    { title: "Wash", body: "Clean the pieces and separate unwanted material." },
    { title: "Dry", body: "Remove moisture before melting." },
    { title: "Extrude", body: "Melt and filter the clean plastic." },
    { title: "Pelletise", body: "Cut it into reusable pellets." },
    { title: "Supply", body: "Test, bag and trace each batch to a buyer." },
  ],
  massIn: 1000,
  massOut: 1000 * (v("yield") / 100),
  yieldPct: v("yield"),
  ids: ["yield", "etp_capacity_kld"],
} as const;

export const plant = {
  kicker: "Inside the plant",
  title: "A plant designed around the flow.",
  body: "Arrival, sorting, cleaning, pellet making and dispatch each have a place. The walkthrough explains the job of every area and the decisions behind this proposed layout.",
  note: "Proposed layout for discussion. Site, equipment, safety and permits need professional validation before construction.",
  stats: [
    { value: `${num(v("plant_input_tpd"))} t`, label: "plastic in per day" },
    { value: `${num(v("yield"))}%`, label: "leaves as pellets" },
    { value: `~${num(v("output_t_month"))} t`, label: "pellets a month" },
  ],
  stops: [
    "Weighbridge",
    "Bale yard",
    "Sorting",
    "Shred & wash",
    "Dry & store",
    "Extrude & pelletise",
    "Water recycling",
    "Packed & dispatched",
  ],
  ids: ["line_rate", "plant_input_tpd", "yield", "etp_capacity_kld", "output_t_month"],
} as const;

const costIds = [
  "cost_feedstock_kg",
  "cost_inbound_kg",
  "cost_labour_kg",
  "cost_power_kg",
  "cost_overhead_kg",
  "cost_rent_kg",
  "cost_other_kg",
] as const;

export const model = {
  kicker: "How it could earn",
  title: "The main product is recycled plastic.",
  streams: [
    {
      name: "Recycled HDPE pellets",
      tag: "Core revenue",
      price: `₹${num(v("pellet_price"))}/kg`,
      priceNote: "illustrative selling price in the current model",
      body: "Manufacturers buy pellets they can use reliably. We would sell by a clear quality specification, with every batch recorded.",
    },
    {
      name: "EPR certificates",
      tag: "Possible extra income",
      price: `₹${money(v("epr_credit_price"))}/kg`,
      priceNote: "illustrative and uncertain; not needed for the core case",
      body: "Eligible, documented recycling may also create certificates for brands. We would count this only after registration and verification.",
    },
  ],
  flow: {
    pellet: v("pellet_price"),
    epr: v("epr_credit_price"),
  },
  ids: figIds("pellet_price", "epr_credit_price", "epr_market_low", "epr_market_high", ...costIds),
  principle: {
    title: "The pellets must carry the business.",
    body: "Certificate income is uncertain. We would only build if contracted pellet sales can support the plant on their own.",
  },
};

function totalCostPerKg() {
  return (
    v("cost_feedstock_kg") +
    v("cost_inbound_kg") +
    v("cost_labour_kg") +
    v("cost_power_kg") +
    v("cost_overhead_kg") +
    v("cost_rent_kg") +
    v("cost_other_kg")
  );
}

const revenuePerKg = v("pellet_price") + v("epr_credit_price");

export const economics = {
  kicker: "The business case",
  title: "The plant has to work when conditions change.",
  body: "This is an early model, not a forecast. The charts show what drives the result and where the idea becomes vulnerable.",
  kpis: [
    { value: `₹${num(v("annual_revenue"))} cr`, label: "modelled yearly sales at full planned run rate" },
    { value: `${num(v("breakeven_utilisation"))}%`, label: "of planned capacity needed to cover cash operating costs" },
  ],
  perKg: {
    title: "What happens to each sale",
    revenue: revenuePerKg,
    costs: [
      { label: "Feedstock", value: v("cost_feedstock_kg") },
      { label: "Inbound logistics", value: v("cost_inbound_kg") },
      { label: "Labour", value: v("cost_labour_kg") },
      { label: "Electricity", value: v("cost_power_kg") },
      { label: "Admin, QC & compliance", value: v("cost_overhead_kg") },
      { label: "Rent", value: v("cost_rent_kg") },
      { label: "Water & other", value: v("cost_other_kg") },
    ],
    margin: revenuePerKg - totalCostPerKg(),
  },
  stressChart: [
    { label: "Base case", value: revenuePerKg - totalCostPerKg() },
    { label: `Feedstock +${num(v("stress_feed_pct"))}%`, value: v("stress_single_feed_kg") },
    { label: `Yield −${num(v("stress_yield_pp"))} pts`, value: v("stress_single_yield_kg") },
    { label: `Price −${num(v("stress_price_pct"))}%`, value: v("stress_single_price_kg") },
    { label: "All three at once", value: v("stress_ebitda_kg") },
  ],
  ids: figIds(
    "line_rate",
    "plant_input_tpd",
    "operating_days_month",
    "yield",
    "output_t_month",
    "annual_revenue",
    "annual_ebitda",
    "breakeven_utilisation",
    "pellet_price",
    "epr_credit_price",
    ...costIds,
    "stress_single_feed_kg",
    "stress_single_yield_kg",
    "stress_single_price_kg",
    "stress_ebitda_kg",
  ),
  stress: {
    title: "What could break the plan?",
    body: "One setback at a time is manageable in the model. Higher input cost, lower usable output and a lower selling price together would make it lose money. That is why supply and buyers come before machines.",
  },
};

export const roadmap = {
  kicker: "The path forward",
  title: "Earn the right to build.",
  phases: [
    {
      tag: "Phase 1",
      name: "Prove",
      when: "Before the plant",
      body: "Test real plastic, make trial pellets with a partner and get buyer feedback.",
      gate: "Move on when supply and buyer interest are documented.",
    },
    {
      tag: "Phase 2",
      name: "Build",
      when: "After proof",
      body: "Choose a workable site, complete engineering and permits, then install the line and water treatment.",
      gate: "Move on after safe commissioning and required approvals.",
    },
    {
      tag: "Phase 3",
      name: "Run",
      when: "First operations",
      body: "Increase output gradually while checking every batch, water loop and buyer response.",
      gate: "Move on when quality and repeat orders hold steady.",
    },
    {
      tag: "Phase 4",
      name: "Expand",
      when: "Only when ready",
      body: "Add capacity only if the first line proves its supply, quality and buyer economics.",
      gate: "The next line must earn its own case.",
    },
  ],
  ids: [
    "prove_phase_months_high",
    "procurement_trial_weeks",
    "sample_converters",
    "gate_feedstock_contracted",
    "gate_offtake_contracted",
    "time_to_production_months",
    "ramp_year1",
    "ramp_year2",
    "ramp_year3",
    "expansion_yield_gate",
    "expansion_input_tpd",
  ],
} as const;

export const team = {
  kicker: "The founding team",
  title: "Three founders. One focused first step.",
  principles: [
    { title: "Prove the supply", body: "Start with the collectors already doing the work and test what material is available." },
    { title: "Design for quality", body: "Build batch records and product checks into the flow from the first day." },
    { title: "Spend in stages", body: "Commit to equipment only after samples, buyers and the site are real." },
  ],
  // First names and order supplied by the founders; no invented biographies.
  people: [
    { name: "Goutham", role: "Lead founder" },
    { name: "Manoj", role: "Co-founder" },
    { name: "Tharun", role: "Co-founder" },
  ],
};

const funds = [
  { label: "Processing equipment", lakh: v("capex_machinery") + v("capex_electrical") + v("capex_handling") },
  { label: "Working capital", lakh: v("working_capital") },
  { label: "Site, safety & permits", lakh: v("capex_civil") + v("capex_safety_permits") + v("lease_deposit") },
  { label: "Water treatment", lakh: v("capex_etp") },
];
const fundsTotal = funds.reduce((s, f) => s + f.lakh, 0);

export const ask = {
  kicker: "What building takes",
  title: "Fund the plant in stages, against proof.",
  body: "Equipment is only part of the cost. The site, water treatment and cash to buy plastic before customers pay matter too. This is an early cost map, not vendor quotations or a funding request.",
  totalCrore: money(lakhToCrore(fundsTotal)),
  funds: funds.map((f) => ({
    label: f.label,
    crore: money(lakhToCrore(f.lakh)),
    pct: (f.lakh / fundsTotal) * 100,
  })),
  ids: [
    "raise_amount",
    "capex_accuracy_pct",
    "capex_machinery",
    "working_capital",
    "capex_civil",
    "capex_etp",
    "capex_electrical",
    "capex_safety_permits",
    "lease_deposit",
    "capex_handling",
  ],
} as const;
