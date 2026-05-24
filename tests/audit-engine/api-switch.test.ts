import { describe, it, expect } from "vitest";
import { detectApiSwitch } from "@/lib/audit-engine/rules/api-switch";
import { PRICING_CATALOG } from "@/lib/pricing";
import type { AuditInput } from "@/lib/audit-engine/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type SupportedTool = "claude" | "chatgpt" | "anthropic-api" | "openai-api";

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

function makeInput(
  tool: SupportedTool,
  planId: string,
  monthlySpend: number,
  useCase: string,
  extraTools: SupportedTool[] = [],
): AuditInput {
  return {
    teamSize: 5,
    tools: [
      { tool, plan: planId, monthlySpend, useCase: useCase as "engineering", seats: 1 },
      ...extraTools.map((t) => ({
        tool: t,
        plan: "pay-as-you-go",
        monthlySpend: 100,
        useCase: "engineering" as const,
      })),
    ],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("detectApiSwitch", () => {
  it("fires for Claude Pro on engineering use case with spend > $20/seat", () => {
    const input = makeInput("claude", "pro", 40, "engineering");
    const enriched = [makeEnriched("claude", "pro", 40)];
    const recs = detectApiSwitch(input, enriched);
    expect(recs).toHaveLength(1);
    expect(recs[0].type).toBe("api-switch");
    expect(recs[0].toolId).toBe("claude");
    expect(recs[0].alternativeToolId).toBe("anthropic-api");
  });

  it("fires for ChatGPT Plus on engineering use case with spend > $20/seat", () => {
    const input = makeInput("chatgpt", "plus", 45, "engineering");
    const enriched = [makeEnriched("chatgpt", "plus", 45)];
    const recs = detectApiSwitch(input, enriched);
    expect(recs).toHaveLength(1);
    expect(recs[0].alternativeToolId).toBe("openai-api");
  });

  it("does NOT fire for design use case", () => {
    const input = makeInput("claude", "pro", 40, "design");
    const enriched = [makeEnriched("claude", "pro", 40)];
    const recs = detectApiSwitch(input, enriched);
    expect(recs).toHaveLength(0);
  });

  it("does NOT fire for marketing use case", () => {
    const input = makeInput("chatgpt", "plus", 50, "marketing");
    const enriched = [makeEnriched("chatgpt", "plus", 50)];
    const recs = detectApiSwitch(input, enriched);
    expect(recs).toHaveLength(0);
  });

  it("fires for product use case (technical user)", () => {
    const input = makeInput("claude", "pro", 40, "product");
    const enriched = [makeEnriched("claude", "pro", 40)];
    const recs = detectApiSwitch(input, enriched);
    expect(recs).toHaveLength(1);
  });

  it("does NOT fire when spend per seat ≤ $20", () => {
    // $20/mo, 1 seat → spendPerSeat = $20 → NOT > threshold
    const input = makeInput("claude", "pro", 20, "engineering");
    const enriched = [makeEnriched("claude", "pro", 20)];
    const recs = detectApiSwitch(input, enriched);
    expect(recs).toHaveLength(0);
  });

  it("does NOT fire when the API tool is already in the stack", () => {
    const input = makeInput("claude", "pro", 40, "engineering", ["anthropic-api"]);
    const enriched = [makeEnriched("claude", "pro", 40)];
    const recs = detectApiSwitch(input, enriched);
    expect(recs).toHaveLength(0);
  });

  it("does NOT fire for free plan", () => {
    const input = makeInput("claude", "free", 0, "engineering");
    const enriched = [makeEnriched("claude", "free", 0)];
    const recs = detectApiSwitch(input, enriched);
    expect(recs).toHaveLength(0);
  });

  it("does NOT fire for team plan (not a flat subscription)", () => {
    const input = makeInput("claude", "team", 125, "engineering");
    const enriched = [makeEnriched("claude", "team", 125)];
    const recs = detectApiSwitch(input, enriched);
    expect(recs).toHaveLength(0);
  });

  it("estimated saving is 20% of monthly spend", () => {
    const input = makeInput("claude", "pro", 100, "engineering");
    const enriched = [makeEnriched("claude", "pro", 100)];
    const recs = detectApiSwitch(input, enriched);
    expect(recs[0].monthlySaving).toBe(20); // 100 * 0.2
    expect(recs[0].annualSaving).toBe(240);
  });
});
