import { ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { model } from "@/data/landing";

export function BusinessModel() {
  return (
    <Section id="model" className="bg-secondary/40">
      <SectionHeader id="model" kicker={model.kicker} title={model.title} />
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {model.streams.map((s, i) => (
          <Reveal
            key={s.name}
            delay={i * 0.1}
            className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]"
          >
            <span className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              {s.tag}
            </span>
            <h3 className="mt-5 text-2xl font-normal">{s.name}</h3>
            <p className="mt-4 font-display text-4xl text-primary">{s.price}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.priceNote}</p>
            <p className="mt-5 text-muted-foreground">{s.body}</p>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-6 flex flex-col gap-4 rounded-2xl bg-teal-deep p-8 text-paper sm:flex-row sm:items-start dark:bg-accent dark:text-accent-foreground">
        <ShieldCheck className="size-8 shrink-0 text-mint" aria-hidden />
        <div>
          <h3 className="text-2xl font-normal">{model.principle.title}</h3>
          <p className="mt-2 opacity-85">{model.principle.body}</p>
        </div>
      </Reveal>
    </Section>
  );
}
