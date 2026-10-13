import "server-only";
import { getAssumption, v, type AssumptionId, type Status } from "@/data/assumptions";
import type { UnitInputs } from "./unit-model";

const LAKH = 100_000;

/** Base-case model inputs, every one read from assumptions.ts. */
export function baseInputs(): UnitInputs {
  return {
    feedstockPrice: v("feedstock_price"),
    inboundFreight: v("inbound_freight"),
    pelletPrice: v("pellet_price"),
    eprPrice: v("epr_credit_price"),
    powerTariff: v("tariff_ht2a_kwh"),
    inputTpd: v("plant_input_tpd"),
    operatingDays: v("operating_days_month"),
    yieldPct: v("yield"),
    utilisationPct: 100,
    kwhPerT: v("electricity_kwh_t"),
    waterKg: v("cost_water_kg"),
    consumablesKg: v("cost_consumables_kg"),
    outboundKg: v("cost_outbound_kg"),
    maintenanceKg: v("cost_maintenance_kg"),
    maintFixedSharePct: v("maint_fixed_share_pct"),
    labourMonth: v("labour_month") * LAKH,
    rentMonth: v("rent_month") * LAKH,
    overheadMonth: v("overhead_month") * LAKH,
    demandChargeMonth: v("electricity_month") * LAKH - v("electricity_kwh_month") * v("tariff_ht2a_kwh"),
    capexFixed: v("capex_total") * LAKH,
    deposit: v("lease_deposit") * LAKH,
    receivableDays: v("receivable_days"),
    payableDays: v("payable_days"),
    rawStockDays: v("wc_raw_stock_days"),
    finishedDays: v("wc_finished_days"),
    cashBufferDays: v("wc_cash_buffer_days"),
  };
}

export type SliderMeta = {
  key: keyof UnitInputs;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  /** Assumption behind the base value; null for a model setting (utilisation). */
  source: { id: string; text: string; status: Status } | null;
};

const src = (id: AssumptionId) => {
  const a = getAssumption(id);
  return { id, text: a.source, status: a.status };
};

/** Slider ranges are UI bounds (wide enough for R2's ±20% / ±5pp / ±10% shocks), not forecasts. */
export function sliderMeta(): SliderMeta[] {
  return [
    { key: "feedstockPrice", label: "Feedstock price", unit: "₹/kg input", min: 20, max: 60, step: 0.5, source: src("feedstock_price") },
    { key: "inboundFreight", label: "Inbound freight", unit: "₹/kg input", min: 0, max: 6, step: 0.1, source: src("inbound_freight") },
    { key: "yieldPct", label: "Saleable yield", unit: "% of input", min: 65, max: 90, step: 0.5, source: src("yield") },
    { key: "pelletPrice", label: "Pellet price", unit: "₹/kg", min: 60, max: 110, step: 0.5, source: src("pellet_price") },
    { key: "eprPrice", label: "EPR certificate income", unit: "₹/kg", min: 0, max: 20, step: 0.1, source: src("epr_credit_price") },
    { key: "powerTariff", label: "Power tariff (energy charge)", unit: "₹/kWh", min: 4, max: 10, step: 0.1, source: src("tariff_ht2a_kwh") },
    { key: "utilisationPct", label: "Utilisation", unit: "% of capacity", min: 20, max: 100, step: 1, source: null },
  ];
}

/** Sources for the numbers that stay fixed in the model (shown under the tool). */
export function fixedSources() {
  const ids: AssumptionId[] = [
    "plant_input_tpd",
    "operating_days_month",
    "electricity_kwh_t",
    "labour_month",
    "rent_month",
    "overhead_month",
    "electricity_month",
    "cost_water_kg",
    "cost_consumables_kg",
    "cost_outbound_kg",
    "cost_maintenance_kg",
    "capex_total",
    "lease_deposit",
    "receivable_days",
    "payable_days",
  ];
  return ids.map((id) => {
    const a = getAssumption(id);
    return { id, label: a.label, value: a.value, unit: a.unit, source: a.source, status: a.status };
  });
}

/** R2's published checks the model should reproduce. */
export function researchChecks() {
  return {
    ebitdaKg: v("ebitda_kg_base"),
    ebitdaKgNoEpr: v("ebitda_kg_no_epr"),
    breakevenPct: v("breakeven_utilisation"),
    paybackYears: v("payback_steady_state"),
    stress: {
      feed: v("stress_single_feed_kg"),
      yield: v("stress_single_yield_kg"),
      price: v("stress_single_price_kg"),
      combined: v("stress_ebitda_kg"),
    },
    shocks: { feedPct: v("stress_feed_pct"), yieldPp: v("stress_yield_pp"), pricePct: v("stress_price_pct") },
  };
}
