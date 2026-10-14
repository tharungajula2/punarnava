"use client";

// The root error boundary ships with every page, so it avoids the Button primitive
// (Base UI + class merging, ~30 KB of JS). These are the exact classes
// <Button size="lg" className="h-11 rounded-xl px-5"> renders.
const tryAgainClass =
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-primary text-primary-foreground hover:bg-primary/80 gap-1.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 h-11 rounded-xl px-5";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-32 text-center">
      <h1 className="text-4xl font-normal">Something went wrong.</h1>
      <p className="max-w-md text-muted-foreground">The page couldn&apos;t load. Please try again.</p>
      <button type="button" data-slot="button" onClick={reset} className={tryAgainClass}>
        Try again
      </button>
    </main>
  );
}
