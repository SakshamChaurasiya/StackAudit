"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Mail, Share2 } from "lucide-react";

import { ShareButton } from "@/components/results/share-button";
import { captureLeadAction } from "@/app/actions/lead";
import { toast } from "@/lib/toast";
import type { AuditSummary } from "@/lib/audit-engine/types";

type Props = {
  summary: AuditSummary;
  auditId: string;
};

export function ResultsCta({ summary, auditId }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const hasFindings = summary.recommendationCount > 0;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await captureLeadAction(email, auditId);
      if (res.success) {
        setSubmitted(true);
        toast.success("Report request saved!", {
          description: "We will email you the full report layout as soon as PDF delivery is active.",
        });
      } else {
        toast.error("Failed to save email", {
          description: res.error,
        });
      }
    } catch (err) {
      console.error("Lead capture form submission error:", err);
      toast.error("Failed to save email");
    } finally {
      setLoading(false);
    }
  };

  if (hasFindings) {
    return (
      <section
        aria-label="Next steps"
        className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 to-transparent p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1 max-w-lg">
            <h2 className="text-title-sm font-semibold tracking-tight">
              Want this in your inbox?
            </h2>
            <p className="text-body text-muted-foreground">
              Get a formatted PDF report with action steps emailed to you —
              arriving in the next release.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
            {submitted ? (
              <div className="rounded-lg bg-success/10 px-4 py-2.5 text-center text-sm font-medium text-success ring-1 ring-success/20">
                ✓ We&apos;ll email you when reports are ready!
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-2 w-full sm:max-w-md lg:w-auto">
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-64"
                />
                <button
                  id="email-report-btn"
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-brand-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" aria-hidden />
                  )}
                  Email me report
                </button>
              </form>
            )}
            <div className="hidden sm:block">
              <ShareButton />
            </div>
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
