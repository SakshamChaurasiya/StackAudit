import { describe, it, expect } from "vitest";
import { generateFallbackSummary } from "@/lib/ai/fallback";
import type { AuditResult } from "@/lib/audit-engine/types";

const makeResult = (overrides: Partial<AuditResult["summary"]> = {}): AuditResult => ({
  input: {
    teamSize: 10,
    tools: [
      { tool: "cursor", plan: "pro", monthlySpend: 200, useCase: "engineering" },
      { tool: "chatgpt", plan: "team", monthlySpend: 150, seats: 5, useCase: "mixed" },
    ],
  },
  summary: {
    toolCount: 2,
    totalMonthlySpend: 350,
    totalAnnualSpend: 4200,
    estimatedMonthlyListCost: 330,
    overspendAmount: 0,
    totalMonthlySaving: 80,
    totalAnnualSaving: 960,
    savingsPercent: 23,
    recommendationCount: 2,
    ...overrides,
  },
  recommendations: [
    {
      id: "chatgpt-downgrade",
      type: "downgrade",
      toolId: "chatgpt",
      title: "Downgrade ChatGPT to Pro",
      reasoning: "Switch to a cheaper plan.",
      priority: 1,
      monthlySaving: 80,
      annualSaving: 960,
    },
  ],
  scoredAt: new Date().toISOString(),
});

describe("generateFallbackSummary", () => {
  it("returns a non-empty string", () => {
    const summary = generateFallbackSummary(makeResult());
    expect(typeof summary).toBe("string");
    expect(summary.length).toBeGreaterThan(50);
  });

  it("includes the tool count in the summary", () => {
    const summary = generateFallbackSummary(makeResult());
    expect(summary).toContain("2-tool");
  });

  it("includes the monthly spend in the summary", () => {
    const summary = generateFallbackSummary(makeResult());
    expect(summary).toContain("350");
  });

  it("includes savings figures when savings exist", () => {
    const summary = generateFallbackSummary(makeResult());
    expect(summary).toContain("960"); // annual saving
    expect(summary).toContain("80");  // monthly saving
  });

  it("includes the top recommendation when savings exist", () => {
    const summary = generateFallbackSummary(makeResult());
    expect(summary.toLowerCase()).toContain("downgrade chatgpt to pro");
  });

  it("returns an optimised message when no savings found", () => {
    const result = makeResult({
      totalMonthlySaving: 0,
      totalAnnualSaving: 0,
      savingsPercent: 0,
      recommendationCount: 0,
    });
    const summary = generateFallbackSummary(result);
    expect(summary).toContain("well-optimized");
    // Should NOT contain dollar savings amounts (no savings to report)
    expect(summary).not.toMatch(/\$\d+.*per year/i);
    expect(summary).not.toMatch(/\$\d+.*annually/i);
    // Should NOT contain recommendation count language
    expect(summary).not.toContain("optimization");
  });

  it("mentions team size", () => {
    const summary = generateFallbackSummary(makeResult());
    expect(summary).toContain("10");
  });
});
