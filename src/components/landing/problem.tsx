import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { problem } from "@/data/landing";

export function Problem() {
  return (
    <Section id="problem">
      <SectionHeader id="problem" kicker={problem.kicker} title={problem.title} body={problem.body} />
      <dl className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {problem.stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <dt className="sr-only">{s.label}</dt>
            <dd className="font-display text-4xl">
              {s.value}
              {s.unit && <span className="ml-1.5 font-sans text-base text-muted-foreground">{s.unit}</span>}
            </dd>
            <dd className="mt-3 text-sm text-muted-foreground">{s.label}</dd>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}
