import type { Metadata } from "next";
import { Suspense } from "react";
import { Chart, ChartCard } from "@/components/os/chart";
import { Card, ContentSkeleton, SampleNotice, Section, SimLink, SimpleTable, Stat, StatGrid, StatusBadge } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { requireRole } from "@/lib/auth/session";
import { getEpr } from "@/lib/data";
import { inr, int, lakh, pct, tonnes } from "@/lib/format";

export const metadata: Metadata = { title: "EPR credits" };

export default function EprPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operating system · EPR credits"
        title="Certificates are an upside, not the foundation"
        description="Extended Producer Responsibility makes brands pay for recycling. A registered, audited processor can sell certificates for the tonnes it recycles. The plan earns its margin without them."
      >
        <SimLink label="See credits in simulation" />
      </PageHeader>
      <Suspense fallback={<ContentSkeleton />}>
        <EprContent />
      </Suspense>
    </>
  );
}

async function EprContent() {
  await requireRole();
  const e = await getEpr();
  const s = e.summary;

  return (
    <>
      <StatGrid>
        <Stat label="Processor registration" value={s.registered ? "Registered" : "Not registered"} hint="Needs consents first" tone={s.registered ? "good" : "bad"} />
        <Stat label="Base certificate price" value={`${inr(s.basePrice, 2)}/kg`} status="researched" />
        <Stat label="EBITDA per kg without EPR" value={`₹${int(s.ebitdaKgNoEpr, 2)}`} hint={`vs ₹${int(s.ebitdaKg, 2)} with base EPR`} status="researched" />
        <Stat label="Registered processors" value={int(s.pwps)} hint={`vs ${int(s.pibos)} obligated brands`} status="researched" />
      </StatGrid>

      <Section title="Path to the first certificate" description={`PWP processing target ${int(s.pwpProcessingDays)} days; physical audit within ${int(s.pwpAuditDays)} days (CPCB SOP).`}>
        <Card>
          <ol className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-5">
            {e.steps.map((st, i) => (
              <li key={st.title} className="flex gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{i + 1}</span>
                <span>
                  <span className="block font-medium">{st.title}</span>
                  <span className="text-muted-foreground">{st.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </Section>

      <Section title="Certificate income scenarios" description={`At steady output (${int(s.outputTMonth)} t/month). Only the base case is in the finance model.`}>
        <SimpleTable
          minWidth={640}
          head={["Scenario", "₹ / kg", "₹ L / month", "₹ L / year", ""]}
          rows={e.scenarios.map((r) => [
            <span key="l">
              <span className="font-medium">{r.label}</span>
              <span className="block text-xs text-muted-foreground">{r.note}</span>
            </span>,
            <span key="p" className="tabular-nums">{inr(r.priceKg, 2)}</span>,
            <span key="m" className="tabular-nums">{int(r.monthly / 1e5, 2)}</span>,
            <span key="y" className="tabular-nums">{int(r.annual / 1e5, 1)}</span>,
            <StatusBadge key="s" status={r.status} />,
          ])}
        />
      </Section>

      <Section title="Why demand for recycled HDPE rises" description="Mandatory recycled content in rigid (Category I) packaging.">
        <ChartCard title="Recycled-content obligation" subtitle="% of rigid packaging, by financial year">
          <Chart ariaLabel="Recycled content obligation" data={s.recycledContent} xKey="year" unit="pct" series={[{ key: "pct", label: "Required", color: "var(--chart-1)" }]} />
        </ChartCard>
      </Section>

      <Section title={`Credits in the sample run — ${e.sample.days} days`}>
        <SampleNotice>The simulation books one kg of certificate eligibility per kg dispatched. No real certificates exist until registration and audit.</SampleNotice>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Eligible tonnes" value={tonnes(e.sample.creditsKg)} status="sample" />
          <Stat label="At base price" value={lakh(e.sample.creditsKg * s.basePrice, 2)} status="sample" />
          <Stat label="Share of revenue" value={pct((s.basePrice / (s.basePrice + s.pelletPrice)) * 100, 1)} status="sample" />
        </div>
      </Section>
    </>
  );
}
