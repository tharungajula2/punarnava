import type { Metadata } from "next";
import { Suspense } from "react";
import { DataTable } from "@/components/os/data-table";
import { ContentSkeleton, Stat, StatGrid } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { requireRole } from "@/lib/auth/session";
import { getDecisions } from "@/lib/data/lab";

export const metadata: Metadata = { title: "Decision log" };

export default function DecisionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="R&D lab · Decision log"
        title="What we decided, and why"
        description="Every material choice with its date, reason and status. 'Proposed' means recommended by the research but still waiting for the founder to confirm."
      />
      <Suspense fallback={<ContentSkeleton />}>
        <DecisionsContent />
      </Suspense>
    </>
  );
}

async function DecisionsContent() {
  await requireRole();
  const d = await getDecisions();
  const count = (s: string) => d.filter((x) => x.status === s).length;
  return (
    <>
      <StatGrid>
        <Stat label="Decisions logged" value={d.length} />
        <Stat label="Decided" value={count("Decided")} tone="good" />
        <Stat label="Proposed — founder to confirm" value={count("Proposed")} />
        <Stat label="Open" value={count("Open")} />
      </StatGrid>
      <div className="mt-8">
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
          tones={{ Decided: "good", Proposed: "warn", Open: "info", Superseded: "neutral" }}
          filterKey="status"
          filterLabel="Status"
          searchPlaceholder="Search decisions"
          minWidth={960}
        />
      </div>
    </>
  );
}
