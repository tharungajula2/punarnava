import type { Metadata } from "next";
import { Suspense } from "react";
import { Details, PageHeader, Panel } from "@/components/os-shell/page";
import { DataTable } from "@/components/os/data-table";
import { ContentSkeleton, Pill, Stat, StatGrid, type Tone } from "@/components/os/ui";
import { getDecisions } from "@/lib/data/lab";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Decisions" };

const tone: Record<string, Tone> = { Decided: "good", Proposed: "warn", Open: "info", Superseded: "neutral" };
const dot: Record<string, string> = { Decided: "bg-status-verified", Proposed: "bg-status-placeholder", Open: "bg-primary", Superseded: "bg-muted-foreground" };

export default function DecisionsPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const d = await getDecisions();
  const count = (s: string) => d.filter((x) => x.status === s).length;
  const waiting = d.filter((x) => x.status === "Proposed" || x.status === "Open");
  const baseCase = d.find((x) => x.id === "D-001");

  return (
    <>
      <PageHeader
        href="/os/execution/decisions"
        insight={
          <>
            {count("Decided")} decided, {waiting.length} waiting on the founder{" "}
            <span className="text-muted-foreground">{baseCase && baseCase.status !== "Decided" ? "— including the base case itself." : "."}</span>
          </>
        }
        context="Every choice that shapes the numbers, with its reason, so nothing is decided twice or by accident."
      />

      <StatGrid cols={4}>
        <Stat big label="Logged" value={d.length} />
        <Stat big label="Decided" value={count("Decided")} tone="good" />
        <Stat big label="Proposed — to confirm" value={count("Proposed")} />
        <Stat big label="Open" value={count("Open")} />
      </StatGrid>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Panel title="Waiting on you" sub="Proposed or open — confirm, change or close.">
          <ul className="flex flex-col gap-2.5">
            {waiting.map((x) => (
              <li key={x.id} className="rounded-xl border border-status-placeholder/40 bg-status-placeholder/8 p-3">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{x.id}</span>
                  <Pill tone={tone[x.status]}>{x.status}</Pill>
                </p>
                <p className="mt-1.5 text-sm font-medium">{x.decision}</p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Timeline" sub="Newest first.">
          <ol className="relative flex flex-col gap-4 border-l border-border/70 pl-5">
            {d.map((x) => (
              <li key={x.id} className="relative">
                <span className={cn("absolute top-1.5 -left-[25px] size-2.5 rounded-full ring-4 ring-background", dot[x.status])} aria-hidden />
                <p className="text-xs text-muted-foreground">
                  <span className="font-mono">{x.id}</span> · {x.date} · {x.status}
                </p>
                <p className="mt-0.5 text-sm">{x.decision}</p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Details title="Show details — reasons and sources" count={d.length}>
        <DataTable
          caption="Decision log"
          rows={d.map((x) => ({ ...x, where: x.href ?? "" }))}
          columns={[
            { key: "date", label: "Date", sub: "id" },
            { key: "decision", label: "Decision", className: "min-w-64" },
            { key: "reason", label: "Reason", className: "min-w-64" },
            { key: "status", label: "Status", format: "badge" },
            { key: "source", label: "Source" },
          ]}
          tones={tone}
          filterKey="status"
          filterLabel="Status"
          searchPlaceholder="Search decisions"
          minWidth={960}
        />
      </Details>
    </>
  );
}
