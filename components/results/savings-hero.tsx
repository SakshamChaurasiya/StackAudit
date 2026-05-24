"use client";

import { CheckCircle2, TrendingDown } from "lucide-react";

import type { AuditSummary } from "@/lib/audit-engine/types";

function formatDollars(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

type Props = {
  summary: AuditSummary;
};

export function SavingsHero({ summary }: Props) {
  const isOptimized = summary.totalAnnualSaving === 0;

  if (isOptimized) {
    return (
      <div className="animate-fade-up rounded-2xl border border-success/20 bg-success/5 px-8 py-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-7 w-7 text-success" aria-hidden />
        </div>
        <p className="text-eyebrow font-medium uppercase text-success">
          Already optimised
        </p>
        <h1 className="mt-2 text-title font-semibold tracking-tight">
          Your stack looks clean
        </h1>
        <p className="mt-2 text-body text-muted-foreground">
          No significant savings opportunities were found. You&apos;re spending{" "}
          <span className="font-semibold text-foreground">
            {formatDollars(summary.totalMonthlySpend)}/mo
          </span>{" "}
          and it lines up with published pricing.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 via-transparent to-success/5 px-8 py-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
        <TrendingDown className="h-7 w-7 text-brand" aria-hidden />
      </div>

      <p className="text-eyebrow font-medium uppercase text-brand">
        Potential annual savings
      </p>

      <p
        className="mt-2 font-semibold tracking-tight text-foreground"
        style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1.1 }}
        aria-label={`${formatDollars(summary.totalAnnualSaving)} per year`}
      >
        {formatDollars(summary.totalAnnualSaving)}
      </p>

      <p className="mt-1 text-lead text-muted-foreground">per year</p>

      <div className="animate-fade-up-delay mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-success" />
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatDollars(summary.totalMonthlySaving)}
            </span>
            {" "}/ month
          </span>
        </span>
        <span className="hidden text-border sm:inline">·</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-brand" />
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              {summary.savingsPercent}%
            </span>
            {" "}of spend
          </span>
        </span>
        <span className="hidden text-border sm:inline">·</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground" />
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              {summary.recommendationCount}
            </span>
            {" "}recommendation{summary.recommendationCount !== 1 ? "s" : ""}
          </span>
        </span>
      </div>
    </div>
  );
}
