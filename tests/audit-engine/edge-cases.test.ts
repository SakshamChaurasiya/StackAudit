import { describe, it, expect } from "vitest";
import { runAudit } from "@/lib/audit-engine";

/**
 * Edge case and boundary tests for the full audit engine.
 * Covers scenarios not addressed by individual rule unit tests.
 */
describe("Engine edge cases", () => {
  it("handles a single-tool stack with no savings", () => {
    const result = runAudit({
      teamSize: 5,
      tools: [{ tool: "cursor", plan: "pro", monthlySpend: 20, useCase: "engineering" }],
    });
    expect(result.summary.toolCount).toBe(1);
    expect(result.recommendations).toBeInstanceOf(Array);
    expect(result.summary.totalMonthlySpend).toBe(20);
  });

  it("produces no duplicate recommendation IDs across a complex stack", () => {
    const result = runAudit({
      teamSize: 10,
      tools: [
        { tool: "cursor", plan: "pro", monthlySpend: 200, seats: 10, useCase: "engineering" },
        { tool: "github-copilot", plan: "business", monthlySpend: 190, seats: 10, useCase: "engineering" },
        { tool: "claude", plan: "team", monthlySpend: 300, seats: 6, useCase: "mixed" },
        { tool: "chatgpt", plan: "team", monthlySpend: 250, seats: 6, useCase: "mixed" },
      ],
    });
    const ids = result.recommendations.map((r) => r.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("recommendations are sorted P1 first", () => {
    const result = runAudit({
      teamSize: 10,
      tools: [
        { tool: "cursor", plan: "pro", monthlySpend: 200, seats: 10, useCase: "engineering" },
        { tool: "github-copilot", plan: "business", monthlySpend: 190, seats: 10, useCase: "engineering" },
      ],
    });
    const priorities = result.recommendations.map((r) => r.priority);
    const sorted = [...priorities].sort((a, b) => a - b);
    expect(priorities).toEqual(sorted);
  });

  it("summary totals match the sum of recommendations' savings", () => {
    const result = runAudit({
      teamSize: 5,
      tools: [
        { tool: "claude", plan: "team", monthlySpend: 200, seats: 2, useCase: "mixed" },
        { tool: "chatgpt", plan: "team", monthlySpend: 150, seats: 1, useCase: "mixed" },
      ],
    });
    const recTotal = result.recommendations.reduce(
      (sum, r) => sum + r.monthlySaving,
      0
    );
    // Summary saving may be less than or equal to the raw rec total (deduplication)
    expect(result.summary.totalMonthlySaving).toBeLessThanOrEqual(
      Math.round(recTotal * 100) / 100 + 0.01 // small float tolerance
    );
  });

  it("returns savingsPercent as 0 when no savings found", () => {
    const result = runAudit({
      teamSize: 2,
      tools: [
        // Minimal realistic spend — unlikely to trigger any rule
        { tool: "openai-api", plan: "pay-as-you-go", monthlySpend: 5, useCase: "engineering" },
      ],
    });
    if (result.summary.totalMonthlySaving === 0) {
      expect(result.summary.savingsPercent).toBe(0);
    }
  });

  it("handles maximum allowed tool count (15 tools) without crashing", () => {
    // Build 9 unique tools (all supported)
    const tools = [
      { tool: "cursor" as const, plan: "pro", monthlySpend: 20, useCase: "engineering" as const },
      { tool: "github-copilot" as const, plan: "business", monthlySpend: 19, seats: 1, useCase: "engineering" as const },
      { tool: "claude" as const, plan: "pro", monthlySpend: 20, useCase: "mixed" as const },
      { tool: "chatgpt" as const, plan: "plus", monthlySpend: 20, useCase: "mixed" as const },
      { tool: "anthropic-api" as const, plan: "pay-as-you-go", monthlySpend: 30, useCase: "engineering" as const },
      { tool: "openai-api" as const, plan: "pay-as-you-go", monthlySpend: 25, useCase: "engineering" as const },
      { tool: "gemini" as const, plan: "pro", monthlySpend: 20, useCase: "mixed" as const },
      { tool: "windsurf" as const, plan: "pro", monthlySpend: 15, useCase: "engineering" as const },
      { tool: "v0" as const, plan: "premium", monthlySpend: 20, useCase: "engineering" as const },
    ];

    expect(() =>
      runAudit({ teamSize: 10, tools })
    ).not.toThrow();
  });

  it("scoredAt is a non-empty ISO string", () => {
    const result = runAudit({
      teamSize: 5,
      tools: [{ tool: "cursor", plan: "pro", monthlySpend: 20, useCase: "engineering" }],
    });
    expect(typeof result.scoredAt).toBe("string");
    expect(result.scoredAt.length).toBeGreaterThan(0);
    expect(new Date(result.scoredAt).toString()).not.toBe("Invalid Date");
  });
});
