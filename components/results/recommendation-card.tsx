"use client";

import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowRightLeft,
  GitMerge,
  Layers,
  Zap,
} from "lucide-react";

import type { Recommendation, RecommendationType } from "@/lib/audit-engine/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDollars(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

const TYPE_META: Record<
  RecommendationType,
  { label: string; Icon: React.ElementType; iconClass: string }
> = {
  overspend: {
    label: "Billing gap",
    Icon: AlertTriangle,
    iconClass: "text-amber-500",
  },
  downgrade: {
    label: "Downgrade",
    Icon: ArrowDownCircle,
    iconClass: "text-brand",
  },
  redundant: {
    label: "Redundant tools",
    Icon: GitMerge,
    iconClass: "text-red-500",
  },
  "api-switch": {
    label: "Switch to API",
    Icon: Zap,
    iconClass: "text-purple-500",
  },
  alternative: {
    label: "Cheaper alternative",
    Icon: ArrowRightLeft,
    iconClass: "text-sky-500",
  },
  "unused-tier": {
    label: "Seat floor waste",
    Icon: Layers,
    iconClass: "text-orange-500",
  },
};

const PRIORITY_META: Record<
  1 | 2 | 3,
  { label: string; badgeClass: string }
> = {
  1: { label: "P1 · High", badgeClass: "badge-p1" },
  2: { label: "P2 · Medium", badgeClass: "badge-p2" },
  3: { label: "P3 · Low", badgeClass: "badge-p3" },
};

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  rec: Recommendation;
};

export function RecommendationCard({ rec }: Props) {
  const { label: typeLabel, Icon, iconClass } = TYPE_META[rec.type];
  const { label: priorityLabel, badgeClass } = PRIORITY_META[rec.priority];

  return (
    <article
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated"
      aria-label={rec.title}
    >
      {/* Priority accent bar */}
      <span
        className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${
          rec.priority === 1
            ? "bg-red-400"
            : rec.priority === 2
              ? "bg-amber-400"
              : "bg-sky-400"
        }`}
        aria-hidden
      />

      <div className="flex flex-col gap-4 pl-3 sm:flex-row sm:items-start sm:gap-5">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Icon className={`h-5 w-5 ${iconClass}`} aria-hidden />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Type + Priority badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {typeLabel}
            </span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badgeClass}`}
            >
              {priorityLabel}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-body font-semibold leading-snug text-foreground">
            {rec.title}
          </h3>

          {/* Reasoning */}
          <p className="text-caption text-muted-foreground leading-relaxed">
            {rec.reasoning}
          </p>
        </div>

        {/* Savings pill — stacks below on mobile */}
        <div className="flex-shrink-0 sm:text-right">
          <div className="inline-flex flex-col items-start rounded-lg border border-success/20 bg-success/5 px-3 py-2 sm:items-end">
            <span className="text-caption font-medium uppercase text-success">
              Save
            </span>
            <span className="font-semibold tabular-nums text-success" style={{ fontSize: "1.125rem" }}>
              {formatDollars(rec.monthlySaving)}/mo
            </span>
            <span className="text-caption text-muted-foreground">
              {formatDollars(rec.annualSaving)}/yr
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
