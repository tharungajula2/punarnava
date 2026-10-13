/**
 * Landing page content. Copy lives here; every number is read from assumptions.ts.
 * Edit wording here — components only handle layout.
 */
import { money, num, v } from "@/data/assumptions";

const lakhToCrore = (lakh: number) => lakh / 100;

export const nav = [
  { href: "#problem", label: "Problem" },
  { href: "#why-now", label: "Why now" },
  { href: "#how", label: "How it works" },
  { href: "#economics", label: "Economics" },
  { href: "#roadmap", label: "Roadmap" },
] as const;

export const hero = {
  eyebrow: "Plastic recycling · Bengaluru",
  title: "Plastic that becomes",
  titleEmphasis: "new again.",
  promise: `Punarnava turns Bengaluru's post-consumer rigid plastic into traceable recycled pellets — the material India's brands are now required to use.`,
  primaryCta: { href: "#contact", label: "Talk to the founder" },
  secondaryCta: { href: "#economics", label: "See the economics" },
  facts: [
    { value: `${num(v("plant_input_tpd"))} t/day`, label: "first plant, rigid HDPE" },
    { value: `${num(v("epr_cat1_recycled_content_fy29"))}%`, label: "recycled content mandated by FY29" },
    { value: `₹${num(v("raise_amount"))} cr`, label: "seed raise (target)" },
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
      label: "plastic waste generated in Bengaluru, by official estimates",
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
      label: "of consumer packaging is flexible — hard to recycle, so rigid plastic is where clean value lies",
    },
  ],
};

export const whyNow = {
  kicker: "Why now",
  title: "Regulation has turned recycled plastic from optional to mandatory.",
  body: `India's Extended Producer Responsibility (EPR) rules make brands responsible for their plastic packaging. Since FY2025-26 they must also put recycled plastic back into new rigid packaging — and the share rises every year.`,
  chartTitle: "Mandatory recycled content in rigid (Category I) packaging",
  chart: [
    { year: "FY26", value: v("epr_cat1_recycled_content_fy26") },
    { year: "FY27", value: v("epr_cat1_recycled_content_fy27") },
    { year: "FY28", value: v("epr_cat1_recycled_content_fy28") },
    { year: "FY29+", value: v("epr_cat1_recycled_content_fy29") },
  ],
  points: [
    {
      title: "Demand is written into law",
      body: `${num(v("registered_pibos"))} producers, importers and brand owners are registered with obligations — served by only ${num(v("registered_pwps"))} registered processors.`,
    },
    {
      title: "Traceability now decides who wins",
      body: "The March 2026 rule amendment and the new Common EPR Portal (June 2026) tie certificates to verified processing, GST records and audits. Clean, documented supply is scarce.",
    },
    {
      title: "Recycling is a must, not a choice",
      body: `In FY2026-27 at least ${num(v("epr_cat1_min_recycling_fy27"))}% of a brand's rigid-plastic obligation must be met by actual recycling.`,
    },
  ],
};

export const how = {
  kicker: "How Punarnava works",
  title: "One loop, from kerbside to pellet.",
  body: "We buy sorted plastic from the people already collecting it, process it in one plant with closed-loop water, and track every batch from supplier to buyer.",
  steps: [
    { icon: "truck", title: "Collect", body: "Buy from waste-picker collectives, dry-waste centres, kabadiwalas and bulk generators — digital weighing, same-day pay." },
    { icon: "scan", title: "Sort", body: "Weigh, inspect and separate rigid HDPE by colour; reject metal and foreign polymers." },
    { icon: "scissors", title: "Shred", body: "Granulate bottles and containers into uniform flakes." },
    { icon: "droplets", title: "Wash", body: `Friction, float-sink and hot wash, with a ${num(v("etp_capacity_kld"))} KLD treatment plant recycling the water.` },
    { icon: "wind", title: "Dry", body: "Centrifugal dewatering and hot-air drying into buffer silos." },
    { icon: "flame", title: "Extrude", body: "Melt, degas and filter for a clean, consistent melt." },
    { icon: "circle-dot", title: "Pelletise", body: "Cut, cool, sieve, test and bag pellets to a technical data sheet." },
    { icon: "badge-check", title: "Supply", body: "Sell pellets to converters and EPR certificates to brands — every batch traceable." },
  ],
} as const;

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
      priceNote: `modelled — the 2026 market quotes ₹${num(v("epr_market_low"))}–${num(v("epr_market_high"))}/kg`,
      body: "As a registered processor, every verified kilogram we recycle earns a certificate that brands buy to meet their obligations.",
    },
  ],
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
  title: "A small plant, built to survive bad months.",
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
  stress: {
    title: "We plan for the downside",
    body: `If feedstock rises ${num(v("stress_feed_pct"))}%, yield drops ${num(v("stress_yield_pp"))} points and pellet prices fall ${num(v("stress_price_pct"))}% all at once, margin turns to −₹${money(Math.abs(v("stress_ebitda_kg")))}/kg. That is why we lock in supply and buyers before buying machines, and underwrite to a ${num(v("payback_practical"))}-year practical payback rather than the ${num(v("payback_steady_state"))}-year steady-state figure.`,
  },
};

export const roadmap = {
  kicker: "Roadmap",
  title: "Prove the loop, then build it, then scale it.",
  phases: [
    {
      tag: "Phase 1",
      name: "Prove",
      when: "Months 0–6",
      body: `Live procurement trial across Bengaluru for ${num(v("procurement_trial_weeks"))} weeks. Bale audits, toll-recycling runs and pellet samples to ${num(v("sample_converters"))} converters.`,
      gate: `Gate: ≥${num(v("gate_feedstock_contracted"))}% of feedstock and ≥${num(v("gate_offtake_contracted"))}% of offtake in written agreements.`,
    },
    {
      tag: "Phase 2",
      name: "Build",
      when: `Up to ${num(v("time_to_production_months"))} months from site lock`,
      body: "Lease an industrial shed in the Nelamangala–Dabaspete corridor. Pollution-control consents, install the wash-and-pellet line and effluent plant, register as a plastic waste processor.",
      gate: "Gate: consent to operate and processor registration in hand.",
    },
    {
      tag: "Phase 3",
      name: "Run",
      when: "Year 1–2",
      body: "Ramp to steady utilisation, qualify grades with converters, start issuing EPR certificates, build a batch-level traceability record.",
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
};

export const team = {
  kicker: "Why us",
  title: "Built like an operator, not a scrap trader.",
  principles: [
    { title: "Feedstock first", body: "We organise the collectors already doing the work — fair, transparent prices and fast payment — instead of trying to replace them." },
    { title: "Traceability as infrastructure", body: "Supplier KYC, weighbridge data, batch IDs and GST records reconciled daily. That is what makes our certificates and resin bankable." },
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
  kicker: "The ask",
  title: `Raising ₹${num(v("raise_amount"))} crore to build the first plant.`,
  body: "The amount covers the full modelled funding envelope: the line, a compliant site and enough working capital to buy feedstock ahead of sales. Round structure (equity and debt mix) is being finalised.",
  totalCrore: money(lakhToCrore(fundsTotal)),
  funds: funds.map((f) => ({
    label: f.label,
    crore: money(lakhToCrore(f.lakh)),
    pct: (f.lakh / fundsTotal) * 100,
  })),
};

export const contact = {
  kicker: "Contact",
  title: "Let's talk.",
  body: "Investors, collectors, converters and brands — write to us. The form opens your email app; nothing is stored on this site.",
};

export const disclaimer =
  "Figures come from desk research (2026) and planning models, not audited results. Punarnava is pre-revenue and has no customers or partners yet.";
