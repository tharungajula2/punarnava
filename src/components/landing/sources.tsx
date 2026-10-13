import { Container } from "@/components/layout/container";
import { num, publicAssumptions, type Status } from "@/data/assumptions";
import { disclaimer } from "@/data/landing";

const statusLabel: Record<Status, string> = {
  placeholder: "Placeholder",
  researched: "Researched",
  verified: "Verified",
};

/** Collapsed list of every public assumption with its source — honesty by default. */
export function Sources() {
  // Simulation-model parameters live on /admin/assumptions; the landing table lists only pitch figures.
  const rows = publicAssumptions().filter((a) => a.category !== "simulation" && a.category !== "operations");
  return (
    <section aria-label="Sources and assumptions" className="border-t border-border/60 py-10">
      <Container>
        <p className="max-w-3xl text-sm text-muted-foreground">{disclaimer}</p>
        <details className="group mt-4">
          <summary className="cursor-pointer text-sm font-medium text-primary underline-offset-4 hover:underline">
            Sources &amp; assumptions ({rows.length})
          </summary>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Assumption</th>
                  <th className="px-4 py-2 font-medium">Value</th>
                  <th className="px-4 py-2 font-medium">Source</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="border-t border-border/60 align-top">
                    <td className="px-4 py-2">{a.label}</td>
                    <td className="px-4 py-2 font-mono whitespace-nowrap tabular-nums">
                      {num(a.value, 3)} {a.unit}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{a.source}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{statusLabel[a.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </Container>
    </section>
  );
}
