import { describe, it, expect } from "vitest";
import {
  calcTotalMonthlySpend,
  calcTotalListCost,
  calcOverspendAmount,
  calcTotalMonthlySaving,
  calcSavingsPercent,
  toAnnual,
  calcSummary,
} from "@/lib/audit-engine/calculator";
import type { AuditInput, Recommendation } from "@/lib/audit-engine/types";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const baseInput: AuditInput = {
  teamSize: 5,
  tools: [
    { tool: "cursor", plan: "pro", monthlySpend: 20, seats: 1, useCase: "engineering" },
    { tool: "claude", plan: "pro", monthlySpend: 30, seats: 1, useCase: "engineering" },
  ],
};

const baseRec = (saving: number, tool = "cursor"): Recommendation => ({
  id: `test-${tool}`,
  type: "overspend",
  toolId: tool as "cursor",
  title: "Test",
  reasoning: "Test reasoning",
  monthlySaving: saving,
  annualSaving: toAnnual(saving),
  priority: 1,
});

// ─── calcTotalMonthlySpend ────────────────────────────────────────────────────

describe("calcTotalMonthlySpend", () => {
  it("sums all tool monthly spends", () => {
    expect(calcTotalMonthlySpend(baseInput)).toBe(50);
  });

  it("returns 0 for empty tools array", () => {
    expect(calcTotalMonthlySpend({ teamSize: 1, tools: [] })).toBe(0);
  });

  it("handles single tool", () => {
    const input: AuditInput = {
      teamSize: 1,
      tools: [{ tool: "cursor", plan: "pro", monthlySpend: 99.99, seats: 1, useCase: "engineering" }],
    };
    expect(calcTotalMonthlySpend(input)).toBe(99.99);
  });
});

// ─── calcTotalListCost ────────────────────────────────────────────────────────

describe("calcTotalListCost", () => {
  it("sums resolved costs", () => {
    expect(calcTotalListCost([20, 30, 40])).toBe(90);
  });

  it("returns 0 for empty array", () => {
    expect(calcTotalListCost([])).toBe(0);
  });
});

// ─── calcOverspendAmount ──────────────────────────────────────────────────────

describe("calcOverspendAmount", () => {
  it("returns positive delta when reported > list", () => {
    expect(calcOverspendAmount(100, 80)).toBe(20);
  });

  it("returns 0 when reported equals list", () => {
    expect(calcOverspendAmount(80, 80)).toBe(0);
  });

  it("returns 0 when reported < list (no negative overspend)", () => {
    expect(calcOverspendAmount(60, 80)).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    expect(calcOverspendAmount(100.999, 80)).toBe(21);
  });
});

// ─── calcTotalMonthlySaving ───────────────────────────────────────────────────

describe("calcTotalMonthlySaving", () => {
  it("sums savings for different tools", () => {
    const recs = [baseRec(30, "cursor"), baseRec(20, "claude")];
    expect(calcTotalMonthlySaving(recs)).toBe(50);
  });

  it("deduplicates by tool — keeps highest saving", () => {
    // Two recs targeting cursor — only $40 should count
    const recs = [baseRec(40, "cursor"), baseRec(20, "cursor")];
    expect(calcTotalMonthlySaving(recs)).toBe(40);
  });

  it("returns 0 for empty recommendations", () => {
    expect(calcTotalMonthlySaving([])).toBe(0);
  });
});

// ─── calcSavingsPercent ───────────────────────────────────────────────────────

describe("calcSavingsPercent", () => {
  it("calculates correct percentage", () => {
    expect(calcSavingsPercent(25, 100)).toBe(25);
  });

  it("returns 0 when totalSpend is 0", () => {
    expect(calcSavingsPercent(50, 0)).toBe(0);
  });

  it("rounds to one decimal place", () => {
    // 33.333...% → 33.3
    expect(calcSavingsPercent(10, 30)).toBe(33.3);
  });

  it("can return 100% when saving equals spend", () => {
    expect(calcSavingsPercent(50, 50)).toBe(100);
  });
});

// ─── toAnnual ─────────────────────────────────────────────────────────────────

describe("toAnnual", () => {
  it("multiplies by 12 and rounds", () => {
    expect(toAnnual(50)).toBe(600);
  });

  it("handles fractional monthly amounts", () => {
    expect(toAnnual(19.99)).toBe(240); // annualizeMonthly rounds
  });
});

// ─── calcSummary ──────────────────────────────────────────────────────────────

describe("calcSummary", () => {
  it("builds correct summary for a simple two-tool stack", () => {
    const recs: Recommendation[] = [baseRec(20, "cursor")];
    const summary = calcSummary(baseInput, [20, 20], recs);

    expect(summary.totalMonthlySpend).toBe(50);
    expect(summary.totalAnnualSpend).toBe(600);
    expect(summary.estimatedMonthlyListCost).toBe(40);
    expect(summary.overspendAmount).toBe(10);
    expect(summary.totalMonthlySaving).toBe(20);
    expect(summary.totalAnnualSaving).toBe(240);
    expect(summary.savingsPercent).toBe(40);
    expect(summary.toolCount).toBe(2);
    expect(summary.recommendationCount).toBe(1);
  });

  it("overspendAmount is 0 when reported spend ≤ list", () => {
    const lowSpendInput: AuditInput = {
      teamSize: 1,
      tools: [{ tool: "cursor", plan: "pro", monthlySpend: 18, seats: 1, useCase: "engineering" }],
    };
    const summary = calcSummary(lowSpendInput, [20], []);
    expect(summary.overspendAmount).toBe(0);
  });

  it("handles zero spend and zero recs", () => {
    const emptyInput: AuditInput = { teamSize: 1, tools: [] };
    const summary = calcSummary(emptyInput, [], []);
    expect(summary.totalMonthlySpend).toBe(0);
    expect(summary.totalMonthlySaving).toBe(0);
    expect(summary.savingsPercent).toBe(0);
    expect(summary.recommendationCount).toBe(0);
  });
});
