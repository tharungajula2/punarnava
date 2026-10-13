import { TrendingUp } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { money } from "@/data/assumptions";
import { economics } from "@/data/landing";

// One colour per cost line; margin is always the green "keep" colour.
const costColours = [
  "bg-chart-1",
  "bg-chart-4",
  "bg-chart-3",
  "bg-chart-2",
  "bg-foreground/50",
  "bg-foreground/35",
  "bg-foreground/20",
];

export function Economics() {
  const { perKg } = economics;
  const pct = (x: number) => `${(x / perKg.revenue) * 100}%`;

  return (
    <Section id="economics">
      <SectionHeader id="economics" kicker={economics.kicker} title={economics.title} body={economics.body} />

      <dl className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {economics.kpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 0.08} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <dt className="sr-only">{k.label}</dt>
            <dd className="font-display text-4xl text-primary">{k.value}</dd>
            <dd className="mt-3 text-sm text-muted-foreground">{k.label}</dd>
          </Reveal>
        ))}
      </dl>

      <Reveal className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-2xl font-normal">{perKg.title}</h3>
          <p className="text-sm text-muted-foreground">
            Revenue ₹{money(perKg.revenue)}/kg (pellets + EPR)
          </p>
        </div>

        <div className="mt-6 flex h-10 w-full overflow-hidden rounded-xl" aria-hidden>
          {perKg.costs.map((c, i) => (
            <div key={c.label} className={costColours[i]} style={{ width: pct(c.value) }} title={`${c.label}: ₹${money(c.value)}`} />
          ))}
          <div className="bg-chart-5" style={{ width: pct(perKg.margin) }} title={`Margin: ₹${money(perKg.margin)}`} />
        </div>

        <ul className="mt-6 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {perKg.costs.map((c, i) => (
            <li key={c.label} className="flex items-center gap-2.5">
              <span className={`size-3 shrink-0 rounded-sm ${costColours[i]}`} aria-hidden />
              <span className="text-muted-foreground">{c.label}</span>
              <span className="ml-auto font-mono tabular-nums">₹{money(c.value)}</span>
            </li>
          ))}
          <li className="flex items-center gap-2.5 font-medium">
            <span className="size-3 shrink-0 rounded-sm bg-chart-5" aria-hidden />
            <span>EBITDA margin</span>
            <span className="ml-auto font-mono tabular-nums">₹{money(perKg.margin)}</span>
          </li>
        </ul>
      </Reveal>

      <Reveal className="mt-6 flex flex-col gap-4 rounded-2xl border border-dashed border-border p-6 sm:flex-row sm:p-8">
        <TrendingUp className="size-7 shrink-0 rotate-180 text-chart-4" aria-hidden />
        <div>
          <h3 className="text-xl font-normal">{economics.stress.title}</h3>
          <p className="mt-2 text-muted-foreground">{economics.stress.body}</p>
        </div>
      </Reveal>
    </Section>
  );
}
