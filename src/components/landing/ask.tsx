import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { ask } from "@/data/landing";

export function Ask() {
  return (
    <Section id="ask" className="bg-teal-deep text-paper dark:bg-card dark:text-foreground">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="[&_p]:text-paper/75 dark:[&_p]:text-muted-foreground [&_p:first-child]:text-mint">
          <SectionHeader id="ask" kicker={ask.kicker} title={ask.title} body={ask.body} />
        </div>
        <Reveal>
          <div className="flex items-baseline justify-between border-b border-paper/20 pb-3 dark:border-border">
            <h3 className="font-sans text-sm font-medium opacity-75">Use of funds</h3>
            <p className="font-display text-2xl">₹{ask.totalCrore} cr</p>
          </div>
          <ul className="mt-4 flex flex-col gap-4">
            {ask.funds.map((f) => (
              <li key={f.label}>
                <div className="flex justify-between text-sm">
                  <span>{f.label}</span>
                  <span className="font-mono tabular-nums opacity-80">₹{f.crore} cr</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper/15 dark:bg-muted">
                  <div className="h-full rounded-full bg-mint" style={{ width: `${f.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
