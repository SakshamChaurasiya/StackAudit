import { describe, it, expect } from "vitest";
import { detectRedundant } from "@/lib/audit-engine/rules/redundant";
import { PRICING_CATALOG } from "@/lib/pricing";
import type { AuditInput } from "@/lib/audit-engine/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type SupportedTool = "cursor" | "github-copilot" | "windsurf" | "claude" | "chatgpt" | "anthropic-api" | "openai-api";

function makeEnriched(
  tool: SupportedTool,
  planId: string,
  monthlySpend: number,
  seats = 1,
) {
  const toolEntry = PRICING_CATALOG.tools[tool];
  const plan = toolEntry.plans.find((p) => p.id === planId) ?? toolEntry.plans[0];
  return {
    tool,
    plan,
    monthlySpend,
    seats,
    label: toolEntry.label,
    planLabel: plan.label,
  };
}

function makeInput(tools: { tool: SupportedTool; planId: string; spend: number; seats?: number; useCase?: string }[]): AuditInput {
  return {
    teamSize: 5,
    tools: tools.map((t) => ({
      tool: t.tool,
      plan: t.planId,
      monthlySpend: t.spend,
      seats: t.seats ?? 1,
      useCase: (t.useCase ?? "engineering") as "engineering",
    })),
  };
}

// ─── IDE overlap tests ────────────────────────────────────────────────────────

describe("detectRedundant — IDE tools", () => {
  it("fires when Cursor (paid) and GitHub Copilot (paid) are both in stack", () => {
    const input = makeInput([
      { tool: "cursor", planId: "pro", spend: 20 },
      { tool: "github-copilot", planId: "individual", spend: 10 },
    ]);
    const enriched = [
      makeEnriched("cursor", "pro", 20),
      makeEnriched("github-copilot", "individual", 10),
    ];
    const recs = detectRedundant(input, enriched);
    expect(recs).toHaveLength(1);
    expect(recs[0].type).toBe("redundant");
  });

  it("saves the cheaper tool's cost (Copilot $10 < Cursor $20 → save $10)", () => {
    const input = makeInput([
      { tool: "cursor", planId: "pro", spend: 20 },
      { tool: "github-copilot", planId: "individual", spend: 10 },
    ]);
    const enriched = [
      makeEnriched("cursor", "pro", 20),
      makeEnriched("github-copilot", "individual", 10),
    ];
    const recs = detectRedundant(input, enriched);
    expect(recs[0].monthlySaving).toBe(10);
    expect(recs[0].annualSaving).toBe(120);
  });

  it("recommends removing cheaper tool and keeping the more expensive one", () => {
    const input = makeInput([
      { tool: "cursor", planId: "pro", spend: 20 },
      { tool: "github-copilot", planId: "individual", spend: 10 },
    ]);
    const enriched = [
      makeEnriched("cursor", "pro", 20),
      makeEnriched("github-copilot", "individual", 10),
    ];
    const recs = detectRedundant(input, enriched);
    // Cheaper = Copilot ($10) → toRemove = copilot
    expect(recs[0].toolId).toBe("github-copilot");
    expect(recs[0].conflictingToolId).toBe("cursor");
  });

  it("does NOT fire when one IDE tool is on free plan (spend = 0)", () => {
    const input = makeInput([
      { tool: "cursor", planId: "pro", spend: 20 },
      { tool: "github-copilot", planId: "free", spend: 0 },
    ]);
    const enriched = [
      makeEnriched("cursor", "pro", 20),
      makeEnriched("github-copilot", "free", 0),
    ];
    const recs = detectRedundant(input, enriched);
    expect(recs).toHaveLength(0);
  });

  it("fires for Cursor + Windsurf both paid", () => {
    const input = makeInput([
      { tool: "cursor", planId: "pro", spend: 20 },
      { tool: "windsurf", planId: "pro", spend: 15 },
    ]);
    const enriched = [
      makeEnriched("cursor", "pro", 20),
      makeEnriched("windsurf", "pro", 15),
    ];
    const recs = detectRedundant(input, enriched);
    expect(recs).toHaveLength(1);
  });

  it("only generates one rec for each pair (no duplicates)", () => {
    const input = makeInput([
      { tool: "cursor", planId: "pro", spend: 20 },
      { tool: "github-copilot", planId: "individual", spend: 10 },
    ]);
    const enriched = [
      makeEnriched("cursor", "pro", 20),
      makeEnriched("github-copilot", "individual", 10),
    ];
    const recs = detectRedundant(input, enriched);
    expect(recs).toHaveLength(1);
  });
});

// ─── Assistant overlap tests ──────────────────────────────────────────────────

describe("detectRedundant — Assistant tools", () => {
  it("fires when Claude + ChatGPT combined spend > $40/mo", () => {
    const input = makeInput([
      { tool: "claude", planId: "pro", spend: 20 },
      { tool: "chatgpt", planId: "plus", spend: 25 },
    ]);
    const enriched = [
      makeEnriched("claude", "pro", 20),
      makeEnriched("chatgpt", "plus", 25),
    ];
    const recs = detectRedundant(input, enriched);
    expect(recs).toHaveLength(1);
    expect(recs[0].type).toBe("redundant");
  });

  it("does NOT fire when combined assistant spend ≤ $40/mo", () => {
    const input = makeInput([
      { tool: "claude", planId: "pro", spend: 20 },
      { tool: "chatgpt", planId: "plus", spend: 20 },
    ]);
    const enriched = [
      makeEnriched("claude", "pro", 20),
      makeEnriched("chatgpt", "plus", 20),
    ];
    const recs = detectRedundant(input, enriched);
    expect(recs).toHaveLength(0);
  });

  it("does NOT fire when one assistant is on free plan", () => {
    const input = makeInput([
      { tool: "claude", planId: "pro", spend: 20 },
      { tool: "chatgpt", planId: "free", spend: 0 },
    ]);
    const enriched = [
      makeEnriched("claude", "pro", 20),
      makeEnriched("chatgpt", "free", 0),
    ];
    const recs = detectRedundant(input, enriched);
    expect(recs).toHaveLength(0);
  });
});

// ─── API overlap tests ────────────────────────────────────────────────────────

describe("detectRedundant — API tools", () => {
  it("fires when both APIs > $200/mo AND same use case", () => {
    const input = makeInput([
      { tool: "anthropic-api", planId: "pay-as-you-go", spend: 300, useCase: "engineering" },
      { tool: "openai-api", planId: "pay-as-you-go", spend: 250, useCase: "engineering" },
    ]);
    const enriched = [
      makeEnriched("anthropic-api", "pay-as-you-go", 300),
      makeEnriched("openai-api", "pay-as-you-go", 250),
    ];
    const recs = detectRedundant(input, enriched);
    expect(recs).toHaveLength(1);
  });

  it("does NOT fire when one API spend < $200/mo", () => {
    const input = makeInput([
      { tool: "anthropic-api", planId: "pay-as-you-go", spend: 300, useCase: "engineering" },
      { tool: "openai-api", planId: "pay-as-you-go", spend: 150, useCase: "engineering" },
    ]);
    const enriched = [
      makeEnriched("anthropic-api", "pay-as-you-go", 300),
      makeEnriched("openai-api", "pay-as-you-go", 150),
    ];
    const recs = detectRedundant(input, enriched);
    expect(recs).toHaveLength(0);
  });

  it("does NOT fire when API tools serve different use cases", () => {
    const input = makeInput([
      { tool: "anthropic-api", planId: "pay-as-you-go", spend: 300, useCase: "engineering" },
      { tool: "openai-api", planId: "pay-as-you-go", spend: 250, useCase: "product" },
    ]);
    const enriched = [
      makeEnriched("anthropic-api", "pay-as-you-go", 300),
      makeEnriched("openai-api", "pay-as-you-go", 250),
    ];
    const recs = detectRedundant(input, enriched);
    expect(recs).toHaveLength(0);
  });
});
