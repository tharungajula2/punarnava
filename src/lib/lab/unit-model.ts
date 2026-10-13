/**
 * Interactive unit-economics model for /lab. Pure maths, no imports from
 * assumptions.ts, so the client can run it without the full assumptions file
 * (which holds owner-only entries). The server builds `UnitInputs` from
 * assumptions.ts (see ./unit-inputs.ts) and passes plain numbers down.
 *
 * Same method as src/data/os/finance.ts (R2): at the base inputs it must give
 * the same EBITDA, break-even and working capital — tested in __tests__.
 */

export type UnitInputs = {
  // Prices
  feedstockPrice: number; // ₹/kg input
  inboundFreight: number; // ₹/kg input
  pelletPrice: number; // ₹/kg output
  eprPrice: number; // ₹/kg output
  powerTariff: number; // ₹/kWh energy charge
  // Plant
  inputTpd: number; // t/day at 100% utilisation
  operatingDays: number; // days/month
  yieldPct: number; // % of input sold as pellets
  utilisationPct: number; // % of capacity
  kwhPerT: number; // kWh per tonne input
  // Per-kg running costs (₹/kg output)
  waterKg: number;
  consumablesKg: number;
  outboundKg: number;
  maintenanceKg: number; // at full capacity
  maintFixedSharePct: number;
  // Fixed monthly costs (₹)
  labourMonth: number;
  rentMonth: number;
  overheadMonth: number;
  demandChargeMonth: number; // electricity bill minus energy charge at base
  // Funding (₹)
  capexFixed: number;
  deposit: number;
  // Working capital (days)
  receivableDays: number;
  payableDays: number;
  rawStockDays: number;
  finishedDays: number;
  cashBufferDays: number;
};

const DAYS_PER_MONTH = 365 / 12; // calendar conversion, same as finance.ts

/** One operating month at a utilisation (0–1). */
function flows(i: UnitInputs, util: number) {
  const inputKg = i.inputTpd * 1000 * i.operatingDays * util;
  const outKg = inputKg * (i.yieldPct / 100);
  const capacityOutKg = i.inputTpd * 1000 * i.operatingDays * (i.yieldPct / 100);
  const revenue = outKg * (i.pelletPrice + i.eprPrice);
  const feedstock = inputKg * i.feedstockPrice;
  const inbound = inputKg * i.inboundFreight;
  const energy = (inputKg / 1000) * i.kwhPerT * i.powerTariff;
  const maintFull = capacityOutKg * i.maintenanceKg;
  const maintFixed = maintFull * (i.maintFixedSharePct / 100);
  const variableOther = outKg * (i.waterKg + i.consumablesKg + i.outboundKg) + (maintFull - maintFixed) * util;
  const variable = feedstock + inbound + energy + variableOther;
  const fixed = i.labourMonth + i.rentMonth + i.overheadMonth + i.demandChargeMonth + maintFixed;
  return { inputKg, outKg, revenue, feedstock, inbound, energy, variableOther, variable, fixed };
}

export function unitModel(i: UnitInputs) {
  const { inputKg, outKg, revenue, feedstock, inbound, energy, variableOther, variable, fixed } = flows(i, i.utilisationPct / 100);
  const ebitda = revenue - variable - fixed;

  // Break-even: fixed cost ÷ contribution at full capacity (the same as finance.ts).
  const full = flows(i, 1);
  const contributionFull = full.revenue - full.variable;
  const breakevenPct = contributionFull > 0 ? (fixed / contributionFull) * 100 : null;

  // Working capital at this utilisation.
  const perDay = (x: number) => x / DAYS_PER_MONTH;
  const wcNet =
    perDay(revenue) * i.receivableDays +
    perDay(feedstock + inbound) * i.rawStockDays +
    perDay(variable + fixed) * i.finishedDays -
    perDay(feedstock) * i.payableDays;
  const workingCapital = wcNet + perDay(fixed) * i.cashBufferDays;
  const funding = i.capexFixed + i.deposit + workingCapital;
  const annualEbitda = ebitda * 12;

  const perKg = (x: number) => (outKg > 0 ? x / outKg : 0);
  return {
    inputKg,
    outKg,
    revenue,
    variable,
    fixed,
    ebitda,
    annualEbitda,
    marginPct: revenue > 0 ? (ebitda / revenue) * 100 : 0,
    /** EBITDA per kg of saleable pellets. */
    marginKg: perKg(ebitda),
    pricePerKg: perKg(revenue),
    costPerKg: perKg(variable + fixed),
    costLines: [
      { key: "feedstock", label: "Feedstock", perKg: perKg(feedstock) },
      { key: "inbound", label: "Inbound freight", perKg: perKg(inbound) },
      { key: "energy", label: "Electricity (energy)", perKg: perKg(energy) },
      { key: "otherVar", label: "Water, consumables, outbound, maintenance", perKg: perKg(variableOther) },
      { key: "fixed", label: "Labour, rent, overheads, demand charge", perKg: perKg(fixed) },
    ],
    contributionKg: perKg(revenue - variable),
    breakevenPct,
    workingCapital,
    funding,
    /** All-in simple payback at this steady state (no ramp-up, tax or interest). */
    paybackYears: annualEbitda > 0 ? funding / annualEbitda : null,
  };
}

export type UnitResult = ReturnType<typeof unitModel>;

/** R2's three shocks, applied to any input set. Signs: +1 favourable, −1 adverse. */
export type Shock = { feedPct: number; yieldPp: number; pricePct: number };

export function applyShock(i: UnitInputs, s: Shock): UnitInputs {
  return {
    ...i,
    feedstockPrice: i.feedstockPrice * (1 + s.feedPct / 100),
    yieldPct: i.yieldPct + s.yieldPp,
    pelletPrice: i.pelletPrice * (1 + s.pricePct / 100),
  };
}
