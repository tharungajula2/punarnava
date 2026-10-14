"use client";

import { ChevronLeft, ChevronRight, Command, Moon, Presentation, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { CommandPalette } from "./command-palette";
import { sectionFor, sections, story, tabFor } from "./nav";
import { stopPresenting, useStartPresenting } from "./present";
import { useOsUi } from "./ui-store";

/** Punarnava OS frame: glass sidebar, top bar, palette, shortcuts, presentation mode. */
export function OsShell({ children }: { children: React.ReactNode }) {
  usePresentationController();
  useShortcuts();
  const presenting = useOsUi((s) => s.presenting);

  return (
    <div className="os-root relative flex min-h-dvh flex-1">
      <Backdrop />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main id="os-main" className={cn("min-w-0 flex-1 px-4 pt-6 pb-16 sm:px-6 lg:px-10 xl:px-12", presenting && "os-present-main")}>
          <div className="mx-auto w-full max-w-[1480px]">{children}</div>
        </main>
      </div>
      <CommandPalette />
      {presenting ? <PresenterBar /> : null}
    </div>
  );
}

/** Soft brand glow behind the glass panels. */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-32 size-[520px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute top-1/3 -right-40 size-[480px] rounded-full bg-accent/20 blur-3xl dark:bg-accent/30" />
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const active = sectionFor(pathname);
  const setPalette = useOsUi((s) => s.setPalette);

  return (
    <aside className="os-chrome sticky top-0 hidden h-dvh w-16 shrink-0 flex-col border-r border-border/60 bg-sidebar/60 backdrop-blur-xl md:flex xl:w-64">
      <div className="flex h-16 items-center px-4 xl:px-5">
        <Link href="/os" aria-label="Punarnava OS home" className="flex items-center gap-2 rounded-lg">
          <span className="hidden items-center gap-2 xl:flex">
            <Logo />
            <span className="rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">OS</span>
          </span>
          <LogoMark className="xl:hidden" />
        </Link>
      </div>
      <p className="hidden px-5 pb-2 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase xl:block">Operating system</p>

      <nav aria-label="Sections" className="flex flex-1 flex-col gap-1 px-2 xl:px-3">
        {sections.map((s) => {
          const on = s.id === active.id;
          return (
            <Link
              key={s.id}
              href={s.href}
              aria-current={on ? "page" : undefined}
              title={`${s.label} (${s.key})`}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                on ? "bg-primary/12 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              {on ? <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" /> : null}
              <s.icon className={cn("size-[18px] shrink-0", on && "text-primary")} aria-hidden />
              <span className="hidden min-w-0 flex-1 xl:block">
                <span className={cn("block", on && "font-medium")}>{s.label}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{s.blurb}</span>
              </span>
              <kbd className="hidden rounded-md border border-border/80 px-1.5 font-mono text-[10px] text-muted-foreground xl:inline">{s.key}</kbd>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 p-2 xl:p-3">
        <button
          type="button"
          onClick={() => setPalette(true)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          title="Jump anywhere (Ctrl K)"
        >
          <Command className="size-[18px] shrink-0" aria-hidden />
          <span className="hidden flex-1 text-left xl:block">Jump to…</span>
          <kbd className="hidden rounded-md border border-border/80 px-1.5 font-mono text-[10px] xl:inline">Ctrl K</kbd>
        </button>
        <p className="hidden px-3 pt-2 text-[11px] leading-relaxed text-muted-foreground xl:block">
          Local only · numbers from <code className="font-mono">assumptions.ts</code>
        </p>
      </div>
    </aside>
  );
}

function TopBar() {
  const pathname = usePathname();
  const { section, tab } = tabFor(pathname);
  const setPalette = useOsUi((s) => s.setPalette);
  const start = useStartPresenting();

  return (
    <header className="os-chrome sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Link href="/os" aria-label="Punarnava OS home" className="md:hidden">
            <LogoMark />
          </Link>
          <section.icon className="hidden size-4 text-primary md:block" aria-hidden />
          <span className="font-medium">{section.label}</span>
          {section.tabs.length > 1 ? (
            <>
              <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
              <span className="truncate text-muted-foreground">{tab.label}</span>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPalette(true)}
            className="hidden h-9 items-center gap-2 rounded-xl border border-border/80 bg-card/50 px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <span>Search</span>
            <kbd className="rounded-md bg-muted px-1.5 font-mono text-[10px]">Ctrl K</kbd>
          </button>
          <button
            type="button"
            onClick={start}
            className="flex h-9 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
            title="Present (P)"
          >
            <Presentation className="size-4" aria-hidden />
            <span className="hidden sm:inline">Present</span>
          </button>
          <ThemeButton />
        </div>
      </div>
      {/* Phones/tablets: sections as a scrolling chip row */}
      <nav aria-label="Sections" className="overflow-x-auto border-t border-border/60 px-3 py-2 md:hidden">
        <ul className="flex w-max gap-1.5">
          {sections.map((s) => (
            <li key={s.id}>
              <Link
                href={s.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs",
                  s.id === section.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                )}
              >
                <s.icon className="size-3.5" aria-hidden />
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      // The server can't know the stored theme, so the label may differ on first paint.
      suppressHydrationWarning
      className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
    >
      <Sun className="hidden size-4 dark:block" aria-hidden />
      <Moon className="size-4 dark:hidden" aria-hidden />
    </button>
  );
}

// ── Keyboard shortcuts ──────────────────────────────────────────────────────

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return t.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function useShortcuts() {
  const router = useRouter();
  const start = useStartPresenting();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ui = useOsUi.getState();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ui.setPalette(!ui.paletteOpen);
        return;
      }
      if (ui.paletteOpen || ui.presenting || e.ctrlKey || e.metaKey || e.altKey || isTyping(e)) return;
      const s = sections.find((x) => x.key === e.key);
      if (s) {
        e.preventDefault();
        router.push(s.href);
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, start]);
}

// ── Presentation mode ───────────────────────────────────────────────────────

function usePresentationController() {
  const router = useRouter();
  const presenting = useOsUi((s) => s.presenting);
  const hadFullscreen = useRef(false);

  // Large type + hidden chrome via one attribute on <html> (see globals.css).
  useEffect(() => {
    const root = document.documentElement;
    if (presenting) root.dataset.present = "on";
    else delete root.dataset.present;
    return () => {
      delete root.dataset.present;
    };
  }, [presenting]);

  useEffect(() => {
    if (!presenting) return;
    hadFullscreen.current = false;
    const go = (delta: number) => {
      const { step, setStep } = useOsUi.getState();
      const next = Math.max(0, Math.min(story.length - 1, step + delta));
      if (next === step) return;
      setStep(next);
      router.push(story[next].href);
      window.scrollTo({ top: 0 });
    };
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        e.preventDefault();
        stopPresenting();
      } else if (e.key === "h" || e.key === "H") {
        useOsUi.getState().toggleCaptions();
      }
    };
    // Esc in fullscreen is swallowed by the browser: leaving fullscreen ends the show.
    const onFs = () => {
      if (document.fullscreenElement) hadFullscreen.current = true;
      else if (hadFullscreen.current) useOsUi.getState().stopPresenting();
    };
    const onGo = (e: Event) => go((e as CustomEvent<number>).detail);
    window.addEventListener("keydown", onKey);
    window.addEventListener("os-present-go", onGo);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("os-present-go", onGo);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [presenting, router]);
}

function PresenterBar() {
  const step = useOsUi((s) => s.step);
  const captions = useOsUi((s) => s.captions);
  const s = story[step];
  const go = (d: number) => window.dispatchEvent(new CustomEvent("os-present-go", { detail: d }));

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-5">
      <div className={cn("glass pointer-events-auto flex w-full max-w-4xl items-center gap-4 px-5 py-3 transition-opacity", !captions && "opacity-0 hover:opacity-100")}>
        <button type="button" onClick={() => go(-1)} disabled={step === 0} aria-label="Previous" className="flex size-9 shrink-0 items-center justify-center rounded-xl hover:bg-foreground/5 disabled:opacity-30">
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {step + 1} / {story.length}
            </span>
            <span className="font-display text-lg">{s.title}</span>
          </p>
          <p className="truncate text-sm text-muted-foreground">{s.say}</p>
          <div className="mt-2 flex gap-1" aria-hidden>
            {story.map((x, i) => (
              <span key={x.href} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-foreground/10")} />
            ))}
          </div>
        </div>
        <button type="button" onClick={() => go(1)} disabled={step === story.length - 1} aria-label="Next" className="flex size-9 shrink-0 items-center justify-center rounded-xl hover:bg-foreground/5 disabled:opacity-30">
          <ChevronRight className="size-5" aria-hidden />
        </button>
        <button type="button" onClick={stopPresenting} aria-label="Exit presentation (Esc)" className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-foreground/5">
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
