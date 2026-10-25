import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { LoopGraphic } from "@/components/landing/loop-graphic";
import { buttonVariants } from "@/components/ui/button-variants";
import { hero } from "@/data/landing";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* Soft brand wash behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_85%_20%,color-mix(in_oklch,var(--brand-mint)_35%,transparent),transparent),radial-gradient(50%_40%_at_10%_90%,color-mix(in_oklch,var(--brand-sand)_60%,transparent),transparent)] dark:opacity-40"
      />
      <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:py-28">
        <div className="flex flex-col items-start">
          <p className="rounded-full border border-border bg-card/60 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
            {hero.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="mt-6 text-5xl leading-[1.02] font-normal sm:text-7xl"
          >
            {hero.title} <em className="text-primary">{hero.titleEmphasis}</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground sm:text-xl">{hero.promise}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={hero.primaryCta.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-xl px-5 text-base")}
            >
              {hero.primaryCta.label} <ArrowRight data-icon="inline-end" />
            </Link>
            <Link
              href={hero.secondaryCta.href}
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-11 rounded-xl px-5 text-base")}
            >
              {hero.secondaryCta.label}
            </Link>
          </div>
          <dl className="mt-12 grid w-full max-w-xl grid-cols-3 gap-4 border-t border-border pt-6">
            {hero.facts.map((f) => (
              <div key={f.label}>
                <dt className="sr-only">{f.label}</dt>
                <dd className="font-display text-2xl sm:text-3xl">{f.value}</dd>
                <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mx-auto w-full max-w-md hero-in lg:max-w-none">
          <LoopGraphic stages={hero.loopStages} />
        </div>
      </Container>
    </section>
  );
}
