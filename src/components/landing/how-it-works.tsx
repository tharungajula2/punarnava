import {
  BadgeCheck,
  CircleDot,
  Droplets,
  Flame,
  ScanLine,
  Scissors,
  Truck,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { how } from "@/data/landing";

const icons: Record<(typeof how.steps)[number]["icon"], LucideIcon> = {
  truck: Truck,
  scan: ScanLine,
  scissors: Scissors,
  droplets: Droplets,
  wind: Wind,
  flame: Flame,
  "circle-dot": CircleDot,
  "badge-check": BadgeCheck,
};

export function HowItWorks() {
  return (
    <Section id="how">
      <SectionHeader id="how" kicker={how.kicker} title={how.title} body={how.body} />

      {/* Flow track: pellets moving left → right along the value chain */}
      <div aria-hidden className="relative mt-14 h-2 overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 w-[200%] animate-[flow_6s_linear_infinite] bg-[radial-gradient(circle,var(--primary)_2.5px,transparent_3px)] bg-[length:28px_8px] bg-repeat-x bg-center" />
      </div>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {how.steps.map((step, i) => {
          const Icon = icons[step.icon];
          return (
            <li key={step.title}>
              <Reveal
                delay={(i % 4) * 0.08}
                className="group h-full rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-colors hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 text-xl font-normal">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
