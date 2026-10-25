import { ArrowUpRight, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Details, PageHeader, Panel } from "@/components/os-shell/page";
import { ContentSkeleton, Pill, Stat, StatGrid, type Tone } from "@/components/os/ui";
import { getDataRoom } from "@/lib/data/lab";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Data room" };

const tone: Record<string, Tone> = { Available: "good", Draft: "warn", "Not started": "bad" };
const chip: Record<string, string> = {
  Available: "border-status-verified/40 bg-status-verified/10",
  Draft: "border-status-placeholder/40 bg-status-placeholder/10",
  "Not started": "border-dashed border-border bg-transparent text-muted-foreground",
};

export default function DataRoomPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const docs = await getDataRoom();
  const count = (s: string) => docs.filter((d) => d.status === s).length;
  const sections = [...new Set(docs.map((d) => d.section))];
  const available = count("Available");

  return (
    <>
      <PageHeader
        href="/os/vault"
        insight={
          <>
            {available} of {docs.length} documents are ready —{" "}
            <span className="text-muted-foreground">what&apos;s missing is real-world evidence: agreements, quotes, trial results.</span>
          </>
        }
        context="An index, not file storage: each document links to the page that holds it, or says what it still needs."
      />

      <StatGrid cols={4}>
        <Stat big label="Documents" value={docs.length} />
        <Stat big label="Available" value={available} tone="good" />
        <Stat big label="Draft" value={count("Draft")} />
        <Stat big label="Not started" value={count("Not started")} tone={count("Not started") > 0 ? "bad" : undefined} />
      </StatGrid>

      <Panel className="mt-6" title="The data room at a glance" sub="Green = ready · amber = draft · dashed = not started · click a ready document to open it">
        <div className="mb-5 flex h-2.5 overflow-hidden rounded-full bg-foreground/8" role="img" aria-label={`${available} available, ${count("Draft")} draft, ${count("Not started")} not started`}>
          <div className="bg-status-verified" style={{ width: `${(available / docs.length) * 100}%` }} />
          <div className="bg-status-placeholder" style={{ width: `${(count("Draft") / docs.length) * 100}%` }} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sections.map((sec) => (
            <div key={sec}>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{sec}</p>
              <ul className="flex flex-col gap-1.5">
                {docs
                  .filter((d) => d.section === sec)
                  .map((d) => (
                    <li key={d.id}>
                      {d.where?.href ? (
                        <Link href={d.where.href} className={cn("flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-sm hover:border-primary/50", chip[d.status])}>
                          <span className="min-w-0">{d.title}</span>
                          <ArrowUpRight className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                        </Link>
                      ) : (
                        <span className={cn("block rounded-lg border px-2.5 py-1.5 text-sm", chip[d.status])}>{d.title}</span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

      <Details title="Show details — what each document still needs, owner notes" count={docs.length}>
        <ul className="flex flex-col divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
          {docs.map((d) => (
            <li key={d.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">{d.title}</p>
                <p className="text-xs text-muted-foreground">
                  {d.section}
                  {d.where ? ` · ${d.where.label}` : ""}
                </p>
                {d.needs ? <p className="mt-1 text-sm text-muted-foreground">Needs: {d.needs}</p> : null}
                {d.ownerNote ? (
                  <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-foreground/[0.04] px-2.5 py-1.5 text-xs">
                    <Lock className="mt-0.5 size-3 shrink-0" aria-hidden />
                    <span>
                      <span className="font-medium">Owner note: </span>
                      {d.ownerNote}
                    </span>
                  </p>
                ) : null}
              </div>
              <Pill tone={tone[d.status]}>{d.status}</Pill>
            </li>
          ))}
        </ul>
      </Details>
    </>
  );
}
