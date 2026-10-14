import type { Metadata } from "next";
import { Suspense } from "react";
import { Details, Flow, PageHeader, Panel } from "@/components/os-shell/page";
import { DataTable } from "@/components/os/data-table";
import { ContentSkeleton, Pill, Stat, StatGrid, StatusBadge } from "@/components/os/ui";
import { getAssumption } from "@/data/assumptions";
import { getCompliance } from "@/lib/data";
import { int } from "@/lib/format";

export const metadata: Metadata = { title: "Licences" };

const stageOrder = ["Set-up", "Before construction", "Before production", "Before EPR certificates", "If applicable"];

export default function LicencesPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const c = await getCompliance();
  const granted = c.licences.filter((l) => l.status === "Granted").length;
  const stages = [...stageOrder.filter((s) => c.licences.some((l) => l.stage === s)), ...new Set(c.licences.map((l) => l.stage).filter((s) => !stageOrder.includes(s)))];
  const monthsStatus = getAssumption("time_to_production_months").status;

  return (
    <>
      <PageHeader
        href="/os/execution/licences"
        insight={
          <>
            {c.licences.length} approvals stand between us and production —{" "}
            <span className="text-muted-foreground">
              {granted} granted so far, up to {int(c.monthsToProduction)} months from site lock.
            </span>
          </>
        }
        status={monthsStatus}
        context="Consents first, machines second. Nothing is applied for until a site is locked."
      />

      <StatGrid cols={4}>
        <Stat big label="Approvals tracked" value={c.licences.length} />
        <Stat big label="Granted" value={granted} tone={granted === 0 ? "bad" : "good"} hint="Nothing applied for yet" />
        <Stat big label="In progress" value={c.licences.filter((l) => l.status === "Preparing" || l.status === "Applied").length} />
        <Stat big label="Site lock → production" value={`≤ ${int(c.monthsToProduction)} mo`} hint="Leased shed, upper bound (R1)" status={monthsStatus} />
      </StatGrid>

      <Panel className="mt-6" title="Critical path" sub="The order R1 and R2 recommend.">
        <Flow steps={c.sequence.map((s) => ({ title: s }))} />
      </Panel>

      <Panel className="mt-6" title="What is needed when" sub="Each approval by the stage it unlocks · colour = status">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {stages.map((stage) => (
            <div key={stage} className="rounded-xl border border-border/60 p-3">
              <p className="text-xs font-medium text-muted-foreground">{stage}</p>
              <ul className="mt-2 flex flex-col gap-2">
                {c.licences
                  .filter((l) => l.stage === stage)
                  .map((l) => (
                    <li key={l.id} className="flex flex-col gap-1 text-sm leading-snug">
                      <span>{l.name}</span>
                      <span className="flex flex-wrap items-center gap-1.5">
                        <Pill tone={l.status === "Granted" ? "good" : l.status === "Not started" ? "bad" : "warn"}>{l.status}</Pill>
                        {l.timelineStatus ? <StatusBadge status={l.timelineStatus} /> : null}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

      <Details title="Show details — authorities, documents, timelines" count={c.licences.length}>
        <DataTable
          caption="Licences and approvals"
          rows={c.licences}
          filterKey="stage"
          filterLabel="Filter by stage"
          minWidth={1080}
          searchPlaceholder="Search licence, authority, document…"
          columns={[
            { key: "name", label: "Licence / approval", sub: "notes", className: "max-w-xs" },
            { key: "authority", label: "Authority", className: "max-w-[14rem]" },
            { key: "stage", label: "Needed", format: "badge" },
            { key: "status", label: "Status", format: "badge" },
            { key: "documents", label: "Documents", format: "list", className: "max-w-xs" },
            { key: "timeline", label: "Typical timeline", className: "max-w-[14rem]" },
          ]}
          tones={{ "Not started": "bad", Preparing: "warn", Applied: "info", Granted: "good", "Set-up": "neutral", "Before construction": "info", "Before production": "info", "Before EPR certificates": "info", "If applicable": "neutral" }}
        />
        <p className="text-xs text-muted-foreground">Update status in src/data/os/compliance.ts as applications move.</p>
      </Details>
    </>
  );
}
