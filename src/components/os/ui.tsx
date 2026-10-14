import { ArrowRight, Boxes, FlaskConical, Info, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { Status } from "@/data/assumptions";
import { cn } from "@/lib/utils";

// Shared building blocks for the /os modules. Server-safe (no hooks).

export type Tone = "good" | "warn" | "bad" | "info" | "neutral";

export const toneClass: Record<Tone, string> = {
  good: "border-status-verified/40 bg-status-verified/10 text-status-verified",
  warn: "border-status-placeholder/50 bg-status-placeholder/15 text-foreground",
  bad: "border-destructive/40 bg-destructive/10 text-destructive",
  info: "border-primary/30 bg-primary/10 text-primary",
  neutral: "border-border bg-muted text-muted-foreground",
};

export function Pill({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs whitespace-nowrap", toneClass[tone], className)}>{children}</span>;
}

const statusTone: Record<Status, Tone> = { placeholder: "warn", researched: "neutral", verified: "good" };
const statusText: Record<Status, string> = { placeholder: "Placeholder", researched: "Researched", verified: "Verified" };

/** Per-number badge required by CLAUDE.md §7 in private areas. */
export function StatusBadge({ status }: { status: Status }) {
  return (
    <Pill tone={statusTone[status]} className="px-1.5 text-[10px] tracking-wide uppercase">
      {statusText[status]}
    </Pill>
  );
}

export function StatGrid({ children, cols = 4 }: { children: React.ReactNode; cols?: 3 | 4 | 6 }) {
  const c = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 6: "lg:grid-cols-3 xl:grid-cols-6" }[cols];
  return <dl className={cn("grid grid-cols-2 gap-3", c)}>{children}</dl>;
}

export function Stat({
  label,
  value,
  hint,
  status,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  status?: Status | "sample";
  tone?: "bad" | "good";
}) {
  return (
    <div className="@container flex min-w-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-xs">
      {/* Narrow tiles (phones): badge above the label so the label keeps its width */}
      <dt className="flex flex-col-reverse items-start gap-1.5 text-xs text-muted-foreground @[13rem]:flex-row @[13rem]:justify-between @[13rem]:gap-2">
        <span>{label}</span>
        {status === "sample" ? <Pill tone="info" className="px-1.5 text-[10px] uppercase">Sample</Pill> : status ? <StatusBadge status={status} /> : null}
      </dt>
      <dd className={cn("mt-1.5 truncate font-display text-2xl", tone === "bad" && "text-destructive", tone === "good" && "text-status-verified")}>{value}</dd>
      {hint ? <dd className="mt-1 text-xs text-muted-foreground">{hint}</dd> : null}
    </div>
  );
}

export function Section({
  title,
  description,
  children,
  action,
  id,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
}) {
  const hid = id ?? `s-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={hid} className="mt-12 first:mt-0">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <h2 id={hid} className="text-2xl font-normal">
            {title}
          </h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-xs", className)}>{children}</div>;
}

/** Banner for anything that is not real company data. */
export function SampleNotice({ children, source = "sim" }: { children?: React.ReactNode; source?: "sim" | "static" }) {
  return (
    <div role="note" className="mb-6 flex gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4 text-sm">
      <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <p>
        <span className="font-medium">Sample data. </span>
        {children ??
          (source === "sim"
            ? "Punarnava is pre-revenue. Records below come from a four-week run of the base-case simulation (fixed seed), so every figure traces back to the assumptions file — they are not real trips, lots or customers."
            : "Records below are placeholders that show the structure. Names are not real companies.")}
      </p>
    </div>
  );
}

export function SimLink({ label = "Open in simulation", href = "/sim" }: { label?: string; href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
    >
      <Boxes className="size-4" aria-hidden />
      {label}
      <ArrowRight className="size-3.5" aria-hidden />
    </Link>
  );
}

export function LinkButton({ href, label, icon: Icon = FlaskConical }: { href: string; label: string; icon?: LucideIcon }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
      <Icon className="size-4" aria-hidden />
      {label}
    </Link>
  );
}

export function Progress({ value, max = 100, tone = "info", label }: { value: number; max?: number; tone?: "info" | "warn" | "good"; label: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const bar = { info: "bg-primary", warn: "bg-status-placeholder", good: "bg-status-verified" }[tone];
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-[width]", bar)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ icon: Icon = Info, title, children }: { icon?: LucideIcon; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="font-medium">{title}</p>
      {children ? <div className="max-w-md text-sm text-muted-foreground">{children}</div> : null}
    </div>
  );
}

/** Plain responsive table for small, fixed lists (no search needed). */
export function SimpleTable({ head, rows, minWidth = 560 }: { head: React.ReactNode[]; rows: React.ReactNode[][]; minWidth?: number }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead className="bg-muted/60 text-muted-foreground">
          <tr>
            {head.map((h, i) => (
              <th key={i} scope="col" className="px-4 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border/60 align-top">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-3">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ContentSkeleton() {
  return (
    <div aria-label="Loading" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-muted/50" />
    </div>
  );
}
