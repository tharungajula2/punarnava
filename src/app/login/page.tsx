import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LogoMark } from "@/components/brand/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Link href="/" aria-label="Punarnava home" className="rounded-xl">
            <LogoMark className="size-12" />
          </Link>
          <div>
            <h1 className="text-3xl font-normal">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Private workspace for the Punarnava team and invited investors.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          {/* The form reads ?next= from the URL, so it renders at request time. */}
          <Suspense fallback={<div className="h-[136px]" aria-hidden />}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:text-foreground hover:underline">
            ← Back to punarnava
          </Link>
        </p>
      </div>
    </main>
  );
}
