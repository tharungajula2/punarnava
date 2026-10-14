import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { num, publicAssumptions, type Status } from "@/data/assumptions";
import { disclaimer } from "@/data/landing";

const statusLabel: Record<Status, string> = {
  placeholder: "Placeholder",
  researched: "Researched",
  verified: "Verified",
};

// Simulation-model parameters live on /admin/assumptions; the public table lists only pitch figures.
const publicRows = () =>
  publicAssumptions().filter(
    (a) => a.category !== "simulation" && a.category !== "operations" && a.category !== "competitors",
  );

/** Landing footnote: the disclaimer plus a link to the full sources table on /sources. */
export function Sources() {
  return (
    <section aria-label="Sources and assumptions" className="border-t border-border/60 py-10">
      <Container>
        <p className="max-w-3xl text-sm text-muted-foreground">{disclaimer}</p>
        <Link
          href="/sources"
          className="mt-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Sources &amp; assumptions ({publicRows().length})
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </Container>
    </section>
  );
}

/** Every public assumption with its source and status — honesty by default. */
export function SourcesTable() {
  const rows = publicRows();
  return (
    <>
      {/* Phones: one card per figure */}
      <ul className="flex flex-col gap-3 sm:hidden">
        {rows.map((a) => (
          <li key={a.id} className="rounded-2xl border border-border bg-card p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <span>{a.label}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{statusLabel[a.status]}</span>
            </div>
            <div className="mt-1.5 font-mono tabular-nums">
              {num(a.value, 3)} {a.unit}
            </div>
            <div className="mt-1.5 text-xs text-muted-foreground">{a.source}</div>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Public assumptions, values, sources and status</caption>
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Assumption</th>
              <th className="px-4 py-2 font-medium">Value</th>
              <th className="px-4 py-2 font-medium">Source</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-t border-border/60 align-top">
                <td className="px-4 py-2">{a.label}</td>
                <td className="px-4 py-2 font-mono whitespace-nowrap tabular-nums">
                  {num(a.value, 3)} {a.unit}
                </td>
                <td className="px-4 py-2 text-muted-foreground">{a.source}</td>
                <td className="px-4 py-2 whitespace-nowrap">{statusLabel[a.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
