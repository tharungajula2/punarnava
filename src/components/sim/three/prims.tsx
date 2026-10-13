"use client";

import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";

/** Scene palette — hex versions of the brand tokens (three.js can't read oklch CSS vars). */
export const C = {
  tile: "#dbe5d4",
  tileSide: "#b9c9b2",
  verge: "#cfdcc8",
  concrete: "#ece8df",
  concreteDark: "#ddd6c8",
  asphalt: "#a3abaf",
  marking: "#f5f2ea",
  wall: "#f4f0e8",
  wallShade: "#e3dccf",
  teal: "#2f7c76",
  tealDeep: "#1e4f4c",
  mint: "#a9e1cd",
  sand: "#eadcc0",
  sandDark: "#d2bf9b",
  ink: "#2a3331",
  steel: "#c9d1d3",
  steelDark: "#8d989b",
  glass: "#b9dde0",
  water: "#8fcdd3",
  trunk: "#a98a6c",
  leaf: "#97c4a1",
  leafDark: "#78ab8a",
  forklift: "#e8b65e",
  paper: "#f7f4ee",
  pellet: "#3f958d",
  flake: "#d9e7e5",
  bale: ["#86b9d6", "#e8c46d", "#e3937e", "#a1cf9d", "#c4b5e0", "#f1efe8"],
  status: { running: "#3fae7a", idle: "#a7b0b4", down: "#e2574c", maintenance: "#eaa93c" },
};

// Shared geometry: one of each, scaled per mesh.
export const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 18),
  cylLow: new THREE.CylinderGeometry(1, 1, 1, 8),
  cone: new THREE.ConeGeometry(1, 1, 7),
  ico: new THREE.IcosahedronGeometry(1, 0),
  sphere: new THREE.IcosahedronGeometry(1, 1),
};

const mats = new Map<string, THREE.MeshStandardMaterial>();
/** Cached matte material per colour (flat-shaded for the low-poly look). */
export function mat(color: string, opts: { rough?: number; metal?: number; opacity?: number } = {}): THREE.MeshStandardMaterial {
  const key = `${color}|${opts.rough ?? 0.85}|${opts.metal ?? 0}|${opts.opacity ?? 1}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.rough ?? 0.85,
      metalness: opts.metal ?? 0,
      flatShading: true,
      transparent: (opts.opacity ?? 1) < 1,
      opacity: opts.opacity ?? 1,
    });
    mats.set(key, m);
  }
  return m;
}

/** Shared night-glow materials, animated by the lighting rig. */
export const GLOW = {
  window: new THREE.MeshStandardMaterial({ color: C.glass, emissive: "#ffd99a", emissiveIntensity: 0, roughness: 0.3, flatShading: true }),
  lamp: new THREE.MeshStandardMaterial({ color: "#fff6e0", emissive: "#ffd99a", emissiveIntensity: 0, roughness: 0.4 }),
};

type MeshProps = Omit<ThreeElements["mesh"], "position" | "scale" | "rotation">;
type Vec = [number, number, number];

/** Box by centre + size. */
export function Box({ p, s, c, r, m, shadow = true, ...rest }: { p: Vec; s: Vec; c?: string; r?: Vec; m?: THREE.Material; shadow?: boolean } & MeshProps) {
  return <mesh geometry={GEO.box} material={m ?? mat(c ?? C.wall)} position={p} scale={s} rotation={r} castShadow={shadow} receiveShadow {...rest} />;
}

/** Box sitting on y = base (p is the footprint centre). */
export function Block({ p, s, c, r, m, base = 0, shadow = true }: { p: [number, number]; s: Vec; c?: string; r?: number; m?: THREE.Material; base?: number; shadow?: boolean }) {
  return <Box p={[p[0], base + s[1] / 2, p[1]]} s={s} c={c} m={m} r={r ? [0, r, 0] : undefined} shadow={shadow} />;
}

/** Vertical cylinder by centre + radius + height. */
export function Cyl({ p, rad, h, c, m, rot, low, shadow = true }: { p: Vec; rad: number; h: number; c?: string; m?: THREE.Material; rot?: Vec; low?: boolean; shadow?: boolean }) {
  return (
    <mesh
      geometry={low ? GEO.cylLow : GEO.cyl}
      material={m ?? mat(c ?? C.steel)}
      position={p}
      scale={[rad, h, rad]}
      rotation={rot}
      castShadow={shadow}
      receiveShadow
    />
  );
}

let blobTex: THREE.Texture | null = null;
function blobTexture() {
  if (blobTex) return blobTex;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 64;
  const g = cv.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 4, 32, 32, 32);
  grad.addColorStop(0, "rgba(30,45,42,0.55)");
  grad.addColorStop(0.55, "rgba(30,45,42,0.22)");
  grad.addColorStop(1, "rgba(30,45,42,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  blobTex = new THREE.CanvasTexture(cv);
  return blobTex;
}

const noRaycast = () => null;

/** Soft dark pool under an object — the cheap "ambient occlusion" contact feel. */
export function Blob({ p, w, d, o = 0.5 }: { p: [number, number]; w: number; d: number; o?: number }) {
  return (
    <mesh position={[p[0], 0.03, p[1]]} rotation={[-Math.PI / 2, 0, 0]} scale={[w, d, 1]} renderOrder={1} raycast={noRaycast}>
      <planeGeometry />
      <meshBasicMaterial map={blobTexture()} transparent opacity={o} depthWrite={false} />
    </mesh>
  );
}

/** Seconds of animation for this frame: 0 while paused, faster at high sim speeds. */
export function animDt(dt: number, playing: boolean, speed: number): number {
  return playing ? dt * Math.min(4, 1 + Math.log10(Math.max(1, speed))) : 0;
}
