/**
 * Plant operations: the line as planned (R2), plus the shift pattern. Live-ish
 * figures come from a sample simulation run (src/lib/data/sim-sample.ts).
 */
import type { UnitId } from "@/sim/types";
import { v } from "../assumptions";

export const machines: { id: UnitId; name: string; role: string }[] = [
  { id: "sorting", name: "Sorting line", role: "Bale opening and manual pre-sort; rejects caps, labels, metal, other polymers." },
  { id: "shredder", name: "Shredder", role: "Cuts bottles into flakes." },
  { id: "wash", name: "Float-sink wash line", role: "Friction wash; PP/PE float, heavy dirt sinks." },
  { id: "dryer", name: "Dryer", role: "Centrifugal + thermal drying, cyclone to silo." },
  { id: "extruder", name: "Extruder", role: "Melts, degasses and filters the flakes." },
  { id: "pelletizer", name: "Pelletiser", role: "Cuts strands / die-face into pellets." },
  { id: "qc", name: "QC lab", role: "Samples each lot during the QC hold." },
  { id: "packing", name: "Packing", role: `Bags pellets (${v("bag_kg")} kg).` },
];

export function shiftPlan() {
  return {
    shifts: v("sim_shifts"),
    shiftHours: v("sim_shift_hours"),
    netLineHours: v("sim_net_line_hours"),
    daysWeek: v("sim_operating_days_week"),
    daysMonth: v("operating_days_month"),
    lineRate: v("line_rate"),
    inputTpd: v("plant_input_tpd"),
    kwhPerT: v("electricity_kwh_t"),
    waterM3PerT: v("water_makeup_m3_t"),
    etpKld: v("etp_capacity_kld"),
  };
}
