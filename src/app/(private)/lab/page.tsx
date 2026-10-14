import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { labModules } from "@/components/lab/modules";
import { ContentSkeleton, Stat, StatGrid } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { getLabOverview } from "@/lib/data/lab";

export const metadata: Metadata = { title: "R&D lab" };

export default function LabPage() {
  return (
    <>
      <PageHeader
        eyebrow="R&D lab"
        title="Business research, with sources"
        description="Market, competitors, prices, unit economics, scenarios and risk — all drawn from the three research reports and the shared assumptions file. Every figure names its source."
      />
      <Suspense fallback={<ContentSkeleton />}>
        <LabOverview />
      </Suspense>
    </>
  );
}

async function LabOverview() {
  const o = await getLabOverview();
  return (
    <>
      <StatGrid>
        <Stat label="Assumptions" value={o.stats.total} hint={`${o.stats.researched} researched · ${o.stats.placeholder} placeholder · ${o.stats.verified} verified`} />
        <Stat label="With a clickable source" value={o.stats.withLink} hint="Research files lost their links — see Research gaps." tone={o.stats.withLink === 0 ? "bad" : undefined} />
        <Stat label="Research gaps" value={o.gaps} hint="Ready-to-paste prompts" />
        <Stat label="Data room" value={`${o.docsAvailable} / ${o.docs}`} hint="Documents available" />
      </StatGrid>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {labModules.slice(1).map((m) => (
          <li key={m.href}>
            <Link href={m.href} className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/40">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <m.icon className="size-4" aria-hidden />
              </span>
              <span>
                <span className="flex items-center gap-1.5 font-medium">
                  {m.label}
                  <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{m.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
