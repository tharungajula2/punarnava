import { Database, KeyRound } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ModuleCard, ModuleGrid, PageHeader } from "@/components/private/page-shell";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin" };

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted/50" aria-label="Loading" />}>
      <AdminContent />
    </Suspense>
  );
}

// Proxy already blocks non-owners; this re-checks on the server before rendering.
async function AdminContent() {
  await requireRole("owner");
  return (
    <>
      <PageHeader
        eyebrow="Admin · owner only"
        title="Control room"
        description="Owner-only tools. Investors never see this page or anything marked owner-only."
      />
      <ModuleGrid>
        <ModuleCard icon={Database} title="Assumptions viewer" description="Every number, its source, confidence and status." phase="Phase 4" />
        <ModuleCard
          icon={KeyRound}
          title="Access"
          description="To revoke all investor access, change INVESTOR_PASSWORD in Vercel and redeploy."
          phase="Live"
        />
      </ModuleGrid>
    </>
  );
}
