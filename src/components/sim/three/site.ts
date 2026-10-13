/**
 * Plant site layout for the 3D view, in metres: x = east, z = south, y = up.
 * Pure data (no three.js) so the overlay UI can use it without loading 3D code.
 * Positions are a stylised layout for the demo, not an engineering drawing.
 */

export type V2 = [number, number]; // [x, z]

/** Diorama tile (the ground slab everything sits on). */
export const TILE = { minX: -98, maxX: 98, minZ: -50, maxZ: 54, depth: 5 };
/** Trucks beyond this |x| are off the tile and hidden. */
export const OFF_TILE_X = 95;

export const FENCE = { minX: -74, maxX: 66, minZ: -42, frontZ: 30, gaps: [[-36, -6], [32, 66]] as V2[] };
export const HALL = { minX: -64, maxX: 20, minZ: -26, maxZ: -6 };
export const BALE_YARD = { minX: 14, maxX: 30, minZ: 0, maxZ: 18 };
export const FG_STORE = { minX: -32, maxX: -10, minZ: 0, maxZ: 14 };
export const PARKING = { minX: 46, maxX: 64, minZ: -32, maxZ: 0 };

export const ROADS = {
  main: { z: 38, width: 9 }, // two lanes: eastbound z=36, westbound z=40
  gate: { x: 40, fromZ: -32, toZ: 38, width: 8 },
  exit: { x: 62, fromZ: -32, toZ: 38, width: 5 },
  dock: { x: -20, fromZ: 16, toZ: 38, width: 7 },
};

export const LINE_Z = -16;

/** Where every clickable thing sits, plus the radius of its selection ring. */
export const SPOTS: Record<string, { x: number; z: number; r: number; y?: number }> = {
  weighbridge: { x: 38, z: 10, r: 6 },
  baleYard: { x: 22, z: 9, r: 9 },
  sorting: { x: 12, z: LINE_Z, r: 7.5 },
  shredder: { x: 0, z: LINE_Z, r: 3.5 },
  wash: { x: -14, z: LINE_Z, r: 6.5 },
  dryer: { x: -27, z: LINE_Z, r: 4 },
  silo: { x: -35.5, z: -21, r: 3.5 },
  extruder: { x: -44, z: LINE_Z, r: 5 },
  pelletizer: { x: -55, z: LINE_Z, r: 3.5 },
  qc: { x: -56, z: 5, r: 5 },
  packing: { x: -42, z: 6, r: 4 },
  finishedGoods: { x: -21, z: 7, r: 10 },
  dock: { x: -20, z: 21, r: 6 },
};

/** Surge bins between machines (fill gauges). */
export const BINS: { id: "sorted" | "flakes" | "washed" | "melt"; x: number; z: number }[] = [
  { id: "sorted", x: 5, z: -10.5 },
  { id: "flakes", x: -6.5, z: -10.5 },
  { id: "washed", x: -21.5, z: -10.5 },
  { id: "melt", x: -50, z: -10.5 },
];

/** Conveyors: [from, to] with heights; `unit` is the machine whose output rides on it. */
export interface Conveyor {
  from: [number, number, number];
  to: [number, number, number];
  unit: "sorting" | "shredder" | "wash" | "dryer" | "extruder" | "pelletizer" | "qc";
  look: "mixed" | "flake" | "clean" | "pellet";
}
export const CONVEYORS: Conveyor[] = [
  { from: [18, 1.1, LINE_Z], to: [6.5, 1.1, LINE_Z], unit: "sorting", look: "mixed" },
  { from: [6, 1.1, LINE_Z], to: [2, 3.2, LINE_Z], unit: "sorting", look: "mixed" },
  { from: [-2, 0.9, LINE_Z], to: [-8.5, 2.2, LINE_Z], unit: "shredder", look: "flake" },
  { from: [-19.5, 1.6, LINE_Z], to: [-24.5, 2.4, LINE_Z], unit: "wash", look: "clean" },
  { from: [-29.5, 1.6, LINE_Z], to: [-34.5, 9.5, -20], unit: "dryer", look: "clean" },
  { from: [-36.5, 1.2, -18.5], to: [-40, 2.6, LINE_Z], unit: "extruder", look: "clean" },
  { from: [-48.5, 1.2, LINE_Z], to: [-53, 1.2, LINE_Z], unit: "extruder", look: "pellet" },
  { from: [-56, 1.0, -13], to: [-56, 1.0, 1], unit: "pelletizer", look: "pellet" },
  { from: [-52, 1.0, 5.5], to: [-44.5, 1.0, 6], unit: "qc", look: "pellet" },
];

/** Forklift shuttles: a → b carrying a load, b → a empty. */
export const FORKLIFTS: { id: string; a: V2; b: V2; load: "bale" | "bags" }[] = [
  { id: "fl-yard", a: [33.8, 10], b: [28.5, 6], load: "bale" }, // truck on weighbridge → bale yard
  { id: "fl-feed", a: [20, 1], b: [20, -12], load: "bale" }, // bale yard → sorting infeed
  { id: "fl-pack", a: [-37, 9.5], b: [-29, 9], load: "bags" }, // packing → finished goods
  { id: "fl-dock", a: [-15, 10], b: [-16.5, 16.5], load: "bags" }, // finished goods → outbound truck
];

// ── Truck routes ─────────────────────────────────────────────────────────────

export interface Route {
  pts: V2[];
  /** Segments with index ≥ rev are driven in reverse (truck faces backwards). */
  rev: number;
  cum: number[];
  len: number;
}

export function route(pts: V2[], rev = Infinity): Route {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, rev, cum, len: cum[cum.length - 1] };
}

/** Position + heading (radians about y, model faces +x) at distance s along a route. */
export function sample(r: Route, s: number): { x: number; z: number; heading: number } {
  const d = Math.max(0, Math.min(r.len, s));
  let i = 1;
  while (i < r.cum.length - 1 && r.cum[i] < d) i++;
  const [ax, az] = r.pts[i - 1];
  const [bx, bz] = r.pts[i];
  const seg = r.cum[i] - r.cum[i - 1] || 1;
  const f = (d - r.cum[i - 1]) / seg;
  const heading = Math.atan2(-(bz - az), bx - ax) + (i - 1 >= r.rev ? Math.PI : 0);
  return { x: ax + (bx - ax) * f, z: az + (bz - az) * f, heading };
}

export function distanceTo(r: Route, p: V2): number {
  const i = r.pts.findIndex((q) => q[0] === p[0] && q[1] === p[1]);
  return i < 0 ? r.len : r.cum[i];
}

const EAST_IN: V2 = [104, 40];
const EAST_OUT: V2 = [104, 36];
const WEST_IN: V2 = [-104, 36];
const WEST_OUT: V2 = [-104, 40];
export const WEIGHBRIDGE_STOP: V2 = [38, 10];
const PARK_Z = [-4, -12, -20, -28];
const DOCK_STOP: V2 = [-20, 21];

export function parkingSlot(i: number): V2 {
  return [52, PARK_Z[i % PARK_Z.length]];
}

/** Collection trucks: in from the east (the city), over the weighbridge, into a parking bay. */
export function inboundArrive(i: number): Route {
  const [px, pz] = parkingSlot(i);
  return route([EAST_IN, [38, 40], WEIGHBRIDGE_STOP, [38, pz], [px, pz]]);
}
export function inboundDepart(i: number): Route {
  const [px, pz] = parkingSlot(i);
  return route([[px, pz], [62, pz], [62, 36], EAST_OUT]);
}
/** Outbound truck: drives past the dock road, then reverses up to the dock. */
export function outboundArrive(side: "east" | "west"): Route {
  return side === "east"
    ? route([EAST_IN, [-32, 40], [-20, 32], DOCK_STOP], 1)
    : route([WEST_IN, [-8, 36], [-20, 30], DOCK_STOP], 1);
}
export function outboundDepart(side: "east" | "west"): Route {
  return side === "east" ? route([DOCK_STOP, [-20, 36], EAST_OUT]) : route([DOCK_STOP, [-20, 40], WEST_OUT]);
}

/** Queue spacing behind the weighbridge (one truck length + gap). */
export const QUEUE_GAP = 13;

// ── Decoration (deterministic) ──────────────────────────────────────────────

function lcg(seed: number) {
  let x = seed;
  return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Trees around the fence and along the road verge. */
export const TREES: { x: number; z: number; s: number }[] = (() => {
  const r = lcg(7);
  const out: { x: number; z: number; s: number }[] = [];
  for (let x = -92; x <= 92; x += 7) {
    if (Math.abs(x + 20) < 8 || Math.abs(x - 40) < 6 || Math.abs(x - 62) < 5) continue;
    out.push({ x: x + r() * 3, z: 47 + r() * 4, s: 0.8 + r() * 0.5 });
  }
  for (let x = -92; x <= 92; x += 8) out.push({ x: x + r() * 3, z: -46 + r() * 2, s: 0.9 + r() * 0.6 });
  for (let z = -38; z <= 28; z += 7) {
    out.push({ x: -82 + r() * 6, z: z + r() * 3, s: 0.8 + r() * 0.6 });
    out.push({ x: 76 + r() * 14, z: z + r() * 3, s: 0.8 + r() * 0.6 });
  }
  return out;
})();

/** Street lamps along the internal roads. */
export const LAMPS: V2[] = [
  [34, 26], [34, 4], [34, -18], [-25, 26], [-15, 30], [10, 26], [44, -30], [60, -6], [-60, 26], [-80, 34], [80, 34],
];
