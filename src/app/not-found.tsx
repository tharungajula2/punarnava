import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-32 text-center">
      <LogoMark className="size-14" />
      <h1 className="text-4xl font-normal">This page hasn&apos;t been recycled yet.</h1>
      <p className="max-w-md text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-xl px-5")}>
        Back to home
      </Link>
    </main>
  );
}
