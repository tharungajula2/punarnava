"use client";

import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, Maximize2, Pause, Play, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { FACTORY_STOPS } from "@/data/factory-story";
import { useSceneStore } from "@/components/sim/three/camera-store";
import { cn } from "@/lib/utils";

const PlantScene = dynamic(() => import("@/components/sim/three/plant-scene"), { ssr: false });
const STOP_MS = 10500;

let webglSupport: boolean | null = null;
function getWebglSupport() {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

const subscribeToWebglSupport = () => () => {};
function useSceneSupport() {
  return useSyncExternalStore(subscribeToWebglSupport, getWebglSupport, () => false);
}

function PlanFallback({ active }: { active: number }) {
  const group = active <= 3 ? 0 : active <= 6 ? 1 : active <= 9 ? 2 : 3;
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_65%_20%,#e2f4ec,#d7e9e4_55%,#c3d9d2)] p-6">
      <ol className="grid w-full max-w-3xl gap-3 sm:grid-cols-4">
        {[
          ["01", "Receive", "Record and sort incoming plastic"],
          ["02", "Clean", "Shred, wash and treat the water"],
          ["03", "Convert", "Dry, melt and make pellets"],
          ["04", "Release", "Test, pack and dispatch"],
        ].map(([n, title, body], index) => (
          <li key={n} className={cn("rounded-2xl border bg-white/85 p-5 shadow-lg backdrop-blur transition-colors", index === group && active > 0 ? "border-teal-700 ring-2 ring-teal-700/35" : "border-white/70")}>
            <span className="font-mono text-xs text-teal-700">{n}</span>
            <h3 className="mt-3 font-display text-2xl text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function FactoryExperience() {
  const supported = useSceneSupport();
  const ready = useSceneStore((s) => s.ready);
  const active = useSceneStore((s) => s.tourStep);
  const [touring, setTouring] = useState(false);
  const [playing, setPlaying] = useState(false);
  const stop = FACTORY_STOPS[active];

  const goTo = useCallback((index: number) => {
    const next = Math.max(0, Math.min(FACTORY_STOPS.length - 1, index));
    const item = FACTORY_STOPS[next];
    const scene = useSceneStore.getState();
    scene.setTourStep(next);
    scene.setSelected(item.spot ?? null);
    scene.setSpotlight(item.spot ?? null);
    scene.frame(item.shot);
  }, []);

  useEffect(() => {
    const scene = useSceneStore.getState();
    scene.setSelected(null);
    scene.setSpotlight(null);
    return () => {
      scene.setSelected(null);
      scene.setSpotlight(null);
      scene.setMode("explore");
    };
  }, []);

  useEffect(() => {
    if (ready && supported) useSceneStore.getState().frame(FACTORY_STOPS[0].shot);
  }, [ready, supported]);

  useEffect(() => {
    return useSceneStore.subscribe((scene, previous) => {
      if (!scene.selected || scene.selected === previous.selected) return;
      const index = FACTORY_STOPS.findIndex((item) => item.spot === scene.selected);
      if (index < 0 || index === scene.tourStep) return;
      scene.setTourStep(index);
      scene.frame(FACTORY_STOPS[index].shot);
      setPlaying(false);
    });
  }, []);

  useEffect(() => {
    if (!touring || !playing) return;
    const timer = window.setTimeout(() => {
      if (active === FACTORY_STOPS.length - 1) setPlaying(false);
      else goTo(active + 1);
    }, STOP_MS);
    return () => window.clearTimeout(timer);
  }, [touring, playing, active, goTo]);

  const exitTour = useCallback(() => {
    setTouring(false);
    setPlaying(false);
    useSceneStore.getState().setMode("explore");
    useSceneStore.getState().command("reset");
  }, []);

  useEffect(() => {
    if (!touring) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") exitTour();
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(active + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(active - 1);
      }
      if (event.key === " ") {
        event.preventDefault();
        setPlaying((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [touring, active, exitTour, goTo]);

  const startTour = () => {
    setTouring(true);
    setPlaying(true);
    useSceneStore.getState().setMode("tour");
    goTo(0);
  };

  return (
    <div className={cn("sim-stage factory-stage", touring ? "fixed inset-0 z-[70] h-dvh w-screen rounded-none" : "relative h-[min(820px,calc(100svh-4rem))] min-h-[620px] overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-float)]")} data-mode={touring ? "tour" : "explore"}>
      {supported ? <PlantScene conceptOnly /> : <PlanFallback active={active} />}
      {supported && !ready && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-background/30 text-sm text-foreground">
          Opening the proposed plant…
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-start justify-between gap-3 sm:inset-x-6 sm:top-6">
        <div className="rounded-xl border border-white/60 bg-background/90 px-4 py-2.5 shadow-lg backdrop-blur">
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">Punarnava · factory concept</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{supported ? "Click a part or follow the guided story" : "Follow the guided story, step by step"}</p>
        </div>
        {touring ? (
          <button type="button" onClick={exitTour} className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-lg">
            <X className="size-4" aria-hidden /> Exit tour
          </button>
        ) : (
          <button type="button" onClick={startTour} className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-teal-deep px-4 py-2.5 text-sm font-medium text-paper shadow-lg transition-transform hover:-translate-y-0.5">
            <Maximize2 className="size-4" aria-hidden /> Start cinematic tour
          </button>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-center sm:inset-x-6 sm:bottom-6">
        <div className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-white/70 bg-background/95 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">{stop.zone} · {String(active + 1).padStart(2, "0")} / {FACTORY_STOPS.length}</span>
            <span className="text-xs text-muted-foreground">{touring ? playing ? "Guided tour playing" : "Tour paused" : "Proposed layout"}</span>
          </div>
          <div aria-live={playing ? "off" : "polite"}>
            <h2 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{stop.title}</h2>
            <p className="mt-2 text-sm text-foreground sm:text-base">{stop.purpose}</p>
            <p className="mt-2 border-l-2 border-primary pl-3 text-sm text-muted-foreground"><strong className="font-medium text-foreground">Why here:</strong> {stop.decision}</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            {touring ? (
              <button type="button" onClick={() => {
                if (!playing && active === FACTORY_STOPS.length - 1) goTo(0);
                setPlaying((value) => !value);
              }} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
                {playing ? "Pause" : active === FACTORY_STOPS.length - 1 ? "Replay from start" : "Continue"}
              </button>
            ) : (
              <label className="text-xs font-medium text-muted-foreground">
                Jump to area
                <select value={active} onChange={(event) => goTo(Number(event.target.value))} className="ml-2 max-w-[200px] rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground">
                  {FACTORY_STOPS.map((item, index) => <option key={item.id} value={index}>{item.title}</option>)}
                </select>
              </label>
            )}
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous factory stop" className="grid size-9 place-items-center rounded-lg hover:bg-muted disabled:opacity-30"><ArrowLeft className="size-4" /></button>
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:w-28"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${((active + 1) / FACTORY_STOPS.length) * 100}%` }} /></div>
              <button type="button" onClick={() => goTo(active + 1)} disabled={active === FACTORY_STOPS.length - 1} aria-label="Next factory stop" className="grid size-9 place-items-center rounded-lg hover:bg-muted disabled:opacity-30"><ArrowRight className="size-4" /></button>
              {!touring && <button type="button" onClick={() => { goTo(0); useSceneStore.getState().command("reset"); }} aria-label="Show whole plant" className="ml-1 grid size-9 place-items-center rounded-lg hover:bg-muted"><RotateCcw className="size-4" /></button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
