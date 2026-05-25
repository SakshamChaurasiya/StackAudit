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
  isShared?: boolean;
};

export function ResultsCta({ summary, auditId, isShared = false }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const hasFindings = summary.recommendationCount > 0;

  // External/shared view — replace email capture with a "run your own" CTA
  if (isShared) {
    return (
      <section
        aria-label="Run your own audit"
        className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 to-transparent p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 max-w-lg">
            <h2 className="text-title-sm font-semibold tracking-tight">
              Audit your own AI stack
            </h2>
            <p className="text-body text-muted-foreground">
              Find out how much you could save on AI tools — free, instant, no signup required.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-3">
            <ShareButton />
            <Link
              href="/audit"
              id="shared-run-audit-btn"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              Run free audit →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await captureLeadAction(email, auditId, name || undefined);
      if (res.success) {
        setSubmitted(true);
        toast.success("Report sent! Check your inbox.", {
          description: "We've emailed you a link to your full audit results.",
        });
      } else {
        toast.error("Failed to send report", {
          description: res.error,
        });
      }
    } catch (err) {
      console.error("Lead capture form submission error:", err);
      toast.error("Failed to send report");
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
              Get your savings report by email
            </h2>
            <p className="text-body text-muted-foreground">
              We&apos;ll send a summary of your ${summary.totalAnnualSaving.toFixed(0)} in potential annual savings
              straight to your inbox — so you can share it with your team.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full lg:w-auto lg:min-w-72">
            {submitted ? (
              <div className="rounded-lg bg-success/10 px-4 py-3 text-center text-sm font-medium text-success ring-1 ring-success/20">
                ✓ Check your inbox — report is on its way!
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-2 w-full sm:max-w-md lg:w-auto">
                <input
                  type="text"
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  maxLength={100}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    id="email-report-btn"
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-brand-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" aria-hidden />
                    )}
                    Send report
                  </button>
                </div>
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

