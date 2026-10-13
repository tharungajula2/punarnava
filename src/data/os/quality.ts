/**
 * Quality. Test parameters from R2/R3 (sell against a technical data sheet).
 * No numeric limits yet: targets are agreed per grade with each buyer, so they
 * show as "to agree" rather than invented values.
 */
import { getAssumption, v, type AssumptionId } from "../assumptions";

export const pelletSpec = [
  { parameter: "Melt-flow index (MFI)", why: "Decides which moulding / extrusion process can use the pellet.", target: "To agree per grade with buyer" },
  { parameter: "Density", why: "Confirms polymer identity; flags PP or filler contamination.", target: "To agree per grade with buyer" },
  { parameter: "Moisture", why: "Wet pellets cause voids and surface defects for the converter.", target: "To agree per grade with buyer" },
  { parameter: "Ash / contamination", why: "Measures dirt, filler and non-melting residue.", target: "To agree per grade with buyer" },
  { parameter: "Colour", why: "Natural / light grades earn more than mixed black.", target: "Natural, light, black — per grade" },
  { parameter: "Odour", why: "Common rejection reason for packaging converters.", target: "To agree per grade with buyer" },
  { parameter: "Filtration consistency", why: "Gels and specks show up in thin-wall parts.", target: "Screen mesh per grade (vendor to advise)" },
];

export const checkpoints = [
  { stage: "Weighbridge", check: "Weight, supplier KYC, lot ID issued" },
  { stage: "Bale yard", check: "Bale audit: composition, contamination, moisture (sampled)" },
  { stage: "Sorting", check: "Reject weight logged per lot" },
  { stage: "Wash line", check: "Float-sink separation; water pH / TSS in ETP log" },
  { stage: "Extruder", check: "Melt temperature, screen-change log" },
  { stage: "QC hold", check: "Lot sampled and tested before release" },
  { stage: "Packing", check: "Bag label: grade, lot, date, weight" },
];

export function lossBudget() {
  const row = (stage: string, id: AssumptionId) => ({ stage, pct: v(id), status: getAssumption(id).status, label: getAssumption(id).label });
  return {
    rows: [row("Sorting rejects", "loss_sort_pct"), row("Washing", "loss_wash_pct"), row("Fines, purge, screen changes", "loss_process_pct")],
    yieldPct: v("yield"),
    expansionGate: v("expansion_yield_gate"),
    stressYieldPp: v("stress_yield_pp"),
    stressYieldEbitda: v("stress_single_yield_kg"),
    baseEbitda: v("ebitda_kg_base"),
    qcHoldHours: v("sim_qc_hold_hours"),
  };
}
