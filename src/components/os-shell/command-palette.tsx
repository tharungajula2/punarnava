"use client";

import { ArrowRight, ExternalLink, Moon, Presentation, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { allTabs } from "./nav";
import { useStartPresenting } from "./present";
import { useOsUi } from "./ui-store";

type Item = { id: string; group: string; label: string; hint: string; icon: React.ComponentType<{ className?: string }>; run: () => void; keywords: string };

/** Ctrl+K: jump to any section/tab or run an action. */
export function CommandPalette() {
  const open = useOsUi((s) => s.paletteOpen);
  const setPalette = useOsUi((s) => s.setPalette);
  if (!open) return null;
  return <Palette close={() => setPalette(false)} />;
}

function Palette({ close }: { close: () => void }) {
  const router = useRouter();
  const present = useStartPresenting();
  const { resolvedTheme, setTheme } = useTheme();
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(0);
  const list = useRef<HTMLUListElement>(null);

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => () => {
      close();
      router.push(href);
    };
    return [
      ...allTabs.map((t) => ({
        id: t.href,
        group: "Go to",
        label: t.section.tabs.length > 1 ? `${t.section.label} · ${t.label}` : t.section.label,
        hint: t.question,
        icon: t.section.icon,
        run: go(t.href),
        keywords: `${t.section.label} ${t.label} ${t.question} ${t.section.blurb}`.toLowerCase(),
      })),
      { id: "present", group: "Actions", label: "Start presentation", hint: "Fullscreen story · arrow keys to step · P", icon: Presentation, run: () => (close(), present()), keywords: "present presentation slideshow demo record" },
      {
        id: "theme",
        group: "Actions",
        label: resolvedTheme === "light" ? "Switch to dark theme" : "Switch to light theme",
        hint: "Theme",
        icon: Moon,
        run: () => (close(), setTheme(resolvedTheme === "light" ? "dark" : "light")),
        keywords: "theme dark light mode",
      },
      { id: "landing", group: "Actions", label: "Open the public landing page", hint: "/", icon: ExternalLink, run: go("/"), keywords: "landing public website pitch" },
      { id: "public-sources", group: "Actions", label: "Open the public sources page", hint: "/sources", icon: ExternalLink, run: go("/sources"), keywords: "public sources references" },
    ];
  }, [close, router, present, resolvedTheme, setTheme]);

  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return items;
    // Every word must match somewhere; matches in the label rank first.
    const score = (i: Item) => words.reduce((a, w) => a + (i.label.toLowerCase().includes(w) ? 2 : i.keywords.includes(w) ? 1 : -99), 0);
    return items
      .map((i) => ({ i, s: score(i) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.i);
  }, [items, q]);
  const current = Math.min(index, Math.max(0, shown.length - 1));

  useEffect(() => {
    list.current?.querySelector(`[data-index="${current}"]`)?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((current + 1) % Math.max(1, shown.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((current - 1 + shown.length) % Math.max(1, shown.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      shown[current]?.run();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-background/50 p-4 pt-[14vh] backdrop-blur-[2px]" onMouseDown={close}>
      <div role="dialog" aria-modal="true" aria-label="Jump to" className="os-pop w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-popover/95 shadow-float backdrop-blur-xl" onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <div className="flex items-center gap-3 border-b border-border/70 px-4">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIndex(0);
            }}
            placeholder="Jump to a section, or type an action…"
            aria-label="Search sections and actions"
            role="combobox"
            aria-expanded="true"
            aria-controls="os-palette-list"
            aria-activedescendant={shown[current] ? `pal-${shown[current].id}` : undefined}
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded-md border border-border px-1.5 font-mono text-[10px] text-muted-foreground">Esc</kbd>
        </div>
        <ul id="os-palette-list" ref={list} role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
          {shown.length === 0 ? <li className="px-3 py-8 text-center text-sm text-muted-foreground">Nothing matches “{q}”.</li> : null}
          {shown.map((item, i) => {
            const header = i === 0 || shown[i - 1].group !== item.group ? item.group : null;
            return (
              <li key={item.id} role="presentation">
                {header ? <p className="px-3 pt-2 pb-1 text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">{header}</p> : null}
                <button
                  type="button"
                  id={`pal-${item.id}`}
                  role="option"
                  aria-selected={i === current}
                  data-index={i}
                  onMouseMove={() => setIndex(i)}
                  onClick={item.run}
                  className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", i === current ? "bg-primary/12" : "")}
                >
                  <item.icon className={cn("size-4 shrink-0", i === current ? "text-primary" : "text-muted-foreground")} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm">{item.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>
                  </span>
                  {i === current ? <ArrowRight className="size-3.5 text-primary" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="flex gap-4 border-t border-border/70 px-4 py-2 text-[11px] text-muted-foreground">
          <span>↑↓ move</span>
          <span>Enter open</span>
          <span>1–7 sections</span>
          <span>P present</span>
        </p>
      </div>
    </div>
  );
}
