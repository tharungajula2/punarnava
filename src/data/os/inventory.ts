/**
 * Inventory policy (R2 working-capital days) and stage names. Stock levels are
 * SAMPLE data from a simulation run (src/lib/data/sim-sample.ts).
 */
import type { BufferId } from "@/sim/types";
import { v } from "../assumptions";

export const stageLabel: Record<BufferId, string> = {
  baleYard: "Bale yard (raw stock)",
  sorted: "Sorted, awaiting shredder",
  flakes: "Flakes, awaiting wash",
  washed: "Washed, awaiting dryer",
  silo: "Dry flake silo",
  melt: "Extruder / pelletiser",
  qcHold: "QC hold",
  packQueue: "Released, awaiting packing",
  finishedGoods: "Finished pellets (warehouse)",
};

export const stageGroup: Record<BufferId, "Raw" | "Work in progress" | "Finished"> = {
  baleYard: "Raw",
  sorted: "Work in progress",
  flakes: "Work in progress",
  washed: "Work in progress",
  silo: "Work in progress",
  melt: "Work in progress",
  qcHold: "Work in progress",
  packQueue: "Work in progress",
  finishedGoods: "Finished",
};

export function inventoryPolicy() {
  const inputTpd = v("plant_input_tpd");
  const outputTpd = v("output_t_month") / v("operating_days_month");
  return {
    rawDays: v("wc_raw_stock_days"),
    finishedDays: v("wc_finished_days"),
    rawTargetKg: inputTpd * 1000 * v("wc_raw_stock_days"),
    finishedTargetKg: outputTpd * 1000 * v("wc_finished_days"),
    bagKg: v("bag_kg"),
    outboundLoadT: v("sim_outbound_payload"),
  };
}
