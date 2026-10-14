"use client";

import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useSimStore } from "../sim-store";
import { useSceneStore, type CameraCmd, type Shot } from "./camera-store";
import { Bales, Bins, Conveyors, DayNight, FinishedBags, Forklifts, Selection, Trucks } from "./live";
import { StaticPlant } from "./models";

// True isometric view: 45° around, ~35° down.
const HOME_TARGET = new THREE.Vector3(-8, 0, 2);
const ISO_EL = Math.atan(1 / Math.SQRT2);
const HOME_AZ = Math.PI / 4;
const DIST = 220;

/**
 * Room taken by the glass overlays, in px: top = KPI + control rows (8.25rem), bottom = tracker/tabs
 * (11.1rem) plus the stage's --hud-b lift (presenter bar). rem scales with presentation mode's larger type.
 */
let overlays = { top: 132, bottom: 178 };
function measureOverlays(canvas: HTMLCanvasElement) {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const stage = canvas.closest(".sim-stage") as HTMLElement | null;
  const lift = stage ? parseFloat(stage.style.getPropertyValue("--hud-b")) || 0.75 : 0.75;
  overlays = { top: 8.25 * rem, bottom: (10.35 + lift) * rem };
}

/** Zoom at which the whole site fits the free space between overlays (or the full canvas in cinematic mode). */
function fitZoom(w: number, h: number, full = false) {
  if (full) return Math.max(2, Math.min(w / 150, h / 80));
  return Math.max(2, Math.min(w / 160, (h - overlays.top - overlays.bottom) / 76));
}

/** Home target shifted so the plant sits in the free space between overlays. */
function homeTarget(zoom: number) {
  const px = (overlays.bottom - overlays.top) / 2;
  const d = px / zoom / Math.sin(ISO_EL);
  return HOME_TARGET.clone().add(new THREE.Vector3(Math.SQRT1_2, 0, Math.SQRT1_2).multiplyScalar(d));
}

interface Pose {
  target: THREE.Vector3;
  zoom: number;
  az: number;
  el: number;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

function readPose(camera: THREE.OrthographicCamera, controls: OrbitControlsImpl): Pose {
  const off = camera.position.clone().sub(controls.target);
  return { target: controls.target.clone(), zoom: camera.zoom, az: Math.atan2(off.x, off.z), el: Math.asin(THREE.MathUtils.clamp(off.y / off.length(), -1, 1)) };
}

function applyPose(p: Pose, camera: THREE.OrthographicCamera, controls: OrbitControlsImpl) {
  const off = new THREE.Vector3(Math.sin(p.az) * Math.cos(p.el), Math.sin(p.el), Math.cos(p.az) * Math.cos(p.el)).multiplyScalar(DIST);
  controls.target.copy(p.target);
  camera.position.copy(p.target).add(off);
  camera.zoom = p.zoom;
  camera.updateProjectionMatrix();
  controls.update();
}

type Cmd = { kind: CameraCmd } | { kind: "focus"; x: number; z: number } | { kind: "shot"; shot: Shot } | { kind: "fit" };

/**
 * Every camera move is an eased flight between two poses: overlay buttons, "fly to" from the lists,
 * guided-tour shots and the cinematic orbit. Grabbing the scene cancels a flight.
 */
function CameraRig() {
  const cmd = useSceneStore((s) => s.cmd);
  const focus = useSceneStore((s) => s.focus);
  const shot = useSceneStore((s) => s.shot);
  const mode = useSceneStore((s) => s.mode);
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const queue = useRef<Cmd[]>([{ kind: "fit" }]);
  const fly = useRef<{ from: Pose; to: Pose; t: number; dur: number } | null>(null);

  useEffect(() => {
    if (cmd) queue.current.push({ kind: cmd.kind });
  }, [cmd]);
  useEffect(() => {
    if (focus) queue.current.push({ kind: "focus", x: focus.x, z: focus.z });
  }, [focus]);
  useEffect(() => {
    if (shot) queue.current.push({ kind: "shot", shot });
  }, [shot]);

  // Cinematic: slow auto-orbit around the whole site; leaving it flies home.
  const prevMode = useRef(mode);
  useEffect(() => {
    if (!controls) return;
    if (mode === "cinematic") queue.current.push({ kind: "shot", shot: { x: HOME_TARGET.x, z: HOME_TARGET.z, zoom: -1, el: 0.5, dur: 2.4 } });
    else if (prevMode.current !== "explore" && mode === "explore") queue.current.push({ kind: "reset" });
    prevMode.current = mode;
  }, [mode, controls]);

  useEffect(() => {
    if (!controls) return;
    const cancel = () => {
      fly.current = null;
    };
    controls.addEventListener("start", cancel);
    return () => controls.removeEventListener("start", cancel);
  }, [controls]);

  // Re-frame the whole plant when the stage changes size (presentation, full screen, show modes), unless a show mode owns the camera.
  const size = useThree((s) => s.size);
  const firstSize = useRef(true);
  useEffect(() => {
    if (firstSize.current) {
      firstSize.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      if (useSceneStore.getState().mode === "explore") queue.current.push({ kind: "reset" });
    }, 120);
    return () => window.clearTimeout(t);
  }, [size.width, size.height]);

  useFrame((state, dt) => {
    const camera = state.camera as THREE.OrthographicCamera;
    if (!controls) return;
    // Cinematic: slow auto-orbit (set here, not in an effect, so React never mutates the controls).
    const orbit = state.controls as unknown as OrbitControlsImpl | null;
    if (orbit) {
      orbit.autoRotate = useSceneStore.getState().mode === "cinematic";
      orbit.autoRotateSpeed = 0.45;
    }
    if (queue.current.length) measureOverlays(state.gl.domElement);
    const fit = fitZoom(state.size.width, state.size.height);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const c of queue.current.splice(0)) {
      const base = fly.current?.to ?? readPose(camera, controls);
      const go = (to: Partial<Pose>, dur: number) => {
        fly.current = { from: readPose(camera, controls), to: { ...base, ...to }, t: 0, dur: reduced ? 0.001 : dur };
      };
      if (c.kind === "fit") applyPose({ target: homeTarget(fit), zoom: fit, az: HOME_AZ, el: ISO_EL }, camera, controls);
      else if (c.kind === "zoomIn") go({ zoom: Math.min(fit * 7, base.zoom * 1.35) }, 0.4);
      else if (c.kind === "zoomOut") go({ zoom: Math.max(fit * 0.6, base.zoom / 1.35) }, 0.4);
      else if (c.kind === "rotateLeft") go({ az: base.az + Math.PI / 4 }, 0.7);
      else if (c.kind === "rotateRight") go({ az: base.az - Math.PI / 4 }, 0.7);
      else if (c.kind === "reset") go({ target: homeTarget(fit), zoom: fit, az: HOME_AZ, el: ISO_EL }, 1.1);
      else if (c.kind === "focus") go({ target: new THREE.Vector3(c.x, 0, c.z), zoom: Math.max(base.zoom, fit * 2.2) }, 0.9);
      else if (c.kind === "shot") {
        const s = c.shot;
        const zoom = s.zoom < 0 ? fitZoom(state.size.width, state.size.height, true) * 1.08 : fit * s.zoom;
        go({ target: new THREE.Vector3(s.x, 0, s.z), zoom, az: HOME_AZ + (s.az ?? 0), el: s.el ?? ISO_EL }, s.dur ?? 2);
      }
    }

    const f = fly.current;
    if (!f) return;
    f.t = Math.min(1, f.t + dt / f.dur);
    const e = easeInOut(f.t);
    const pose: Pose = {
      target: f.from.target.clone().lerp(f.to.target, e),
      zoom: Math.exp(THREE.MathUtils.lerp(Math.log(f.from.zoom), Math.log(f.to.zoom), e)),
      az: f.from.az + wrap(f.to.az - f.from.az) * e,
      el: THREE.MathUtils.lerp(f.from.el, f.to.el, e),
    };
    applyPose(pose, camera, controls);
    if (f.t >= 1) fly.current = null;
  });
  return null;
}

/** Tells the overlay the scene has drawn a few frames, so the loading screen can fade out. */
function ReadySignal() {
  const frames = useRef(0);
  useEffect(() => () => useSceneStore.getState().setReady(false), []);
  useFrame(() => {
    if (frames.current > 4) return;
    frames.current += 1;
    if (frames.current === 4) useSceneStore.getState().setReady(true);
  });
  return null;
}

/** The whole 3D plant. Loaded lazily (client only) so three.js never touches the server or 2D users. */
export default function PlantScene() {
  const select = useSimStore((s) => s.select);
  // Pixel ratio is the main cost on integrated GPUs: cap it, and drop to 1 if the frame rate sags.
  const maxDpr = typeof window === "undefined" ? 1.25 : Math.min(1.5, window.devicePixelRatio || 1);
  const [dpr, setDpr] = useState(maxDpr);
  return (
    <Canvas
      orthographic
      shadows
      dpr={dpr}
      camera={{ position: HOME_TARGET.clone().add(new THREE.Vector3(1, 1, 1).multiplyScalar(DIST / Math.sqrt(3))).toArray(), zoom: 6, near: 1, far: 1000 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, powerPreference: "high-performance" }}
      onPointerMissed={() => select(null)}
      onCreated={(state) => {
        // Dev-only handle for measuring draw calls / render time from the console.
        if (process.env.NODE_ENV === "development") (window as unknown as { __r3f: typeof state }).__r3f = state;
      }}
      aria-label="3D view of the plant"
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(maxDpr)} />
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
      <ReadySignal />
    </Canvas>
  );
}
