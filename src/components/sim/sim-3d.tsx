"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useOsUi } from "@/components/os-shell/ui-store";
import { cn } from "@/lib/utils";
import type { Scenario, SimParams } from "@/sim";
import { BatchTracker, CinematicOverlay, ControlDock, DetailPanel, KpiStrip, LeftRail, ModeButtons, PlantTabs, SceneLoader, TourCaption, useStageKeys } from "./hud";
import { useSimStore } from "./sim-store";
import { useSceneStore } from "./three/camera-store";

type Status = "placeholder" | "researched" | "verified";

// The loading screen (SceneLoader) covers the stage until the scene has drawn its first frames.
const PlantScene = dynamic(() => import("./three/plant-scene"), { ssr: false });

function SceneMessage({ children }: { children: ReactNode }) {
  return <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">{children}</div>;
}

// ── Can this device run the 3D view? ─────────────────────────────────────────

let webgl: boolean | null = null;
function hasWebGL() {
  if (webgl === null) {
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") ?? c.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

const WIDE = "(min-width: 768px)";
function subscribeWide(cb: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** 3D needs WebGL and a tablet-or-larger screen; phones get the 2D schematic. */
export function useCan3D(): boolean {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches && hasWebGL(),
    () => false,
  );
}

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? <SceneMessage>The 3D view could not start on this device.</SceneMessage> : this.props.children;
  }
}

// ── The stage ────────────────────────────────────────────────────────────────

/**
 * The 3D plant with its glass HUD. Fills most of the window; in presentation mode
 * it covers the whole screen, and it can go full screen on its own for recording.
 */
export function Sim3DView({ params, statuses }: { params: SimParams; statuses: Record<keyof Scenario, Status> }) {
  const setView = useSimStore((s) => s.setView);
  const mode = useSceneStore((s) => s.mode);
  const presenting = useOsUi((s) => s.presenting);
  const captions = useOsUi((s) => s.captions);
  const stage = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  useStageKeys();

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === stage.current && stage.current !== null);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  // Leaving the page ends any show mode.
  useEffect(() => () => useSceneStore.getState().setMode("explore"), []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement === stage.current) document.exitFullscreen?.().catch(() => {});
    else stage.current?.requestFullscreen?.().catch(() => {});
  };
  // F: full screen (not while presenting — the whole page is already full screen then).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.ctrlKey || e.metaKey || e.altKey || (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      if ((e.key === "f" || e.key === "F") && !useOsUi.getState().presenting) {
        e.preventDefault();
        if (document.fullscreenElement === stage.current) document.exitFullscreen?.().catch(() => {});
        else stage.current?.requestFullscreen?.().catch(() => {});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // Leave room for the presenter caption bar at the bottom while presenting.
  const hudBottom = presenting && captions ? "7.5rem" : "0.75rem";
  const firstHud = useRef(true);
  useEffect(() => {
    if (firstHud.current) {
      firstHud.current = false;
      return;
    }
    if (useSceneStore.getState().mode === "explore") useSceneStore.getState().command("reset");
  }, [hudBottom]);

  return (
    <div
      ref={stage}
      data-mode={mode}
      style={{ ["--hud-b" as string]: hudBottom }}
      className={cn(
        "sim-stage overflow-hidden",
        // Presentation and the show modes take over the whole window; full screen fills the screen.
        presenting || mode !== "explore"
          ? "fixed inset-0 z-[45]"
          : fullscreen
            ? "relative h-full w-full"
            : "relative h-[calc(100svh-5.5rem)] max-h-[1000px] min-h-[620px] rounded-2xl border border-border",
      )}
    >
      <SceneBoundary onError={() => setView("2d")}>
        <PlantScene />
      </SceneBoundary>
      <KpiStrip />
      <ControlDock />
      <ModeButtons fullscreen={fullscreen} onFullscreen={toggleFullscreen} canFullscreen={!presenting} />
      <LeftRail params={params} statuses={statuses} />
      <DetailPanel />
      <BatchTracker />
      <PlantTabs />
      <TourCaption />
      <CinematicOverlay />
      <SceneLoader />
    </div>
  );
}

export function ViewToggle() {
  const view = useSimStore((s) => s.view);
  const setView = useSimStore((s) => s.setView);
  return (
    <div role="group" aria-label="View" className="flex rounded-lg border border-border p-0.5">
      {(["3d", "2d"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setView(v)}
          aria-pressed={view === v}
          className={`rounded-md px-3 py-1 text-xs font-medium uppercase transition-colors ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
