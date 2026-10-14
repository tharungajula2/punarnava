import { ArrowUpRight, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DetailBlock, Details, PageHeader, Panel } from "@/components/os-shell/page";
import { Chart } from "@/components/os/chart";
import { ContentSkeleton, SimpleTable } from "@/components/os/ui";
import { assumptions, type Assumption } from "@/data/assumptions";

export const metadata: Metadata = { title: "Sources" };

// The three research reports in /research. Raw text stays there; this is the map.
const reports = [
  { key: "R1", file: "research/01-market.md", title: "Market & regulation", covers: "Waste volumes, market size, EPR rules and recycled-content mandates, licences and timelines, price ranges." },
  { key: "R2", file: "research/02-unit-economics.md", title: "Unit economics", covers: "1, 5 and 10 t/day plant cases: capex, cost per kg, margins, break-even, staffing, stress tests." },
  { key: "R3", file: "research/03-competitors-investors.md", title: "Competitors & investors", covers: "Recyclers, collection platforms and aggregators in India; buyer segments; deal structures." },
] as const;

const OTHER = "Own modelling / founder";

function reportOf(a: Assumption): string {
  return reports.find((r) => a.source.includes(r.file))?.key ?? OTHER;
}

export default function SourcesPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const rows = assumptions as readonly Assumption[];
  const groups = [...reports.map((r) => r.key), OTHER].map((key) => {
    const list = rows.filter((a) => reportOf(a) === key);
    return {
      key,
      n: list.length,
      high: list.filter((a) => a.confidence === "high").length,
      medium: list.filter((a) => a.confidence === "medium").length,
      low: list.filter((a) => a.confidence === "low").length,
      placeholder: list.filter((a) => a.status === "placeholder").length,
    };
  });
  const fromReports = groups.filter((g) => g.key !== OTHER).reduce((a, g) => a + g.n, 0);
  const linked = rows.filter((a) => a.sourceUrl).length;
  const other = [...new Set(rows.filter((a) => reportOf(a) === OTHER).map((a) => a.source))];

  return (
    <>
      <PageHeader
        href="/os/vault/sources"
        insight={
          <>
            Three research reports supply {fromReports} of our {rows.length} numbers —{" "}
            <span className="text-muted-foreground">{linked === 0 ? "none links to its original source yet." : `${linked} link to an original source.`}</span>
          </>
        }
        context="The reports are ChatGPT deep-research summaries of public data. Before an investor relies on a figure, it needs a quote, filing or contract behind it."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {reports.map((r) => {
          const g = groups.find((x) => x.key === r.key)!;
          return (
            <section key={r.key} className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-soft backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs tracking-[0.16em] text-primary uppercase">
                  <FileText className="size-3.5" aria-hidden /> {r.key}
                </span>
                <span className="font-display text-3xl tabular-nums">{g.n}</span>
              </div>
              <h2 className="font-display text-xl">{r.title}</h2>
              <p className="text-sm text-muted-foreground">{r.covers}</p>
              <p className="mt-auto font-mono text-[11px] text-muted-foreground">{r.file}</p>
            </section>
          );
        })}
      </div>

      <Panel className="mt-6" title="How confident is each source?" sub="Number of figures by confidence rating">
        <Chart
          ariaLabel="Figures by source and confidence"
          height={260}
          data={groups.map((g) => ({ src: g.key, high: g.high, medium: g.medium, low: g.low }))}
          xKey="src"
          unit="count"
          series={[
            { key: "high", label: "High", color: "var(--status-verified)", stack: "a" },
            { key: "medium", label: "Medium", color: "var(--status-researched)", stack: "a" },
            { key: "low", label: "Low", color: "var(--status-placeholder)", stack: "a" },
          ]}
        />
      </Panel>

      <Details title="Show details — other sources, public page">
        <DetailBlock title={`${OTHER} (${groups.find((g) => g.key === OTHER)!.n} figures)`} note="Modelling choices and founder statements. Most are simulation parameters.">
          <SimpleTable head={["Source text"]} rows={other.map((s) => [s])} minWidth={400} />
        </DetailBlock>
        <DetailBlock title="Public version">
          <Link href="/sources" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            /sources — the investor-facing source table (public figures only) <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </DetailBlock>
      </Details>
    </>
  );
}
