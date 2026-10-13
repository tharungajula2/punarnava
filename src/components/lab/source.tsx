import { BookMarked } from "lucide-react";
import { Pill, Stat, StatusBadge } from "@/components/os/ui";
import type { Fig } from "@/lib/data/lab";
import { fmtValue, shortSource } from "@/lib/lab/format";
import { cn } from "@/lib/utils";

// Provenance UI for /lab: every figure carries its source and status.

/** Stat tile for one assumption: value, status badge, source underneath. */
export function FigStat({ f, label, value }: { f: Fig; label?: string; value?: React.ReactNode }) {
  return (
    <Stat
      label={label ?? f.label}
      value={value ?? fmtValue(f.value, f.unit)}
      status={f.status}
      hint={
        <span className="flex flex-col gap-0.5">
          <SourceText source={f.source} />
          {f.confidence === "low" ? <span>Low confidence{f.notes ? ` — ${f.notes}` : ""}</span> : null}
        </span>
      }
    />
  );
}

export function SourceText({ source, className }: { source: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-start gap-1 text-xs text-muted-foreground", className)}>
      <BookMarked className="mt-0.5 size-3 shrink-0" aria-hidden />
      <span>
        <span className="sr-only">Source: </span>
        {shortSource(source)}
      </span>
    </span>
  );
}

/** "Sources" footnote listing the assumptions behind a chart or table. */
export function SourceList({ figs, title = "Sources" }: { figs: Pick<Fig, "id" | "label" | "value" | "unit" | "source" | "status">[]; title?: string }) {
  return (
    <details className="mt-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-2.5 text-sm">
      <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
        {title} ({figs.length})
      </summary>
      <ul className="mt-2 flex flex-col gap-2">
        {figs.map((f) => (
          <li key={f.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span>{f.label}:</span>
            <span className="font-medium">{fmtValue(f.value, f.unit)}</span>
            <StatusBadge status={f.status} />
            <SourceText source={f.source} />
          </li>
        ))}
      </ul>
    </details>
  );
}

export function SourceKey() {
  return (
    <p className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>Source key:</span>
      <Pill>R1 = research/01-market.md</Pill>
      <Pill>R2 = research/02-unit-economics.md</Pill>
      <Pill>R3 = research/03-competitors-investors.md</Pill>
    </p>
  );
}
