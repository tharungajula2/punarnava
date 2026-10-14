import { ThemeToggleButton } from "@/components/layout/theme-toggle-button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

// Server component: works out the Button classes here so only a tiny client button
// ships (keeps ~30 KB of Base UI + class-merging JS off the landing page).
export function ThemeToggle() {
  return <ThemeToggleButton className={cn(buttonVariants({ variant: "ghost", size: "icon" }))} />;
}
