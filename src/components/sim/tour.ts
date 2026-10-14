import { bufferKg, getKpis, type PlantSim, type UnitId } from "@/sim";
import { fmt, reasonLabel, statusLabel } from "./format";
import type { Shot } from "./three/camera-store";
import { SPOTS } from "./three/site";

/**
 * Guided tour: one camera shot + one live caption per stage of the plant.
 * Captions read the running engine, so every number is the simulation's own.
 */
export interface TourStop {
  id: string;
  title: string;
  /** Machine or zone to ring while the camera is here. */
  spot?: string;
  shot: Shot;
  say: (sim: PlantSim) => string;
}

const at = (id: string, zoom: number, az = 0, dx = 0, dz = 0): Shot => ({ x: SPOTS[id].x + dx, z: SPOTS[id].z + dz, zoom, az, el: 0.56, dur: 2.6 });

function running(sim: PlantSim, id: UnitId, verb: string) {
  const u = sim.state.units[id];
  if (u.status === "running") return `${verb} at ${fmt.n(u.rateKgH)} kg/h right now.`;
  return `${statusLabel[u.status]} right now${u.reason ? ` — ${reasonLabel[u.reason]}` : ""}.`;
}

export const TOUR: TourStop[] = [
  {
    id: "gate",
    title: "Gate and weighbridge",
    spot: "weighbridge",
    shot: at("weighbridge", 2.4, -0.3, 0, 4),
    say: (sim) => {
      const q = sim.state.trucks.filter((t) => t.phase === "queued").length;
      return `Collection trucks arrive from the city and are weighed in: ${fmt.t(sim.state.mass.weighedIn)} received so far${q ? `, ${q} waiting` : ""}.`;
    },
  },
  {
    id: "yard",
    title: "Bale yard",
    spot: "baleYard",
    shot: at("baleYard", 2.6, 0.12, 4, -2),
    say: (sim) => `Trucks unload bales beside the yard; ${fmt.t(bufferKg(sim.state, "baleYard"))} is waiting for the line.`,
  },
  {
    id: "sorting",
    title: "Sorting line",
    spot: "sorting",
    shot: at("sorting", 3, -0.2),
    say: (sim) => `Pickers pull out labels, dirt and the wrong plastics — ${fmt.n(sim.state.scenario.contaminationPct)}% of input is rejected here.`,
  },
  {
    id: "shredder",
    title: "Shredder",
    spot: "shredder",
    shot: at("shredder", 4.2, -0.35),
    say: (sim) => `Rigid plastic is cut into flakes. ${running(sim, "shredder", "Shredding")}`,
  },
  {
    id: "wash",
    title: "Wash line",
    spot: "wash",
    shot: at("wash", 3.1, -0.15),
    say: (sim) => `Flakes are scrubbed and separated in float–sink tanks. ${running(sim, "wash", "Washing")}`,
  },
  {
    id: "dryer",
    title: "Dryer and silo",
    spot: "dryer",
    shot: at("dryer", 3.1, 0.1, -3, -2),
    say: (sim) => `Washed flakes are dried and stored; ${fmt.t(bufferKg(sim.state, "silo"))} of dry flake is in the silo.`,
  },
  {
    id: "extruder",
    title: "Extruder",
    spot: "extruder",
    shot: at("extruder", 3.3, 0.3),
    say: (sim) =>
      `Flakes are melted, filtered and pushed out as strands — ${fmt.n(sim.params.energySharePct.extruder)}% of the line's electricity. ${running(sim, "extruder", "Running")}`,
  },
  {
    id: "pelletizer",
    title: "Pelletizer",
    spot: "pelletizer",
    shot: at("pelletizer", 3.5, 0.45, 0, 2),
    say: (sim) => `Strands are cooled and cut into pellets — the product we sell. ${fmt.t(sim.state.mass.packed)} packed so far.`,
  },
  {
    id: "qc",
    title: "Quality lab",
    spot: "qc",
    shot: at("qc", 3, 0.3),
    say: (sim) => `Every lot is held ${fmt.n(sim.params.qcHoldHours)} h and tested before release; ${fmt.t(bufferKg(sim.state, "qcHold"))} is on hold now.`,
  },
  {
    id: "store",
    title: "Packing and finished goods",
    spot: "finishedGoods",
    shot: at("finishedGoods", 2.5, 0.1, -8, 0),
    say: (sim) =>
      `Pellets are bagged (${fmt.n(sim.params.bagKg)} kg each) and stacked — ${fmt.n(Math.floor(bufferKg(sim.state, "finishedGoods") / sim.params.bagKg))} bags in the store.`,
  },
  {
    id: "dock",
    title: "Dispatch",
    spot: "dock",
    shot: at("dock", 2.7, -0.25, 0, 4),
    say: (sim) => {
      const k = getKpis(sim.state, sim.params);
      return `Pellets leave by truck for converters (sample buyers): ${fmt.t(k.tonnesOut * 1000)} dispatched, ${fmt.t(k.eprCreditsT * 1000)} eligible for EPR credits.`;
    },
  },
  {
    id: "etp",
    title: "Water treatment",
    spot: "etp",
    shot: at("etp", 2.6, 0.3),
    say: (sim) => `Wash water is settled, treated and reused; the plant has drawn ${fmt.n(sim.state.waterM3)} m³ of fresh water so far.`,
  },
  {
    id: "overview",
    title: "The whole loop",
    shot: { x: -6, z: -2, zoom: 1.05, az: 0, dur: 3 },
    say: (sim) => {
      const k = getKpis(sim.state, sim.params);
      return `${fmt.t(k.tonnesIn * 1000)} in, ${fmt.t(k.tonnesOut * 1000)} out, ${k.yieldPct === null ? "yield building up" : `${fmt.n(k.yieldPct, 1)}% yield`} — every figure from the simulation engine.`;
    },
  },
];

/** Seconds the tour stays on each stop. */
export const TOUR_STOP_S = 7;
