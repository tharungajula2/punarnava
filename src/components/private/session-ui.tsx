import { LogOut } from "lucide-react";
import { PrivateNav } from "@/components/private/private-nav";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { isOpenMode } from "@/lib/auth/mode";
import { getSession } from "@/lib/auth/session";

// These read the session cookie, so each one sits inside a <Suspense>
// boundary in the private layout; everything around them prerenders.

export async function RoleBadge() {
  if (isOpenMode()) return null;
  const session = await getSession();
  if (!session) return null;
  return session.role === "investor" ? (
    <span className="rounded-full border border-accent/40 bg-accent/15 px-2.5 py-1 text-xs font-medium text-foreground">
      Investor view · read-only
    </span>
  ) : (
    <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">Owner</span>
  );
}

export async function RoleNav({ compact = false }: { compact?: boolean }) {
  const session = await getSession();
  return <PrivateNav compact={compact} showAdmin={session?.role === "owner"} />;
}

export function LogoutButton() {
  if (isOpenMode()) return null; // nothing to sign out of
  return (
    <form action={logout}>
      <Button type="submit" variant="ghost" size="sm" aria-label="Sign out" className="gap-1.5 rounded-xl">
        <LogOut aria-hidden />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </form>
  );
}
