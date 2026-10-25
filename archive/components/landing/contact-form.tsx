"use client";

import { Mail } from "lucide-react";
import { useState } from "react";

const roles = ["Investor", "Waste supplier / collector", "Pellet buyer / converter", "Brand (EPR)", "Other"];

const fieldClass =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

/**
 * Builds a pre-filled email in the visitor's own mail app. Nothing is sent or stored by the site.
 * `submitClassName` comes from the server (contact.tsx) so this file stays free of the Button primitive.
 */
export function ContactForm({ email, submitClassName }: { email?: string; submitClassName: string }) {
  const [error, setError] = useState<string | null>(null);

  if (!email) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
        The contact address is being set up. Please check back shortly.
      </p>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !message) {
      setError("Please add your name and a short message.");
      return;
    }
    setError(null);
    const org = String(data.get("org") ?? "").trim();
    const role = String(data.get("role") ?? "");
    const subject = `Punarnava — ${role}${org ? ` (${org})` : ""}`;
    const body = `${message}\n\n— ${name}${org ? `, ${org}` : ""}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Name
          <input name="name" autoComplete="name" required className={fieldClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Organisation <span className="sr-only">(optional)</span>
          <input name="org" autoComplete="organization" placeholder="Optional" className={fieldClass} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        I am a…
        <select name="role" className={fieldClass} defaultValue={roles[0]}>
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Message
        <textarea name="message" rows={5} required className={fieldClass} />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" data-slot="button" className={submitClassName}>
          <Mail data-icon="inline-start" /> Open in my email app
        </button>
        <a href={`mailto:${email}`} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          or write to {email}
        </a>
      </div>
    </form>
  );
}
