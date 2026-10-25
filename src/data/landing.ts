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
  promise: "We want to turn used hard plastic containers into small, reusable plastic grains that manufacturers can make into new products. This is the opportunity, the proposed plant and the proof needed before building it.",
  primaryCta: { href: "/factory", label: "Tour the proposed factory" },
  secondaryCta: { href: "#roadmap", label: "See the plan" },
  facts: [
    { value: "One material", label: "hard plastic bottles and containers" },
    { value: "One line", label: "a focused first plant" },
    { value: "Clear records", label: "from arrival to shipping" },
  ],
  loopStages: ["Collect", "Sort", "Wash", "Melt", "Pellets", "Supply"],
};

export const problem = {
  kicker: "The problem",
  title: "Usable plastic is lost in mixed waste.",
  body: "Bengaluru already collects plastic. The harder job is turning mixed, dirty containers into clean plastic that a manufacturer can use again and again.",
  stats: [
    {
      value: `${num(v("bengaluru_plastic_waste_low"))}–${num(v("bengaluru_plastic_waste_high"))}`,
      unit: "tonnes/day",
      label: "estimated tonnes of plastic waste a day in Bengaluru (one tonne is 1,000 kg)",
    },
    {
      value: num(v("india_plastic_waste_fy23")),
      unit: "million tonnes",
      label: "plastic waste reported across India in the 2022–23 financial year",
    },
    {
      value: `~${num(v("karnataka_share_national_waste"), 0)}%`,
      unit: "",
      label: "of reported plastic waste comes from Karnataka",
    },
    {
      value: `~${num(v("flexible_share_consumer_packaging"))}%`,
      unit: "",
      label: "of consumer packaging is soft or flexible; we would start with hard containers",
    },
  ],
  figure: {
    karnatakaPct: v("karnataka_share_national_waste"),
    cityLow: v("bengaluru_plastic_waste_low"),
    cityHigh: v("bengaluru_plastic_waste_high"),
    plantTpd: v("plant_input_tpd"),
    plantNote: "The proposed plant would need only a small share of the city's plastic. The real challenge is getting the right kind, reliably.",
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
  body: "India's rules require a growing share of recycled plastic in new hard plastic packaging. That creates demand. Buyers would still choose a supplier on quality, reliability and clear records.",
  chartTitle: "Recycled share required in new hard plastic packaging, by financial year",
  chart: [
    { year: "2025–26", value: v("epr_cat1_recycled_content_fy26") },
    { year: "2026–27", value: v("epr_cat1_recycled_content_fy27") },
    { year: "2027–28", value: v("epr_cat1_recycled_content_fy28") },
    { year: "2028–29+", value: v("epr_cat1_recycled_content_fy29") },
  ],
  points: [
    {
      title: "A clear reason to buy",
      body: "The required recycled share rises over time. Manufacturers will need suitable material to meet it.",
    },
    {
      title: "A reason to choose us",
      body: "Each production lot should come with a quality check and a record showing where its plastic came from.",
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
  body: "Each step changes the material in a simple way. Follow the line, then open the factory to see why we placed each area where it is.",
  steps: [
    { title: "Collect", body: "Buy used hard plastic containers from existing collectors." },
    { title: "Sort", body: "Keep the right plastic and colours together." },
    { title: "Cut", body: "Cut containers into small, even pieces called flakes." },
    { title: "Wash", body: "Clean the pieces and separate unwanted material." },
    { title: "Dry", body: "Remove moisture before melting." },
    { title: "Melt", body: "Melt and filter the clean plastic." },
    { title: "Make pellets", body: "Cut the melted plastic into small grains called pellets." },
    { title: "Supply", body: "Test and bag each production lot, then send it to a buyer." },
  ],
  massIn: 1000,
  massOut: 1000 * (v("yield") / 100),
  yieldPct: v("yield"),
  ids: ["yield", "etp_capacity_kld"],
} as const;

export const plant = {
  kicker: "Inside the plant",
  title: "A place for every step.",
  body: "The plant receives used containers, cleans them and makes pellets: small plastic grains manufacturers can melt into new products. The walkthrough explains every area and why we put it there.",
  note: "Proposed layout for discussion. Site, equipment, safety and permits need professional validation before construction.",
  stats: [
    { value: `${num(v("plant_input_tpd"))} t`, label: "plastic in per day" },
    { value: `${num(v("yield"))}%`, label: "leaves as pellets" },
    { value: `~${num(v("output_t_month"))} t`, label: "pellets a month" },
  ],
  stops: [
    "Weigh arrivals",
    "Store incoming plastic",
    "Sorting",
    "Cut & wash",
    "Dry the flakes",
    "Melt & make pellets",
    "Clean used water",
    "Test, pack & ship",
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
      name: "Recycled plastic pellets",
      tag: "Core revenue",
      price: `₹${num(v("pellet_price"))}/kg`,
      priceNote: "illustrative selling price in the current model",
      body: "Pellets are small grains of plastic that manufacturers melt into new products. We would agree the required quality with each buyer and record every production lot.",
    },
    {
      name: "Recycling certificates",
      tag: "Possible extra income",
      price: `₹${money(v("epr_credit_price"))}/kg`,
      priceNote: "illustrative and uncertain; not needed for the core case",
      body: "A certificate can prove that an amount of plastic was recycled under India's producer responsibility rules (EPR). Brands may buy eligible certificates to meet their obligations. We would count this income only after registration and verification.",
    },
  ],
  flow: {
    pellet: v("pellet_price"),
    epr: v("epr_credit_price"),
  },
  ids: figIds("pellet_price", "epr_credit_price", "epr_market_low", "epr_market_high", ...costIds),
  principle: {
    title: "Pellet sales must pay the bills.",
    body: "Certificate income is uncertain. The plant must make sense from pellet sales alone, with real buyers committed before we buy machines.",
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
  body: "These are example calculations, not sales already made or a promise of profit. They show what the plant must earn, what it must pay and what could go wrong.",
  kpis: [
    { value: `₹${num(v("annual_revenue"))} crore`, label: "example yearly sales if the plant reaches its full planned output" },
    { value: `${num(v("breakeven_utilisation"))}%`, label: "of full output needed to pay day-to-day running costs" },
  ],
  perKg: {
    title: "What happens to each sale",
    revenue: revenuePerKg,
    costs: [
      { label: "Used plastic", value: v("cost_feedstock_kg") },
      { label: "Bringing plastic in", value: v("cost_inbound_kg") },
      { label: "Labour", value: v("cost_labour_kg") },
      { label: "Electricity", value: v("cost_power_kg") },
      { label: "Quality checks & records", value: v("cost_overhead_kg") },
      { label: "Rent", value: v("cost_rent_kg") },
      { label: "Water & other", value: v("cost_other_kg") },
    ],
    margin: revenuePerKg - totalCostPerKg(),
  },
  stressChart: [
    { label: "Starting estimate", value: revenuePerKg - totalCostPerKg() },
    { label: `Plastic costs +${num(v("stress_feed_pct"))}%`, value: v("stress_single_feed_kg") },
    { label: `Usable output −${num(v("stress_yield_pp"))} points`, value: v("stress_single_yield_kg") },
    { label: `Selling price −${num(v("stress_price_pct"))}%`, value: v("stress_single_price_kg") },
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
    body: "If used plastic costs more, less of it becomes saleable product, and buyers pay less—all together—the example plant loses money. That is why we would secure supply and buyers before buying machines.",
  },
};

export const roadmap = {
  kicker: "The path forward",
  title: "Prove it, build it, then grow.",
  phases: [
    {
      tag: "Phase 1",
      name: "Prove",
      when: "Before the plant",
      body: "Test real plastic, make sample pellets with an existing recycler and ask buyers whether they can use them.",
      gate: "Next step only after we record reliable supply and written buyer feedback.",
    },
    {
      tag: "Phase 2",
      name: "Build",
      when: "After proof",
      body: "Choose a site, have engineers turn the layout into buildable drawings, obtain official permissions and install the machines and water treatment.",
      gate: "Next step only after the installed plant passes safe trial runs and receives required approvals.",
    },
    {
      tag: "Phase 3",
      name: "Run",
      when: "First operations",
      body: "Increase output gradually while checking every production lot, cleaned water and buyer response.",
      gate: "Move on when quality and repeat orders hold steady.",
    },
    {
      tag: "Phase 4",
      name: "Expand",
      when: "Only when ready",
      body: "Add capacity only if the first line proves its supply, quality and buyer economics.",
      gate: "Add another line only when its costs, supply and buyers are proven too.",
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

const funds = [
  { label: "Processing equipment", lakh: v("capex_machinery") + v("capex_electrical") + v("capex_handling") },
  { label: "Cash to run the first months", lakh: v("working_capital") },
  { label: "Site, safety & permits", lakh: v("capex_civil") + v("capex_safety_permits") + v("lease_deposit") },
  { label: "Water treatment", lakh: v("capex_etp") },
];
const fundsTotal = funds.reduce((s, f) => s + f.lakh, 0);

export const ask = {
  kicker: "What building would take",
  title: "What would it cost to start?",
  body: "Machines are only part of the cost. We would also need a site, water treatment and cash to buy plastic and pay workers before buyers pay us. These are early estimates, not supplier quotes or a request for funding.",
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
