import { ContactForm } from "@/components/landing/contact-form";
import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { contact } from "@/data/landing";

export function Contact() {
  return (
    <Section id="contact">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <SectionHeader id="contact" kicker={contact.kicker} title={contact.title} body={contact.body} />
        <Reveal className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <ContactForm email={process.env.NEXT_PUBLIC_CONTACT_EMAIL} />
        </Reveal>
      </div>
    </Section>
  );
}
