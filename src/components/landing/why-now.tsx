import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { whyNow } from "@/data/landing";

export function WhyNow() {
  return (
    <Section id="why-now" className="bg-secondary/40">
      <SectionHeader id="why-now" kicker={whyNow.kicker} title={whyNow.title} body={whyNow.body} />
      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <Reveal className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <h3 className="font-sans text-sm font-medium text-muted-foreground">{whyNow.chartTitle}</h3>
          <div className="mt-8 flex h-56 items-end gap-3 sm:gap-5" role="list">
            {whyNow.chart.map((d) => (
              <div key={d.year} role="listitem" className="flex h-full flex-1 flex-col justify-end text-center">
                <span className="font-display text-2xl">{d.value}%</span>
                <div
                  className="mt-2 rounded-t-xl bg-gradient-to-t from-primary to-[color-mix(in_oklch,var(--primary),var(--brand-mint)_45%)]"
                  style={{ height: `${d.value}%` }}
                  aria-hidden
                />
                <span className="mt-2 text-sm text-muted-foreground">{d.year}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <ul className="flex flex-col gap-4">
          {whyNow.points.map((p, i) => (
            <li key={p.title}>
              <Reveal delay={i * 0.08} className="rounded-2xl border border-border bg-card/70 p-6">
                <h3 className="text-xl font-normal">{p.title}</h3>
                <p className="mt-2 text-muted-foreground">{p.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
