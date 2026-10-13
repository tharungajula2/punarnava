import { AlertTriangle, BookOpen, Calculator, FolderLock, GitBranch, Globe, Swords, Tags } from "lucide-react";
import type { Metadata } from "next";
import { ModuleCard, ModuleGrid, PageHeader } from "@/components/private/page-shell";

export const metadata: Metadata = { title: "R&D lab" };

const modules = [
  { icon: Globe, title: "Market overview", description: "Size, segments and demand for recycled pellets." },
  { icon: Swords, title: "Competitor map", description: "Who recycles what, where, and at what scale." },
  { icon: Tags, title: "Pricing intelligence", description: "Feedstock and pellet price ranges with sources." },
  { icon: Calculator, title: "Unit-economics model", description: "Interactive cost and margin per kg." },
  { icon: GitBranch, title: "Scenario planner", description: "Best, base and worst cases side by side." },
  { icon: AlertTriangle, title: "Risk register", description: "Key risks, owners and mitigations." },
  { icon: FolderLock, title: "Investor data room", description: "Documents list, with owner-only notes." },
  { icon: BookOpen, title: "Decision log", description: "What we decided, when, and why." },
];

export default function LabPage() {
  return (
    <>
      <PageHeader
        eyebrow="R&D lab"
        title="Business research, with sources"
        description="Market, pricing and risk work drawn from the research files and the shared assumptions."
      />
      <ModuleGrid>
        {modules.map((m) => (
          <ModuleCard key={m.title} {...m} phase="Phase 8" />
        ))}
      </ModuleGrid>
    </>
  );
}
