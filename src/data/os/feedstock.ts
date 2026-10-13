/**
 * Feedstock & suppliers. Grades and channels from R2/R3. The supplier register
 * holds SAMPLE records only (the simulation's sample collection points) —
 * Punarnava has no suppliers yet.
 */
import { COLLECTION_POINTS } from "@/sim/layout";
import { getAssumption, v, type AssumptionId, type Status } from "../assumptions";

export type Grade = {
  id: string;
  name: string;
  accept: "accept" | "separate" | "exclude";
  examples: string;
  why: string;
  priceId?: AssumptionId;
};

export const grades: Grade[] = [
  { id: "natural", name: "Natural / light rigid HDPE", accept: "separate", examples: "Milk-white and natural bottles, light-coloured jars", why: "Natural / controlled-MFI pellets sell well above mixed black — keep this stream apart (R2).", priceId: "hdpe_scrap_bengaluru" },
  { id: "coloured", name: "Mixed-colour rigid HDPE (base case)", accept: "accept", examples: "Detergent, personal-care and home-care bottles, cans", why: "The base-case feed: pre-sorted or semi-sorted household and FMCG containers (R2).", priceId: "feedstock_price" },
  { id: "caps", name: "PP caps and closures", accept: "separate", examples: "Caps arriving on HDPE bottles", why: "Rejected at sorting; zero revenue assumed, small by-product upside (R2)." },
  { id: "hazardous", name: "Chemical / pesticide drums", accept: "exclude", examples: "Agro-chemical, solvent and oil containers", why: "Excluded unless a separate, legally compliant decontamination protocol exists (R2)." },
  { id: "film", name: "LDPE film and multilayer", accept: "exclude", examples: "Carry bags, pouches, wrappers", why: "Needs much more washing and drying per saleable tonne; not for the first plant (R2)." },
];

export const acceptLabel: Record<Grade["accept"], string> = { accept: "Accept", separate: "Keep separate", exclude: "Exclude" };

export const channels = [
  { name: "Dry Waste Collection Centres & MRFs", note: "City-linked sorting centres; aggregated, semi-sorted material." },
  { name: "Secondary aggregators & scrap dealers", note: "Buy from kabadiwalas; price-sensitive; quality varies." },
  { name: "Waste-picker entrepreneurs (inclusive model)", note: "Organise collectors already doing the work: transparent prices, fast payment." },
  { name: "Bulk generators", note: "Apartments, campuses and institutions; steady but small lots." },
];

export type SupplierRow = {
  id: string;
  name: string;
  area: string;
  type: string;
  stage: string;
  kyc: string;
  agreement: string;
  shareOfSupply: number; // %
  monthlyKg: number;
  sample: true;
};

/** Sample supplier register mirroring the simulation's collection points. */
export function sampleSuppliers(): SupplierRow[] {
  const types = ["Dry Waste Collection Centre", "Secondary aggregator", "Secondary aggregator", "Scrap dealer", "Bulk-generator cluster"];
  const monthlyInputKg = v("plant_input_tpd") * 1000 * v("operating_days_month");
  return COLLECTION_POINTS.map((p, i) => ({
    id: p.id,
    name: `Sample supplier ${String.fromCharCode(65 + i)}`,
    area: p.name.replace(" (sample)", ""),
    type: types[i % types.length],
    stage: "Prospect",
    kyc: "Not started",
    agreement: "None",
    shareOfSupply: (p.share ?? 0) * 100,
    monthlyKg: (p.share ?? 0) * monthlyInputKg,
    sample: true,
  }));
}

export function feedstockSummary() {
  const st = (id: AssumptionId): Status => getAssumption(id).status;
  return {
    monthlyInputKg: v("plant_input_tpd") * 1000 * v("operating_days_month"),
    dailyInputT: v("plant_input_tpd"),
    priceKg: v("feedstock_price"),
    freightKg: v("inbound_freight"),
    landedKg: v("feedstock_price") + v("inbound_freight"),
    priceStatus: st("feedstock_price"),
    listingKg: v("hdpe_scrap_bengaluru"),
    contractedPct: v("signed_feedstock_pct"),
    gatePct: v("gate_feedstock_contracted"),
    trialWeeks: v("procurement_trial_weeks"),
    stressFeedPct: v("stress_feed_pct"),
    stressFeedEbitda: v("stress_single_feed_kg"),
    baseEbitda: v("ebitda_kg_base"),
    cityLowTpd: v("bengaluru_plastic_waste_low"),
    cityHighTpd: v("bengaluru_plastic_waste_high"),
  };
}
