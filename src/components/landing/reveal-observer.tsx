"use client";

import { useEffect } from "react";

/** Arms the `.reveal` fade-ups on the page (see reveal.tsx). Renders nothing. */
export function RevealObserver() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    // The observer's first callback reports every element at once. Whatever is already on
    // screen is marked visible before arming, so nothing flickers. Asking the observer instead
    // of measuring each element avoids forcing layout of the whole (content-visibility) page.
    let armed = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
        if (!armed) {
          armed = true;
          document.documentElement.dataset.reveal = "armed";
        }
      },
      { rootMargin: "0px 0px -64px 0px" },
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, []);
  return null;
}
