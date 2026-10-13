import "server-only";
import { getAssumption, type AssumptionId } from "@/data/assumptions";
import { getKpis, PlantSim, type Scenario } from "@/sim";
import { defaultParams } from "@/sim/params";
import { baseInputs, researchChecks } from "./unit-inputs";
import { applyShock, unitModel, type Shock } from "./unit-model";

/**
 * Best / base / worst for /lab/scenarios. Each case is R2's three shocks
 * (feedstock price, yield, pellet price): worst = all three adverse at once
 * (R2's combined stress test); best = the same three sizes, all favourable —
 * our mirror of R2's stress case, as unlikely as the worst. Each case is
 * shown two ways: the steady-state unit model, and a run of the simulation
 * engine (same seed for all three) so breakdowns, shifts and ramp-up show.
 */

export type ScenarioKey = "best" | "base" | "worst";
export const SCENARIO_KEYS: ScenarioKey[] = ["best", "base", "worst"];
export const SIM_DAYS = 28;
const WARMUP_DAYS = 7; // the line starts empty; skip the first week in window figures
const SEED = 7;

export function scenarioShocks(): Record<ScenarioKey, Shock> {
  const s = researchChecks().shocks;
  return {
    best: { feedPct: -s.feedPct, yieldPp: s.yieldPp, pricePct: s.pricePct },
    base: { feedPct: 0, yieldPp: 0, pricePct: 0 },
    worst: { feedPct: s.feedPct, yieldPp: -s.yieldPp, pricePct: -s.pricePct },
  };
}

/** Patch for the sim's scenario sliders (also used by /sim?scenario=…). */
export function simPatch(key: ScenarioKey): Partial<Scenario> {
  const p = defaultParams();
  const sh = scenarioShocks()[key];
  return {
    feedstockPrice: Math.round(p.feedstockPrice * (1 + sh.feedPct / 100) * 100) / 100,
    pelletPrice: Math.round(p.pelletPrice * (1 + sh.pricePct / 100) * 100) / 100,
    // Yield = 100 − (sort + wash + process loss) in the engine, so a yield move is a sorting-loss move.
    contaminationPct: p.contaminationPct - sh.yieldPp,
  };
}

function runSim(key: ScenarioKey) {
  const params = defaultParams();
  const sim = new PlantSim(params, SEED);
  sim.setScenario(simPatch(key));
  sim.run(SIM_DAYS * 1440);
  const s = sim.state;
  const window = s.days.slice(WARMUP_DAYS);
  const sum = (k: "inKg" | "producedKg" | "soldKg" | "revenue" | "cost") => window.reduce((a, d) => a + d[k], 0);
  const k = getKpis(s, params);
  const produced = sum("producedKg");
  const sold = sum("soldKg");
  let cum = 0;
  return {
    windowDays: window.length,
    inT: sum("inKg") / 1000,
    producedT: produced / 1000,
    yieldPct: k.yieldPct,
    revenue: sum("revenue"),
    cost: sum("cost"),
    ebitda: sum("revenue") - sum("cost"),
    marginKg: sold > 0 && produced > 0 ? sum("revenue") / sold - sum("cost") / produced : null,
    uptimePct: k.uptimePct,
    cashEnd: k.cash,
    cumulative: s.days.map((d) => (cum += d.revenue - d.cost)),
  };
}

const ids: AssumptionId[] = ["stress_feed_pct", "stress_yield_pp", "stress_price_pct", "stress_ebitda_kg", "ebitda_kg_base"];

let cached: ReturnType<typeof build> | null = null;

function build() {
  const base = baseInputs();
  const shocks = scenarioShocks();
  const cases = SCENARIO_KEYS.map((key) => {
    const inputs = applyShock(base, shocks[key]);
    const m = unitModel(inputs);
    return {
      key,
      label: key === "best" ? "Best case" : key === "base" ? "Base case" : "Worst case",
      shock: shocks[key],
      inputs: { feedstockPrice: inputs.feedstockPrice, yieldPct: inputs.yieldPct, pelletPrice: inputs.pelletPrice, eprPrice: inputs.eprPrice },
      model: {
        marginKg: m.marginKg,
        ebitdaMonth: m.ebitda,
        annualEbitda: m.annualEbitda,
        breakevenPct: m.breakevenPct,
        paybackYears: m.paybackYears,
        funding: m.funding,
      },
      sim: runSim(key),
      simHref: `/sim?scenario=${key}`,
    };
  });
  const days = cases[0].sim.cumulative.length;
  const series = Array.from({ length: days }, (_, d) => ({
    day: `D${d + 1}`,
    best: cases[0].sim.cumulative[d],
    base: cases[1].sim.cumulative[d],
    worst: cases[2].sim.cumulative[d],
  }));
  const sources = ids.map((id) => {
    const a = getAssumption(id);
    return { id, label: a.label, value: a.value, unit: a.unit, source: a.source, status: a.status };
  });
  return { cases, series, sources, simDays: SIM_DAYS, warmupDays: WARMUP_DAYS, seed: SEED, research: researchChecks().stress };
}

/** Cached: three 28-day engine runs take about a second. */
export function scenarioPlanner() {
  return (cached ??= build());
}
