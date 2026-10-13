"use client";

import { Search, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { inr, int, kg, lakh, pct, tonnes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Pill, type Tone } from "./ui";

export type Format = "text" | "kg" | "t" | "inr" | "lakh" | "pct" | "int" | "dec1" | "badge" | "list";

export type Column = {
  key: string;
  label: string;
  format?: Format;
  align?: "right";
  /** Secondary text key shown under the main value. */
  sub?: string;
  className?: string;
};

type Row = Record<string, unknown>;

type Props = {
  rows: Row[];
  columns: Column[];
  /** Column whose distinct values become filter chips. */
  filterKey?: string;
  filterLabel?: string;
  /** Value → tone for "badge" columns. */
  tones?: Record<string, Tone>;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyBody?: string;
  pageSize?: number;
  minWidth?: number;
  caption: string;
};

function render(value: unknown, format: Format = "text", tones?: Record<string, Tone>): React.ReactNode {
  if (value === null || value === undefined || value === "") return <span className="text-muted-foreground">—</span>;
  const n = typeof value === "number" ? value : NaN;
  switch (format) {
    case "kg":
      return kg(n);
    case "t":
      return tonnes(n, 2);
    case "inr":
      return inr(n);
    case "lakh":
      return lakh(n, 2);
    case "pct":
      return pct(n, 1);
    case "int":
      return int(n);
    case "dec1":
      return int(n, 1);
    case "badge":
      return <Pill tone={tones?.[String(value)] ?? "neutral"}>{String(value)}</Pill>;
    case "list":
      return Array.isArray(value) ? (
        <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
          {value.map((x) => (
            <li key={String(x)}>{String(x)}</li>
          ))}
        </ul>
      ) : (
        String(value)
      );
    default:
      return String(value);
  }
}

/** Searchable, filterable table for module records. Rows are plain data from the server. */
export function DataTable({
  rows,
  columns,
  filterKey,
  filterLabel = "Filter",
  tones,
  searchPlaceholder = "Search…",
  emptyTitle = "Nothing recorded yet",
  emptyBody,
  pageSize = 20,
  minWidth = 720,
  caption,
}: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [limit, setLimit] = useState(pageSize);

  const options = useMemo(() => (filterKey ? [...new Set(rows.map((r) => String(r[filterKey] ?? "")))].filter(Boolean).sort() : []), [rows, filterKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterKey && filter !== "all" && String(r[filterKey]) !== filter) return false;
      if (!q) return true;
      return Object.values(r).some((v) => (Array.isArray(v) ? v.join(" ") : String(v ?? "")).toLowerCase().includes(q));
    });
  }, [rows, query, filter, filterKey]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
        <p className="font-medium">{emptyTitle}</p>
        {emptyBody ? <p className="max-w-md text-sm text-muted-foreground">{emptyBody}</p> : null}
      </div>
    );
  }

  const shown = filtered.slice(0, limit);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Search {caption}</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(pageSize);
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </label>
        {options.length > 1 ? (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={filterLabel}>
            {["all", ...options].map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  setFilter(o);
                  setLimit(pageSize);
                }}
                aria-pressed={filter === o}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  filter === o ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {o === "all" ? "All" : o}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
        Showing {shown.length} of {filtered.length}
        {filtered.length !== rows.length ? ` (filtered from ${rows.length})` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-3 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
          <SearchX className="size-5" aria-hidden />
          No matches. Clear the search or filter.
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm" style={{ minWidth }}>
            <caption className="sr-only">{caption}</caption>
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} scope="col" className={cn("px-4 py-2.5 font-medium whitespace-nowrap", c.align === "right" && "text-right")}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={String(r.id ?? i)} className="border-t border-border/60 align-top">
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-2.5", c.align === "right" && "text-right tabular-nums", c.className)}>
                      {render(r[c.key], c.format, tones)}
                      {c.sub && r[c.sub] ? <div className="mt-0.5 text-xs text-muted-foreground">{String(r[c.sub])}</div> : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filtered.length > limit ? (
        <button type="button" onClick={() => setLimit(filtered.length)} className="mt-3 text-sm text-primary underline-offset-4 hover:underline">
          Show all {filtered.length}
        </button>
      ) : null}
    </div>
  );
}
