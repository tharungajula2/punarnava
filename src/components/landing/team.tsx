import { Users } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { team } from "@/data/landing";

export function Team() {
  return (
    <Section id="team">
      <SectionHeader id="team" kicker={team.kicker} title={team.title} />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {team.principles.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <h3 className="text-xl font-normal">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-6 grid gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8 md:grid-cols-2">
        <div>
          <h3 className="font-sans text-sm font-medium text-muted-foreground">Team</h3>
          <ul className="mt-4 flex flex-col gap-4">
            {team.people.map((person) => (
              <li key={person.name} className="flex items-center gap-4">
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center rounded-full bg-accent font-display text-lg text-accent-foreground"
                >
                  {person.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
                <span>
                  <span className="block font-medium">{person.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {person.role} · {person.note}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="flex items-center gap-2 font-sans text-sm font-medium text-muted-foreground">
            <Users className="size-4" aria-hidden /> Planned first hires
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {team.hiring.map((role) => (
              <li key={role} className="rounded-full border border-border px-3 py-1.5 text-sm">
                {role}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Section>
  );
}
