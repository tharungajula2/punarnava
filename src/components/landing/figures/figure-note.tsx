import type { AssumptionId } from "@/data/assumptions";
import { cn } from "@/lib/utils";

/** A short confidence note beside a figure, without a second page to read. */
export function FigureNote({ ids, className }: { ids: readonly AssumptionId[]; className?: string }) {
  const isRegulation = ids.some((id) => id.startsWith("epr_cat1_recycled_content"));
  const isWasteEstimate = ids.includes("bengaluru_plastic_waste_low");

  if (isRegulation) {
    return (
      <p className={cn("mt-4 text-xs text-muted-foreground", className)}>
        Target shares:{" "}
        <a href="https://egazette.gov.in/WriteReadData/2025/263615.pdf" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">
          Government of India, Plastic Waste Management (Second Amendment) Rules, 2025
        </a>.
      </p>
    );
  }

  return (
    <p className={cn("mt-4 text-xs text-muted-foreground", className)}>
      {isWasteEstimate ? "Waste volumes are reported estimates; the proposed plant would need its own supply contracts." : "Illustrative planning model, not results from an operating plant."}
    </p>
  );
}
