"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { UnitId } from "@/sim";
import { useSimStore } from "../sim-store";
import { useSceneStore } from "./camera-store";
import { Blob, Block, Box, C, Cyl, GEO, GLOW, animDt, mat, poolTexture } from "./prims";
import { BALE_YARD, CARS, CAR_PARK, ETP, FENCE, FG_STORE, HALL, LAMPS, LINE_Z, PARKING, ROADS, SPOTS, TILE, TREES, UNLOAD_STOP } from "./site";

// ── Interaction ──────────────────────────────────────────────────────────────

/** Makes its children clickable / hoverable as one selectable thing. */
export function Pick({ id, children }: { id: string; children: ReactNode }) {
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        const scene = useSceneStore.getState();
        scene.setSelected(scene.selected === id ? null : id);
        const { selected, select } = useSimStore.getState();
        if (useSimStore.getState().sim) select(selected === id ? null : id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        useSceneStore.getState().setHovered(id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        if (useSceneStore.getState().hovered === id) useSceneStore.getState().setHovered(null);
        document.body.style.cursor = "";
      }}
    >
      {children}
    </group>
  );
}

const STATUS_COLORS = Object.fromEntries(Object.entries(C.status).map(([k, v]) => [k, new THREE.Color(v)])) as Record<keyof typeof C.status, THREE.Color>;

/** Machine status light: green running · grey idle · amber planned stop · blinking red down. */
export function Beacon({ unit, p }: { unit: UnitId; p: [number, number, number] }) {
  const light = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null);
  useFrame(({ clock }) => {
    const sim = useSimStore.getState().sim;
    if (!sim || !light.current) return;
    const m = light.current.material;
    const st = sim.state.units[unit].status;
    const col = STATUS_COLORS[st];
    m.color.copy(col);
    m.emissive.copy(col);
    m.emissiveIntensity = st === "down" ? (Math.sin(clock.elapsedTime * 9) > 0 ? 1.4 : 0.05) : st === "running" ? 0.7 : 0.12;
  });
  return (
    <group position={p}>
      <Cyl p={[0, 0.25, 0]} rad={0.2} h={0.5} c={C.ink} />
      <mesh ref={light} geometry={GEO.sphere} position={[0, 0.85, 0]} scale={0.48}>
        <meshStandardMaterial roughness={0.35} />
      </mesh>
    </group>
  );
}

/** Spins a part while its machine runs. */
function useSpin(unit: UnitId, axis: "x" | "y" | "z", speed: number) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const { sim, playing, speed: simSpeed } = useSimStore.getState();
    if (!ref.current || !sim || sim.state.units[unit].status !== "running") return;
    ref.current.rotation[axis] += animDt(dt, playing, simSpeed) * speed;
  });
  return ref;
}

// ── Ground, roads, fence, greenery ───────────────────────────────────────────

export function Ground() {
  const w = TILE.maxX - TILE.minX;
  const d = TILE.maxZ - TILE.minZ;
  const cx = (TILE.maxX + TILE.minX) / 2;
  const cz = (TILE.maxZ + TILE.minZ) / 2;
  const fx = (FENCE.maxX + FENCE.minX) / 2;
  const fz = (FENCE.frontZ + FENCE.minZ) / 2;
  return (
    <group>
      <Box p={[cx, -TILE.depth / 2 - 0.01, cz]} s={[w, TILE.depth, d]} c={C.tileSide} shadow={false} />
      <Box p={[cx, -0.02, cz]} s={[w, 0.04, d]} c={C.tile} shadow={false} />
      {/* Plant yard: compacted ground inside the fence */}
      <Box p={[fx, 0.0, fz]} s={[FENCE.maxX - FENCE.minX, 0.04, FENCE.frontZ - FENCE.minZ]} c={C.concrete} shadow={false} />
      <Box p={[(HALL.minX + HALL.maxX) / 2, 0.05, (HALL.minZ + HALL.maxZ) / 2]} s={[HALL.maxX - HALL.minX + 2, 0.1, HALL.maxZ - HALL.minZ + 2]} c={C.concreteDark} shadow={false} />
      <Box p={[(BALE_YARD.minX + BALE_YARD.maxX) / 2, 0.05, (BALE_YARD.minZ + BALE_YARD.maxZ) / 2]} s={[BALE_YARD.maxX - BALE_YARD.minX, 0.1, BALE_YARD.maxZ - BALE_YARD.minZ]} c={C.concreteDark} shadow={false} />
      <Box p={[(PARKING.minX + PARKING.maxX) / 2, 0.05, (PARKING.minZ + PARKING.maxZ) / 2]} s={[PARKING.maxX - PARKING.minX, 0.1, PARKING.maxZ - PARKING.minZ]} c={C.concreteDark} shadow={false} />
      {/* Bale-yard push walls */}
      <Block p={[BALE_YARD.minX - 0.3, 9]} s={[0.6, 1.4, 18]} c={C.sandDark} />
      <Block p={[22, BALE_YARD.maxZ + 0.3]} s={[16.6, 1.4, 0.6]} c={C.sandDark} />
      {/* Lawns: front verge, around the office, behind the hall */}
      <Box p={[-26, 0.02, 26.6]} s={[94, 0.05, 5.6]} c={C.lawn} shadow={false} />
      <Box p={[-68, 0.02, -6]} s={[10, 0.05, 66]} c={C.lawn} shadow={false} />
      <Box p={[-26, 0.02, -35.5]} s={[92, 0.05, 11]} c={C.lawn} shadow={false} />
      {/* Truck parking bays */}
      {[0, -8, -16, -24, -32].map((z) => (
        <Box key={z} p={[52, 0.12, z]} s={[10, 0.02, 0.25]} c={C.marking} shadow={false} />
      ))}
      {/* Unload bay beside the bale yard */}
      <Box p={[UNLOAD_STOP[0], 0.09, 4]} s={[4.2, 0.05, 12]} c={C.asphalt} shadow={false} />
      {[-2, 2].map((dx) => (
        <Box key={dx} p={[UNLOAD_STOP[0] + dx, 0.13, 4]} s={[0.18, 0.02, 12]} c={C.forklift} shadow={false} />
      ))}
      <Box p={[38, 0.09, -1.5]} s={[10, 0.05, 4.2]} c={C.asphalt} shadow={false} />
      <CarPark />
      <Roads />
      <Fence />
      <Trees />
      <Lamps />
    </group>
  );
}

function Roads() {
  const { main, gate, exit, dock } = ROADS;
  const dashes = useRef<THREE.InstancedMesh>(null);
  const count = 46;
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      m.compose(new THREE.Vector3(TILE.minX + 3 + i * 4.2, 0.1, main.z), new THREE.Quaternion(), new THREE.Vector3(2, 0.02, 0.25));
      dashes.current!.setMatrixAt(i, m);
    }
    dashes.current!.instanceMatrix.needsUpdate = true;
  }, [main.z]);
  return (
    <group>
      <Box p={[0, 0.04, main.z]} s={[TILE.maxX - TILE.minX, 0.06, main.width]} c={C.asphalt} shadow={false} />
      <Box p={[0, 0.03, main.z - main.width / 2 - 0.7]} s={[TILE.maxX - TILE.minX, 0.05, 1.4]} c={C.verge} shadow={false} />
      <Box p={[0, 0.03, main.z + main.width / 2 + 0.7]} s={[TILE.maxX - TILE.minX, 0.05, 1.4]} c={C.verge} shadow={false} />
      {/* Road edge lines */}
      {[-1, 1].map((k) => (
        <Box key={k} p={[0, 0.09, main.z + k * (main.width / 2 - 0.5)]} s={[TILE.maxX - TILE.minX, 0.02, 0.16]} c={C.marking} shadow={false} />
      ))}
      {/* Zebra crossing at the gate */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Box key={`z${i}`} p={[28 - i * 1.3, 0.1, main.z]} s={[0.7, 0.02, main.width - 1.4]} c={C.marking} shadow={false} />
      ))}
      <instancedMesh ref={dashes} args={[GEO.box, mat(C.marking), count]} />
      {[gate, exit].map((r, i) => (
        <Box key={i} p={[r.x, 0.06, (r.fromZ + r.toZ) / 2]} s={[r.width, 0.06, r.toZ - r.fromZ]} c={C.asphalt} shadow={false} />
      ))}
      <Box p={[dock.x, 0.06, (dock.fromZ + dock.toZ) / 2]} s={[dock.width, 0.06, dock.toZ - dock.fromZ]} c={C.asphalt} shadow={false} />
      <Box p={[51, 0.06, -32]} s={[22, 0.06, 4]} c={C.asphalt} shadow={false} />
      {/* Internal yard road in front of the hall */}
      <Box p={[-5, 0.06, 22]} s={[90, 0.06, 6]} c={C.asphalt} shadow={false} />
      <Box p={[-5, 0.08, 22]} s={[90, 0.02, 0.2]} c={C.marking} shadow={false} />
      {/* Gate: posts, booms, guard cabin and a brand totem */}
      <Block p={[34, 30]} s={[0.6, 2.4, 0.6]} c={C.tealDeep} />
      <Box p={[37.5, 2, 30]} s={[7, 0.18, 0.18]} c={C.forklift} />
      <Block p={[46, 30]} s={[0.6, 2.4, 0.6]} c={C.tealDeep} />
      <Block p={[59, 30]} s={[0.6, 2.4, 0.6]} c={C.tealDeep} />
      <Box p={[61.6, 2, 30]} s={[5, 0.18, 0.18]} c={C.forklift} />
      <GuardCabin />
      <Totem />
    </group>
  );
}

function Fence() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { posts, rails } = useMemo(() => {
    const posts: [number, number][] = [];
    const rails: { p: [number, number]; len: number; along: "x" | "z" }[] = [];
    const runX = (z: number, a: number, b: number) => {
      for (let x = a; x <= b + 0.01; x += 4) posts.push([x, z]);
      rails.push({ p: [(a + b) / 2, z], len: b - a, along: "x" });
    };
    const runZ = (x: number, a: number, b: number) => {
      for (let z = a; z <= b + 0.01; z += 4) posts.push([x, z]);
      rails.push({ p: [x, (a + b) / 2], len: b - a, along: "z" });
    };
    runX(FENCE.minZ, FENCE.minX, FENCE.maxX);
    runZ(FENCE.minX, FENCE.minZ, FENCE.frontZ);
    runZ(FENCE.maxX, FENCE.minZ, FENCE.frontZ);
    let from = FENCE.minX;
    for (const [a, b] of FENCE.gaps) {
      if (a > from) runX(FENCE.frontZ, from, a);
      from = b;
    }
    if (from < FENCE.maxX) runX(FENCE.frontZ, from, FENCE.maxX);
    return { posts, rails };
  }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    posts.forEach(([x, z], i) => {
      m.compose(new THREE.Vector3(x, 0.9, z), new THREE.Quaternion(), new THREE.Vector3(0.18, 1.8, 0.18));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [posts]);
  return (
    <group>
      <instancedMesh ref={ref} args={[GEO.box, mat(C.steelDark), posts.length]} castShadow />
      {rails.map((r, i) =>
        [0.7, 1.6].map((y) => (
          <Box key={`${i}-${y}`} p={[r.p[0], y, r.p[1]]} s={r.along === "x" ? [r.len, 0.08, 0.08] : [0.08, 0.08, r.len]} c={C.steelDark} shadow={false} />
        )),
      )}
    </group>
  );
}

function Trees() {
  const trunks = useRef<THREE.InstancedMesh>(null);
  const crowns = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const light = new THREE.Color(C.leaf);
    const dark = new THREE.Color(C.leafDark);
    const pale = new THREE.Color(C.leafLight);
    TREES.forEach((t, i) => {
      m.compose(new THREE.Vector3(t.x, 0.9 * t.s, t.z), q, new THREE.Vector3(0.28 * t.s, 1.8 * t.s, 0.28 * t.s));
      trunks.current!.setMatrixAt(i, m);
      q.setFromEuler(new THREE.Euler(0, i * 1.7, 0));
      m.compose(new THREE.Vector3(t.x, 2.9 * t.s, t.z), q, new THREE.Vector3(1.75 * t.s, 1.9 * t.s, 1.75 * t.s));
      crowns.current!.setMatrixAt(i, m);
      crowns.current!.setColorAt(i, i % 3 === 0 ? dark : i % 3 === 1 ? light : pale);
      q.identity();
    });
    trunks.current!.instanceMatrix.needsUpdate = true;
    crowns.current!.instanceMatrix.needsUpdate = true;
    if (crowns.current!.instanceColor) crowns.current!.instanceColor.needsUpdate = true;
  }, []);
  return (
    <group>
      <instancedMesh ref={trunks} args={[GEO.cylLow, mat(C.trunk), TREES.length]} castShadow />
      <instancedMesh ref={crowns} args={[GEO.round, mat("#ffffff"), TREES.length]} castShadow receiveShadow />
    </group>
  );
}

const planeGeo = new THREE.PlaneGeometry(1, 1);
const noRaycast = () => null;

function Lamps() {
  const posts = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    LAMPS.forEach(([x, z], i) => {
      m.compose(new THREE.Vector3(x, 2.5, z), new THREE.Quaternion(), new THREE.Vector3(0.12, 5, 0.12));
      posts.current!.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(x, 5.1, z), new THREE.Quaternion(), new THREE.Vector3(0.7, 0.25, 0.4));
      heads.current!.setMatrixAt(i, m);
    });
    posts.current!.instanceMatrix.needsUpdate = true;
    heads.current!.instanceMatrix.needsUpdate = true;
  }, []);
  const pools = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    GLOW.pool.map = poolTexture();
    GLOW.pool.needsUpdate = true;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    LAMPS.forEach(([x, z], i) => {
      m.compose(new THREE.Vector3(x, 0.15, z), q, new THREE.Vector3(13, 13, 1));
      pools.current!.setMatrixAt(i, m);
    });
    pools.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      <instancedMesh ref={posts} args={[GEO.cylLow, mat(C.steelDark), LAMPS.length]} castShadow />
      <instancedMesh ref={heads} args={[GEO.box, GLOW.lamp, LAMPS.length]} />
      <instancedMesh ref={pools} args={[planeGeo, GLOW.pool, LAMPS.length]} renderOrder={3} raycast={noRaycast} />
    </group>
  );
}

// ── Buildings ────────────────────────────────────────────────────────────────

/** Strip of windows that glow at night. */
function Windows({ p, w, h, along = "x" }: { p: [number, number, number]; w: number; h: number; along?: "x" | "z" }) {
  return <Box p={p} s={along === "x" ? [w, h, 0.08] : [0.08, h, w]} m={GLOW.window} shadow={false} />;
}

/** Open process hall: back + side walls, columns and roof trusses, no roof so the line stays visible. */
export function Hall() {
  const { minX, maxX, minZ, maxZ } = HALL;
  const cols: number[] = [];
  for (let x = minX; x <= maxX + 0.01; x += 7) cols.push(x);
  const H = 7.5;
  return (
    <group>
      <Block p={[(minX + maxX) / 2, minZ - 0.3]} s={[maxX - minX + 0.6, H, 0.6]} c={C.wall} />
      <Windows p={[(minX + maxX) / 2, 5.4, minZ + 0.05]} w={maxX - minX - 6} h={1.2} />
      <Block p={[minX - 0.3, (minZ + maxZ) / 2]} s={[0.6, H, maxZ - minZ]} c={C.wallShade} />
      <Block p={[(minX + maxX) / 2, minZ - 0.3]} s={[maxX - minX + 1.2, 0.5, 1]} base={H} c={C.teal} />
      {cols.map((x) => (
        <group key={x}>
          <Block p={[x, maxZ]} s={[0.34, H, 0.34]} c={C.teal} bevel={0.06} />
          <Block p={[x, minZ + 0.4]} s={[0.34, H, 0.34]} c={C.teal} bevel={0.06} />
          {/* Slim, light trusses so the line inside reads clearly from above */}
          <Box p={[x, H + 0.25, (minZ + maxZ) / 2]} s={[0.16, 0.2, maxZ - minZ]} c={C.steel} shadow={false} raycast={noRaycast} />
        </group>
      ))}
      <Box p={[(minX + maxX) / 2, H + 0.25, maxZ]} s={[maxX - minX, 0.32, 0.26]} c={C.teal} />
      {/* Warm work lights under the trusses (glow at night) */}
      {cols.slice(0, -1).map((x) => (
        <Box key={`l${x}`} p={[x + 3.5, H - 0.3, LINE_Z]} s={[2.4, 0.12, 0.35]} m={GLOW.lamp} shadow={false} />
      ))}
      <HallRoof H={H} />
      {/* Floor walkway markings */}
      <Box p={[(minX + maxX) / 2, 0.12, -10.5]} s={[maxX - minX - 4, 0.02, 0.18]} c={C.forklift} shadow={false} />
      <Box p={[(minX + maxX) / 2, 0.12, -21.5]} s={[maxX - minX - 4, 0.02, 0.18]} c={C.forklift} shadow={false} />
    </group>
  );
}

function Office() {
  return (
    <group>
      <Blob p={[53, 15]} w={18} d={12} o={0.45} />
      <Block p={[53, 15]} s={[13, 6, 8]} c={C.wall} />
      <Block p={[53, 15]} s={[13.6, 0.5, 8.6]} base={6} c={C.teal} />
      <Windows p={[53, 4.3, 19.05]} w={11} h={1.1} />
      <Windows p={[53, 1.8, 19.05]} w={7} h={1.1} />
      <Block p={[59.4, 19.1]} s={[1.6, 2.6, 0.15]} c={C.tealDeep} />
      {/* Abstract loop mark on the parapet (brand, no words) */}
      <mesh position={[49, 6.9, 19.2]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.7, 0.18, 8, 24]} />
        <meshStandardMaterial color={C.mint} flatShading />
      </mesh>
    </group>
  );
}

// ── Process equipment ────────────────────────────────────────────────────────

const hopperGeo = new THREE.CylinderGeometry(1.5, 0.7, 1.4, 4, 1);
function Hopper({ p, scale = 1, c = C.steel }: { p: [number, number, number]; scale?: number; c?: string }) {
  return <mesh geometry={hopperGeo} material={mat(c)} position={p} scale={scale} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow />;
}

function Legs({ x0, x1, z, y, w = 1.6 }: { x0: number; x1: number; z: number; y: number; w?: number }) {
  const xs = [x0, (x0 + x1) / 2, x1];
  return (
    <>
      {xs.flatMap((x) =>
        [-w / 2, w / 2].map((dz) => <Box key={`${x}-${dz}`} p={[x, y / 2, z + dz]} s={[0.15, y, 0.15]} c={C.steelDark} shadow={false} />),
      )}
    </>
  );
}

function Worker({ p, c = C.forklift }: { p: [number, number]; c?: string }) {
  return (
    <group position={[p[0], 0, p[1]]}>
      <Cyl p={[0, 0.45, 0]} rad={0.2} h={0.9} c={C.ink} low />
      <Cyl p={[0, 1.2, 0]} rad={0.28} h={0.7} c={c} low />
      <mesh geometry={GEO.sphere} material={mat("#d7b9a0")} position={[0, 1.75, 0]} scale={0.2} castShadow />
    </group>
  );
}

function Sorting() {
  const z = LINE_Z;
  return (
    <Pick id="sorting">
      <Blob p={[12, z]} w={16} d={6} />
      <Hopper p={[19, 2, z]} scale={1.1} c={C.sand} />
      <Block p={[19, z]} s={[2, 1.3, 2]} c={C.sandDark} />
      <Legs x0={7} x1={17.5} z={z} y={0.95} />
      <Box p={[12.2, 0.98, z]} s={[11.6, 0.18, 1.9]} c={C.steel} />
      <Box p={[12.2, 1.08, z]} s={[11.4, 0.04, 1.45]} c={C.ink} shadow={false} />
      {/* Picking cabin frame */}
      {[7.5, 17].map((x) =>
        [-1.3, 1.3].map((dz) => <Box key={`${x}${dz}`} p={[x, 1.9, z + dz]} s={[0.12, 3.8, 0.12]} c={C.teal} />),
      )}
      <Box p={[12.2, 3.8, z]} s={[9.9, 0.15, 2.9]} c={C.teal} />
      {[9, 11.5, 14, 16.2].map((x, i) => (
        <Worker key={x} p={[x, z + (i % 2 ? 1.75 : -1.75)]} c={i % 2 ? C.forklift : C.mint} />
      ))}
      {/* Reject bins either side */}
      <Block p={[9.5, z + 3]} s={[1.6, 0.9, 1.1]} c={C.sandDark} />
      <Block p={[14.5, z - 3]} s={[1.6, 0.9, 1.1]} c={C.sandDark} />
      <Beacon unit="sorting" p={[17, 4, z - 1.3]} />
    </Pick>
  );
}

function Shredder() {
  const z = LINE_Z;
  const fly = useSpin("shredder", "z", 6);
  return (
    <Pick id="shredder">
      <Blob p={[0, z]} w={6} d={6} />
      <Block p={[0, z]} s={[3.2, 1.2, 3.2]} c={C.steelDark} />
      <Block p={[0, z]} s={[2.6, 1.9, 2.6]} base={1.2} c={C.teal} />
      <Hopper p={[0, 3.8, z]} scale={1.05} />
      <Block p={[0, z + 2.2]} s={[1.4, 1.2, 1.2]} c={C.mint} />
      <group ref={fly} position={[1.5, 2.1, z + 0.4]}>
        <Cyl p={[0, 0, 0]} rad={0.75} h={0.25} c={C.ink} rot={[0, 0, Math.PI / 2]} />
        <Box p={[0, 0, 0]} s={[0.3, 1.3, 0.15]} c={C.forklift} shadow={false} />
      </group>
      <Beacon unit="shredder" p={[-1, 3.1, z - 1]} />
    </Pick>
  );
}

function Wash() {
  const z = LINE_Z;
  const paddles = useSpin("wash", "x", 3);
  return (
    <Pick id="wash">
      <Blob p={[-14, z]} w={14} d={7} />
      {/* Float–sink tank */}
      <Block p={[-14.5, z]} s={[8, 1.5, 3]} c={C.teal} />
      <Box p={[-14.5, 1.52, z]} s={[7.6, 0.05, 2.6]} c={C.water} shadow={false} />
      <group ref={paddles} position={[-14.5, 1.8, z]}>
        {[0, 1, 2, 3].map((i) => (
          <Box key={i} p={[0, 0, 0]} s={[7.2, 0.12, 1.1]} r={[(i * Math.PI) / 4, 0, 0]} c={C.steel} shadow={false} />
        ))}
      </group>
      {/* Friction washer (inclined) */}
      <Cyl p={[-9.5, 1.7, z]} rad={0.55} h={4} c={C.steel} rot={[0, 0, Math.PI / 2 - 0.35]} />
      <Block p={[-11, z - 2.5]} s={[1.6, 2.2, 1.2]} c={C.mint} />
      {/* Hot-wash tank */}
      <Cyl p={[-19.5, 1.4, z - 2.4]} rad={1.1} h={2.8} c={C.steel} />
      <Beacon unit="wash" p={[-18, 1.5, z + 1.2]} />
    </Pick>
  );
}

function Dryer() {
  const z = LINE_Z;
  const drum = useSpin("dryer", "x", 4);
  return (
    <Pick id="dryer">
      <Blob p={[-27, z]} w={7} d={6} />
      <Block p={[-27, z]} s={[4.2, 1, 2.4]} c={C.steelDark} />
      <group ref={drum} position={[-27, 2, z]}>
        <Cyl p={[0, 0, 0]} rad={1.05} h={4} c={C.sand} rot={[0, 0, Math.PI / 2]} />
        <Box p={[0, 0, 0]} s={[4.05, 0.3, 2.15]} c={C.sandDark} shadow={false} />
      </group>
      {/* Cyclone */}
      <Cyl p={[-27.5, 5, z - 2.4]} rad={0.8} h={1.6} c={C.steel} />
      <mesh geometry={GEO.cone} material={mat(C.steel)} position={[-27.5, 3.6, z - 2.4]} scale={[0.8, 1.3, 0.8]} rotation={[Math.PI, 0, 0]} castShadow />
      <Box p={[-27.5, 1.5, z - 2.4]} s={[0.12, 3, 0.12]} c={C.steelDark} shadow={false} />
      <Box p={[-27.2, 4.4, z - 1.2]} s={[0.35, 0.35, 2.2]} c={C.steelDark} />
      <Beacon unit="dryer" p={[-25.3, 3, z + 0.8]} />
    </Pick>
  );
}

function Silo() {
  const { x, z } = SPOTS.silo;
  return (
    <Pick id="silo">
      <Blob p={[x, z]} w={6} d={6} />
      {[-1, 1].flatMap((dx) => [-1, 1].map((dz) => <Box key={`${dx}${dz}`} p={[x + dx * 1.3, 1.4, z + dz * 1.3]} s={[0.2, 2.8, 0.2]} c={C.steelDark} />))}
      <mesh geometry={GEO.cone} material={mat(C.steel)} position={[x, 2.6, z]} scale={[2, 1.4, 2]} rotation={[Math.PI, 0, 0]} castShadow />
      <Cyl p={[x, 6.4, z]} rad={2} h={6.2} c={C.paper} />
      <mesh geometry={GEO.cone} material={mat(C.teal)} position={[x, 10.1, z]} scale={[2.1, 1.2, 2.1]} castShadow />
    </Pick>
  );
}

function Extruder() {
  const z = LINE_Z;
  const fan = useSpin("extruder", "x", 10);
  return (
    <Pick id="extruder">
      <Blob p={[-44, z]} w={12} d={5} />
      <Block p={[-44, z]} s={[9.5, 1, 2]} c={C.steelDark} />
      <Block p={[-40.2, z]} s={[2.4, 1.6, 2.2]} base={1} c={C.teal} />
      <group ref={fan} position={[-38.9, 1.8, z]}>
        <Cyl p={[0, 0, 0]} rad={0.6} h={0.2} c={C.mint} rot={[0, 0, Math.PI / 2]} />
        <Box p={[0, 0, 0]} s={[0.22, 1, 0.12]} c={C.ink} shadow={false} />
      </group>
      <Cyl p={[-45, 1.6, z]} rad={0.42} h={6} c={C.steel} rot={[0, 0, Math.PI / 2]} />
      {[-43, -44.4, -45.8, -47.2].map((x) => (
        <Cyl key={x} p={[x, 1.6, z]} rad={0.52} h={0.5} c={C.forklift} rot={[0, 0, Math.PI / 2]} />
      ))}
      <Hopper p={[-41.8, 3.4, z]} scale={0.7} />
      <Box p={[-48.3, 1.6, z]} s={[0.6, 1, 1]} c={C.tealDeep} />
      <Beacon unit="extruder" p={[-40.2, 2.6, z - 0.6]} />
    </Pick>
  );
}

function Pelletizer() {
  const z = LINE_Z;
  const cutter = useSpin("pelletizer", "z", 14);
  return (
    <Pick id="pelletizer">
      <Blob p={[-55, z]} w={6} d={6} />
      <Block p={[-51, z]} s={[3.6, 0.9, 1.3]} c={C.teal} />
      <Box p={[-51, 0.92, z]} s={[3.4, 0.04, 1.1]} c={C.water} shadow={false} />
      <Block p={[-55.5, z]} s={[2.6, 2.4, 2.4]} c={C.mint} />
      <group ref={cutter} position={[-55.5, 1.5, z + 1.25]}>
        <Cyl p={[0, 0, 0]} rad={0.6} h={0.15} c={C.steelDark} rot={[Math.PI / 2, 0, 0]} />
        <Box p={[0, 0, 0.05]} s={[1.1, 0.15, 0.1]} c={C.ink} shadow={false} />
      </group>
      <Beacon unit="pelletizer" p={[-56.2, 2.4, z - 0.6]} />
    </Pick>
  );
}

function QcLab() {
  const { x, z } = SPOTS.qc;
  return (
    <Pick id="qc">
      <Blob p={[x, z]} w={12} d={10} />
      <Block p={[x, z]} s={[8, 4, 6.5]} c={C.wall} />
      <Block p={[x, z]} s={[8.6, 0.4, 7.1]} base={4} c={C.teal} />
      <Windows p={[x, 2.2, z + 3.3]} w={6.4} h={1.6} />
      <Windows p={[x + 4.05, 2.2, z]} w={4} h={1.6} along="z" />
      {/* Sample silos (QC hold) */}
      <Cyl p={[x + 5.6, 1.4, z - 1.6]} rad={0.8} h={2.8} c={C.paper} />
      <Cyl p={[x + 5.6, 1.4, z + 0.4]} rad={0.8} h={2.8} c={C.paper} />
      <Beacon unit="qc" p={[x - 2.5, 4.2, z]} />
    </Pick>
  );
}

function Packing() {
  const { x, z } = SPOTS.packing;
  return (
    <Pick id="packing">
      <Blob p={[x, z]} w={7} d={6} />
      {[-1, 1].flatMap((dx) => [-1, 1].map((dz) => <Box key={`${dx}${dz}`} p={[x + dx, 2.2, z + dz]} s={[0.15, 4.4, 0.15]} c={C.teal} />))}
      <Hopper p={[x, 4.6, z]} scale={0.8} />
      <Box p={[x, 3.3, z]} s={[0.4, 1, 0.4]} c={C.steelDark} />
      <Box p={[x, 0.1, z]} s={[2.2, 0.2, 2.2]} c={C.steelDark} />
      <PackingBag x={x} z={z} />
      {/* Pallet waiting for the forklift */}
      <Box p={[x + 3.2, 0.1, z + 2.4]} s={[1.3, 0.2, 1.3]} c={C.trunk} />
      <Beacon unit="packing" p={[x - 1, 4.6, z - 1]} />
    </Pick>
  );
}

/** The bag under the spout grows as pellets are packed (one bag = bag_kg). */
function PackingBag({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const sim = useSimStore.getState().sim;
    if (!ref.current || !sim) return;
    const kg = sim.state.units.packing.processedKg;
    const f = kg > 0 ? ((kg % sim.params.bagKg) / sim.params.bagKg) * 0.85 + 0.15 : 0.15;
    ref.current.scale.set(0.95, 1.6 * f, 0.7);
    ref.current.position.y = 0.2 + (1.6 * f) / 2;
  });
  return <mesh ref={ref} geometry={GEO.box} material={mat(C.paper)} position={[x, 1, z]} castShadow />;
}

function FinishedGoodsStore() {
  const { minX, maxX, minZ, maxZ } = FG_STORE;
  const cx = (minX + maxX) / 2;
  const H = 6.5;
  return (
    <Pick id="finishedGoods">
      <Blob p={[cx, (minZ + maxZ) / 2]} w={28} d={18} o={0.35} />
      <Box p={[cx, 0.12, (minZ + maxZ) / 2]} s={[maxX - minX, 0.24, maxZ - minZ]} c={C.concreteDark} shadow={false} />
      <Block p={[cx, minZ - 0.25]} s={[maxX - minX, H, 0.5]} c={C.wall} />
      <Windows p={[cx, 5.2, minZ]} w={maxX - minX - 4} h={0.8} />
      <Block p={[minX - 0.25, (minZ + maxZ) / 2]} s={[0.5, H, maxZ - minZ]} c={C.wallShade} />
      {[minX, cx, maxX].map((x) => (
        <group key={x}>
          <Block p={[x, maxZ]} s={[0.4, H, 0.4]} c={C.tealDeep} />
          <Box p={[x, H + 0.15, (minZ + maxZ) / 2]} s={[0.3, 0.3, maxZ - minZ]} c={C.tealDeep} />
        </group>
      ))}
      <Box p={[cx, H + 0.15, maxZ]} s={[maxX - minX, 0.3, 0.3]} c={C.tealDeep} />
      <Box p={[cx, H + 0.4, minZ + 0.3]} s={[maxX - minX + 0.6, 0.4, 1.2]} c={C.teal} />
      {/* Loading dock lip */}
      <Box p={[-20, 0.5, maxZ + 1]} s={[6, 1, 2]} c={C.concreteDark} />
      <Box p={[-20, 1.02, maxZ + 1.9]} s={[6, 0.06, 0.25]} c={C.forklift} shadow={false} />
    </Pick>
  );
}

function Weighbridge() {
  const { x, z } = SPOTS.weighbridge;
  return (
    <Pick id="weighbridge">
      <Box p={[x, 0.14, z]} s={[3.8, 0.24, 15]} c={C.steelDark} />
      <Box p={[x - 1.95, 0.3, z]} s={[0.12, 0.1, 15]} c={C.forklift} shadow={false} />
      <Box p={[x + 1.95, 0.3, z]} s={[0.12, 0.1, 15]} c={C.forklift} shadow={false} />
      <Blob p={[x - 5.5, z + 4]} w={6} d={5} />
      <Block p={[x - 5.5, z + 4]} s={[3.2, 2.8, 2.6]} c={C.wall} />
      <Block p={[x - 5.5, z + 4]} s={[3.6, 0.3, 3]} base={2.8} c={C.teal} />
      <Windows p={[x - 3.85, 1.7, z + 4]} w={1.8} h={1} along="z" />
    </Pick>
  );
}

function BaleYardZone() {
  return (
    <Pick id="baleYard">
      {/* Invisible-ish hit area so the whole yard is clickable */}
      <Box p={[22, 0.15, 9]} s={[16, 0.1, 18]} c={C.concreteDark} shadow={false} />
    </Pick>
  );
}

function DockZone() {
  return (
    <Pick id="dock">
      <Box p={[-20, 0.1, 22]} s={[7, 0.06, 9]} c={C.asphalt} shadow={false} />
      {[-23.5, -16.5].map((x) => (
        <Box key={x} p={[x, 0.14, 22]} s={[0.18, 0.02, 9]} c={C.marking} shadow={false} />
      ))}
    </Pick>
  );
}

// ── Roof, solar, site extras ────────────────────────────────────────────────

const glassRoof = new THREE.MeshStandardMaterial({ color: C.glass, transparent: true, opacity: 0.17, roughness: 0.12, metalness: 0.15, depthWrite: false });
const ROOF_STRIP = 4.6; // solid back strip of the hall roof that carries the solar panels

/** Solar panel positions (hall back strip + office roof), tilted to face south. */
const SOLAR: [number, number, number][] = (() => {
  const out: [number, number, number][] = [];
  for (let x = HALL.minX + 1.4; x <= HALL.maxX - 1.2; x += 1.95) {
    if (Math.abs(x - SPOTS.silo.x) < 3.2) continue;
    for (const dz of [1.25, 3.3]) out.push([x, 8.3, HALL.minZ + dz]);
  }
  for (let x = 48; x <= 58.1; x += 1.95) for (const z of [13.2, 15.6]) out.push([x, 6.8, z]);
  return out;
})();

function SolarPanels() {
  const panels = useRef<THREE.InstancedMesh>(null);
  const frames = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.22, 0, 0));
    SOLAR.forEach(([x, y, z], i) => {
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1.72, 0.07, 1.62));
      panels.current!.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(x, y - 0.05, z), q, new THREE.Vector3(1.84, 0.06, 1.74));
      frames.current!.setMatrixAt(i, m);
    });
    panels.current!.instanceMatrix.needsUpdate = true;
    frames.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      <instancedMesh ref={frames} args={[GEO.box, mat(C.solarFrame), SOLAR.length]} receiveShadow />
      <instancedMesh ref={panels} args={[GEO.box, mat(C.solar, { rough: 0.32, metal: 0.35 }), SOLAR.length]} castShadow />
    </group>
  );
}

/** Cutaway roof: a solid back strip carrying solar panels, frosted glass over the line so every machine stays visible. */
function HallRoof({ H }: { H: number }) {
  const { minX, maxX, minZ, maxZ } = HALL;
  const cx = (minX + maxX) / 2;
  const g0 = minZ + ROOF_STRIP;

  return (
    <group>
      <Box p={[cx, H + 0.55, minZ + ROOF_STRIP / 2 - 0.3]} s={[maxX - minX + 1.2, 0.3, ROOF_STRIP + 0.6]} c={C.wallShade} bevel={0.1} />
      <mesh geometry={GEO.box} material={glassRoof} position={[cx, H + 0.5, (g0 + maxZ) / 2]} scale={[maxX - minX, 0.06, maxZ - g0]} raycast={noRaycast} renderOrder={4} />

      <SolarPanels />
    </group>
  );
}

function GuardCabin() {
  return (
    <group>
      <Blob p={[31.5, 26]} w={5} d={5} o={0.4} />
      <Block p={[31.5, 26]} s={[2.8, 2.6, 2.6]} c={C.wall} />
      <Block p={[31.5, 26]} s={[3.4, 0.3, 3.2]} base={2.6} c={C.teal} />
      <Windows p={[31.5, 1.7, 27.35]} w={2} h={0.9} />
      <Windows p={[32.95, 1.7, 26]} w={1.6} h={0.9} along="z" />
    </group>
  );
}

/** Brand totem at the gate: deep-teal slab with the mint loop mark (no words). */
function Totem() {
  return (
    <group>
      <Block p={[29.5, 32.2]} s={[1.4, 4.4, 0.5]} c={C.tealDeep} />
      <mesh position={[29.5, 3.3, 32.5]}>
        <torusGeometry args={[0.42, 0.11, 8, 24]} />
        <meshStandardMaterial color={C.mint} flatShading emissive={C.mint} emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

function Car({ x, z, c }: { x: number; z: number; c: string }) {
  return (
    <group position={[x, 0, z]} rotation={[0, Math.PI / 2, 0]}>
      <Blob p={[0, 0]} w={5} d={3} o={0.45} />
      <Box p={[0, 0.62, 0]} s={[3.7, 0.75, 1.7]} c={c} bevel={0.28} />
      <Box p={[-0.2, 1.22, 0]} s={[2, 0.62, 1.48]} c="#d9e9ee" bevel={0.22} />
      {[1.15, -1.15].flatMap((wx) => [-0.78, 0.78].map((wz) => <Cyl key={`${wx}${wz}`} p={[wx, 0.34, wz]} rad={0.34} h={0.24} c={C.ink} rot={[Math.PI / 2, 0, 0]} low shadow={false} />))}
    </group>
  );
}

function CarPark() {
  const { minX, maxX, minZ, maxZ } = CAR_PARK;
  const bays: number[] = [];
  for (let x = minX + 0.5; x <= maxX; x += 3) bays.push(x);
  return (
    <group>
      <Box p={[(minX + maxX) / 2, 0.07, (minZ + maxZ) / 2]} s={[maxX - minX, 0.06, maxZ - minZ]} c={C.asphalt} shadow={false} />
      {bays.map((x) => (
        <Box key={x} p={[x, 0.12, minZ + 2.6]} s={[0.12, 0.02, 4.6]} c={C.marking} shadow={false} />
      ))}
      {CARS.map((car, i) => (
        <Car key={i} x={car.x} z={car.z - 1} c={C.car[car.c % C.car.length]} />
      ))}
    </group>
  );
}

const AERATION_Z = [-25.6, -30.4];

/** Air bubbles rising in the aeration tanks while the wash line (and so the ETP) runs. */
function Bubbles() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const pts = useMemo(() => Array.from({ length: 36 }, (_, i) => ({ x: 33.5 + (i % 9) * 1.1, z: AERATION_Z[i < 18 ? 0 : 1] + ((i * 7) % 3) - 1, ph: i * 0.37 })), []);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), sc: new THREE.Vector3() }), []);
  const t = useRef(0);
  useFrame((_, dt) => {
    const { sim, playing, speed } = useSimStore.getState();
    if (!sim || !ref.current) return;
    const on = sim.state.units.wash.status === "running";
    t.current += animDt(Math.min(dt, 0.1), playing, speed);
    pts.forEach((b, i) => {
      const k = (t.current * 0.8 + b.ph) % 1;
      tmp.p.set(b.x, 1.5 + k * 0.25, b.z);
      tmp.sc.setScalar(on ? 0.12 + 0.1 * Math.sin(k * Math.PI) : 0);
      tmp.m.compose(tmp.p, tmp.q, tmp.sc);
      ref.current!.setMatrixAt(i, tmp.m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[GEO.sphere, mat("#f4fbfa"), pts.length]} frustumCulled={false} />;
}

/** Effluent treatment: wash water is equalised, aerated, settled and sent back to the line. */
function Etp() {
  const { minX, maxX, minZ, maxZ } = ETP;
  const arm = useSpin("wash", "y", 0.35);
  return (
    <Pick id="etp">
      <Box p={[(minX + maxX) / 2, 0.06, (minZ + maxZ) / 2]} s={[maxX - minX, 0.1, maxZ - minZ]} c={C.concreteDark} shadow={false} />
      {/* Equalisation tank */}
      <Blob p={[27, -27]} w={9} d={9} o={0.4} />
      <Block p={[27, -27]} s={[6, 1.8, 6]} c={C.teal} />
      <Box p={[27, 1.79, -27]} s={[5.3, 0.05, 5.3]} c={C.sludge} shadow={false} />
      {/* Aeration tanks */}
      {AERATION_Z.map((z) => (
        <group key={z}>
          <Blob p={[38, z]} w={13} d={6} o={0.35} />
          <Block p={[38, z]} s={[10, 1.5, 4]} c={C.sand} />
          <Box p={[38, 1.49, z]} s={[9.3, 0.05, 3.3]} c="#a6d9cf" shadow={false} />
        </group>
      ))}
      <Bubbles />
      {/* Clarifier with its slowly turning bridge */}
      <Blob p={[28, -36.5]} w={11} d={11} o={0.4} />
      <Cyl p={[28, 0.8, -36.5]} rad={4} h={1.6} c={C.paper} />
      <Cyl p={[28, 1.6, -36.5]} rad={3.65} h={0.05} c={C.water} shadow={false} />
      <Cyl p={[28, 1.4, -36.5]} rad={0.45} h={2.8} c={C.steelDark} />
      <group ref={arm} position={[28, 2.2, -36.5]}>
        <Box p={[1.9, 0, 0]} s={[4.1, 0.22, 0.6]} c={C.forklift} />
        <Box p={[3.8, 0.35, 0]} s={[0.6, 0.6, 0.9]} c={C.teal} bevel={0.08} />
      </group>
      {/* Pump house */}
      <Block p={[39, -37.5]} s={[3.4, 2.4, 2.4]} c={C.wall} />
      <Block p={[39, -37.5]} s={[3.9, 0.3, 2.9]} base={2.4} c={C.teal} />
      <Windows p={[39, 1.4, -36.25]} w={2} h={0.8} />
      <Beacon unit="wash" p={[40.2, 2.7, -37.5]} />
      {/* Pipe from the wash line, along the hall's east end */}
      <Box p={[21.5, 3.2, -23]} s={[5, 0.3, 0.3]} c={C.steelDark} />
      <Box p={[24, 2.5, -23]} s={[0.3, 1.6, 0.3]} c={C.steelDark} />
      <Box p={[22, 2.7, -31.5]} s={[0.24, 0.24, 15]} c={C.mint} />
      {[19.5, 22.5].map((x) => (
        <Box key={x} p={[x, 1.55, -23]} s={[0.16, 3.1, 0.16]} c={C.steelDark} shadow={false} />
      ))}
      {[-26, -31, -36].map((z) => (
        <Box key={z} p={[22, 1.3, z]} s={[0.14, 2.6, 0.14]} c={C.steelDark} shadow={false} />
      ))}
    </Pick>
  );
}

/** Everything that never moves (apart from spinning parts and lights). */
export function StaticPlant() {
  return (
    <group>
      <Ground />
      <Hall />
      <Etp />
      <Office />
      <Weighbridge />
      <BaleYardZone />
      <DockZone />
      <Sorting />
      <Shredder />
      <Wash />
      <Dryer />
      <Silo />
      <Extruder />
      <Pelletizer />
      <QcLab />
      <Packing />
      <FinishedGoodsStore />
    </group>
  );
}
