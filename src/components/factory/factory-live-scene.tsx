"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, type ReactNode } from "react";
import type { SimParams } from "@/sim";
import { useSimStore } from "@/components/sim/sim-store";
import { useSceneStore } from "@/components/sim/three/camera-store";

const PlantScene = dynamic(() => import("@/components/sim/three/plant-scene"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable(); }
  render() { return this.state.failed ? null : this.props.children; }
}

/** Drives only the visual workday. Figures and analytics stay off the presentation. */
export function FactoryLiveScene({ params, onUnavailable }: { params: SimParams; onUnavailable: () => void }) {
  const ready = useSceneStore((state) => state.ready);

  useEffect(() => {
    const store = useSimStore.getState();
    store.init(params);
    store.setSpeed(20);
    store.setPlaying(true);
    useSceneStore.getState().setReady(false);
    let frame = 0;
    let last = performance.now();
    let accumulated = 0;
    let lastUi = 0;
    const tick = (now: number) => {
      const elapsed = Math.min(0.1, (now - last) / 1000);
      last = now;
      const { sim, playing, speed } = useSimStore.getState();
      if (sim && playing) {
        accumulated += elapsed * speed;
        const minutes = Math.floor(accumulated);
        accumulated -= minutes;
        if (minutes) sim.run(minutes);
        if (now - lastUi > 500) {
          lastUi = now;
          useSimStore.setState((state) => ({ version: state.version + 1 }));
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      useSimStore.getState().setPlaying(false);
      useSceneStore.getState().setReady(false);
    };
  }, [params]);

  useEffect(() => {
    if (ready) return;
    const timeout = window.setTimeout(onUnavailable, 12000);
    return () => window.clearTimeout(timeout);
  }, [ready, onUnavailable]);

  return (
    <SceneBoundary onUnavailable={onUnavailable}>
      <PlantScene showLabels onContextLost={onUnavailable} />
    </SceneBoundary>
  );
}

export function WorkdayCaption() {
  useSimStore((state) => state.version);
  const sim = useSimStore((state) => state.sim);
  if (!sim) return null;
  const time = ((sim.state.t % 1440) + 1440) % 1440;
  const hour = Math.floor(time / 60);
  const minute = Math.floor(time % 60);
  const phase = hour < 8 ? "Preparing the line" : hour < 11 ? "Receiving and sorting" : hour < 15 ? "Washing and converting" : hour < 20 ? "Testing and dispatch" : "Closing the day";
  return (
    <div className="pointer-events-none rounded-xl border border-white/20 px-4 py-2.5 text-white shadow-xl backdrop-blur" style={{ position: "absolute", bottom: 20, left: 20, zIndex: 2, backgroundColor: "rgba(7, 58, 59, 0.94)" }}>
      <p className="text-[10px] font-semibold tracking-[0.15em] text-[#9de0c3] uppercase">Illustrative workday</p>
      <p className="mt-0.5 text-sm font-medium">{phase} <span className="ml-1 font-mono text-xs text-white/70">{String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}</span></p>
    </div>
  );
}
