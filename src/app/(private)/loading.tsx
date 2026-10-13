export default function Loading() {
  return (
    <div aria-busy aria-label="Loading" className="flex flex-col gap-4">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="h-9 w-72 max-w-full animate-pulse rounded-lg bg-muted" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </div>
    </div>
  );
}
