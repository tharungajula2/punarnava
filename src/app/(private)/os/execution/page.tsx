import type { Metadata } from "next";
import { Suspense } from "react";
import { Details, GateBar, PageHeader, Panel } from "@/components/os-shell/page";
import { DataTable } from "@/components/os/data-table";
import { ContentSkeleton, Pill } from "@/components/os/ui";
import { getRoadmap } from "@/lib/data";
import { pct } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Roadmap" };

export default function RoadmapPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const r = await getRoadmap();
  const current = r.progress.find((p) => p.pct < 100) ?? r.progress[r.progress.length - 1];
  const open = r.tasks.filter((t) => t.status !== "done");
  const next = open
    .filter((t) => t.phase === current.n)
    .sort((a, b) => a.priority.localeCompare(b.priority))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        href="/os/execution"
        insight={
          <>
            {current.tag}: {current.name.toLowerCase()} —{" "}
            <span className="text-muted-foreground">
              {current.done} of {current.total} tasks done. Signed supply and offtake unlock the plant.
            </span>
          </>
        }
        context={`${open.length} open tasks, ${open.filter((t) => t.priority === "P1").length} of them P1. Each phase is unlocked by a gate, not a date.`}
      />

      <ol className="grid gap-4 lg:grid-cols-4">
        {r.phases.map((p, i) => {
          const prog = r.progress[i];
          const isNow = prog.n === current.n;
          return (
            <li key={p.tag} className={cn("relative flex flex-col gap-3 rounded-2xl border p-5 shadow-soft backdrop-blur-sm", isNow ? "border-primary/50 bg-primary/8" : "border-border/70 bg-card/70")}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs tracking-[0.16em] text-primary uppercase">{p.tag}</p>
                {isNow ? <Pill tone="info">Now</Pill> : <span className="text-xs text-muted-foreground">{p.when}</span>}
              </div>
              <p className="font-display text-2xl leading-tight">{p.name}</p>
              <div className="mt-auto">
                <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>
                    {prog.done}/{prog.total} tasks
                  </span>
                  <span>{pct(prog.pct)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-foreground/8">
                  <div className={cn("h-full rounded-full", prog.pct === 100 ? "bg-status-verified" : "bg-primary")} style={{ width: `${Math.max(prog.pct, 2)}%` }} />
                </div>
              </div>
              <p className="rounded-xl bg-foreground/[0.04] p-2.5 text-xs leading-snug">
                <span className="font-medium">Gate · </span>
                {p.gate}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Gate to Phase 2" sub="Agreements in writing. Today's values are placeholders until the first is signed.">
          <div className="flex flex-col gap-6">
            {r.gates.map((g) => (
              <GateBar key={g.label} label={g.label} current={g.current} target={g.target} status={g.currentStatus} />
            ))}
          </div>
        </Panel>
        <Panel title={`Next in ${current.tag}`} sub="Highest priority first.">
          <ol className="flex flex-col gap-2">
            {next.map((t, i) => (
              <li key={t.id} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-medium text-primary">{i + 1}</span>
                <p className="min-w-0 flex-1 text-sm">{t.title}</p>
                <Pill tone={t.priority === "P1" ? "bad" : "neutral"}>{t.priority}</Pill>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Details title="Show details — all tasks" count={r.tasks.length}>
        <DataTable
          caption="Roadmap tasks"
          rows={r.tasks}
          filterKey="phaseLabel"
          filterLabel="Filter by phase"
          pageSize={30}
          minWidth={860}
          columns={[
            { key: "title", label: "Task", sub: "notes", className: "max-w-md" },
            { key: "phaseLabel", label: "Phase" },
            { key: "module", label: "Area", format: "badge" },
            { key: "priority", label: "Priority", format: "badge" },
            { key: "statusLabel", label: "Status", format: "badge" },
            { key: "owner", label: "Owner" },
          ]}
          tones={{ P1: "bad", P2: "warn", P3: "neutral", Done: "good", "In progress": "info", "To do": "neutral" }}
        />
        <p className="text-xs text-muted-foreground">Edit src/data/os/roadmap.ts to update tasks.</p>
      </Details>
    </>
  );
}
