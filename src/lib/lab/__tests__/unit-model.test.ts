import { describe, expect, it } from "vitest";
import { breakeven, month, workingCapital } from "@/data/os/finance";
import { baseInputs, researchChecks } from "../unit-inputs";
import { applyShock, unitModel } from "../unit-model";

describe("lab unit-economics model", () => {
  const base = baseInputs();
  const r = unitModel(base);
  const checks = researchChecks();

  it("matches the OS finance model at the base case", () => {
    const m = month(1);
    expect(r.outKg).toBeCloseTo(m.outKg, 6);
    expect(r.revenue).toBeCloseTo(m.rev, 0);
    // finance.ts uses R2's rounded ₹/kg-output lines (e.g. inbound ₹3.13 vs 2.5 ÷ 0.8); allow ₹1,000/month.
    expect(Math.abs(r.ebitda - m.ebitda)).toBeLessThan(1000);
    expect(r.breakevenPct!).toBeCloseTo(breakeven().util, 0);
    expect(Math.abs(r.workingCapital - workingCapital(1).total)).toBeLessThan(5000);
  });

  it("reproduces R2's base margin, zero-EPR margin, break-even and payback", () => {
    expect(r.marginKg).toBeCloseTo(checks.ebitdaKg, 1);
    expect(unitModel({ ...base, eprPrice: 0 }).marginKg).toBeCloseTo(checks.ebitdaKgNoEpr, 1);
    expect(Math.abs(r.breakevenPct! - checks.breakevenPct)).toBeLessThan(1.5);
    expect(r.paybackYears!).toBeCloseTo(checks.paybackYears, 1);
  });

  it("reproduces R2's one-factor and combined stress cases within ₹0.25/kg", () => {
    const s = checks.shocks;
    const at = (shock: { feedPct: number; yieldPp: number; pricePct: number }) => unitModel(applyShock(base, shock)).marginKg;
    expect(Math.abs(at({ feedPct: s.feedPct, yieldPp: 0, pricePct: 0 }) - checks.stress.feed)).toBeLessThan(0.25);
    expect(Math.abs(at({ feedPct: 0, yieldPp: -s.yieldPp, pricePct: 0 }) - checks.stress.yield)).toBeLessThan(0.25);
    expect(Math.abs(at({ feedPct: 0, yieldPp: 0, pricePct: -s.pricePct }) - checks.stress.price)).toBeLessThan(0.25);
    expect(Math.abs(at({ feedPct: s.feedPct, yieldPp: -s.yieldPp, pricePct: -s.pricePct }) - checks.stress.combined)).toBeLessThan(0.25);
  });

  it("moves in the right direction and handles losses", () => {
    expect(unitModel({ ...base, pelletPrice: base.pelletPrice + 5 }).marginKg).toBeGreaterThan(r.marginKg);
    expect(unitModel({ ...base, utilisationPct: 40 }).marginKg).toBeLessThan(r.marginKg);
    const loss = unitModel({ ...base, pelletPrice: 50 });
    expect(loss.ebitda).toBeLessThan(0);
    expect(loss.paybackYears).toBeNull();
  });
});
