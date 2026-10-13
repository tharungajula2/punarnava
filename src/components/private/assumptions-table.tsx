"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Assumption, Category, Confidence, Status } from "@/data/assumptions";
import { cn } from "@/lib/utils";

const statusStyle: Record<Status, string> = {
  placeholder: "border-destructive/40 bg-destructive/10 text-destructive",
  researched: "border-border bg-muted text-foreground",
  verified: "border-primary/40 bg-primary/10 text-primary",
};
const statusLabel: Record<Status, string> = { placeholder: "Placeholder", researched: "Researched", verified: "Verified" };

const confidenceStyle: Record<Confidence, string> = {
  low: "border-destructive/30 text-destructive",
  medium: "border-border text-muted-foreground",
  high: "border-primary/40 text-primary",
};

function fmt(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 3 });
}

type Props = {
  rows: Assumption[];
  order: Category[];
  labels: Record<Category, string>;
};

export function AssumptionsTable({ rows, order, labels }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "all">("all");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (!q) return true;
      return [a.label, a.id, a.source, a.unit, a.notes ?? "", a.conflict ?? ""].some((s) => s.toLowerCase().includes(q));
    });
    return order
      .map((c) => ({ category: c, items: filtered.filter((a) => a.category === c) }))
      .filter((g) => g.items.length > 0);
  }, [rows, order, query, status]);

  const shown = grouped.reduce((n, g) => n + g.items.length, 0);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Search assumptions</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search label, id, source, notes…"
            className="w-full rounded-xl border border-input bg-background py-2.5 pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {(["all", "placeholder", "researched", "verified"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              aria-pressed={status === s}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                status === s ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {s === "all" ? "All" : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
        Showing {shown} of {rows.length}
      </p>

      {grouped.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          No assumptions match. Clear the search or status filter.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-8">
          {grouped.map((g) => (
            <section key={g.category} aria-labelledby={`cat-${g.category}`}>
              <h2 id={`cat-${g.category}`} className="font-sans text-sm font-medium tracking-wide text-primary uppercase">
                {labels[g.category]} <span className="text-muted-foreground normal-case">· {g.items.length}</span>
              </h2>
              <div className="mt-2 overflow-x-auto rounded-2xl border border-border">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 font-medium">Assumption</th>
                      <th className="px-4 py-2 font-medium">Value</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium">Confidence</th>
                      <th className="px-4 py-2 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((a) => (
                      <tr key={a.id} className="border-t border-border/60 align-top">
                        <td className="px-4 py-3">
                          <div className="font-medium">{a.label}</div>
                          <div className="mt-0.5 font-mono text-xs text-muted-foreground">{a.id}</div>
                          {a.ownerOnly ? <div className="mt-1 text-xs text-muted-foreground">Owner only — hidden from the public page</div> : null}
                          {a.notes ? <p className="mt-1.5 text-xs text-muted-foreground">{a.notes}</p> : null}
                          {a.conflict ? (
                            <p className="mt-1.5 rounded-lg border border-border bg-secondary/50 p-2 text-xs">
                              <span className="font-medium">Reports disagree: </span>
                              {a.conflict}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 font-mono whitespace-nowrap tabular-nums">
                          {fmt(a.value)} <span className="text-muted-foreground">{a.unit}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap", statusStyle[a.status])}>
                            {statusLabel[a.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-xs capitalize", confidenceStyle[a.confidence])}>
                            {a.confidence}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <div>{a.source}</div>
                          {a.sourceUrl ? (
                            <a
                              href={a.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-block text-primary underline-offset-4 hover:underline"
                            >
                              Open source ↗
                            </a>
                          ) : (
                            <span className="mt-1 inline-block text-xs">No link yet</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
