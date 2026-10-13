import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("scroll-mt-16 py-20 sm:py-28", className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeader({
  id,
  kicker,
  title,
  body,
  className,
}: {
  id: string;
  kicker: string;
  title: string;
  body?: string;
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-3xl", className)}>
      <p className="text-sm font-medium tracking-wide text-primary uppercase">{kicker}</p>
      <h2 id={`${id}-title`} className="mt-3 text-3xl leading-tight font-normal sm:text-5xl">
        {title}
      </h2>
      {body && <p className="mt-5 text-lg text-pretty text-muted-foreground">{body}</p>}
    </Reveal>
  );
}
