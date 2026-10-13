import { describe, expect, it } from "vitest";
import { breakeven, capex, cashFlow, HORIZON_MONTHS, pnl, workingCapital } from "../finance";
import { hiringPlan } from "../hiring";

// The OS finance model is rebuilt from line items; these checks tie it back to
// the totals R2 states, so a typo in assumptions.ts shows up here.
describe("OS finance model reproduces R2", () => {
  it("capex lines add up to the stated fixed capex and funding envelope", () => {
    const c = capex();
    expect(c.fixed).toBeCloseTo(c.fixedCheck, 0);
    expect(c.envelope).toBeCloseTo(c.envelopeCheck, 0);
  });

  it("steady-state P&L matches annual revenue, EBITDA and EBITDA/kg", () => {
    const p = pnl();
    const steady = p.years[3];
    expect(Math.abs(steady.revenue - p.checks.annualRevenue) / p.checks.annualRevenue).toBeLessThan(0.01);
    expect(Math.abs(steady.ebitda - p.checks.annualEbitda) / p.checks.annualEbitda).toBeLessThan(0.01);
    expect(steady.ebitdaPerKg).toBeCloseTo(p.checks.ebitdaKg, 0);
  });

  it("break-even utilisation is within a point of R2's 44%", () => {
    const b = breakeven();
    expect(Math.abs(b.util - b.researchCheck)).toBeLessThan(1);
  });

  it("working capital at full output is close to R2's ₹83.4 L", () => {
    const wc = workingCapital(1);
    expect(Math.abs(wc.total - 83.4e5) / 83.4e5).toBeLessThan(0.03);
  });

  it("cash flow covers the horizon and is internally consistent", () => {
    const cf = cashFlow();
    expect(cf.rows).toHaveLength(HORIZON_MONTHS);
    const sumNet = cf.rows.reduce((a, r) => a + r.net, 0);
    expect(sumNet).toBeCloseTo(cf.endCash, 0);
    expect(cf.rows.filter((r) => r.phase === "build")).toHaveLength(cf.buildMonths);
  });
});

describe("hiring plan", () => {
  it("roster matches R2's headcount and monthly labour cost", () => {
    const h = hiringPlan();
    expect(h.headcount).toBe(h.checks.employees);
    expect(h.payroll).toBeCloseTo(h.checks.labourMonth, 0);
  });
});
