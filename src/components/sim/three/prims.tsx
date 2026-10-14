"use client";

import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three-stdlib";

/** Scene palette — hex versions of the brand tokens (three.js can't read oklch CSS vars). */
export const C = {
  tile: "#eef1ef",
  tileSide: "#cdd7d3",
  verge: "#dcebdd",
  lawn: "#d3e6d4",
  concrete: "#f8f7f3",
  concreteDark: "#e8e5de",
  asphalt: "#bcc4c7",
  asphaltDark: "#aab3b7",
  marking: "#ffffff",
  wall: "#f7f4ee",
  wallShade: "#e7e1d6",
  teal: "#2f7c76",
  tealDeep: "#1e4f4c",
  mint: "#a9e1cd",
  sand: "#eadcc0",
  sandDark: "#d6c4a1",
  ink: "#33403e",
  steel: "#d3dadb",
  steelDark: "#97a3a6",
  glass: "#bfe3e2",
  water: "#8fd0d4",
  sludge: "#b7a98c",
  solar: "#2c4a63",
  solarFrame: "#dfe6ea",
  trunk: "#b0916f",
  leaf: "#9fd0a9",
  leafDark: "#7db890",
  leafLight: "#b8ddb4",
  forklift: "#efbd62",
  paper: "#fbf9f4",
  pellet: "#3f958d",
  flake: "#d9e7e5",
  bale: ["#86b9d6", "#e8c46d", "#e3937e", "#a1cf9d", "#c4b5e0", "#f1efe8"],
  car: ["#e7a58f", "#8fb8d8", "#f2f0ea", "#a9e1cd", "#e8c46d"],
  // Status lights: green running · amber idle / planned stop · red down.
  status: { running: "#3fbf7f", idle: "#f0a73a", down: "#e5484d", maintenance: "#f0a73a" },
};

// Shared geometry: one of each, scaled per mesh.
export const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 18),
  cylLow: new THREE.CylinderGeometry(1, 1, 1, 8),
  cone: new THREE.ConeGeometry(1, 1, 7),
  ico: new THREE.IcosahedronGeometry(1, 0),
  sphere: new THREE.IcosahedronGeometry(1, 1),
  round: new THREE.IcosahedronGeometry(1, 2),
  bale: new RoundedBoxGeometry(1, 1, 1, 2, 0.12),
};

const mats = new Map<string, THREE.MeshLambertMaterial | THREE.MeshStandardMaterial>();
/**
 * Cached flat-shaded material per colour. Matte surfaces use Lambert shading (looks the same on
 * low-poly pastel shapes and costs far less per pixel on integrated GPUs); pass rough/metal for the
 * few surfaces that need a specular sheen (solar glass).
 */
export function mat(color: string, opts: { rough?: number; metal?: number; opacity?: number } = {}): THREE.MeshLambertMaterial | THREE.MeshStandardMaterial {
  const key = `${color}|${opts.rough ?? "-"}|${opts.metal ?? "-"}|${opts.opacity ?? 1}`;
  let m = mats.get(key);
  if (!m) {
    const base = { color, flatShading: true, transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1 };
    m = opts.rough !== undefined || opts.metal !== undefined
      ? new THREE.MeshStandardMaterial({ ...base, roughness: opts.rough ?? 0.85, metalness: opts.metal ?? 0 })
      : new THREE.MeshLambertMaterial(base);
    mats.set(key, m);
  }
  return m;
}

/** Shared night-glow materials, animated by the lighting rig. */
export const GLOW = {
  window: new THREE.MeshStandardMaterial({ color: C.glass, emissive: "#ffd99a", emissiveIntensity: 0, roughness: 0.3, flatShading: true }),
  lamp: new THREE.MeshStandardMaterial({ color: "#fff6e0", emissive: "#ffd99a", emissiveIntensity: 0, roughness: 0.4 }),
  /** Warm pools of light on the ground under lamps (night only). */
  pool: new THREE.MeshBasicMaterial({ color: "#ffd59a", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
};

type MeshProps = Omit<ThreeElements["mesh"], "position" | "scale" | "rotation">;
type Vec = [number, number, number];

const rboxes = new Map<string, THREE.BufferGeometry>();
/** Rounded box of an exact size (cached), so bevels stay even instead of stretching with scale. */
export function rbox(w: number, h: number, d: number, radius: number): THREE.BufferGeometry {
  const r = Math.min(radius, w / 4, h / 4, d / 4);
  const key = `${w.toFixed(2)}|${h.toFixed(2)}|${d.toFixed(2)}|${r.toFixed(3)}`;
  let g = rboxes.get(key);
  if (!g) {
    g = new RoundedBoxGeometry(w, h, d, 2, r);
    rboxes.set(key, g);
  }
  return g;
}

/** Box by centre + size. `bevel` (metres) gives the soft, rounded "miniature" edge. */
export function Box({ p, s, c, r, m, shadow = true, bevel = 0, ...rest }: { p: Vec; s: Vec; c?: string; r?: Vec; m?: THREE.Material; shadow?: boolean; bevel?: number } & MeshProps) {
  if (bevel > 0) {
    return <mesh geometry={rbox(s[0], s[1], s[2], bevel)} material={m ?? mat(c ?? C.wall)} position={p} rotation={r} castShadow={shadow} receiveShadow {...rest} />;
  }
  return <mesh geometry={GEO.box} material={m ?? mat(c ?? C.wall)} position={p} scale={s} rotation={r} castShadow={shadow} receiveShadow {...rest} />;
}

/** Box sitting on y = base (p is the footprint centre). Bevelled by default. */
export function Block({ p, s, c, r, m, base = 0, shadow = true, bevel = 0.14 }: { p: [number, number]; s: Vec; c?: string; r?: number; m?: THREE.Material; base?: number; shadow?: boolean; bevel?: number }) {
  return <Box p={[p[0], base + s[1] / 2, p[1]]} s={s} c={c} m={m} r={r ? [0, r, 0] : undefined} shadow={shadow} bevel={bevel} />;
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

let poolTex: THREE.Texture | null = null;
/** Soft radial falloff used for the night light pools. */
export function poolTexture() {
  if (poolTex) return poolTex;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 64;
  const g = cv.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  poolTex = new THREE.CanvasTexture(cv);
  return poolTex;
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
