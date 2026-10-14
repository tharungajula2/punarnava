"use client";

import { create } from "zustand";
import { PlantSim, type Scenario, type SimEvent, type SimParams } from "@/sim";

export const SPEEDS = [1, 10, 60, 250, 1000] as const;

/**
 * The plant opens on day 8 (Monday) at 09:00: the engine has already run its
 * first week from an empty plant, so every stage holds material. Nothing is preset: it is the
 * same engine run, just started earlier.
 */
export const WARMUP_MIN = 7 * 24 * 60 + 9 * 60;

function startSim(params: SimParams, seed: number, scenario?: Partial<Scenario>) {
  const sim = new PlantSim(params, seed);
  if (scenario) sim.setScenario(scenario);
  sim.run(WARMUP_MIN);
  return sim;
}

/**
 * Thin client wrapper around the engine. The engine owns all numbers; this
 * store only holds UI state (playing, speed, selection) and a `version` that
 * bumps whenever the engine advanced, so React knows to re-read it.
 * The 3D layer reads the same engine every frame via getState().
 */
interface SimStore {
  sim: PlantSim | null;
  params: SimParams | null;
  seed: number;
  playing: boolean;
  speed: number;
  version: number;
  chartVersion: number;
  selected: string | null;
  view: "3d" | "2d";
  init: (params: SimParams, scenario?: Partial<Scenario>) => void;
  reset: (seed?: number) => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setScenario: (patch: Partial<Scenario>) => void;
  trigger: (event: SimEvent) => void;
  advance: (minutes: number) => void;
  select: (id: string | null) => void;
  setView: (view: "3d" | "2d") => void;
}

export const useSimStore = create<SimStore>((set, get) => ({
  sim: null,
  params: null,
  seed: 1,
  playing: false,
  speed: 60,
  version: 0,
  chartVersion: 0,
  selected: null,
  view: "3d",
  init: (params, scenario) => {
    if (get().sim && get().params === params) return;
    set({ params, sim: startSim(params, get().seed, scenario), version: 0, chartVersion: 0 });
  },
  reset: (seed) => {
    const { params } = get();
    if (!params) return;
    const next = seed ?? get().seed;
    set((s) => ({ seed: next, sim: startSim(params, next), version: s.version + 1, chartVersion: s.chartVersion + 1 }));
  },
  setPlaying: (playing) => set({ playing }),
  setSpeed: (speed) => set({ speed }),
  setScenario: (patch) => {
    get().sim?.setScenario(patch);
    set((s) => ({ version: s.version + 1 }));
  },
  trigger: (event) => {
    get().sim?.trigger(event);
    set((s) => ({ version: s.version + 1 }));
  },
  advance: (minutes) => {
    get().sim?.run(minutes);
    set((s) => ({ version: s.version + 1, chartVersion: s.chartVersion + 1 }));
  },
  select: (id) => set({ selected: id }),
  setView: (view) => set({ view }),
}));

/** Re-renders the caller whenever the engine advanced; returns the live engine. */
export function useSim(): PlantSim | null {
  useSimStore((s) => s.version);
  return useSimStore((s) => s.sim);
}

// Dev-only handle for poking the store from the browser console (never in production builds).
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as unknown as { __simStore: typeof useSimStore }).__simStore = useSimStore;
}
