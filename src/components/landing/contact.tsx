import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { buttonVariants } from "@/components/ui/button-variants";
import { contact } from "@/data/landing";
import { cn } from "@/lib/utils";

export function Contact() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return (
    <Section id="contact">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <SectionHeader id="contact" kicker={contact.kicker} title={contact.title} body={contact.body} />
        <Reveal className="flex flex-wrap items-start gap-3 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
          {contact.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-xl px-5 text-base")}
            >
              {l.label}
            </a>
          ))}
          <a
            href={`mailto:${email ?? "you@example.com"}`}
            className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-xl px-5 text-base")}
          >
            Email for work enquiries
          </a>
        </Reveal>
      </div>
    </Section>
  );
}
