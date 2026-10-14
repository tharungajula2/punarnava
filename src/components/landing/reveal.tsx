import { cn } from "@/lib/utils";

/**
 * Fades content up once when it scrolls into view. Pure CSS (`.reveal` in
 * globals.css) driven by <RevealObserver/>; content stays visible without JS
 * and for visitors who prefer reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={cn("reveal", className)} style={delay ? { transitionDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}
