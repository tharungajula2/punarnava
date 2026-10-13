"use client";

import { Button } from "@/components/ui/button";

export default function PrivateError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 py-16">
      <h1 className="text-3xl font-normal">This section couldn&apos;t load.</h1>
      <p className="max-w-md text-muted-foreground">Something went wrong on our side. Please try again.</p>
      <Button onClick={reset} className="h-10 rounded-xl px-4">
        Try again
      </Button>
    </div>
  );
}
