import "server-only";
import { assumptions, assumptionStats, getAssumption, type Assumption, type AssumptionId } from "@/data/assumptions";
import { competitorRows, chainLabel, punarnavaPoint } from "@/data/lab/competitors";
import { dataRoom } from "@/data/lab/data-room";
import { decisions } from "@/data/lab/decisions";
import { buyerSegments, caveats, contractStructures, focusNote, headlineIds, mandateIds, mandateSeries, marketSeries } from "@/data/lab/market";
import { bandRows, pricingNotes, spreads, waterfall } from "@/data/lab/pricing";
import { levelLabel, risks, riskScore } from "@/data/os/risks";
import { researchGaps } from "@/data/research-gaps";
import type { Role } from "@/lib/auth/token";
import { scenarioPlanner } from "@/lib/lab/scenarios";
import { baseInputs, fixedSources, researchChecks, sliderMeta } from "@/lib/lab/unit-inputs";

/**
 * Data layer for /lab (same idea as ./index.ts for /os): pages call only these
 * async getters and get plain, serialisable, role-filtered data back.
 */

const isOwner = (role: Role) => role === "owner";

/** One figure with its provenance, for "every figure shows its source". */
export function fig(id: AssumptionId) {
  const a = getAssumption(id);
  return { id, label: a.label, value: a.value, unit: a.unit, source: a.source, status: a.status, confidence: a.confidence, notes: a.notes ?? null, conflict: a.conflict ?? null };
}
export type Fig = ReturnType<typeof fig>;

export async function getLabOverview() {
  return { stats: assumptionStats(), gaps: researchGaps.length, risks: risks.length, decisions: decisions().length, docs: dataRoom.length, docsAvailable: dataRoom.filter((d) => d.status === "Available").length };
}

export async function getMarket() {
  return {
    headline: headlineIds.map(fig),
    bengaluruLow: fig("bengaluru_plastic_waste_low"),
    market2031: fig("india_recycled_plastics_market_2031"),
    cagr: fig("india_recycled_market_cagr"),
    series: marketSeries(),
    mandate: mandateSeries(),
    mandateFigs: mandateIds.map(fig),
    caveats: caveats(),
    buyerSegments,
    contractStructures,
    focusNote,
  };
}

export async function getCompetitors() {
  return { rows: competitorRows(), punarnava: punarnavaPoint(), chainLabel, outputFig: fig("output_t_month") };
}

export async function getPricing() {
  return { bands: bandRows(), spreads: spreads(), waterfall: waterfall(), notes: pricingNotes, ebitda: fig("ebitda_kg_base") };
}

export async function getUnitModel() {
  return { base: baseInputs(), sliders: sliderMeta(), fixed: fixedSources(), checks: researchChecks() };
}

export async function getScenarios() {
  return scenarioPlanner();
}

export async function getRiskRegister() {
  return [...risks]
    .sort((a, b) => riskScore(b) - riskScore(a))
    .map((r) => ({ ...r, score: riskScore(r), likelihoodLabel: levelLabel[r.likelihood], impactLabel: levelLabel[r.impact] }));
}

export async function getDataRoom(role: Role) {
  return dataRoom.map(({ ownerNote, ...d }) => ({ ...d, ownerNote: isOwner(role) ? (ownerNote ?? null) : null }));
}

export async function getDecisions() {
  return decisions();
}

export async function getResearchGaps(role: Role) {
  const list = (assumptions as readonly Assumption[]).filter((a) => isOwner(role) || !a.ownerOnly);
  const pick = (a: Assumption) => ({ id: a.id, label: a.label, value: a.value, unit: a.unit, source: a.source, category: a.category, confidence: a.confidence });
  return {
    gaps: researchGaps,
    placeholders: list.filter((a) => a.status === "placeholder" && a.category !== "simulation").map(pick),
    simPlaceholders: list.filter((a) => a.status === "placeholder" && a.category === "simulation").length,
    lowConfidence: list.filter((a) => a.confidence === "low" && a.status !== "placeholder").map(pick),
    conflicts: list.filter((a) => a.conflict).map((a) => ({ ...pick(a), conflict: a.conflict! })),
    stats: assumptionStats(list),
  };
}
