import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SourcesTable } from "@/components/landing/sources";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { disclaimer } from "@/data/landing";

export const metadata: Metadata = {
  title: "Sources & assumptions",
  description: "Every figure on the Punarnava pitch, with its value, source and research status.",
  alternates: { canonical: "/sources" },
};

export default function SourcesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-12 sm:py-16">
        <Container>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to the pitch
          </Link>
          <h1 className="mt-6 font-display text-4xl tracking-tight sm:text-5xl">Sources &amp; assumptions</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Every number on the pitch comes from this list. Status shows how far each one has been checked:
            <strong className="font-medium text-foreground"> Researched</strong> = taken from desk research,
            <strong className="font-medium text-foreground"> Placeholder</strong> = not yet researched or decided,
            <strong className="font-medium text-foreground"> Verified</strong> = confirmed with a quote, contract or trial.
          </p>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{disclaimer}</p>
          <div className="mt-8">
            <SourcesTable />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
