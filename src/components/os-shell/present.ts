"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { story } from "./nav";
import { useOsUi } from "./ui-store";

export function useStartPresenting() {
  const router = useRouter();
  const pathname = usePathname();
  return useCallback(() => {
    const here = story.findIndex((s) => s.href === pathname);
    const step = here >= 0 ? here : 0;
    useOsUi.getState().startPresenting(step);
    document.documentElement.requestFullscreen?.().catch(() => {});
    if (story[step].href !== pathname) router.push(story[step].href);
  }, [router, pathname]);
}

export function stopPresenting() {
  useOsUi.getState().stopPresenting();
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}

