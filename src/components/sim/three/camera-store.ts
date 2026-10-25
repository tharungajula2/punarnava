"use client";

import { create } from "zustand";

/**
 * UI ↔ 3D bridge with no three.js import, so the overlay can talk to the scene
 * without pulling 3D code into the main bundle.
 */
export type CameraCmd = "zoomIn" | "zoomOut" | "rotateLeft" | "rotateRight" | "reset";

/** A camera framing: look at (x, z), zoom as a multiple of the "whole plant fits" zoom, azimuth offset from the iso home angle. */
export interface Shot {
  x: number;
  z: number;
  zoom: number;
  az?: number;
  /** Elevation in radians (default: true isometric). */
  el?: number;
  /** Seconds. */
  dur?: number;
}

/** explore = normal use · tour = guided camera flight · cinematic = slow orbit, UI hidden. */
export type ShowMode = "explore" | "tour" | "cinematic";

interface SceneStore {
  hovered: string | null;
  selected: string | null;
  /** Highlighted by the guided tour (ring only, no detail panel). */
  spotlight: string | null;
  cmd: { kind: CameraCmd; n: number } | null;
  focus: { x: number; z: number; n: number } | null;
  shot: (Shot & { n: number }) | null;
  mode: ShowMode;
  tourStep: number;
  tourPaused: boolean;
  /** True once the 3D scene has drawn its first frames (hides the loading screen). */
  ready: boolean;
  setHovered: (id: string | null) => void;
  setSelected: (id: string | null) => void;
  command: (kind: CameraCmd) => void;
  focusOn: (x: number, z: number) => void;
  frame: (shot: Shot) => void;
  setMode: (mode: ShowMode) => void;
  setTourStep: (step: number) => void;
  setTourPaused: (paused: boolean) => void;
  setSpotlight: (id: string | null) => void;
  setReady: (ready: boolean) => void;
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  hovered: null,
  selected: null,
  spotlight: null,
  cmd: null,
  focus: null,
  shot: null,
  mode: "explore",
  tourStep: 0,
  tourPaused: false,
  ready: false,
  setHovered: (hovered) => set({ hovered }),
  setSelected: (selected) => set({ selected }),
  command: (kind) => set({ cmd: { kind, n: (get().cmd?.n ?? 0) + 1 } }),
  focusOn: (x, z) => set({ focus: { x, z, n: (get().focus?.n ?? 0) + 1 } }),
  frame: (shot) => set({ shot: { ...shot, n: (get().shot?.n ?? 0) + 1 } }),
  setMode: (mode) => set({ mode, tourStep: 0, tourPaused: false, spotlight: null }),
  setTourStep: (tourStep) => set({ tourStep }),
  setTourPaused: (tourPaused) => set({ tourPaused }),
  setSpotlight: (spotlight) => set({ spotlight }),
  setReady: (ready) => set({ ready }),
}));

/** Live truck positions written by the scene every frame (not reactive). */
export const truckSpots = new Map<string, { x: number; z: number; visible: boolean }>();

// Dev-only handle for driving the camera from the browser console (never in production builds).
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as unknown as { __sceneStore: typeof useSceneStore }).__sceneStore = useSceneStore;
}
