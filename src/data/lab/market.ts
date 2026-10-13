/**
 * Market overview for /lab/market. Numbers via assumptions.ts; the text is a
 * summary of R1 (research/01-market.md) and R3 (03-competitors-investors.md).
 */
import { v, type AssumptionId } from "../assumptions";

/** Headline figures, in display order. */
export const headlineIds: AssumptionId[] = [
  "india_plastic_waste_fy23",
  "karnataka_plastic_waste_fy23",
  "bengaluru_plastic_waste_high",
  "india_recycled_plastics_market_2026",
  "karnataka_recycled_market_2026",
  "registered_pibos",
  "registered_pwps",
  "flexible_share_consumer_packaging",
];

/** India recycled-plastics market, 2026 → 2031, projected at IMARC's CAGR (R1's own method). */
export function marketSeries() {
  const base = v("india_recycled_plastics_market_2026");
  const g = v("india_recycled_market_cagr") / 100;
  return Array.from({ length: 6 }, (_, k) => ({ year: String(2026 + k), usdBn: Math.round(base * (1 + g) ** k * 100) / 100 }));
}

/** Mandatory recycled content, Category I rigid packaging (the demand driver for rHDPE). */
export function mandateSeries() {
  return [
    { year: "FY26", pct: v("epr_cat1_recycled_content_fy26") },
    { year: "FY27", pct: v("epr_cat1_recycled_content_fy27") },
    { year: "FY28", pct: v("epr_cat1_recycled_content_fy28") },
    { year: "FY29+", pct: v("epr_cat1_recycled_content_fy29") },
  ];
}

export const mandateIds: AssumptionId[] = [
  "epr_cat1_recycled_content_fy26",
  "epr_cat1_recycled_content_fy27",
  "epr_cat1_recycled_content_fy28",
  "epr_cat1_recycled_content_fy29",
  "epr_cat1_min_recycling_fy27",
];

/** What the market numbers do and do not say (R1). */
export const caveats = () => [
  "Waste generated (CPCB), packaging processed (EPR portal) and recycled-resin value (market reports) measure different things and cannot be swapped.",
  "Karnataka's reported waste swings year to year, so it is an order-of-magnitude feedstock indicator, not bankable supply.",
  `Bengaluru's ${v("bengaluru_plastic_waste_low")}–${v("bengaluru_plastic_waste_high")} t/day are official statements, not an audited material-flow study — they do not say how much is clean rigid HDPE.`,
  "No credible state-level recycled-plastics market value exists; the Karnataka figure is a proxy (its share of national waste × the India estimate).",
];

/** Who buys physical recycled resin (R3). */
export const buyerSegments = [
  { segment: "Packaging converters", buys: "rHDPE, rPP, rLDPE, rPET for bottles, caps, containers, film", note: "Main target for natural / light rHDPE." },
  { segment: "Compounders", buys: "PCR to blend with virgin resin and additives", note: "Accept wider spec if price is right." },
  { segment: "Industrial / automotive moulders", buys: "Darker or performance-modified PE/PP", note: "Outlet for black / coloured pellets." },
  { segment: "Traders / exporters", buys: "Smaller loads, geographic arbitrage", note: "Spot price, little stickiness." },
  { segment: "FMCG brands (indirect)", buys: "Qualify the resin and nominate the recycler; the converter buys", note: "Slow qualification, strongest stickiness." },
];

/** Contract structures in use (R3). */
export const contractStructures = [
  { structure: "Spot material", who: "Traders, small converters, compounders", terms: "Per-kg quote per truckload; short payment cycle", risk: "Variable quality, no guaranteed demand" },
  { structure: "Converter supply agreement", who: "Large packaging / moulding converters", terms: "Monthly minimum; qualification; price formula or reset", risk: "Consistent MFI, colour, odour, yield" },
  { structure: "Brand-backed offtake", who: "FMCG brand + nominated converter + recycler", terms: "Annual or multi-year volume; audit and traceability", risk: "Long qualification, highest stickiness" },
  { structure: "EPR compliance contract", who: "PIBO + registered processor, often via a platform", terms: "Category / year-specific certificates; portal transfer", risk: "Certificate validity, duplicate generation" },
];

/** Why rigid HDPE rather than flexibles (R2) — context for the 70% flexible share. */
export const focusNote =
  "Most consumer packaging is flexible film, which is costly to collect and wash. The base case targets rigid HDPE containers: smaller volume, but cleaner, denser and easier to sell to a specification.";
