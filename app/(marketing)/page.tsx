import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          AI Spend Audit
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Find hidden savings in your AI stack
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          StackAudit analyzes your AI subscriptions and delivers deterministic,
          financially grounded recommendations — no guesswork.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/audit">Start free audit</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#how-it-works">How it works</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
