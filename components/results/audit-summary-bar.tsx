import type { AuditSummary } from "@/lib/audit-engine/types";

function formatDollars(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

type StatCellProps = {
  label: string;
  value: string;
  sub?: string;
};

function StatCell({ label, value, sub }: StatCellProps) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3 first:pl-0 last:pr-0">
      <span className="text-eyebrow font-medium uppercase text-muted-foreground">
        {label}
      </span>
      <span className="text-title-sm font-semibold tabular-nums text-foreground">
        {value}
      </span>
      {sub && (
        <span className="text-caption text-muted-foreground">{sub}</span>
      )}
    </div>
  );
}

type Props = {
  summary: AuditSummary;
};

export function AuditSummaryBar({ summary }: Props) {
  return (
    <div className="animate-fade-up-delay overflow-x-auto rounded-xl border border-border bg-card shadow-card">
      <div className="flex min-w-max divide-x divide-border">
        <div className="px-5 py-3">
          <StatCell
            label="Monthly spend"
            value={formatDollars(summary.totalMonthlySpend)}
            sub={`${formatDollars(summary.totalAnnualSpend)} / year`}
          />
        </div>
        <div className="px-5 py-3">
          <StatCell
            label="List price"
            value={formatDollars(summary.estimatedMonthlyListCost)}
            sub="from pricing catalog"
          />
        </div>
        <div className="px-5 py-3">
          <StatCell
            label="Tools audited"
            value={String(summary.toolCount)}
            sub={`${summary.recommendationCount} finding${summary.recommendationCount !== 1 ? "s" : ""}`}
          />
        </div>
        {summary.overspendAmount > 0 && (
          <div className="px-5 py-3">
            <StatCell
              label="Billing gap"
              value={formatDollars(summary.overspendAmount)}
              sub="vs published list price"
            />
          </div>
        )}
      </div>
    </div>
  );
}
