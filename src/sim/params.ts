import "server-only";
import { getAssumption, v, type AssumptionId } from "@/data/assumptions";
import type { SimParams } from "./types";

/**
 * Builds engine parameters from assumptions.ts — the only place the sim reads
 * numbers from. Server-only so the full assumptions file (incl. owner-only
 * entries) never ships to the browser; the page passes the plain result down.
 */
export function defaultParams(): SimParams {
  const lakh = 100_000;
  return {
    feedstockPrice: v("feedstock_price"),
    pelletPrice: v("pellet_price"),
    throughputTpd: v("plant_input_tpd"),
    shifts: v("sim_shifts"),
    powerTariff: v("tariff_ht2a_kwh"),
    contaminationPct: v("loss_sort_pct"),

    inboundFreight: v("inbound_freight"),
    eprPrice: v("epr_credit_price"),
    lineRateKgH: v("line_rate"),
    baseShifts: v("sim_shifts"),
    shiftHours: v("sim_shift_hours"),
    netLineHours: v("sim_net_line_hours"),
    firstShiftHour: v("sim_first_shift_hour"),
    operatingDaysWeek: v("sim_operating_days_week"),
    lossWashPct: v("loss_wash_pct"),
    lossProcessPct: v("loss_process_pct"),
    kwhPerTInput: v("electricity_kwh_t"),
    energySharePct: {
      sorting: v("sim_energy_sorting_pct"),
      shredder: v("sim_energy_shredder_pct"),
      wash: v("sim_energy_wash_pct"),
      dryer: v("sim_energy_dryer_pct"),
      extruder: v("sim_energy_extruder_pct"),
      pelletizer: v("sim_energy_pelletizer_pct"),
    },
    waterM3PerTInput: v("water_makeup_m3_t"),
    costWaterKgOut: v("cost_water_kg"),
    costConsumablesKgOut: v("cost_consumables_kg"),
    costMaintenanceKgOut: v("cost_maintenance_kg"),
    costOutboundKgOut: v("cost_outbound_kg"),
    labourMonth: v("labour_month") * lakh,
    rentMonth: v("rent_month") * lakh,
    overheadMonth: v("overhead_month") * lakh,
    electricityMonth: v("electricity_month") * lakh,
    electricityKwhMonth: v("electricity_kwh_month"),
    receivableDays: v("receivable_days"),
    payableDays: v("payable_days"),
    bagKg: v("bag_kg"),
    inboundTrucks: v("sim_inbound_trucks"),
    inboundPayloadKg: v("sim_inbound_payload") * 1000,
    minLoadPct: v("sim_min_load_pct"),
    truckSpeedKmh: v("sim_truck_speed_kmh"),
    loadMinutes: v("sim_load_minutes"),
    unloadMinutes: v("sim_unload_minutes"),
    truckStartHour: v("sim_inbound_start_hour"),
    truckEndHour: v("sim_inbound_end_hour"),
    outboundPayloadKg: v("sim_outbound_payload") * 1000,
    bufferKg: v("sim_buffer_kg"),
    qcHoldHours: v("sim_qc_hold_hours"),
    mtbfHours: v("sim_mtbf_hours"),
    mttrHours: v("sim_mttr_hours"),
    monsoonDipPct: v("sim_monsoon_dip_pct"),
    monsoonDays: v("sim_monsoon_days"),
    priceShockPct: v("stress_price_pct"),
    priceShockDays: v("sim_price_shock_days"),
    startingCash: v("working_capital") * lakh,
  };
}

/** Status of each slider's source assumption, for the badges on /sim. */
export const sliderSources = {
  feedstockPrice: "feedstock_price",
  pelletPrice: "pellet_price",
  throughputTpd: "plant_input_tpd",
  shifts: "sim_shifts",
  powerTariff: "tariff_ht2a_kwh",
  contaminationPct: "loss_sort_pct",
} as const satisfies Record<string, AssumptionId>;

export function sliderStatuses() {
  return Object.fromEntries(
    Object.entries(sliderSources).map(([k, id]) => [k, getAssumption(id).status]),
  ) as Record<keyof typeof sliderSources, "placeholder" | "researched" | "verified">;
}
