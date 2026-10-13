import type { LucideIcon } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  /** Optional actions (buttons/links) shown beside the title on wide screens. */
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-widest text-primary uppercase">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-normal sm:text-4xl">{title}</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
      </div>
      {children ? <div className="flex shrink-0 flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

/** Empty-state card for a module that hasn't been built yet. */
export function ModuleCard({ icon: Icon, title, description, phase }: { icon: LucideIcon; title: string; description: string; phase: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="text-xs text-muted-foreground">{phase}</span>
      </div>
      <div>
        <h2 className="font-sans text-base font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function ModuleGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}
