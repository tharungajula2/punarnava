"use client";

import { create } from "zustand";

/**
 * UI ↔ 3D bridge with no three.js import, so the overlay can talk to the scene
 * without pulling 3D code into the main bundle.
 */
export type CameraCmd = "zoomIn" | "zoomOut" | "rotateLeft" | "rotateRight" | "reset";

interface SceneStore {
  hovered: string | null;
  cmd: { kind: CameraCmd; n: number } | null;
  focus: { x: number; z: number; n: number } | null;
  setHovered: (id: string | null) => void;
  command: (kind: CameraCmd) => void;
  focusOn: (x: number, z: number) => void;
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  hovered: null,
  cmd: null,
  focus: null,
  setHovered: (hovered) => set({ hovered }),
  command: (kind) => set({ cmd: { kind, n: (get().cmd?.n ?? 0) + 1 } }),
  focusOn: (x, z) => set({ focus: { x, z, n: (get().focus?.n ?? 0) + 1 } }),
}));

/** Live truck positions written by the scene every frame (not reactive). */
export const truckSpots = new Map<string, { x: number; z: number; visible: boolean }>();
