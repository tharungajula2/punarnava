import { ArrowUpRight, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ContentSkeleton, Pill, Progress, Section, Stat, StatGrid, type Tone } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { requireRole } from "@/lib/auth/session";
import { getDataRoom } from "@/lib/data/lab";

export const metadata: Metadata = { title: "Investor data room" };

const tone: Record<string, Tone> = { Available: "good", Draft: "warn", "Not started": "neutral" };

export default function DataRoomPage() {
  return (
    <>
      <PageHeader
        eyebrow="R&D lab · Investor data room"
        title="What an investor can see today, and what is missing"
        description="An index of the documents a seed investor will ask for. R3 notes investors want feedstock evidence, trial yields, customer letters, regulatory readiness, margin sensitivity and working capital — most of that cannot exist until the proving phase."
      />
      <Suspense fallback={<ContentSkeleton />}>
        <DataRoomContent />
      </Suspense>
    </>
  );
}

async function DataRoomContent() {
  const { role } = await requireRole();
  const docs = await getDataRoom(role);
  const count = (s: string) => docs.filter((d) => d.status === s).length;
  const sections = [...new Set(docs.map((d) => d.section))];

  return (
    <>
      <StatGrid>
        <Stat label="Documents" value={docs.length} />
        <Stat label="Available" value={count("Available")} tone="good" />
        <Stat label="Draft" value={count("Draft")} />
        <Stat label="Not started" value={count("Not started")} hint="The missing pieces are mostly real-world evidence" />
      </StatGrid>
      <div className="mt-4">
        <Progress value={count("Available")} max={docs.length} tone="good" label="Share of data-room documents available" />
      </div>

      {sections.map((sec) => (
        <Section key={sec} title={sec}>
          <ul className="flex flex-col divide-y divide-border/60 overflow-hidden rounded-2xl border border-border bg-card">
            {docs
              .filter((d) => d.section === sec)
              .map((d) => (
                <li key={d.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">{d.title}</p>
                    {d.needs ? <p className="mt-0.5 text-sm text-muted-foreground">Needs: {d.needs}</p> : null}
                    {d.ownerNote ? (
                      <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs">
                        <Lock className="mt-0.5 size-3 shrink-0" aria-hidden />
                        <span>
                          <span className="font-medium">Owner note: </span>
                          {d.ownerNote}
                        </span>
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                    <Pill tone={tone[d.status]}>{d.status}</Pill>
                    {d.where ? (
                      d.where.href ? (
                        <Link href={d.where.href} className="flex items-center gap-1 text-xs text-primary hover:underline">
                          {d.where.label} <ArrowUpRight className="size-3" aria-hidden />
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">{d.where.label}</span>
                      )
                    ) : null}
                  </div>
                </li>
              ))}
          </ul>
        </Section>
      ))}
      <p className="mt-8 text-xs text-muted-foreground">
        This is an index, not file storage: documents live in the app pages linked above or will be added when they exist. Owner notes are hidden in the investor view.
      </p>
    </>
  );
}
