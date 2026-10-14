"use client";

import { create } from "zustand";

// Shell UI state that must survive page navigation (lives above the pages).
type OsUi = {
  paletteOpen: boolean;
  presenting: boolean;
  step: number;
  captions: boolean;
  setPalette: (open: boolean) => void;
  startPresenting: (step: number) => void;
  stopPresenting: () => void;
  setStep: (step: number) => void;
  toggleCaptions: () => void;
};

export const useOsUi = create<OsUi>((set) => ({
  paletteOpen: false,
  presenting: false,
  step: 0,
  captions: true,
  setPalette: (paletteOpen) => set({ paletteOpen }),
  startPresenting: (step) => set({ presenting: true, step, paletteOpen: false, captions: true }),
  stopPresenting: () => set({ presenting: false }),
  setStep: (step) => set({ step }),
  toggleCaptions: () => set((s) => ({ captions: !s.captions })),
}));
