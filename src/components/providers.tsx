"use client";

import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";

// Punarnava OS (/os, local only) defaults to dark and remembers its own choice;
// the public site keeps following the system theme.
export function Providers({ children }: { children: React.ReactNode }) {
  const os = usePathname()?.startsWith("/os") ?? false;
  return (
    <ThemeProvider
      key={os ? "os" : "site"}
      attribute="class"
      defaultTheme={os ? "dark" : "system"}
      storageKey={os ? "punarnava-os-theme" : "theme"}
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
