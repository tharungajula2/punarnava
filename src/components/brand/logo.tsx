import { cn } from "@/lib/utils";

/**
 * Punarnava loop mark: an almost-closed ring completed by a single pellet —
 * material going round and becoming new again.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <circle
        cx="16"
        cy="16"
        r="11"
        fill="none"
        className="stroke-primary"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="56 100"
        transform="rotate(-50 16 16)"
      />
      <circle cx="17.15" cy="5.06" r="2.6" className="fill-[oklch(0.74_0.12_165)] dark:fill-mint" />
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      <span className="font-display text-xl font-medium tracking-tight text-foreground">
        Punarnava
      </span>
    </span>
  );
}
