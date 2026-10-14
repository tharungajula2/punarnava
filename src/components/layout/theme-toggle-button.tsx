"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Plain <button> on purpose: the classes arrive from the server (see theme-toggle.tsx),
 * so the public pages don't ship the Button primitive and class-merging code.
 */
export function ThemeToggleButton({ className }: { className: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      data-slot="button"
      className={className}
      aria-label="Toggle light and dark theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Both icons render; CSS shows the right one, so no hydration mismatch */}
      <Sun className="hidden dark:block" />
      <Moon className="block dark:hidden" />
    </button>
  );
}
