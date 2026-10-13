import type { Metadata } from "next";
import { Suspense } from "react";
import { DataTable } from "@/components/os/data-table";
import { Card, ContentSkeleton, Progress, Section, Stat, StatGrid, StatusBadge } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { requireRole } from "@/lib/auth/session";
import { getRoadmap } from "@/lib/data";
import { pct } from "@/lib/format";

export const metadata: Metadata = { title: "Roadmap & tasks" };

export default function RoadmapPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operating system · Roadmap & tasks"
        title="Prove, build, run, scale"
        description="The same four phases as the investor page, each with a gate. Tasks come from the research recommendations; only work that has actually happened is marked done."
      />
      <Suspense fallback={<ContentSkeleton />}>
        <RoadmapContent />
      </Suspense>
    </>
  );
}

async function RoadmapContent() {
  const { role } = await requireRole();
  const r = await getRoadmap(role);
  const open = r.tasks.filter((t) => t.status !== "done");
  const current = r.progress.find((p) => p.pct < 100);

  return (
    <>
      <StatGrid>
        <Stat label="Tasks" value={r.tasks.length} />
        <Stat label="Done" value={r.tasks.length - open.length} tone="good" />
        <Stat label="Open P1 tasks" value={open.filter((t) => t.priority === "P1").length} />
        <Stat label="Current phase" value={current ? `${current.tag} · ${current.name}` : "All phases done"} />
      </StatGrid>

      <Section title="Phases and gates">
        <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {r.phases.map((p, i) => {
            const prog = r.progress[i];
            return (
              <li key={p.tag}>
                <Card className="flex h-full flex-col gap-3">
                  <div>
                    <p className="text-xs tracking-widest text-primary uppercase">{p.tag}</p>
                    <p className="mt-1 font-display text-xl">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.when}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.body}</p>
                  <p className="rounded-xl bg-muted/60 p-2.5 text-xs">{p.gate}</p>
                  <div className="mt-auto">
                    <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>
                        {prog.done} of {prog.total} {prog.total === 1 ? "task" : "tasks"}
                      </span>
                      <span>{pct(prog.pct)}</span>
                    </div>
                    <Progress value={prog.pct} label={`${p.tag} progress`} tone={prog.pct === 100 ? "good" : "info"} />
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section title="Phase 1 gate status" description="Agreements in writing. Today's values are placeholders until the first agreement is signed.">
        <div className="grid gap-3 md:grid-cols-2">
          {r.gates.map((g) => (
            <Card key={g.label}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{g.label}</p>
                <StatusBadge status={g.currentStatus} />
              </div>
              <p className="mt-2 font-display text-2xl">
                {pct(g.current)} <span className="text-sm text-muted-foreground">of ≥{pct(g.target)} needed</span>
              </p>
              <div className="mt-3">
                <Progress value={g.current} max={g.target} tone="warn" label={g.label} />
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Tasks" description="Filter by phase; search by module or owner. Edit src/data/os/roadmap.ts to update.">
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
            { key: "module", label: "Module", format: "badge" },
            { key: "priority", label: "Priority", format: "badge" },
            { key: "statusLabel", label: "Status", format: "badge" },
            { key: "owner", label: "Owner" },
          ]}
          tones={{ P1: "bad", P2: "warn", P3: "neutral", Done: "good", "In progress": "info", "To do": "neutral" }}
        />
      </Section>
    </>
  );
}
