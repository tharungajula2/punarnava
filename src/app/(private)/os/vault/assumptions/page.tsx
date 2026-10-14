import type { Metadata } from "next";
import { Suspense } from "react";
import { Details, PageHeader, Panel } from "@/components/os-shell/page";
import { Chart } from "@/components/os/chart";
import { ContentSkeleton, Stat, StatGrid } from "@/components/os/ui";
import { AssumptionsTable } from "@/components/private/assumptions-table";
import { assumptions, assumptionStats, categoryLabels, type Assumption, type Category } from "@/data/assumptions";

export const metadata: Metadata = { title: "Assumptions" };

const order: Category[] = ["market", "regulation", "prices", "plant", "capex", "funding", "economics", "roadmap", "operations", "simulation", "competitors", "alternatives"];

export default function AssumptionsPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const rows = [...assumptions] as Assumption[];
  const s = assumptionStats(rows);
  const byCat = order
    .map((c) => {
      const list = rows.filter((a) => a.category === c);
      return {
        cat: categoryLabels[c].replace(/ \(.*\)$/, ""),
        researched: list.filter((a) => a.status === "researched").length,
        placeholder: list.filter((a) => a.status === "placeholder").length,
        verified: list.filter((a) => a.status === "verified").length,
      };
    })
    .filter((r) => r.researched + r.placeholder + r.verified > 0);
  const share = (n: number) => `${(n / s.total) * 100}%`;

  return (
    <>
      <PageHeader
        href="/os/vault/assumptions"
        insight={
          <>
            {s.verified} of {s.total} numbers are verified —{" "}
            <span className="text-muted-foreground">
              {s.researched} come from research, {s.placeholder} are placeholders.
            </span>
          </>
        }
        context="One source of truth: src/data/assumptions.ts. Researched = from the research files. Verified = checked against a quote, contract or filing."
      />

      <Panel title="Status of every number" sub={`${s.total} assumptions`}>
        <div className="flex h-10 overflow-hidden rounded-xl" role="img" aria-label={`${s.verified} verified, ${s.researched} researched, ${s.placeholder} placeholder`}>
          <div className="bg-status-verified" style={{ width: share(s.verified) }} />
          <div className="flex items-center bg-status-researched px-3 text-sm font-medium text-white" style={{ width: share(s.researched) }}>
            Researched {s.researched}
          </div>
          <div className="flex items-center justify-end bg-status-placeholder px-3 text-sm font-medium text-ink" style={{ width: share(s.placeholder) }}>
            {s.placeholder}
          </div>
        </div>
        <ul className="mt-3 flex flex-wrap gap-5 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-status-verified" aria-hidden /> Verified {s.verified}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-status-researched" aria-hidden /> Researched {s.researched}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-status-placeholder" aria-hidden /> Placeholder {s.placeholder}
          </li>
        </ul>
      </Panel>

      <Panel className="mt-6" title="By category" sub="Simulation placeholders are modelling choices (truck sizes, breakdown rates), not missing research.">
        <Chart
          ariaLabel="Assumptions by category and status"
          height={280}
          data={byCat}
          xKey="cat"
          unit="count"
          series={[
            { key: "verified", label: "Verified", color: "var(--status-verified)", stack: "a" },
            { key: "researched", label: "Researched", color: "var(--status-researched)", stack: "a" },
            { key: "placeholder", label: "Placeholder", color: "var(--status-placeholder)", stack: "a" },
          ]}
        />
      </Panel>

      <div className="mt-6">
        <StatGrid cols={3}>
          <Stat big label="Low confidence" value={s.lowConfidence} hint="Single listing, official statement or company claim" />
          <Stat big label="Reports disagree" value={s.withConflict} hint="See Research gaps for which side we took" />
          <Stat big label="Have a source link" value={`${s.withLink} / ${s.total}`} tone={s.withLink === 0 ? "bad" : undefined} hint="Nothing can be verified without links" />
        </StatGrid>
      </div>

      <Details title="Browse every assumption" count={s.total}>
        <AssumptionsTable rows={rows} order={order} labels={categoryLabels} />
      </Details>
    </>
  );
}
