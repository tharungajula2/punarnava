/**
 * Finance module — everything computed from assumptions.ts, nothing typed in.
 *
 * Method follows R2 (research/02-unit-economics.md):
 * - Steady state = 5 t/day input, 26 days/month, 80% yield → output_t_month.
 * - Variable: feedstock, inbound, energy charge, water, consumables, outbound,
 *   half of maintenance. Fixed: labour, rent, overheads, demand charge, the
 *   other half of maintenance (maint_fixed_share_pct).
 * - Working capital in days (raw stock, finished goods, receivables, payables).
 * - Not modelled: tax, interest, GST timing, sustaining capex, price inflation.
 */
import { getAssumption, v, type AssumptionId, type Status } from "../assumptions";

const LAKH = 100_000;
const CRORE = 10_000_000;
const DAYS_PER_MONTH = 365 / 12; // calendar conversion, not a business assumption

/** Display horizon for the cash-flow table (requested view, not a forecast claim). */
export const HORIZON_MONTHS = 36;

export type Line = { key: string; label: string; amount: number; source: AssumptionId[] };

const statusOf = (ids: AssumptionId[]): Status => {
  const s = ids.map((id) => getAssumption(id).status);
  return s.includes("placeholder") ? "placeholder" : s.every((x) => x === "verified") ? "verified" : "researched";
};

// ── Capex ────────────────────────────────────────────────────────────────────
const capexIds = ["capex_machinery", "capex_civil", "capex_etp", "capex_electrical", "capex_handling", "capex_safety_permits"] as const;

export function capex() {
  const items = capexIds.map((id) => ({ id, label: getAssumption(id).label, amount: v(id) * LAKH, status: getAssumption(id).status }));
  const fixed = items.reduce((a, i) => a + i.amount, 0);
  const deposit = v("lease_deposit") * LAKH;
  const workingCapital = v("working_capital") * LAKH;
  return {
    items,
    fixed,
    fixedCheck: v("capex_total") * LAKH, // R2's stated total; should equal `fixed`
    accuracyPct: v("capex_accuracy_pct"),
    deposit,
    workingCapital,
    envelope: fixed + deposit + workingCapital,
    envelopeCheck: v("funding_total") * LAKH,
    raise: v("raise_amount") * CRORE,
    raiseStatus: getAssumption("raise_amount").status,
  };
}

// ── One operating month at a given utilisation (0-1) ─────────────────────────
export function month(util: number) {
  const outKg = v("output_t_month") * 1000 * util;
  const kwh = v("electricity_kwh_month") * util;
  const demandCharge = v("electricity_month") * LAKH - v("electricity_kwh_month") * v("tariff_ht2a_kwh");
  const maintFull = v("output_t_month") * 1000 * v("cost_maintenance_kg");
  const maintFixed = maintFull * (v("maint_fixed_share_pct") / 100);

  const revenue: Line[] = [
    { key: "pellets", label: "Pellet sales", amount: outKg * v("pellet_price"), source: ["pellet_price", "output_t_month"] },
    { key: "epr", label: "EPR certificates", amount: outKg * v("epr_credit_price"), source: ["epr_credit_price"] },
  ];
  const variable: Line[] = [
    { key: "feedstock", label: "Feedstock", amount: outKg * v("cost_feedstock_kg"), source: ["cost_feedstock_kg"] },
    { key: "inbound", label: "Inbound logistics", amount: outKg * v("cost_inbound_kg"), source: ["cost_inbound_kg"] },
    { key: "energy", label: "Electricity — energy charge", amount: kwh * v("tariff_ht2a_kwh"), source: ["electricity_kwh_month", "tariff_ht2a_kwh"] },
    { key: "water", label: "Water + ETP", amount: outKg * v("cost_water_kg"), source: ["cost_water_kg"] },
    { key: "consumables", label: "Consumables & bags", amount: outKg * v("cost_consumables_kg"), source: ["cost_consumables_kg"] },
    { key: "outbound", label: "Outbound logistics", amount: outKg * v("cost_outbound_kg"), source: ["cost_outbound_kg"] },
    { key: "maintVar", label: "Maintenance (variable half)", amount: (maintFull - maintFixed) * util, source: ["cost_maintenance_kg", "maint_fixed_share_pct"] },
  ];
  const fixed: Line[] = [
    { key: "labour", label: "Labour (two shifts)", amount: v("labour_month") * LAKH, source: ["labour_month"] },
    { key: "rent", label: "Shed rent", amount: v("rent_month") * LAKH, source: ["rent_month"] },
    { key: "overhead", label: "Overheads, compliance, QC, security", amount: v("overhead_month") * LAKH, source: ["overhead_month"] },
    { key: "demand", label: "Electricity — demand charge & duty", amount: demandCharge, source: ["electricity_month", "electricity_kwh_month", "tariff_ht2a_kwh"] },
    { key: "maintFixed", label: "Maintenance (fixed half)", amount: maintFixed, source: ["cost_maintenance_kg", "maint_fixed_share_pct"] },
  ];
  const sum = (l: Line[]) => l.reduce((a, x) => a + x.amount, 0);
  const rev = sum(revenue);
  const varCost = sum(variable);
  const fixCost = sum(fixed);
  const feedPurchases = outKg * (v("cost_feedstock_kg") + v("cost_inbound_kg"));
  return { util, outKg, revenue, variable, fixed, rev, varCost, fixCost, opex: varCost + fixCost, ebitda: rev - varCost - fixCost, feedPurchases };
}

/** Working capital tied up at a utilisation (R2 days; cash buffer reported separately). */
export function workingCapital(util: number) {
  const m = month(util);
  const perDay = (x: number) => x / DAYS_PER_MONTH;
  const items = [
    { label: "Customer & EPR receivables", amount: perDay(m.rev) * v("receivable_days"), days: v("receivable_days") },
    { label: "Raw-stock inventory", amount: perDay(m.feedPurchases) * v("wc_raw_stock_days"), days: v("wc_raw_stock_days") },
    { label: "Finished-pellet inventory", amount: perDay(m.opex) * v("wc_finished_days"), days: v("wc_finished_days") },
    { label: "Less: feedstock payables", amount: -perDay(m.variable[0].amount) * v("payable_days"), days: v("payable_days") },
  ];
  const net = items.reduce((a, i) => a + i.amount, 0);
  const buffer = perDay(m.fixCost) * v("wc_cash_buffer_days");
  return { items, net, buffer, total: net + buffer };
}

// ── P&L ──────────────────────────────────────────────────────────────────────
export function pnl() {
  const dep = v("depreciation_month") * LAKH;
  const years = [
    { label: "Year 1", util: v("ramp_year1") / 100 },
    { label: "Year 2", util: v("ramp_year2") / 100 },
    { label: "Year 3", util: v("ramp_year3") / 100 },
    { label: "Steady state", util: 1 },
  ].map((y) => {
    const m = month(y.util);
    return {
      ...y,
      revenue: m.rev * 12,
      variable: m.varCost * 12,
      fixed: m.fixCost * 12,
      ebitda: m.ebitda * 12,
      depreciation: dep * 12,
      ebit: (m.ebitda - dep) * 12,
      marginPct: m.rev > 0 ? (m.ebitda / m.rev) * 100 : 0,
      ebitdaPerKg: m.outKg > 0 ? m.ebitda / m.outKg : 0,
    };
  });
  return { steadyMonth: month(1), depreciationMonth: dep, years, checks: { annualRevenue: v("annual_revenue") * CRORE, annualEbitda: v("annual_ebitda") * CRORE, ebitdaKg: v("ebitda_kg_base") } };
}

// ── Break-even ───────────────────────────────────────────────────────────────
export function breakeven() {
  const full = month(1);
  const contribution = full.rev - full.varCost;
  const util = full.fixCost / contribution;
  const curve = Array.from({ length: 21 }, (_, i) => {
    const m = month(i / 20);
    return { util: i * 5, revenue: m.rev, cost: m.opex, ebitda: m.ebitda };
  });
  return {
    util: util * 100,
    inputTpd: util * v("plant_input_tpd"),
    outputT: util * v("output_t_month"),
    fixedMonth: full.fixCost,
    contributionPerKg: contribution / full.outKg,
    researchCheck: v("breakeven_utilisation"),
    curve,
  };
}

// ── 36-month cash flow ───────────────────────────────────────────────────────
export type CashRow = {
  month: number;
  phase: "build" | "operate";
  util: number;
  revenue: number;
  opex: number;
  ebitda: number;
  capex: number;
  deposit: number;
  wcChange: number;
  equity: number;
  net: number;
  cash: number;
};

/** Monthly payroll for staff hired before production starts (see hiring.ts). */
function preProductionPayroll(monthsBeforeStart: number) {
  const core = (["supervisors", "maintenance", "qa", "admin"] as const).reduce(
    (a, r) => a + v(`hire_${r}_count` as const) * v(`hire_${r}_cost` as const) * 1000,
    0,
  );
  const line = (["sorters", "operators"] as const).reduce((a, r) => a + v(`hire_${r}_count` as const) * v(`hire_${r}_cost` as const) * 1000, 0);
  return (monthsBeforeStart <= v("hire_lead_core_months") ? core : 0) + (monthsBeforeStart <= v("hire_lead_line_months") ? line : 0);
}

export function cashFlow() {
  const build = Math.round(v("time_to_production_months"));
  const c = capex();
  const capexPerMonth = c.fixed / build;
  const rows: CashRow[] = [];
  let cash = 0;
  let wcPrev = 0;
  for (let mo = 1; mo <= HORIZON_MONTHS; mo++) {
    const equity = mo === 1 ? c.raise : 0;
    const deposit = mo === 1 ? c.deposit : 0;
    if (mo <= build) {
      // Lease signed at site lock → rent from month 1; pre-operative expenses sit in capex.
      const opex = v("rent_month") * LAKH + preProductionPayroll(build + 1 - mo);
      const net = equity - deposit - capexPerMonth - opex;
      cash += net;
      rows.push({ month: mo, phase: "build", util: 0, revenue: 0, opex, ebitda: -opex, capex: capexPerMonth, deposit, wcChange: 0, equity, net, cash });
      continue;
    }
    const opMonth = mo - build;
    const util = (opMonth <= 12 ? v("ramp_year1") : opMonth <= 24 ? v("ramp_year2") : v("ramp_year3")) / 100;
    const m = month(util);
    const wc = workingCapital(util).net;
    const wcChange = wc - wcPrev;
    wcPrev = wc;
    const net = equity - deposit + m.ebitda - wcChange;
    cash += net;
    rows.push({ month: mo, phase: "operate", util: util * 100, revenue: m.rev, opex: m.opex, ebitda: m.ebitda, capex: 0, deposit, wcChange, equity, net, cash });
  }
  const minRow = rows.reduce((a, r) => (r.cash < a.cash ? r : a), rows[0]);
  const firstPositiveEbitda = rows.find((r) => r.phase === "operate" && r.ebitda > 0)?.month ?? null;
  // Cumulative cash generated by the project, excluding the equity raised.
  let cum = 0;
  let payback: number | null = null;
  for (const r of rows) {
    cum += r.net - r.equity;
    if (payback === null && r.phase === "operate" && cum >= 0) payback = r.month;
  }
  return {
    rows,
    buildMonths: build,
    minCash: minRow.cash,
    minCashMonth: minRow.month,
    endCash: rows[rows.length - 1].cash,
    firstPositiveEbitda,
    payback,
    raise: c.raise,
    raiseStatus: c.raiseStatus,
    status: statusOf(["raise_amount", "time_to_production_months", "hire_lead_core_months", "ramp_year1"]),
  };
}

export type FinanceData = {
  capex: ReturnType<typeof capex>;
  pnl: ReturnType<typeof pnl>;
  breakeven: ReturnType<typeof breakeven>;
  workingCapital: ReturnType<typeof workingCapital>;
  cashFlow: ReturnType<typeof cashFlow>;
};

export function financeData(): FinanceData {
  return { capex: capex(), pnl: pnl(), breakeven: breakeven(), workingCapital: workingCapital(1), cashFlow: cashFlow() };
}
