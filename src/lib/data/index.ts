import "server-only";
import { assumptionStats } from "@/data/assumptions";
import { licenceRows, sequence, timeToProductionMonths } from "@/data/os/compliance";
import { eprScenarios, eprSummary, steps as eprSteps } from "@/data/os/epr";
import { acceptLabel, channels, feedstockSummary, grades, sampleSuppliers } from "@/data/os/feedstock";
import { financeData } from "@/data/os/finance";
import { hiringPlan } from "@/data/os/hiring";
import { inventoryPolicy, stageGroup, stageLabel } from "@/data/os/inventory";
import { fleetPlan, gateSteps } from "@/data/os/logistics";
import { machines, shiftPlan } from "@/data/os/operations";
import { checkpoints, lossBudget, pelletSpec } from "@/data/os/quality";
import { gates, nextActions, phaseProgress, phases, taskStatusLabel, visibleTasks } from "@/data/os/roadmap";
import { levelLabel, risks, riskScore, topRisks } from "@/data/os/risks";
import { contractTypes, priceRefs, salesSummary, sampleProspects, segments } from "@/data/os/sales";
import type { Role } from "@/lib/auth/token";
import { simSample } from "./sim-sample";

/**
 * Data layer for /os. Pages call only these async getters, so the typed files
 * in src/data/os can later be swapped for Supabase queries without touching UI.
 * Everything returned is plain, serialisable data that respects the role
 * (owner-only records never reach an investor).
 */

const isOwner = (role: Role) => role === "owner";

export async function getDashboard(role: Role) {
  const f = financeData();
  const lic = licenceRows();
  return {
    stats: assumptionStats(),
    gates: gates(),
    progress: phaseProgress(isOwner(role)),
    nextActions: nextActions(isOwner(role)),
    risks: topRisks(5).map((r) => ({ ...r, likelihood: levelLabel[r.likelihood], impact: levelLabel[r.impact] })),
    finance: {
      envelope: f.capex.envelope,
      raise: f.capex.raise,
      raiseStatus: f.capex.raiseStatus,
      ebitdaKg: f.pnl.years[3].ebitdaPerKg,
      breakevenUtil: f.breakeven.util,
      minCash: f.cashFlow.minCash,
      minCashMonth: f.cashFlow.minCashMonth,
    },
    licences: { granted: lic.filter((l) => l.status === "Granted").length, total: lic.length },
    plan: shiftPlan(),
  };
}

export async function getFeedstock() {
  return { summary: feedstockSummary(), grades: grades.map((g) => ({ ...g, acceptLabel: acceptLabel[g.accept] })), channels, suppliers: sampleSuppliers() };
}

export async function getLogistics() {
  const s = simSample();
  return { fleet: fleetPlan(), gateSteps, trips: s.trips, days: s.days };
}

export async function getOperations() {
  const s = simSample();
  const byId = new Map(s.units.map((u) => [u.id, u]));
  return {
    plan: shiftPlan(),
    machines: machines.map((m) => ({ ...m, ...byId.get(m.id)!, name: m.name })),
    daily: s.daily.map((d) => ({ label: d.label, inT: d.inKg / 1000, producedT: d.producedKg / 1000 })),
    kpis: { yieldPct: s.kpis.yieldPct, uptimePct: s.kpis.uptimePct, kwhPerT: s.kpis.energyKwhPerT, waterM3PerT: s.kpis.waterM3PerT, tonnesIn: s.kpis.tonnesIn, tonnesProduced: s.kpis.tonnesProduced },
    days: s.days,
  };
}

export async function getQuality() {
  const s = simSample();
  const lossTotal = s.losses.sortRejects + s.losses.washLoss + s.losses.processLoss;
  return { spec: pelletSpec, checkpoints, budget: lossBudget(), lots: s.lots, sampleLosses: { ...s.losses, total: lossTotal, yieldPct: s.kpis.yieldPct }, days: s.days };
}

export async function getInventory() {
  const s = simSample();
  return {
    policy: inventoryPolicy(),
    stock: s.inventory.map((i) => ({ id: i.id, stage: stageLabel[i.id], group: stageGroup[i.id], kg: i.kg })),
    series: s.inventorySeries,
    days: s.days,
  };
}

export async function getSales() {
  const s = simSample();
  return { summary: salesSummary(), segments, contractTypes, prices: priceRefs(), prospects: sampleProspects, dispatches: s.dispatches, days: s.days };
}

export async function getEpr() {
  const s = simSample();
  return { summary: eprSummary(), steps: eprSteps, scenarios: eprScenarios(), sample: { creditsKg: s.eprCreditsKg, days: s.days } };
}

export async function getCompliance() {
  return { licences: licenceRows(), sequence, monthsToProduction: timeToProductionMonths() };
}

export async function getFinance() {
  return financeData();
}

export async function getHiring() {
  return hiringPlan();
}

export async function getRoadmap(role: Role) {
  return {
    phases,
    progress: phaseProgress(isOwner(role)),
    gates: gates(),
    tasks: visibleTasks(isOwner(role)).map((t) => ({ ...t, statusLabel: taskStatusLabel[t.status], phaseLabel: `Phase ${t.phase} · ${phases[t.phase - 1].name}` })),
  };
}

export async function getRisks() {
  return [...risks].sort((a, b) => riskScore(b) - riskScore(a));
}
