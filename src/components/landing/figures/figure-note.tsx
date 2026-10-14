import Link from "next/link";
import { getAssumption, type AssumptionId } from "@/data/assumptions";
import { cn } from "@/lib/utils";

const reportNames: Record<string, string> = {
  "research/01-market.md": "market research (R1)",
  "research/02-unit-economics.md": "unit-economics research (R2)",
  "research/03-competitors-investors.md": "competitor research (R3)",
};

/** Research reports named in a source line, or else its lead phrase ("CPCB / MoEFCC reported data"). */
function sourceNames(a: { source: string }): string[] {
  const found = Object.entries(reportNames).filter(([path]) => a.source.includes(path)).map(([, name]) => name);
  return found.length ? found : [a.source.split(/[,(;]| — /)[0].trim()];
}

/**
 * Footnote under each landing infographic: which research the figures come from,
 * how far they have been checked, and a link to the full list on /sources.
 */
export function FigureNote({ ids, className }: { ids: readonly AssumptionId[]; className?: string }) {
  const rows = ids.map(getAssumption);
  const reports = [...new Set(rows.flatMap(sourceNames))];
  const counts = (["verified", "researched", "placeholder"] as const)
    .map((s) => ({ s, n: rows.filter((a) => a.status === s).length }))
    .filter((c) => c.n > 0);
  const status =
    counts.length === 1 ? `all ${counts[0].s}` : counts.map((c) => `${c.n} ${c.s}`).join(", ");

  return (
    <p className={cn("mt-4 text-xs text-muted-foreground", className)}>
      Figures: {reports.join(", ")} · {status} ·{" "}
      <Link href="/sources" className="font-medium underline-offset-4 hover:underline">
        Sources &amp; assumptions →
      </Link>
    </p>
  );
}
