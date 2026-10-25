"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

// Punarnava OS (/os, local only) defaults to dark and remembers its own choice;
// the public site keeps following the system theme.
export function Providers({ children }: { children: React.ReactNode }) {
  const os = usePathname()?.startsWith("/os") ?? false;
  const scope = os ? "os" : "site";
  const storageKey = os ? "punarnava-os-theme" : "theme";
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={os ? "dark" : "system"}
      storageKey={storageKey}
      enableSystem
      disableTransitionOnChange
    >
      <SyncRouteTheme scope={scope} storageKey={storageKey} defaultTheme={os ? "dark" : "system"} />
      {children}
    </ThemeProvider>
  );
}

function SyncRouteTheme({ scope, storageKey, defaultTheme }: { scope: string; storageKey: string; defaultTheme: string }) {
  const { setTheme } = useTheme();
  const previousScope = useRef(scope);

  useLayoutEffect(() => {
    if (previousScope.current === scope) return;
    previousScope.current = scope;

    let savedTheme: string | null = null;
    try {
      savedTheme = localStorage.getItem(storageKey);
    } catch {
      // The default still works when storage is unavailable.
    }
    setTheme(savedTheme ?? defaultTheme);
  }, [scope, storageKey, defaultTheme, setTheme]);

  return null;
}
