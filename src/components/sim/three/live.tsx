"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BUYERS, SUNRISE_HOUR, SUNSET_HOUR, bufferKg, clock, type PlantSim, type Truck } from "@/sim";
import { nodeLabel } from "../schematic";
import { useSimStore } from "../sim-store";
import { truckSpots, useSceneStore } from "./camera-store";
import { Pick } from "./models";
import { Box, C, Cyl, GEO, GLOW, animDt, mat } from "./prims";
import {
  BINS,
  CONVEYORS,
  FORKLIFTS,
  OFF_TILE_X,
  QUEUE_GAP,
  INBOUND_ARRIVE,
  SPOTS,
  WEIGHBRIDGE_STOP,
  distanceTo,
  inboundDepart,
  inboundPark,
  outboundArrive,
  outboundDepart,
  sample,
  type Route,
  type V2,
} from "./site";

// Visual scale only (how much material one drawn object stands for) — not business numbers.
const VISUAL_BALE_KG = 250;
const VISUAL_PALLET_KG = 1000;
/** Sim-minutes before arrival at which an incoming truck appears on the tile. */
const ENTRY_MIN = 8;
/** Share of the engine's unloading phase drawn on the weighbridge; the rest is in the unload bay. */
const WEIGH_SHARE = 0.22;

/** 0 → 1 through the truck's current engine phase. */
function phaseProgress(t: Truck) {
  return t.phaseMinutes > 0 ? 1 - t.timer / t.phaseMinutes : 1;
}

/** True while a collection truck is in the unload bay and bales come off. */
export function unloadingInBay(sim: PlantSim) {
  return sim.state.trucks.some((t) => t.kind === "inbound" && t.phase === "unloading" && phaseProgress(t) > WEIGH_SHARE + 0.06);
}

function getSim(): PlantSim | null {
  return useSimStore.getState().sim;
}

// ── Trucks ───────────────────────────────────────────────────────────────────

const ROUTES = {
  inPark: [0, 1, 2, 3].map(inboundPark),
  inDepart: [0, 1, 2, 3].map(inboundDepart),
  outArrive: { east: outboundArrive("east"), west: outboundArrive("west") },
  outDepart: { east: outboundDepart("east"), west: outboundDepart("west") },
};

type Target = { key: string; route: Route; s: number };

function buyerSide(id: string | null, fallback: "east" | "west"): "east" | "west" {
  if (!id) return fallback;
  const b = BUYERS.find((x) => x.id === id);
  return b ? (b.x < 0 ? "west" : "east") : fallback;
}

/** Where the engine says this truck should be, as a point along one of the site routes. */
function truckTarget(truck: Truck, index: number, sim: PlantSim, side: "east" | "west"): Target {
  if (truck.kind === "inbound") {
    const i = index % ROUTES.inDepart.length;
    const arrive = INBOUND_ARRIVE;
    const park = ROUTES.inPark[i];
    const depart = ROUTES.inDepart[i];
    const wb = distanceTo(arrive, WEIGHBRIDGE_STOP);
    switch (truck.phase) {
      case "to-point":
      case "loading":
        return { key: `id${i}`, route: depart, s: depart.len };
      case "to-plant":
        return { key: "ia", route: arrive, s: truck.timer > ENTRY_MIN ? 0 : (1 - truck.timer / ENTRY_MIN) * (wb - QUEUE_GAP) };
      case "queued": {
        const q = sim.state.trucks.filter((t) => t.phase === "queued");
        return { key: "ia", route: arrive, s: wb - QUEUE_GAP * (q.indexOf(truck) + 1) };
      }
      case "unloading":
        // Weighed first, then reversed into the bay beside the bale yard.
        return { key: "ia", route: arrive, s: phaseProgress(truck) < WEIGH_SHARE ? wb : arrive.len };
      default:
        return { key: `ip${i}`, route: park, s: park.len };
    }
  }
  const arrive = ROUTES.outArrive[side];
  const depart = ROUTES.outDepart[side];
  switch (truck.phase) {
    case "to-buyer":
    case "unloading":
      return { key: `od-${side}`, route: depart, s: depart.len };
    case "returning":
      return { key: `oa-${side}`, route: arrive, s: truck.timer > ENTRY_MIN ? 0 : (1 - truck.timer / ENTRY_MIN) * arrive.len };
    default:
      return { key: `oa-${side}`, route: arrive, s: arrive.len };
  }
}

function TruckModel({ kind, cargo }: { kind: "inbound" | "outbound"; cargo: React.RefObject<(THREE.Mesh | null)[]> }) {
  const cab = kind === "inbound" ? C.teal : C.paper;
  const trim = kind === "inbound" ? C.mint : C.teal;
  const bed = kind === "inbound" ? C.sand : C.tealDeep;
  const slots = useMemo(() => {
    const out: [number, number, number][] = [];
    if (kind === "inbound") for (let i = 0; i < 10; i++) out.push([1.05 - Math.floor(i / 2) * 1.05, 1.75, i % 2 ? 0.55 : -0.55]);
    else for (let i = 0; i < 6; i++) out.push([0.95 - Math.floor(i / 2) * 1.6, 1.8, i % 2 ? 0.58 : -0.58]);
    return out;
  }, [kind]);
  return (
    <group>
      <Box p={[0, 0.85, 0]} s={[7.6, 0.4, 2.1]} c={C.ink} />
      <Box p={[2.9, 2.05, 0]} s={[2, 2.2, 2.4]} c={cab} />
      <Box p={[3.92, 2.45, 0]} s={[0.06, 0.95, 2.05]} c="#3d5257" shadow={false} />
      <Box p={[2.9, 3.2, 0]} s={[1.6, 0.12, 2.2]} c={trim} />
      <Box p={[2.9, 1.25, 1.21]} s={[1.9, 0.25, 0.02]} c={trim} shadow={false} />
      <Box p={[2.9, 1.25, -1.21]} s={[1.9, 0.25, 0.02]} c={trim} shadow={false} />
      <Box p={[-1, 1.15, 0]} s={[5.3, 0.2, 2.4]} c={bed} />
      <Box p={[-1, 1.6, 1.17]} s={[5.3, 0.75, 0.08]} c={bed} />
      <Box p={[-1, 1.6, -1.17]} s={[5.3, 0.75, 0.08]} c={bed} />
      <Box p={[-3.62, 1.6, 0]} s={[0.08, 0.75, 2.4]} c={bed} />
      <Box p={[1.62, 1.9, 0]} s={[0.12, 1.3, 2.4]} c={C.ink} />
      {[2.7, -1.3, -2.6].flatMap((x) =>
        [-1.05, 1.05].map((z) => <Cyl key={`${x}${z}`} p={[x, 0.5, z]} rad={0.5} h={0.4} c={C.ink} rot={[Math.PI / 2, 0, 0]} />),
      )}
      {slots.map((p, i) => (
        <mesh
          key={i}
          ref={(m) => {
            cargo.current[i] = m;
          }}
          geometry={GEO.box}
          material={mat(kind === "inbound" ? C.bale[i % C.bale.length] : C.paper)}
          position={p}
          scale={kind === "inbound" ? [1, 0.95, 1.05] : [1.5, 1.1, 1.1]}
          castShadow
          visible={false}
        />
      ))}
    </group>
  );
}

function TruckActor({ id, index, kind }: { id: string; index: number; kind: "inbound" | "outbound" }) {
  const group = useRef<THREE.Group>(null);
  const cargo = useRef<(THREE.Mesh | null)[]>([]);
  const anim = useRef<{ key: string; route: Route; s: number; heading: number; sim: PlantSim | null; side: "east" | "west" } | null>(null);

  useFrame((_, rawDt) => {
    const sim = getSim();
    const g = group.current;
    if (!sim || !g) return;
    const truck = sim.state.trucks.find((t) => t.id === id);
    if (!truck) {
      g.visible = false;
      return;
    }
    const dt = Math.min(rawDt, 0.1);
    const prevSide = anim.current?.side ?? "east";
    const side = buyerSide(truck.target, prevSide);
    const tgt = truckTarget(truck, index, sim, side);

    let a = anim.current;
    if (!a || a.sim !== sim) {
      // First frame or a restarted simulation: snap into place.
      const p = sample(tgt.route, tgt.s);
      a = anim.current = { key: tgt.key, route: tgt.route, s: tgt.s, heading: p.heading, sim, side };
    }
    a.side = side;
    const speed = (rem: number) => Math.min(160, Math.max(9, rem * 1.6));
    if (a.key !== tgt.key) {
      a.s += speed(a.route.len - a.s + tgt.s) * dt;
      if (a.s >= a.route.len) {
        a.s = Math.min(a.s - a.route.len, tgt.s);
        a.key = tgt.key;
        a.route = tgt.route;
        a.heading = sample(a.route, a.s).heading;
      }
    } else if (tgt.s > a.s) {
      a.s = Math.min(tgt.s, a.s + speed(tgt.s - a.s) * dt);
    } else if (a.s - tgt.s > 20) {
      // The engine jumped ahead a whole trip (e.g. "+1 day"): snap instead of driving backwards.
      a.s = tgt.s;
      a.heading = sample(a.route, a.s).heading;
    }

    const p = sample(a.route, a.s);
    let dh = p.heading - a.heading;
    dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    a.heading += dh * Math.min(1, dt * 9);
    g.position.set(p.x, 0, p.z);
    g.rotation.y = a.heading;
    g.visible = Math.abs(p.x) < OFF_TILE_X;
    truckSpots.set(id, { x: p.x, z: p.z, visible: g.visible });

    // Cargo: bales on collection trucks, pallets of pellet bags on the outbound truck.
    const progress = phaseProgress(truck);
    let units = 0;
    if (kind === "inbound") {
      const off = Math.max(0, (progress - WEIGH_SHARE - 0.06) / (1 - WEIGH_SHARE - 0.06));
      const kg = truck.phase === "unloading" ? truck.cargoKg * (1 - off) : truck.cargoKg;
      units = Math.ceil(kg / VISUAL_BALE_KG - 0.01);
    } else {
      const kg = truck.phase === "loading" ? sim.params.outboundPayloadKg * progress : truck.phase === "to-buyer" ? truck.cargoKg : 0;
      units = Math.ceil(kg / VISUAL_PALLET_KG - 0.01);
    }
    cargo.current.forEach((m, i) => {
      if (m) m.visible = i < units;
    });
  });

  return (
    <group ref={group} visible={false}>
      <Pick id={id}>
        <TruckModel kind={kind} cargo={cargo} />
      </Pick>
    </group>
  );
}

export function Trucks() {
  const sim = useSimStore((s) => s.sim);
  if (!sim) return null;
  let inIdx = 0;
  return (
    <>
      {sim.state.trucks.map((t) => (
        <TruckActor key={t.id} id={t.id} kind={t.kind} index={t.kind === "inbound" ? inIdx++ : 0} />
      ))}
    </>
  );
}

// ── Forklifts ────────────────────────────────────────────────────────────────

const FORKLIFT_ACTIVE: Record<string, (sim: PlantSim) => boolean> = {
  "fl-yard": unloadingInBay,
  "fl-feed": (sim) => sim.state.units.sorting.status === "running",
  "fl-pack": (sim) => sim.state.units.packing.status === "running",
  "fl-dock": (sim) => sim.state.trucks.some((t) => t.kind === "outbound" && t.phase === "loading"),
};

const ease = (t: number) => t * t * (3 - 2 * t);

function Forklift({ id, a, b, load }: { id: string; a: V2; b: V2; load: "bale" | "bags" }) {
  const group = useRef<THREE.Group>(null);
  const loadRef = useRef<THREE.Mesh>(null);
  const forks = useRef<THREE.Group>(null);
  const u = useRef(0);
  const heading = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);

  useFrame((_, rawDt) => {
    const { sim, playing, speed } = useSimStore.getState();
    if (!sim || !group.current) return;
    const dt = animDt(Math.min(rawDt, 0.1), playing, speed);
    const active = FORKLIFT_ACTIVE[id](sim);
    if (active || u.current > 0) {
      u.current += dt / 6;
      if (u.current >= 1) u.current = active ? u.current - 1 : 0;
    }
    const loaded = u.current > 0 && u.current < 0.5;
    const f = u.current < 0.5 ? ease(u.current * 2) : 1 - ease((u.current - 0.5) * 2);
    group.current.position.set(a[0] + (b[0] - a[0]) * f, 0, a[1] + (b[1] - a[1]) * f);
    if (loadRef.current) loadRef.current.visible = loaded;
    if (forks.current) forks.current.position.y = loaded ? 0.35 : 0;
  });

  return (
    <group ref={group} rotation={[0, heading, 0]}>
      <Box p={[-0.1, 0.75, 0]} s={[1.7, 0.9, 1.15]} c={C.forklift} />
      <Box p={[-0.95, 0.85, 0]} s={[0.35, 1.1, 1.1]} c={C.ink} />
      {[-0.7, 0.55].flatMap((x) => [-0.5, 0.5].map((z) => <Box key={`${x}${z}`} p={[x, 1.75, z]} s={[0.07, 1.1, 0.07]} c={C.ink} shadow={false} />))}
      <Box p={[-0.08, 2.3, 0]} s={[1.4, 0.07, 1.1]} c={C.ink} />
      <mesh geometry={GEO.sphere} material={mat("#d7b9a0")} position={[-0.3, 1.65, 0]} scale={0.2} />
      <Box p={[0.85, 1.25, 0.35]} s={[0.08, 2.4, 0.08]} c={C.steelDark} />
      <Box p={[0.85, 1.25, -0.35]} s={[0.08, 2.4, 0.08]} c={C.steelDark} />
      {[0.5, -0.65].flatMap((x) => [-0.55, 0.55].map((z) => <Cyl key={`w${x}${z}`} p={[x, 0.28, z]} rad={0.28} h={0.2} c={C.ink} rot={[Math.PI / 2, 0, 0]} low />))}
      <group ref={forks}>
        <Box p={[1.45, 0.18, 0.3]} s={[1.1, 0.06, 0.12]} c={C.steelDark} shadow={false} />
        <Box p={[1.45, 0.18, -0.3]} s={[1.1, 0.06, 0.12]} c={C.steelDark} shadow={false} />
        <mesh
          ref={loadRef}
          geometry={GEO.box}
          material={mat(load === "bale" ? C.bale[1] : C.paper)}
          position={[1.5, 0.75, 0]}
          scale={load === "bale" ? [1, 1, 1.1] : [1.2, 1, 1.1]}
          castShadow
          visible={false}
        />
      </group>
    </group>
  );
}

export function Forklifts() {
  return (
    <>
      {FORKLIFTS.map((f) => (
        <Forklift key={f.id} {...f} />
      ))}
    </>
  );
}

// ── Conveyors with flowing material ──────────────────────────────────────────

const ITEM_GAP = 0.85;
const LOOK = {
  mixed: { size: [0.55, 0.38, 0.5] as const, colors: C.bale },
  flake: { size: [0.36, 0.16, 0.36] as const, colors: ["#d7e3e1", "#c7dbe6", "#e9dcc0", "#d6e7d3"] },
  clean: { size: [0.34, 0.16, 0.34] as const, colors: ["#eef4f3", "#e3eeee"] },
  pellet: { size: [0.3, 0.26, 0.3] as const, colors: [C.pellet, "#4ea79e"] },
};

export function Conveyors({ showItems = true }: { showItems?: boolean }) {
  const segs = useMemo(
    () =>
      CONVEYORS.map((c) => {
        const from = new THREE.Vector3(...c.from);
        const to = new THREE.Vector3(...c.to);
        const len = from.distanceTo(to);
        return { ...c, v0: from, v1: to, len, n: Math.max(2, Math.floor(len / ITEM_GAP)) };
      }),
    [],
  );
  const total = segs.reduce((a, s) => a + s.n, 0);
  const items = useRef<THREE.InstancedMesh>(null);
  const offsets = useRef(segs.map(() => 0));

  useLayoutEffect(() => {
    if (!items.current) return;
    const col = new THREE.Color();
    let k = 0;
    for (const s of segs) {
      const look = LOOK[s.look];
      for (let i = 0; i < s.n; i++) items.current!.setColorAt(k++, col.set(look.colors[(i * 7 + k) % look.colors.length]));
    }
    if (items.current!.instanceColor) items.current!.instanceColor.needsUpdate = true;
  }, [segs]);

  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), sc: new THREE.Vector3(), e: new THREE.Euler() }), []);

  useFrame((_, rawDt) => {
    const { sim, playing, speed } = useSimStore.getState();
    const mesh = items.current;
    if (!sim || !mesh) return;
    const dt = animDt(Math.min(rawDt, 0.1), playing, speed);
    let k = 0;
    segs.forEach((s, si) => {
      const unit = sim.state.units[s.unit];
      const running = unit.status === "running";
      if (running) offsets.current[si] = (offsets.current[si] + dt * 1.3) % s.len;
      // Fewer items when the machine runs below line rate.
      const density = running ? Math.max(0.35, Math.min(1, unit.rateKgH / Math.max(1, sim.params.lineRateKgH))) : 0;
      const look = LOOK[s.look];
      for (let i = 0; i < s.n; i++) {
        const d = (i * ITEM_GAP + offsets.current[si]) % s.len;
        tmp.p.lerpVectors(s.v0, s.v1, d / s.len);
        tmp.p.y += look.size[1] / 2 + 0.12;
        const show = (i * 0.618) % 1 < density;
        tmp.e.set(0, i * 1.3, 0);
        tmp.q.setFromEuler(tmp.e);
        tmp.sc.set(show ? look.size[0] : 0, show ? look.size[1] : 0, show ? look.size[2] : 0);
        tmp.m.compose(tmp.p, tmp.q, tmp.sc);
        mesh.setMatrixAt(k++, tmp.m);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {segs.map((s, i) => (
        <Belt key={i} from={s.v0} to={s.v1} len={s.len} />
      ))}
      {showItems && <instancedMesh ref={items} args={[GEO.box, mat("#ffffff"), total]} castShadow frustumCulled={false} />}
    </group>
  );
}

function Belt({ from, to, len }: { from: THREE.Vector3; to: THREE.Vector3; len: number }) {
  const { pos, quat } = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.lerpVectors(from, to, 0.5);
    o.lookAt(to);
    return { pos: o.position.clone(), quat: o.quaternion.clone() };
  }, [from, to]);
  return (
    <group>
      <group position={pos} quaternion={quat}>
        <Box p={[0, 0, 0]} s={[1, 0.16, len]} c={C.steelDark} />
        <Box p={[0, 0.09, 0]} s={[0.8, 0.03, len]} c={C.ink} shadow={false} />
      </group>
      {[from, to].map((v, i) =>
        v.y > 0.6 ? <Box key={i} p={[v.x, (v.y - 0.1) / 2, v.z]} s={[0.12, v.y - 0.1, 0.12]} c={C.steelDark} shadow={false} /> : null,
      )}
    </group>
  );
}

// ── Stock: bales in the yard, pellet bags in the warehouse ───────────────────

const BALE_SLOTS: [number, number, number][] = (() => {
  const out: [number, number, number][] = [];
  for (let l = 0; l < 3; l++) for (let r = 0; r < 8; r++) for (let c = 0; c < 7; c++) out.push([15.6 + c * 1.5, 0.6 + l * 1.05, 3.5 + r * 1.45]);
  return out;
})();

export function Bales() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const last = useRef(-1);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const col = new THREE.Color();
    BALE_SLOTS.forEach((p, i) => {
      q.setFromEuler(new THREE.Euler(0, ((i * 37) % 7) * 0.03 - 0.09, 0));
      m.compose(new THREE.Vector3(...p), q, new THREE.Vector3(1.3, 0.98, 1.25));
      ref.current!.setMatrixAt(i, m);
      ref.current!.setColorAt(i, col.set(C.bale[(i * 5 + Math.floor(i / 7)) % C.bale.length]));
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
    ref.current!.count = 0;
  }, []);
  useFrame(() => {
    const sim = getSim();
    if (!sim || !ref.current) return;
    const n = Math.min(BALE_SLOTS.length, Math.ceil(bufferKg(sim.state, "baleYard") / VISUAL_BALE_KG - 0.01));
    if (n !== last.current) ref.current.count = last.current = n;
  });
  return <instancedMesh ref={ref} args={[GEO.box, mat("#ffffff"), BALE_SLOTS.length]} castShadow receiveShadow frustumCulled={false} />;
}

const PALLETS: V2[] = (() => {
  const out: V2[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) out.push([-30 + c * 4, 2.6 + r * 3.3]);
  return out;
})();
const BAGS_PER_PALLET = 24;
const BAG_SLOTS: [number, number, number][] = PALLETS.flatMap(([x, z]) => {
  const out: [number, number, number][] = [];
  for (let l = 0; l < 6; l++) for (let j = 0; j < 4; j++) out.push([x + (j % 2 ? 0.46 : -0.46), 0.5 + l * 0.33, z + (j < 2 ? 0.33 : -0.33)]);
  return out;
});

/** One drawn bag = one real bag (bag_kg). */
export function FinishedBags() {
  const bags = useRef<THREE.InstancedMesh>(null);
  const pallets = useRef<THREE.InstancedMesh>(null);
  const last = useRef(-1);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    BAG_SLOTS.forEach((p, i) => {
      m.compose(new THREE.Vector3(...p), q, new THREE.Vector3(0.88, 0.3, 0.62));
      bags.current!.setMatrixAt(i, m);
    });
    PALLETS.forEach(([x, z], i) => {
      m.compose(new THREE.Vector3(x, 0.32, z), q, new THREE.Vector3(1.9, 0.16, 1.4));
      pallets.current!.setMatrixAt(i, m);
    });
    bags.current!.instanceMatrix.needsUpdate = true;
    pallets.current!.instanceMatrix.needsUpdate = true;
    bags.current!.count = 0;
    pallets.current!.count = 0;
  }, []);
  useFrame(() => {
    const sim = getSim();
    if (!sim || !bags.current || !pallets.current) return;
    const n = Math.min(BAG_SLOTS.length, Math.floor(bufferKg(sim.state, "finishedGoods") / sim.params.bagKg));
    if (n === last.current) return;
    last.current = n;
    bags.current.count = n;
    pallets.current.count = Math.ceil(n / BAGS_PER_PALLET);
  });
  return (
    <group>
      <instancedMesh ref={pallets} args={[GEO.box, mat(C.trunk), PALLETS.length]} receiveShadow frustumCulled={false} />
      <instancedMesh ref={bags} args={[GEO.box, mat(C.paper), BAG_SLOTS.length]} castShadow receiveShadow frustumCulled={false} />
    </group>
  );
}

// ── Fill gauges (surge bins + silo) ──────────────────────────────────────────

function Gauge({ buffer, p, h, max }: { buffer: "sorted" | "flakes" | "washed" | "melt" | "silo"; p: [number, number, number]; h: number; max?: number }) {
  const fill = useRef<THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>>(null);
  useFrame(() => {
    const sim = getSim();
    if (!sim || !fill.current) return;
    const f = Math.min(1, bufferKg(sim.state, buffer) / (max ?? sim.params.bufferKg));
    fill.current.scale.y = Math.max(0.001, f * h);
    fill.current.position.y = p[1] + (f * h) / 2;
    fill.current.material.color.set(f >= 0.999 ? C.status.maintenance : C.teal);
  });
  return (
    <group>
      <Box p={[p[0], p[1] + h / 2, p[2] - 0.03]} s={[0.36, h, 0.06]} c={C.ink} shadow={false} />
      <mesh ref={fill} geometry={GEO.box} position={p} scale={[0.26, 0.01, 0.08]}>
        <meshStandardMaterial color={C.teal} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function Bins() {
  return (
    <group>
      {BINS.map((b) => (
        <Pick key={b.id} id={b.id}>
          <Cyl p={[b.x, 1.3, b.z]} rad={0.65} h={1.6} c={C.paper} />
          <mesh geometry={GEO.cone} material={mat(C.steel)} position={[b.x, 0.3, b.z]} scale={[0.65, 0.5, 0.65]} rotation={[Math.PI, 0, 0]} />
          <Gauge buffer={b.id} p={[b.x, 0.6, b.z + 0.72]} h={1.4} />
        </Pick>
      ))}
      <Gauge buffer="silo" p={[SPOTS.silo.x, 3.5, SPOTS.silo.z + 2.08]} h={5.8} />
    </group>
  );
}

// ── Selection + hover ────────────────────────────────────────────────────────

function spotOf(id: string): { x: number; z: number; r: number; visible: boolean } | null {
  const t = truckSpots.get(id);
  if (t) return { x: t.x, z: t.z, r: 5, visible: t.visible };
  const s = SPOTS[id] ?? (BINS.find((b) => b.id === id) && { ...BINS.find((b) => b.id === id)!, r: 1.6 });
  return s ? { x: s.x, z: s.z, r: s.r, visible: true } : null;
}

function Ring({ id, strong }: { id: string; strong: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock: c }) => {
    const s = spotOf(id);
    if (!ref.current) return;
    if (!s) {
      ref.current.visible = false;
      return;
    }
    ref.current.visible = s.visible;
    ref.current.position.set(s.x, 0.16, s.z);
    const pulse = strong ? 1 + Math.sin(c.elapsedTime * 3) * 0.04 : 1;
    ref.current.scale.setScalar(s.r * pulse);
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
      <ringGeometry args={[0.9, 1, 48]} />
      <meshBasicMaterial color={strong ? C.teal : C.mint} transparent opacity={strong ? 0.85 : 0.7} depthWrite={false} />
    </mesh>
  );
}

function HoverLabel({ id }: { id: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const s = spotOf(id);
    if (ref.current && s) ref.current.position.set(s.x, 6, s.z);
  });
  return (
    <group ref={ref}>
      <Html center zIndexRange={[20, 10]} style={{ pointerEvents: "none" }}>
        <div className="glass whitespace-nowrap px-2.5 py-1 text-xs font-medium text-foreground">{nodeLabel(id)}</div>
      </Html>
    </group>
  );
}

export function Selection() {
  const simSelected = useSimStore((s) => s.selected);
  const conceptSelected = useSceneStore((s) => s.selected);
  const selected = useSimStore((s) => s.sim) ? simSelected : conceptSelected;
  const hovered = useSceneStore((s) => s.hovered);
  const spotlight = useSceneStore((s) => s.spotlight);
  return (
    <>
      {spotlight && spotlight !== selected && <Ring key={`t-${spotlight}`} id={spotlight} strong />}
      {selected && <Ring key={`s-${selected}`} id={selected} strong />}
      {hovered && hovered !== selected && <Ring key={`h-${hovered}`} id={hovered} strong={false} />}
      {hovered && <HoverLabel key={`l-${hovered}`} id={hovered} />}
    </>
  );
}

// ── Day / night ──────────────────────────────────────────────────────────────

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const SKY = { day: new THREE.Color("#e6eeeb"), dusk: new THREE.Color("#f2dcc8"), night: new THREE.Color("#22314a") };
const WHITE = new THREE.Color("#ffffff");
const INK = new THREE.Color("#0b1a1f");
const skyTmp = new THREE.Color();
const SUN = { day: new THREE.Color("#fff6ea"), dusk: new THREE.Color("#ffc59a"), moon: new THREE.Color("#b4c6ee") };
const HEMI = { skyDay: new THREE.Color("#f2f7f5"), skyNight: new THREE.Color("#7f94c4"), groundDay: new THREE.Color("#c9d6c2"), groundNight: new THREE.Color("#4a5670") };

/** Sun, moon and sky follow the simulated clock. */
export function DayNight() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const bg = useMemo(() => new THREE.Color(), []);
  const lastSky = useRef("");
  useFrame(({ scene, gl }) => {
    const sim = getSim();
    if (!sim || !sun.current || !hemi.current) return;
    const h = clock(sim.state.t).hourFloat;
    const d = (h - SUNRISE_HOUR) / (SUNSET_HOUR - SUNRISE_HOUR);
    const up = d > 0 && d < 1;
    const el = up ? Math.sin(Math.PI * d) : 0;
    const day = smooth(0, 0.3, el);
    const dusk = day * (1 - smooth(0.12, 0.45, el));

    if (up) sun.current.position.set(Math.cos(Math.PI * d) * 100, 25 + el * 110, 60);
    else sun.current.position.set(-50, 110, 70);
    sun.current.intensity = up ? 0.6 + 2.2 * day : 0.9;
    sun.current.color.copy(up ? SUN.day : SUN.moon).lerp(SUN.dusk, dusk);

    hemi.current.intensity = 1.05 + 0.55 * day;
    hemi.current.color.copy(HEMI.skyNight).lerp(HEMI.skyDay, day);
    hemi.current.groundColor.copy(HEMI.groundNight).lerp(HEMI.groundDay, day);

    bg.copy(SKY.night).lerp(SKY.day, day).lerp(SKY.dusk, dusk * 0.8);
    // The canvas is transparent: the stage paints a soft gradient sky from this colour (see .sim-stage in globals.css).
    scene.background = null;
    const sky = `#${bg.getHexString()}`;
    if (sky !== lastSky.current) {
      lastSky.current = sky;
      const stage = gl.domElement.closest(".sim-stage") as HTMLElement | null;
      if (stage) {
        stage.style.setProperty("--sky", sky);
        stage.style.setProperty("--sky-hi", `#${skyTmp.copy(bg).lerp(WHITE, 0.32).getHexString()}`);
        stage.style.setProperty("--sky-lo", `#${skyTmp.copy(bg).lerp(INK, 0.12).getHexString()}`);
      }
    }
    GLOW.window.emissiveIntensity = (1 - day) * 1.1;
    GLOW.lamp.emissiveIntensity = (1 - day) * 2.2;
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={["#ffffff", "#c9d6c2", 1.4]} />
      <directionalLight
        ref={sun}
        castShadow
        position={[60, 100, 60]}
        intensity={2.5}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.12}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
        shadow-camera-near={1}
        shadow-camera-far={400}
      />
    </>
  );
}
