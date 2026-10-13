/**
 * Sales & buyers. Segments and contract types from R3; price references from
 * assumptions.ts. Pipeline records are SAMPLE prospects — no buyers yet.
 */
import { getAssumption, v, type AssumptionId } from "../assumptions";

export const segments = [
  { name: "Packaging converters", buys: "rHDPE for bottles, containers, industrial packaging", note: "Usually the actual pellet buyer, even when a brand qualifies the resin." },
  { name: "Compounders", buys: "PCR blended with virgin resin and additives", note: "Tolerate more variation; price-driven." },
  { name: "Industrial / durable moulders", buys: "Darker or modified PE/PP", note: "Natural outlet for mixed-colour black pellets." },
  { name: "Traders", buys: "Small loads, geographic arbitrage", note: "Spot only; useful for overflow, not a base." },
  { name: "Brand-backed offtake", buys: "Qualified resin via a nominated converter", note: "Long qualification; stickiest customers." },
];

export const contractTypes = [
  { name: "Spot material", terms: "Per-kg quote per truckload; short payment cycle; frequent price resets", risk: "No guaranteed demand" },
  { name: "Converter supply agreement", terms: "Monthly minimums; resin qualification; price formula; rejection clauses", risk: "Consistency of MFI, colour, odour, yield" },
  { name: "Brand-backed offtake", terms: "Annual or multi-year volume; audit and traceability", risk: "Long qualification time" },
];

export type PriceRef = { id: AssumptionId; label: string; short: string; value: number; status: string; ours?: boolean };

export function priceRefs(): PriceRef[] {
  const refs: [AssumptionId, string][] = [
    ["pellet_price", "Our plan"],
    ["hdpe_pellet_black_low", "Black rHDPE"],
    ["hdpe_pellet_natural", "Natural rHDPE"],
    ["virgin_hdpe_low", "Virgin (low)"],
    ["virgin_hdpe_high", "Virgin (high)"],
  ];
  return refs.map(([id, short]) => ({ id, short, label: getAssumption(id).label, value: v(id), status: getAssumption(id).status, ours: id === "pellet_price" }));
}

export type ProspectRow = {
  id: string;
  name: string;
  segment: string;
  area: string;
  stage: string;
  contract: string;
  sample: true;
};

export const prospectStages = ["Identify", "Sample sent", "Qualifying", "LOI", "Contract"] as const;

/** Sample pipeline: names are placeholders; areas are plausible industrial clusters. */
export const sampleProspects: ProspectRow[] = [
  { id: "p1", name: "Sample converter 1", segment: "Packaging converters", area: "Dabaspete", stage: "Identify", contract: "Converter supply agreement", sample: true },
  { id: "p2", name: "Sample converter 2", segment: "Industrial / durable moulders", area: "Peenya", stage: "Identify", contract: "Spot material", sample: true },
  { id: "p3", name: "Sample compounder 1", segment: "Compounders", area: "Bommasandra", stage: "Identify", contract: "Spot material", sample: true },
  { id: "p4", name: "Sample converter 3", segment: "Packaging converters", area: "Nelamangala", stage: "Identify", contract: "Converter supply agreement", sample: true },
  { id: "p5", name: "Sample brand programme", segment: "Brand-backed offtake", area: "Bengaluru", stage: "Identify", contract: "Brand-backed offtake", sample: true },
];

export function salesSummary() {
  return {
    outputTMonth: v("output_t_month"),
    pelletPrice: v("pellet_price"),
    offtakePct: v("signed_offtake_pct"),
    gatePct: v("gate_offtake_contracted"),
    sampleConverters: v("sample_converters"),
    receivableDays: v("receivable_days"),
    stressPricePct: v("stress_price_pct"),
    stressPriceEbitda: v("stress_single_price_kg"),
    baseEbitda: v("ebitda_kg_base"),
  };
}
