"use client";

import { ArrowLeft, ArrowRight, Compass, Maximize2, Pause, Play, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { SimParams } from "@/sim";
import { FactoryLiveScene, WorkdayCaption } from "@/components/factory/factory-live-scene";
import { FACTORY_STOPS } from "@/data/factory-story";
import { FactoryPlan } from "@/components/factory/factory-plan";
import { useSimStore } from "@/components/sim/sim-store";
import { useSceneStore } from "@/components/sim/three/camera-store";
import { cn } from "@/lib/utils";

const STOP_MS = 10500;

export function FactoryExperience({ params }: { params: SimParams }) {
  const [active, setActive] = useState(0);
  const [touring, setTouring] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [playing, setPlaying] = useState(false);
  // Start optimistically on "live"; fall back to "plan" if WebGL is unavailable
  const [view, setView] = useState<"live" | "plan">("live");
  const [webgl, setWebgl] = useState(true);
  const [failed, setFailed] = useState(false);
  const ready = useSceneStore((state) => state.ready);
  const stop = FACTORY_STOPS[active];

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let supported = false;
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
        supported = Boolean(context);
        context?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        supported = false;
      }
      setWebgl(supported);
      // Fall back to plan if no WebGL or small screen
      if (!supported || !window.matchMedia("(min-width: 768px)").matches) {
        setView("plan");
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const onUnavailable = useCallback(() => {
    setFailed(true);
    setWebgl(false);
    setView("plan");
  }, []);

  const goTo = useCallback((index: number) => {
    const next = Math.max(0, Math.min(FACTORY_STOPS.length - 1, index));
    setActive(next);
    if (view === "live" && useSceneStore.getState().ready) {
      const item = FACTORY_STOPS[next];
      const scene = useSceneStore.getState();
      scene.setTourStep(next);
      scene.setSelected(item.spot ?? null);
      scene.setSpotlight(item.spot ?? null);
      useSimStore.getState().select(item.spot ?? null);
      scene.frame(item.shot);
    }
  }, [view]);

  useEffect(() => {
    if (view !== "live" || !ready) return;
    useSceneStore.getState().frame(FACTORY_STOPS[active].shot);
  }, [view, ready, active]);

  useEffect(() => {
    if (view !== "live") return;
    return useSceneStore.subscribe((scene, previous) => {
      if (!scene.selected || scene.selected === previous.selected) return;
      const index = FACTORY_STOPS.findIndex((item) => item.spot === scene.selected);
      if (index < 0 || index === scene.tourStep) return;
      scene.setTourStep(index);
      scene.frame(FACTORY_STOPS[index].shot);
      setActive(index);
      if (touring) setPlaying(false);
    });
  }, [view, touring]);

  const exitTour = useCallback(() => {
    setTouring(false);
    setPlaying(false);
    useSceneStore.getState().setMode("explore");
    useSceneStore.getState().command("reset");
  }, []);

  const exitExplore = useCallback(() => {
    setExploring(false);
    useSceneStore.getState().setMode("explore");
    useSceneStore.getState().command("reset");
  }, []);

  useEffect(() => {
    if (!touring || !playing) return;
    const timer = window.setTimeout(() => {
      if (active === FACTORY_STOPS.length - 1) setPlaying(false);
      else goTo(active + 1);
    }, STOP_MS);
    return () => window.clearTimeout(timer);
  }, [touring, playing, active, goTo]);

  // Lock scroll and bind keys when touring OR exploring fullscreen
  useEffect(() => {
    if (!touring && !exploring) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { exitTour(); exitExplore(); }
      if (touring) {
        if (event.key === "ArrowRight") { event.preventDefault(); goTo(active + 1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); goTo(active - 1); }
        if (event.key === " ") { event.preventDefault(); setPlaying((v) => !v); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [touring, exploring, active, exitTour, exitExplore, goTo]);

  const selectArea = (index: number) => {
    goTo(index);
    if (touring) setPlaying(false);
  };

  const startTour = () => {
    if (view === "live") useSceneStore.getState().setMode("tour");
    goTo(0);
    setTouring(true);
    setPlaying(true);
  };

  const startExplore = () => {
    setView("live");
    setExploring(true);
    useSceneStore.getState().setMode("explore");
    useSceneStore.getState().command("reset");
  };

  const isFullscreen = touring || exploring;

  return (
    <>
      {/* ── Main embedded widget ── */}
      <div
        className={cn("relative isolate", isFullscreen && "fixed inset-0 z-[70] h-dvh w-screen bg-[#062f32]")}
        data-mode={touring ? "tour" : exploring ? "explore3d" : "embed"}
      >
        <div
          className={cn(
            "relative overflow-hidden bg-[#062f32]",
            isFullscreen ? "absolute inset-0" : "rounded-3xl border border-border shadow-[var(--shadow-float)]",
          )}
          style={{ height: isFullscreen ? "100dvh" : "640px" }}
        >
          <FactoryPlan active={active} onSelect={selectArea} />
          {view === "live" && (
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                ready ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              style={{ backgroundColor: "#e8f0eb" }}
            >
              <FactoryLiveScene params={params} onUnavailable={onUnavailable} />
              {ready && <WorkdayCaption />}
            </div>
          )}
          {view === "live" && !ready && (
            <p
              className="pointer-events-none rounded-lg border border-white/15 bg-[#073a3b]/85 px-3 py-2 text-xs text-white/85"
              style={{ position: "absolute", right: 20, bottom: 20 }}
            >
              Opening the animated plant…
            </p>
          )}

          {/* ── Top bar ── */}
          <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-start justify-between gap-3 sm:inset-x-6 sm:top-6">
            <div className="rounded-xl border border-white/15 bg-[#073a3b]/95 px-4 py-2.5 text-white shadow-xl backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#9de0c3] uppercase">Punarnava · factory concept</p>
              <p className="mt-0.5 text-xs text-white/75">
                {exploring
                  ? "Free exploration — click any area to focus, drag to rotate"
                  : view === "live"
                  ? "Watch a modelled workday, then explore each design choice"
                  : "Select a station or follow the guided story"}
              </p>
            </div>

            <div className="pointer-events-auto flex flex-wrap items-center gap-2">
              {/* View toggle — hidden during fullscreen modes */}
              {webgl && !isFullscreen && (
                <div role="group" aria-label="Factory view" className="flex rounded-xl border border-white/20 bg-[#073a3b]/95 p-1 text-xs font-semibold text-white shadow-xl">
                  <button
                    type="button"
                    aria-pressed={view === "live"}
                    onClick={() => { setFailed(false); setView("live"); }}
                    className={cn("rounded-lg px-3 py-2", view === "live" && "bg-[#a9e8c9] text-[#073a3b]")}
                  >
                    {failed ? "Retry animation" : "Animated factory"}
                  </button>
                  <button
                    type="button"
                    aria-pressed={view === "plan"}
                    onClick={() => setView("plan")}
                    className={cn("rounded-lg px-3 py-2", view === "plan" && "bg-[#a9e8c9] text-[#073a3b]")}
                  >
                    Layout plan
                  </button>
                </div>
              )}

              {/* Exit buttons */}
              {touring && (
                <button type="button" onClick={exitTour} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#073a3b] shadow-xl">
                  <X className="size-4" aria-hidden /> Exit tour
                </button>
              )}
              {exploring && (
                <button type="button" onClick={exitExplore} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#073a3b] shadow-xl">
                  <X className="size-4" aria-hidden /> Exit exploration
                </button>
              )}

              {/* Action buttons — hidden during fullscreen */}
              {!isFullscreen && (
                <>
                  {/* Explore 3D fullscreen — premium button */}
                  {webgl && (
                    <button
                      type="button"
                      onClick={startExplore}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#073a3b] border border-[#a9e8c9]/40 px-4 py-2.5 text-sm font-semibold text-[#a9e8c9] shadow-xl transition-all hover:bg-[#0a4f50] hover:-translate-y-0.5"
                    >
                      <Compass className="size-4" aria-hidden /> Explore in 3D
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={startTour}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#a9e8c9] px-4 py-2.5 text-sm font-semibold text-[#073a3b] shadow-xl transition-transform hover:-translate-y-0.5"
                  >
                    <Maximize2 className="size-4" aria-hidden /> Start cinematic tour
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── 3D Explore fullscreen overlay: zone chip rail at bottom ── */}
          {exploring && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
              {/* Gradient fade */}
              <div className="h-24 bg-gradient-to-t from-[#062f32] to-transparent" />
              <div className="pointer-events-auto bg-[#062f32] px-4 pb-6 pt-2 sm:px-8">
                <p className="mb-3 text-center text-[10px] font-semibold tracking-[0.18em] text-[#9de0c3] uppercase">
                  Click any area to fly in &amp; read the design story
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {FACTORY_STOPS.filter((s) => s.spot).map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => goTo(FACTORY_STOPS.indexOf(s))}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
                        active === FACTORY_STOPS.indexOf(s)
                          ? "border-[#a9e8c9] bg-[#a9e8c9] text-[#073a3b] shadow-lg"
                          : "border-white/20 bg-white/8 text-white/80 hover:border-[#a9e8c9]/60 hover:bg-[#a9e8c9]/15 hover:text-white",
                      )}
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      {s.zone !== "The idea" ? s.title : "Overview"}
                    </button>
                  ))}
                </div>
                {/* Mini stop card inside explore mode */}
                {active > 0 && (
                  <div className="mx-auto mt-4 max-w-lg rounded-2xl border border-white/15 bg-[#073a3b]/90 p-4 text-white shadow-2xl backdrop-blur">
                    <p className="text-[10px] font-semibold tracking-[0.14em] text-[#9de0c3] uppercase">{stop.zone}</p>
                    <h3 className="mt-1 font-display text-lg leading-snug">{stop.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/70">{stop.purpose}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Story card — shown in embed & tour, hidden in free explore ── */}
        {!exploring && (
          <div className={cn("z-10 mx-auto w-full max-w-3xl", touring ? "absolute inset-x-4 bottom-4 max-h-[70dvh] sm:inset-x-6" : "relative -mt-6 px-4 sm:px-0")}>
            <div className={cn("w-full rounded-2xl border border-white/70 bg-background/95 p-4 shadow-2xl backdrop-blur-xl sm:p-6", touring && "max-h-[70dvh] overflow-y-auto")}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                  {stop.zone} · {String(active + 1).padStart(2, "0")} / {FACTORY_STOPS.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  {touring ? (playing ? "Guided tour playing" : "Tour paused") : "Proposed layout"}
                </span>
              </div>
              <div aria-live={playing ? "off" : "polite"}>
                <h2 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{stop.title}</h2>
                <p className="mt-2 text-sm text-foreground sm:text-base">{stop.purpose}</p>
                <p className="mt-2 border-l-2 border-primary pl-3 text-sm text-muted-foreground">
                  <strong className="font-medium text-foreground">Why here:</strong> {stop.decision}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                {touring ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!playing && active === FACTORY_STOPS.length - 1) goTo(0);
                      setPlaying((v) => !v);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
                    {playing ? "Pause" : active === FACTORY_STOPS.length - 1 ? "Replay from start" : "Continue"}
                  </button>
                ) : (
                  <label className="text-xs font-medium text-muted-foreground">
                    Jump to area
                    <select
                      value={active}
                      onChange={(e) => goTo(Number(e.target.value))}
                      className="ml-2 max-w-[200px] rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                    >
                      {FACTORY_STOPS.map((item, index) => (
                        <option key={item.id} value={index}>{item.title}</option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous factory stop" className="grid size-9 place-items-center rounded-lg hover:bg-muted disabled:opacity-30">
                    <ArrowLeft className="size-4" />
                  </button>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:w-28">
                    <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${((active + 1) / FACTORY_STOPS.length) * 100}%` }} />
                  </div>
                  <button type="button" onClick={() => goTo(active + 1)} disabled={active === FACTORY_STOPS.length - 1} aria-label="Next factory stop" className="grid size-9 place-items-center rounded-lg hover:bg-muted disabled:opacity-30">
                    <ArrowRight className="size-4" />
                  </button>
                  {!touring && (
                    <button type="button" onClick={() => goTo(0)} aria-label="Show whole plant" className="ml-1 grid size-9 place-items-center rounded-lg hover:bg-muted">
                      <RotateCcw className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
