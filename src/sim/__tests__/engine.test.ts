import { describe, expect, it } from "vitest";
import { v } from "@/data/assumptions";
import { BUFFER_ORDER, MIN_PER_DAY, PlantSim, bufferKg, getKpis, totalCosts } from "../engine";
import { defaultParams } from "../params";
import type { Scenario, SimParams, SimState } from "../types";

const DAYS = (n: number) => n * MIN_PER_DAY;

function sim(opts: { seed?: number; noBreakdowns?: boolean; scenario?: Partial<Scenario>; params?: Partial<SimParams> } = {}) {
  const params = { ...defaultParams(), ...opts.params, ...(opts.noBreakdowns ? { mtbfHours: Infinity } : {}) };
  const s = new PlantSim(params, opts.seed ?? 42);
  if (opts.scenario) s.setScenario(opts.scenario);
  return s;
}

function massGap(s: SimState) {
  const inventory = BUFFER_ORDER.reduce((a, b) => a + bufferKg(s, b), 0);
  const losses = s.mass.losses.sortRejects + s.mass.losses.washLoss + s.mass.losses.processLoss;
  return s.mass.weighedIn - (s.mass.dispatched + losses + inventory);
}

function moneyGaps(s: SimState, p: SimParams) {
  const m = s.money;
  const receivables = m.receivables.reduce((a, d) => a + d.amount, 0);
  const payables = m.payables.reduce((a, d) => a + d.amount, 0);
  const revenue = m.pelletRevenue + m.eprRevenue;
  return {
    cashLedger: m.cash - (p.startingCash + m.received - m.paid),
    profitVsCash: revenue - totalCosts(s) - (m.cash - p.startingCash + receivables - payables),
  };
}

describe("parameters", () => {
  it("are all read from assumptions.ts", () => {
    const p = defaultParams();
    expect(p.feedstockPrice).toBe(v("feedstock_price"));
    expect(p.pelletPrice).toBe(v("pellet_price"));
    expect(p.lineRateKgH).toBe(v("line_rate"));
    const shares = Object.values(p.energySharePct).reduce((a, b) => a + b, 0);
    expect(shares).toBe(100);
  });
});

describe("mass balance", () => {
  it("tonnes in = out + losses + inventory, every simulated day, through events", () => {
    const s = sim();
    for (let d = 0; d < 40; d++) {
      if (d === 5) s.trigger({ kind: "breakdown", unit: "extruder" });
      if (d === 10) s.trigger({ kind: "monsoon" });
      if (d === 20) s.setScenario({ contaminationPct: 20, shifts: 3, throughputTpd: 7 });
      s.run(MIN_PER_DAY);
      expect(Math.abs(massGap(s.state))).toBeLessThan(1e-6 * Math.max(1, s.state.mass.weighedIn));
    }
    expect(s.state.mass.weighedIn).toBeGreaterThan(100_000);
    expect(s.state.mass.dispatched).toBeGreaterThan(50_000);
  });
});

describe("money balance", () => {
  it("cash ledger and profit = Δcash + receivables − payables hold throughout", () => {
    const s = sim();
    for (let d = 0; d < 45; d++) {
      if (d === 8) s.trigger({ kind: "priceShock" });
      s.run(MIN_PER_DAY);
      const g = moneyGaps(s.state, s.params);
      expect(Math.abs(g.cashLedger)).toBeLessThan(1e-3);
      expect(Math.abs(g.profitVsCash)).toBeLessThan(1e-3);
    }
    expect(s.state.money.received).toBeGreaterThan(0); // receivables were actually collected
  });
});

describe("determinism", () => {
  it("same seed + same inputs → identical state", () => {
    const a = sim({ seed: 7 });
    const b = sim({ seed: 7 });
    for (const x of [a, b]) {
      x.run(DAYS(6));
      x.trigger({ kind: "breakdown" });
      x.setScenario({ pelletPrice: 90 });
      x.run(DAYS(10));
    }
    expect(JSON.stringify(a.state)).toBe(JSON.stringify(b.state));
  });

  it("a different seed gives a different run", () => {
    const a = sim({ seed: 1 });
    const b = sim({ seed: 2 });
    a.run(DAYS(10));
    b.run(DAYS(10));
    expect(a.state.mass.weighedIn).not.toBe(b.state.mass.weighedIn);
  });
});

describe("calibration against the researched base case", () => {
  it("reproduces R2's yield, energy and EBITDA per kg once warmed up", () => {
    const s = sim({ noBreakdowns: true });
    s.run(DAYS(63));
    const k = getKpis(s.state, s.params);
    expect(k.yieldPct!).toBeCloseTo(v("yield"), 0);
    expect(Math.abs(k.energyKwhPerT! - v("electricity_kwh_t"))).toBeLessThan(5);
    expect(Math.abs(k.marginPerKg! - v("ebitda_kg_base"))).toBeLessThan(1.5);
  });
});

describe("scenarios move KPIs the right way", () => {
  const run = (o: Parameters<typeof sim>[0], days = 49) => {
    const s = sim({ noBreakdowns: true, ...o });
    s.run(DAYS(days));
    return getKpis(s.state, s.params);
  };
  const base = run({});

  it("dearer feedstock → lower margin and less cash", () => {
    const k = run({ scenario: { feedstockPrice: 46 } });
    expect(k.marginPerKg!).toBeLessThan(base.marginPerKg!);
    expect(k.cash).toBeLessThan(base.cash);
  });

  it("higher pellet price → more revenue and margin", () => {
    const k = run({ scenario: { pelletPrice: 95 } });
    expect(k.revenue).toBeGreaterThan(base.revenue);
    expect(k.marginPerKg!).toBeGreaterThan(base.marginPerKg!);
  });

  it("dearer power → higher cost per kg", () => {
    expect(run({ scenario: { powerTariff: 9 } }).costPerKg!).toBeGreaterThan(base.costPerKg!);
  });

  it("dirtier feedstock → lower yield and output", () => {
    const k = run({ scenario: { contaminationPct: 20 } });
    expect(k.yieldPct!).toBeLessThan(base.yieldPct! - 5);
    expect(k.tonnesProduced).toBeLessThan(base.tonnesProduced);
  });

  it("more feedstock than two shifts can handle → bale yard piles up; a third shift clears it", () => {
    const twoShifts = run({ scenario: { throughputTpd: 7 } });
    const threeShifts = run({ scenario: { throughputTpd: 7, shifts: 3 } });
    expect(twoShifts.inventoryKg.baleYard).toBeGreaterThan(base.inventoryKg.baleYard + 10_000);
    expect(threeShifts.inventoryKg.baleYard).toBeLessThan(twoShifts.inventoryKg.baleYard);
    expect(threeShifts.tonnesProduced).toBeGreaterThan(twoShifts.tonnesProduced);
  });

  it("monsoon dip → less feedstock in", () => {
    const s = sim({ noBreakdowns: true });
    s.trigger({ kind: "monsoon" });
    s.run(DAYS(49));
    expect(getKpis(s.state, s.params).tonnesIn).toBeLessThan(base.tonnesIn * 0.9);
  });

  it("price shock → less revenue", () => {
    const s = sim({ noBreakdowns: true });
    s.trigger({ kind: "priceShock" });
    s.run(DAYS(49));
    expect(getKpis(s.state, s.params).revenue).toBeLessThan(base.revenue);
  });

  it("breakdown → machine down, lower uptime, less output that day, more stock waiting", () => {
    const control = sim({ noBreakdowns: true });
    const s = sim({ noBreakdowns: true });
    for (const x of [control, s]) x.run(DAYS(2) + 7 * 60); // Wednesday 07:00, mid productive window
    s.trigger({ kind: "breakdown", unit: "extruder" });
    s.step();
    control.step();
    expect(s.state.units.extruder.status).toBe("down");
    for (const x of [control, s]) x.run(DAYS(1) - 7 * 60 - 1); // to Wednesday midnight
    const k = getKpis(s.state, s.params);
    const c = getKpis(control.state, control.params);
    expect(k.uptimePct!).toBeLessThan(100);
    expect(k.tonnesProduced).toBeLessThan(c.tonnesProduced);
    expect(k.plantInventoryT).toBeGreaterThan(c.plantInventoryT);
  });
});
