import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { roadmap } from "@/data/landing";

export function Roadmap() {
  return (
    <Section id="roadmap" className="bg-secondary/40">
      <SectionHeader id="roadmap" kicker={roadmap.kicker} title={roadmap.title} />
      <ol className="relative mt-14 grid gap-6 lg:grid-cols-4">
        {/* Connecting line on large screens */}
        <span aria-hidden className="absolute top-[7px] right-8 left-8 hidden h-px bg-border lg:block" />
        {roadmap.phases.map((p, i) => (
          <li key={p.name} className="relative">
            <Reveal delay={i * 0.1} className="flex h-full flex-col">
              <span
                aria-hidden
                className={`relative size-4 rounded-full border-2 border-primary ${i === 0 ? "bg-primary" : "bg-background"}`}
              />
              <div className="mt-5 flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                <p className="text-sm text-muted-foreground">
                  {p.tag} · {p.when}
                </p>
                <h3 className="mt-2 text-2xl font-normal">{p.name}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{p.body}</p>
                <p className="mt-auto pt-5 text-sm font-medium text-primary">{p.gate}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
