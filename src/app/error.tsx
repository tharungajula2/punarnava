"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-32 text-center">
      <h1 className="text-4xl font-normal">Something went wrong.</h1>
      <p className="max-w-md text-muted-foreground">The page couldn&apos;t load. Please try again.</p>
      <Button onClick={reset} size="lg" className="h-11 rounded-xl px-5">
        Try again
      </Button>
    </main>
  );
}
