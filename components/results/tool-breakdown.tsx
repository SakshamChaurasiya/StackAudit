import { AlertTriangle, CheckCircle2, Minus } from "lucide-react";

import type { AuditInput } from "@/lib/audit-engine/types";
import { PRICING_CATALOG } from "@/lib/pricing";
import { estimateMonthlyListCost } from "@/lib/pricing/models";

function formatDollars(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

type DeltaStatus = "ok" | "near" | "over" | "usage";

function getDeltaStatus(reported: number, listCost: number | null): DeltaStatus {
  if (listCost === null || listCost === 0) return "usage";
  const ratio = reported / listCost;
  if (ratio > 1.15) return "over";
  if (ratio > 1.0) return "near";
  return "ok";
}

function DeltaBadge({ status, reported, list }: { status: DeltaStatus; reported: number; list: number | null }) {
  if (status === "usage") {
    return (
      <span className="flex items-center gap-1 text-caption text-muted-foreground">
        <Minus className="h-3.5 w-3.5" />
        Usage-based
      </span>
    );
  }
  if (status === "ok") {
    return (
      <span className="flex items-center gap-1 text-caption text-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        At list price
      </span>
    );
  }
  if (status === "near") {
    return (
      <span className="flex items-center gap-1 text-caption text-amber-600">
        <AlertTriangle className="h-3.5 w-3.5" />
        Slightly over
      </span>
    );
  }
  // over
  const gap = list !== null ? reported - list : 0;
  return (
    <span className="flex items-center gap-1 text-caption text-red-600">
      <AlertTriangle className="h-3.5 w-3.5" />
      +{formatDollars(gap)}/mo gap
    </span>
  );
}

type Props = {
  input: AuditInput;
};

export function ToolBreakdown({ input }: Props) {
  const rows = input.tools.map((row) => {
    const toolEntry = PRICING_CATALOG.tools[row.tool];
    const plan = toolEntry.plans.find((p) => p.id === row.plan) ?? toolEntry.plans[0];
    const seats = row.seats ?? 1;
    const listCostRaw = estimateMonthlyListCost(plan, seats);
    const listCost = listCostRaw ?? null;
    const status = getDeltaStatus(row.monthlySpend, listCost);

    return {
      tool: row.tool,
      label: toolEntry.label,
      planLabel: plan.label,
      seats: plan.billingModel === "seat" ? seats : null,
      monthlySpend: row.monthlySpend,
      listCost,
      status,
      useCase: row.useCase,
    };
  });

  return (
    <section aria-label="Tool breakdown" className="space-y-4">
      <h2 className="text-title-sm font-semibold tracking-tight">
        Tool breakdown
      </h2>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tool
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Plan
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Your spend
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  List price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr
                  key={row.tool}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.label}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.planLabel}
                    {row.seats !== null && (
                      <span className="ml-1 text-caption text-muted-foreground/70">
                        × {row.seats} seat{row.seats !== 1 ? "s" : ""}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                    {formatDollars(row.monthlySpend)}/mo
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {row.listCost !== null && row.listCost > 0
                      ? `${formatDollars(row.listCost)}/mo`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <DeltaBadge
                      status={row.status}
                      reported={row.monthlySpend}
                      list={row.listCost}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
