import { ChevronDown } from "lucide-react";
import { StatusBadge } from "@/components/os/ui";
import type { Status } from "@/data/assumptions";
import { cn } from "@/lib/utils";
import { allTabs } from "./nav";

// Page building blocks for Punarnava OS. Server-safe (no hooks).
// Pattern: every page = one question → one headline insight → 3–5 visuals → "Show details".

export function PageHeader({
  href,
  insight,
  context,
  status,
  actions,
}: {
  /** The tab's route; its question and section come from nav.ts. */
  href: string;
  /** The answer, as one sentence. Numbers in it must come from assumptions.ts. */
  insight: React.ReactNode;
  /** One short line of context under the insight. */
  context?: React.ReactNode;
  /** Status of the key number in the insight. */
  status?: Status | "sample";
  actions?: React.ReactNode;
}) {
  const tab = allTabs.find((t) => t.href === href);
  return (
    <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-4xl">
        <p className="flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-primary uppercase">
          {tab ? (
            <>
              <tab.section.icon className="size-3.5" aria-hidden />
              {tab.section.label}
              {tab.section.tabs.length > 1 ? <span className="text-muted-foreground">· {tab.label}</span> : null}
            </>
          ) : null}
        </p>
        {tab ? <p className="mt-3 text-sm text-muted-foreground">{tab.question}</p> : null}
        <h1 className="os-insight mt-1 text-3xl leading-tight font-normal xl:text-[2.6rem]">{insight}</h1>
        {context || status ? (
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {status === "sample" ? (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-1.5 text-[10px] tracking-wide text-primary uppercase">Sample</span>
            ) : status ? (
              <StatusBadge status={status} />
            ) : null}
            {context}
          </p>
        ) : null}
      </div>
      {actions ? <div className="os-detail flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

/** Collapsible "Show details" drawer: tables, notes and fine print live here. */
export function Details({ title = "Show details", count, children, className }: { title?: string; count?: number; children: React.ReactNode; className?: string }) {
  return (
    <details className={cn("os-detail group mt-6 rounded-2xl border border-border/70 bg-card/40", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
        <span>
          {title}
          {count !== undefined ? <span className="ml-2 text-xs font-normal">({count})</span> : null}
        </span>
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="flex flex-col gap-8 border-t border-border/60 p-5">{children}</div>
    </details>
  );
}

/** A titled block inside a Details drawer. */
export function DetailBlock({ title, note, children }: { title: string; note?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-sans text-sm font-medium">{title}</h3>
      {note ? <p className="mt-0.5 text-xs text-muted-foreground">{note}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Glass card for a visual, with a short title. */
export function Panel({ title, sub, children, className, action }: { title?: string; sub?: React.ReactNode; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn("os-panel flex min-w-0 flex-col rounded-2xl border border-border/70 bg-card/70 p-5 shadow-soft backdrop-blur-sm", className)}>
      {title ? (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-sans text-sm font-medium">{title}</h2>
            {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** Numbered takeaway list (instead of paragraphs). */
export function Takeaways({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {items.map((t, i) => (
        <li key={i} className="flex gap-3 text-sm">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-medium text-primary">{i + 1}</span>
          <span className="pt-0.5">{t}</span>
        </li>
      ))}
    </ol>
  );
}

/** Horizontal step flow (process diagram). */
export function Flow({ steps }: { steps: { title: string; body?: string }[] }) {
  return (
    <ol className="grid grid-cols-2 gap-x-2 gap-y-5 md:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]" style={{ "--n": steps.length } as React.CSSProperties}>
      {steps.map((s, i) => (
        <li key={s.title} className="relative flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/12 text-xs font-medium text-primary">{i + 1}</span>
            {i < steps.length - 1 ? <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-primary/50 to-primary/10" /> : null}
          </div>
          <p className="pr-2 text-sm leading-snug font-medium">{s.title}</p>
          {s.body ? <p className="pr-2 text-xs leading-snug text-muted-foreground">{s.body}</p> : null}
        </li>
      ))}
    </ol>
  );
}

/** Big progress gauge for a gate: current vs required. */
export function GateBar({ label, current, target, status }: { label: string; current: number; target: number; status?: Status }) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm">{label}</p>
        <p className="flex shrink-0 items-center gap-2 font-display text-xl whitespace-nowrap tabular-nums">
          {Math.round(current)}%<span className="text-sm text-muted-foreground">/ ≥{Math.round(target)}%</span>
          {status ? <StatusBadge status={status} /> : null}
        </p>
      </div>
      <div className="relative mt-2.5 h-2.5 overflow-hidden rounded-full bg-foreground/8" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={target} aria-valuenow={current}>
        <div className={cn("h-full rounded-full", current >= target ? "bg-status-verified" : "bg-status-placeholder")} style={{ width: `${Math.max(pct, 1.5)}%` }} />
      </div>
    </div>
  );
}
