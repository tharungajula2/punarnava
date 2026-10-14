"use client";

import { useEffect } from "react";

/** Arms the `.reveal` fade-ups on the page (see reveal.tsx). Renders nothing. */
export function RevealObserver() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    // Anything already on screen stays visible, so nothing flickers when arming.
    for (const el of els) if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-visible");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -64px 0px" },
    );
    for (const el of els) if (!el.classList.contains("is-visible")) io.observe(el);
    document.documentElement.dataset.reveal = "armed";
    return () => io.disconnect();
  }, []);
  return null;
}
