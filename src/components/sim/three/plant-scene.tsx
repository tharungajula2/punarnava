"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useSimStore } from "../sim-store";
import { useSceneStore, type CameraCmd } from "./camera-store";
import { Bales, Bins, Conveyors, DayNight, FinishedBags, Forklifts, Selection, Trucks } from "./live";
import { StaticPlant } from "./models";

// True isometric view: 45° around, ~35° down.
const HOME_TARGET = new THREE.Vector3(-8, 0, 2);
const ISO_EL = Math.atan(1 / Math.SQRT2);
const DIST = 220;
const HOME_OFFSET = new THREE.Vector3(Math.cos(ISO_EL) * Math.SQRT1_2, Math.sin(ISO_EL), Math.cos(ISO_EL) * Math.SQRT1_2).multiplyScalar(DIST);

// Room taken by the glass overlays (top KPI strip, bottom panels), in px.
const OVERLAY_TOP = 70;
const OVERLAY_BOTTOM = 175;

function fitZoom(w: number, h: number) {
  return Math.max(2, Math.min(w / 155, (h - OVERLAY_TOP - OVERLAY_BOTTOM) / 82));
}

/** Home target shifted so the plant sits in the free space between overlays. */
function homeTarget(zoom: number) {
  const px = (OVERLAY_BOTTOM - OVERLAY_TOP) / 2;
  const d = px / zoom / Math.sin(ISO_EL);
  return HOME_TARGET.clone().add(new THREE.Vector3(Math.SQRT1_2, 0, Math.SQRT1_2).multiplyScalar(d));
}

/** Smooth camera moves for the overlay buttons (zoom, rotate, reset, focus). Commands are queued and applied in the frame loop. */
function CameraRig() {
  const cmd = useSceneStore((s) => s.cmd);
  const focus = useSceneStore((s) => s.focus);
  const queue = useRef<({ kind: CameraCmd } | { kind: "focus"; x: number; z: number } | { kind: "fit" })[]>([{ kind: "fit" }]);
  const tween = useRef<{ rot: number; zoom: number | null; target: THREE.Vector3 | null; offset: THREE.Vector3 | null }>({ rot: 0, zoom: null, target: null, offset: null });

  useEffect(() => {
    if (cmd) queue.current.push({ kind: cmd.kind });
  }, [cmd]);
  useEffect(() => {
    if (focus) queue.current.push({ kind: "focus", x: focus.x, z: focus.z });
  }, [focus]);

  useFrame((state, dt) => {
    const camera = state.camera as THREE.OrthographicCamera;
    const controls = state.controls as unknown as OrbitControlsImpl | null;
    if (!controls) return;
    const t = tween.current;
    const fit = fitZoom(state.size.width, state.size.height);
    for (const c of queue.current.splice(0)) {
      if (c.kind === "fit") {
        camera.zoom = fit;
        camera.updateProjectionMatrix();
        const home = homeTarget(fit);
        camera.position.copy(home).add(HOME_OFFSET);
        controls.target.copy(home);
        controls.update();
      }
      if (c.kind === "zoomIn") t.zoom = Math.min(fit * 6, (t.zoom ?? camera.zoom) * 1.35);
      if (c.kind === "zoomOut") t.zoom = Math.max(fit * 0.6, (t.zoom ?? camera.zoom) / 1.35);
      if (c.kind === "rotateLeft") t.rot += Math.PI / 4;
      if (c.kind === "rotateRight") t.rot -= Math.PI / 4;
      if (c.kind === "reset") {
        t.rot = 0;
        t.zoom = fit;
        t.target = homeTarget(fit);
        t.offset = HOME_OFFSET.clone();
      }
      if (c.kind === "focus") {
        t.target = new THREE.Vector3(c.x, 0, c.z);
        t.zoom = Math.max(camera.zoom, fit * 2.2);
      }
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const k = reduced ? 1 : Math.min(1, dt * 6);
    const target = controls.target;
    let moved = false;
    if (Math.abs(t.rot) > 1e-4) {
      const step = Math.abs(t.rot) < 1e-3 ? t.rot : t.rot * k;
      const off = camera.position.clone().sub(target).applyAxisAngle(THREE.Object3D.DEFAULT_UP, step);
      camera.position.copy(target).add(off);
      t.rot -= step;
      moved = true;
    }
    if (t.zoom !== null) {
      camera.zoom += (t.zoom - camera.zoom) * k;
      if (Math.abs(t.zoom - camera.zoom) < 0.01) t.zoom = null;
      camera.updateProjectionMatrix();
      moved = true;
    }
    if (t.target) {
      const delta = t.target.clone().sub(target).multiplyScalar(k);
      target.add(delta);
      camera.position.add(delta);
      if (t.target.distanceTo(target) < 0.05) t.target = null;
      moved = true;
    }
    if (t.offset) {
      const off = camera.position.clone().sub(target).lerp(t.offset, k).setLength(DIST);
      camera.position.copy(target).add(off);
      if (off.distanceTo(t.offset) < 0.05) t.offset = null;
      moved = true;
    }
    if (moved) controls.update();
  });
  return null;
}

/** The whole 3D plant. Loaded lazily (client only) so three.js never touches the server or 2D users. */
export default function PlantScene() {
  const select = useSimStore((s) => s.select);
  return (
    <Canvas
      orthographic
      shadows
      dpr={[1, 1.75]}
      camera={{ position: HOME_TARGET.clone().add(HOME_OFFSET).toArray(), zoom: 6, near: 1, far: 1000 }}
      gl={{ antialias: true, toneMapping: THREE.NeutralToneMapping }}
      onPointerMissed={() => select(null)}
      aria-label="3D view of the plant"
    >
      <DayNight />
      <StaticPlant />
      <Conveyors />
      <Bins />
      <Bales />
      <FinishedBags />
      <Forklifts />
      <Trucks />
      <Selection />
      <OrbitControls
        makeDefault
        target={HOME_TARGET.toArray()}
        enableDamping
        dampingFactor={0.1}
        screenSpacePanning={false}
        minPolarAngle={0.25}
        maxPolarAngle={1.2}
        minZoom={2}
        maxZoom={60}
        mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
        touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE }}
      />
      <CameraRig />
    </Canvas>
  );
}
