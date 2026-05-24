"use client";

import Link from "next/link";
import { Mail, Share2 } from "lucide-react";

import { ShareButton } from "@/components/results/share-button";
import { toast } from "@/lib/toast";
import type { AuditSummary } from "@/lib/audit-engine/types";

type Props = {
  summary: AuditSummary;
};

export function ResultsCta({ summary }: Props) {
  const hasFindings = summary.recommendationCount > 0;

  const handleEmailCapture = () => {
    toast.info("Email reports coming soon", {
      description: "Full PDF reports and email delivery arrive in Phase 8.",
    });
  };

  if (hasFindings) {
    return (
      <section
        aria-label="Next steps"
        className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 to-transparent p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-title-sm font-semibold tracking-tight">
              Want this in your inbox?
            </h2>
            <p className="text-body text-muted-foreground">
              Get a formatted PDF report with action steps emailed to you —
              arriving in the next release.
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <ShareButton />
            <button
              id="email-report-btn"
              type="button"
              onClick={handleEmailCapture}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              <Mail className="h-4 w-4" aria-hidden />
              Email me this report
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Already optimized CTA
  return (
    <section
      aria-label="Next steps"
      className="rounded-2xl border border-success/20 bg-success/5 p-6 sm:p-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-title-sm font-semibold tracking-tight">
            Share your results
          </h2>
          <p className="text-body text-muted-foreground">
            Your stack is well-optimised. Share this audit with your team or
            run a new audit after your next renewal cycle.
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <ShareButton />
          <Link
            href="/audit"
            id="new-audit-btn"
            className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2.5 text-sm font-medium text-success-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Share2 className="h-4 w-4" aria-hidden />
            Run another audit
          </Link>
        </div>
      </div>
    </section>
  );
}
