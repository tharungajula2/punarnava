import type { Metadata } from "next";
import { Ask } from "@/components/landing/ask";
import { BusinessModel } from "@/components/landing/business-model";
import { Contact } from "@/components/landing/contact";
import { Economics } from "@/components/landing/economics";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { RevealObserver } from "@/components/landing/reveal-observer";
import { Problem } from "@/components/landing/problem";
import { Roadmap } from "@/components/landing/roadmap";
import { Sources } from "@/components/landing/sources";
import { Team } from "@/components/landing/team";
import { WhyNow } from "@/components/landing/why-now";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Problem />
        <WhyNow />
        <HowItWorks />
        <BusinessModel />
        <Economics />
        <Roadmap />
        <Team />
        <Ask />
        <Contact />
        <Sources />
      </main>
      <SiteFooter />
      <RevealObserver />
    </>
  );
}
