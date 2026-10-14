import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { DataTable } from "@/components/os/data-table";
import { Card, ContentSkeleton, Section, Stat, StatGrid } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { getCompliance } from "@/lib/data";
import { int } from "@/lib/format";

export const metadata: Metadata = { title: "Compliance & licences" };

export default function CompliancePage() {
  return (
    <>
      <PageHeader
        eyebrow="Operating system · Compliance & licences"
        title="Every approval between a lease and a certificate"
        description="Authorities, documents and planning timelines from the research. Timelines are planning allowances, not statutory guarantees, unless marked as a published maximum. Status is today's real status."
      />
      <Suspense fallback={<ContentSkeleton />}>
        <ComplianceContent />
      </Suspense>
    </>
  );
}

async function ComplianceContent() {
  const c = await getCompliance();
  const byStatus = (s: string) => c.licences.filter((l) => l.status === s).length;

  return (
    <>
      <StatGrid>
        <Stat label="Licences tracked" value={c.licences.length} />
        <Stat label="Granted" value={byStatus("Granted")} tone="bad" hint="Nothing applied for yet" />
        <Stat label="Not started" value={byStatus("Not started")} />
        <Stat label="Site lock → compliant production" value={`≤ ${int(c.monthsToProduction)} months`} hint="Leased shed, upper bound (R1)" status="researched" />
      </StatGrid>

      <Section title="Critical path" description="The order R1 and R2 recommend. Consents first, machines second.">
        <Card>
          <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
            {c.sequence.map((step, i) => (
              <li key={step} className="flex items-center gap-1">
                <span className="rounded-full border border-border bg-muted/60 px-3 py-1">
                  <span className="mr-1.5 text-xs text-muted-foreground">{i + 1}</span>
                  {step}
                </span>
                {i < c.sequence.length - 1 ? <ChevronRight className="size-4 text-muted-foreground" aria-hidden /> : null}
              </li>
            ))}
          </ol>
        </Card>
      </Section>

      <Section title="Licence tracker" description="Filter by stage. Update status in src/data/os/compliance.ts as applications move.">
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
      </Section>
    </>
  );
}
