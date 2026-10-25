import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailBlock, Details, Flow, PageHeader, Panel } from "@/components/os-shell/page";
import { Chart } from "@/components/os/chart";
import { ContentSkeleton, SimpleTable, Stat, StatGrid, StatusBadge } from "@/components/os/ui";
import { getEpr } from "@/lib/data";
import { inr, int, lakh, pct, tonnes } from "@/lib/format";

export const metadata: Metadata = { title: "EPR credits" };

export default function EprPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const e = await getEpr();
  const s = e.summary;
  const lift = s.ebitdaKg - s.ebitdaKgNoEpr;

  return (
    <>
      <PageHeader
        href="/os/operations/epr"
        insight={
          <>
            EPR certificates add ₹{int(lift, 2)} a kilo —{" "}
            <span className="text-muted-foreground">a bonus on top of pellets, not the business.</span>
          </>
        }
        status="researched"
        context="Brands must buy certificates from registered processors. We can only issue them after consents, registration and an audit."
      />

      <StatGrid cols={4}>
        <Stat big label="Registration" value={s.registered ? "Registered" : "Not yet"} hint="Needs plant consents first" tone={s.registered ? "good" : "bad"} />
        <Stat big label="Planned certificate price" value={`${inr(s.basePrice, 2)}/kg`} hint="Low, certificate-only quote" status="researched" />
        <Stat big label="Margin without EPR" value={`₹${int(s.ebitdaKgNoEpr, 2)}/kg`} hint={`vs ₹${int(s.ebitdaKg, 2)} with EPR`} status="researched" />
        <Stat big label="Registered processors" value={int(s.pwps)} hint={`selling to ${int(s.pibos)} obligated brands`} status="researched" />
      </StatGrid>

      <Panel className="mt-6" title="Path to the first certificate" sub={`CPCB: registration processed in ~${int(s.pwpProcessingDays)} days, physical audit within ${int(s.pwpAuditDays)} days.`}>
        <Flow steps={e.steps.map((st) => ({ title: st.title, body: st.body }))} />
      </Panel>

      <Panel className="mt-6" title="Certificate income per year" sub={`₹ lakh at steady output (${int(s.outputTMonth)} t/month) · only the base case is in the finance model`}>
        <Chart
          ariaLabel="EPR income scenarios"
          height={260}
          data={e.scenarios.map((r) => ({ name: r.label, annual: r.annual }))}
          xKey="name"
          unit="lakh"
          series={[{ key: "annual", label: "Per year", color: "var(--chart-2)" }]}
        />
      </Panel>

      <Details>
        <DetailBlock title="Income scenarios">
          <SimpleTable
            minWidth={640}
            head={["Scenario", "₹ / kg", "₹ L / month", "₹ L / year", ""]}
            rows={e.scenarios.map((r) => [
              <span key="l">
                <span className="font-medium">{r.label}</span>
                <span className="block text-xs text-muted-foreground">{r.note}</span>
              </span>,
              inr(r.priceKg, 2),
              int(r.monthly / 1e5, 2),
              int(r.annual / 1e5, 1),
              <StatusBadge key="s" status={r.status} />,
            ])}
          />
        </DetailBlock>
        <DetailBlock title={`Credits in the sample run — ${e.sample.days} days`} note="The simulation books one kg of eligibility per kg dispatched. No real certificates exist until registration and audit.">
          <SimpleTable
            head={["Eligible", "At base price", "Share of revenue"]}
            rows={[[tonnes(e.sample.creditsKg), lakh(e.sample.creditsKg * s.basePrice, 2), pct((s.basePrice / (s.basePrice + s.pelletPrice)) * 100, 1)]]}
          />
        </DetailBlock>
      </Details>
    </>
  );
}
