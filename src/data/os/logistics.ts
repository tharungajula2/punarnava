/**
 * Inbound logistics: fleet and gate plan. Trip records are SAMPLE data from a
 * simulation run (src/lib/data/sim-sample.ts) — no trucks are running yet.
 */
import { getAssumption, v } from "../assumptions";

export function fleetPlan() {
  return {
    trucks: v("sim_inbound_trucks"),
    payloadT: v("sim_inbound_payload"),
    speedKmh: v("sim_truck_speed_kmh"),
    loadMin: v("sim_load_minutes"),
    unloadMin: v("sim_unload_minutes"),
    windowStart: v("sim_inbound_start_hour"),
    windowEnd: v("sim_inbound_end_hour"),
    freightKg: v("inbound_freight"),
    freightStatus: getAssumption("inbound_freight").status,
    planStatus: getAssumption("sim_inbound_trucks").status,
  };
}

export const gateSteps = [
  "Truck arrives with supplier challan and lot request",
  "Gross weight on the weighbridge; photo + supplier KYC check",
  "Unload in the bale yard; bale audit sample taken",
  "Tare weight; net weight posted to the lot record",
  "Payable booked against the supplier (payment terms)",
];
