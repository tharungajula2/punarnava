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
  { href: "/#why-now", label: "Why now" },
  { href: "/#how", label: "How it works" },
  { href: "/#economics", label: "Economics" },
  { href: "/#roadmap", label: "Roadmap" },
  { href: "/case-study", label: "Case study" },
] as const;

export const hero = {
  eyebrow: "Plastic recycling · Bengaluru",
  title: "Plastic that becomes",
  titleEmphasis: "new again.",
  promise: `A concept study for a Bengaluru plant to turn post-consumer rigid plastic into traceable recycled HDPE pellets — the recycled content brands must now use in rigid (Category I) packaging.`,
  primaryCta: { href: "/os", label: "Explore the OS" },
  secondaryCta: { href: "#economics", label: "See the economics" },
  facts: [
    { value: `${num(v("plant_input_tpd"))} t/day`, label: "planned first plant, rigid HDPE" },
    { value: `${num(v("epr_cat1_recycled_content_fy29"))}%`, label: "recycled content required in rigid (Category I) packaging from FY2028-29" },
    { value: "7 sections", label: "operating system with a 3D factory digital twin" },
  ],
  loopStages: ["Collect", "Sort", "Wash", "Extrude", "Pellet", "Supply"],
};

export const problem = {
  kicker: "The problem",
  title: "Bengaluru throws away a resource it can't afford to lose.",
  body: `Most plastic is collected through a fragmented informal chain of waste pickers, kabadiwalas and aggregators. Good material gets mixed, contaminated and sold as low-grade scrap — while brands struggle to buy recycled resin of consistent, documented quality.`,
  stats: [
    {
      value: `${num(v("bengaluru_plastic_waste_low"))}–${num(v("bengaluru_plastic_waste_high"))}`,
      unit: "t/day",
      label: "plastic waste generated in Bengaluru, per two official estimates (not an audited study)",
    },
    {
      value: num(v("india_plastic_waste_fy23")),
      unit: "million t",
      label: "plastic waste reported across India in FY2022-23",
    },
    {
      value: `~${num(v("karnataka_share_national_waste"), 0)}%`,
      unit: "",
      label: "of India's reported plastic waste comes from Karnataka",
    },
    {
      value: `~${num(v("flexible_share_consumer_packaging"))}%`,
      unit: "",
      label: "of consumer packaging is flexible, which is harder to collect and recycle — we start with rigid plastic",
    },
  ],
  figure: {
    karnatakaPct: v("karnataka_share_national_waste"),
    cityLow: v("bengaluru_plastic_waste_low"),
    cityHigh: v("bengaluru_plastic_waste_high"),
    plantTpd: v("plant_input_tpd"),
    plantNote: `Our first plant needs ${num(v("plant_input_tpd"))} t/day — a small slice, though only part of the city's waste is rigid HDPE.`,
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
  kicker: "Why now",
  title: "Regulation has turned recycled plastic from optional to mandatory.",
  body: `India's Extended Producer Responsibility (EPR) rules make brands responsible for their plastic packaging. Since FY2025-26 they must also use recycled plastic in new packaging — for rigid (Category I) packaging the required share rises from ${num(v("epr_cat1_recycled_content_fy26"))}% to ${num(v("epr_cat1_recycled_content_fy29"))}%. Food-contact packaging has conditional exemptions, so our target is non-food-grade resin.`,
  chartTitle: "Required recycled content in new rigid (Category I) packaging, by financial year",
  chart: [
    { year: "FY26", value: v("epr_cat1_recycled_content_fy26") },
    { year: "FY27", value: v("epr_cat1_recycled_content_fy27") },
    { year: "FY28", value: v("epr_cat1_recycled_content_fy28") },
    { year: "FY29+", value: v("epr_cat1_recycled_content_fy29") },
  ],
  points: [
    {
      title: "Demand is written into law",
      body: `${num(v("registered_pibos"))} producers, importers and brand owners are registered with recycling and recycled-content obligations (Aug 2026). ${num(v("registered_pwps"))} plastic waste processors are registered to supply certificates.`,
    },
    {
      title: "Traceability now decides who wins",
      body: "CPCB links certificates to verified processing, GST-linked sales records and audits, now on the Common EPR Portal (June 2026); the March 2026 amendment adds audit and verification requirements. Documented, traceable supply is the differentiator.",
    },
    {
      title: "Recycling is a must, not a choice",
      body: `In FY2026-27 at least ${num(v("epr_cat1_min_recycling_fy27"))}% of a brand's rigid (Category I) EPR target must be met through recycling — a separate rule from the recycled-content share above.`,
    },
  ],
  // Where each point sits on the timeline: financial-year column + fraction through it.
  // FY runs April–March, so Mar 2026 ends FY26 and Jun/Aug 2026 fall early in FY27.
  pins: [
    { point: 0, col: 1, at: 0.42, when: "Aug 2026" },
    { point: 1, col: 1, at: 0.02, when: "Mar–Jun 2026" },
    { point: 2, col: 1, at: 0.8, when: "FY27" },
  ],
  ids: [
    "epr_cat1_recycled_content_fy26",
    "epr_cat1_recycled_content_fy27",
    "epr_cat1_recycled_content_fy28",
    "epr_cat1_recycled_content_fy29",
    "registered_pibos",
    "registered_pwps",
    "epr_cat1_min_recycling_fy27",
  ],
} as const;

export const how = {
  kicker: "How Punarnava works",
  title: "One loop, from kerbside to pellet.",
  body: "The plan: buy sorted plastic from the people already collecting it, process it in one plant with closed-loop water, and track every batch from supplier to buyer.",
  steps: [
    { title: "Collect", body: "Buy from waste-picker collectives, dry-waste centres, kabadiwalas and bulk generators — digital weighing, same-day pay." },
    { title: "Sort", body: "Weigh, inspect and separate rigid HDPE by colour; reject metal and foreign polymers." },
    { title: "Shred", body: "Granulate bottles and containers into uniform flakes." },
    { title: "Wash", body: `Friction, float-sink and hot wash, with a planned ${num(v("etp_capacity_kld"))} KLD treatment plant recycling the water.` },
    { title: "Dry", body: "Centrifugal dewatering and hot-air drying into buffer silos." },
    { title: "Extrude", body: "Melt, degas and filter for a clean, consistent melt." },
    { title: "Pelletise", body: "Cut, cool, sieve, test and bag pellets to a technical data sheet." },
    { title: "Supply", body: "Sell pellets to converters and EPR certificates to brands — every batch traceable." },
  ],
  massIn: 1000,
  massOut: 1000 * (v("yield") / 100),
  yieldPct: v("yield"),
  ids: ["yield", "etp_capacity_kld"],
} as const;

export const plant = {
  kicker: "Inside the plant",
  title: "One shed. One line. Every batch tracked.",
  body: `An illustration of the planned plant: one ${num(v("line_rate"))} kg/h wash-and-pelletise line taking ${num(v("plant_input_tpd"))} tonnes a day, about ${num(v("yield"))}% of it leaving as pellets, and a ${num(v("etp_capacity_kld"))} KLD treatment plant recycling the wash water.`,
  note: "Illustration only — the plant is not built yet; the site is chosen in Phase 2.",
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
  kicker: "Business model",
  title: "Two products from every tonne we recycle.",
  streams: [
    {
      name: "Recycled HDPE pellets",
      tag: "Core revenue",
      price: `₹${num(v("pellet_price"))}/kg`,
      priceNote: "base-case blended price",
      body: "Sold to packaging converters, compounders and molders by technical spec (melt-flow, density, colour, moisture). Natural and light grades are kept separate because they earn more.",
    },
    {
      name: "EPR certificates",
      tag: "Upside",
      price: `₹${money(v("epr_credit_price"))}/kg`,
      priceNote: `modelled — 2026 intermediary quotes range ₹${num(v("epr_market_low"))}–${num(v("epr_market_high"))}/kg and may bundle services; there is no exchange price`,
      body: "Once registered as a plastic waste processor and audited, eligible packaging plastic we process and document can earn certificates that brands buy to meet their obligations. Certificates cannot exceed our registered capacity.",
    },
  ],
  flow: {
    pellet: v("pellet_price"),
    epr: v("epr_credit_price"),
  },
  ids: figIds("pellet_price", "epr_credit_price", "epr_market_low", "epr_market_high", ...costIds),
  principle: {
    title: "Our rule: the plant must pay its way without EPR.",
    body: `Certificate prices are opaque and volatile, so we model them at the bottom of the range. Even at zero EPR income, base-case EBITDA stays at ₹${money(v("pellet_price") - totalCostPerKg())}/kg.`,
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
  kicker: "Unit economics",
  title: "A small plant that survives any one shock — but not all three.",
  body: `Base case: one ${num(v("line_rate"))} kg/h line processing ${num(v("plant_input_tpd"))} tonnes a day, ${num(v("operating_days_month"))} days a month, at ${num(v("yield"))}% yield — about ${num(v("output_t_month"))} tonnes of pellets a month.`,
  kpis: [
    { value: `₹${num(v("annual_revenue"))} cr`, label: "annual revenue at steady state" },
    { value: `₹${num(v("annual_ebitda"))} cr`, label: "annual EBITDA (operating profit before interest, tax, depreciation)" },
    { value: `${num((v("annual_ebitda") / v("annual_revenue")) * 100, 0)}%`, label: "EBITDA margin" },
    { value: `${num(v("breakeven_utilisation"))}%`, label: "of capacity needed to break even on cash" },
  ],
  perKg: {
    title: "Where each kilogram of pellets goes",
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
    title: "We plan for the downside",
    body: `Hit one at a time, margin stays positive: feedstock +${num(v("stress_feed_pct"))}% leaves ₹${money(v("stress_single_feed_kg"))}/kg, yield −${num(v("stress_yield_pp"))} points ₹${money(v("stress_single_yield_kg"))}/kg, pellet price −${num(v("stress_price_pct"))}% ₹${money(v("stress_single_price_kg"))}/kg. All three at once turn it to −₹${money(Math.abs(v("stress_ebitda_kg")))}/kg. That is why we lock in supply and buyers before buying machines, and plan on roughly a ${num(v("payback_practical"))}-year practical payback (a rule of thumb from the research) rather than the ${num(v("payback_steady_state"))}-year steady-state figure.`,
  },
};

export const roadmap = {
  kicker: "Roadmap",
  title: "Prove the loop, then build it, then scale it.",
  phases: [
    {
      tag: "Phase 1",
      name: "Prove",
      when: `Months 0–${num(v("prove_phase_months_high"))}`,
      body: `Live procurement trial across Bengaluru for ${num(v("procurement_trial_weeks"))} weeks. Bale audits, toll-recycling runs and pellet samples to ${num(v("sample_converters"))} converters.`,
      gate: `Gate: ≥${num(v("gate_feedstock_contracted"))}% of feedstock and ≥${num(v("gate_offtake_contracted"))}% of offtake in written agreements.`,
    },
    {
      tag: "Phase 2",
      name: "Build",
      when: `Up to ${num(v("time_to_production_months"))} months from site lock`,
      body: "Target a leased industrial shed in the Nelamangala–Dabaspete corridor (shortlist against others). Obtain pollution-control consents, install the wash-and-pellet line and effluent plant, register as a plastic waste processor.",
      gate: "Gate: consent to operate and processor registration in hand.",
    },
    {
      tag: "Phase 3",
      name: "Run",
      when: "Years 1–3",
      body: `Ramp utilisation (${num(v("ramp_year1"))}% in year one, ${num(v("ramp_year2"))}% in year two, ${num(v("ramp_year3"))}% in year three in the model), qualify grades with converters, generate EPR certificates once audited, build a batch-level traceability record.`,
      gate: `Gate: ≥${num(v("expansion_yield_gate"))}% yield sustained and repeat customers.`,
    },
    {
      tag: "Phase 4",
      name: "Scale",
      when: "Year 3+",
      body: `Expand to ~${num(v("expansion_input_tpd"))} t/day, then evaluate a second polymer line (PET or PP) where the economics hold.`,
      gate: "Gate: proven supply and offtake for the larger volume.",
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
  kicker: "Why us",
  title: "Designed around discipline, not scrap trading.",
  principles: [
    { title: "Feedstock first", body: "We plan to organise the collectors already doing the work — transparent prices and fast payment — instead of trying to replace them." },
    { title: "Traceability as infrastructure", body: "Supplier KYC, weighbridge data, batch IDs and GST records reconciled daily — the design goal, because that is what makes certificates and resin bankable." },
    { title: "Downside-first finance", body: "Every decision is tested against a bad month, not a good one. Numbers on this page are labelled with their source." },
  ],
  // Fill in real people only. No invented bios, advisors or logos.
  people: [{ name: "Tharun Gajula", role: "Founder", note: "Bengaluru" }],
  hiring: ["Plant manager", "Quality lead", "Procurement & supplier network lead"],
};

const funds = [
  { label: "Processing line", lakh: v("capex_machinery") },
  { label: "Working capital", lakh: v("working_capital") },
  { label: "Civil works & shed", lakh: v("capex_civil") },
  { label: "Effluent treatment", lakh: v("capex_etp") },
  { label: "Power & electricals", lakh: v("capex_electrical") },
  { label: "Safety, permits & contingency", lakh: v("capex_safety_permits") },
  { label: "Lease deposit", lakh: v("lease_deposit") },
  { label: "Handling & weighing", lakh: v("capex_handling") },
];
const fundsTotal = funds.reduce((s, f) => s + f.lakh, 0);

export const ask = {
  kicker: "Capital plan",
  title: `If this were built: a phased capital plan of ₹${num(v("raise_amount"))} crore.`,
  body: `This is a concept study, not a fundraise. The modelled funding need: the line, a compliant site and working capital to buy feedstock ahead of sales (CAPEX accuracy ±${num(v("capex_accuracy_pct"))}% before vendor quotes). It excludes land purchase, financing cost and early operating losses. Round size and structure (equity and debt mix) are not final.`,
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

export const contact = {
  kicker: "About the builder",
  title: "Built by Tharun Gajula.",
  body: "[Short bio — to be added.] Designer and builder exploring circular-economy ideas with AI tools. Open to work enquiries.",
  links: [
    { label: "GitHub", href: "https://github.com/tharungajula2" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/your-profile" },
  ],
};

export const disclaimer =
  "Projections are based on stated assumptions from desk research (2026) and planning models, not audited results. Punarnava is a concept study: not an operating company, with no revenue, customers or partners.";
