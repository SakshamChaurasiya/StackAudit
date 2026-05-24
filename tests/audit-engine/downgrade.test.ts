import { describe, it, expect } from "vitest";
import { detectDowngrades } from "@/lib/audit-engine/rules/downgrade";
import { PRICING_CATALOG } from "@/lib/pricing";
import type { AuditInput } from "@/lib/audit-engine/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type SupportedTool = "cursor" | "github-copilot" | "chatgpt" | "claude" | "windsurf";

function makeEnriched(
  tool: SupportedTool,
  planId: string,
  monthlySpend: number,
  seats = 1,
) {
  const toolEntry = PRICING_CATALOG.tools[tool];
  const plan = toolEntry.plans.find((p) => p.id === planId)!;
  return {
    tool,
    plan,
    monthlySpend,
    seats,
    label: toolEntry.label,
    planLabel: plan.label,
  };
}

function makeInput(tool: SupportedTool, planId: string, monthlySpend: number, seats = 1): AuditInput {
  return {
    teamSize: seats,
    tools: [{ tool, plan: planId, monthlySpend, seats, useCase: "engineering" }],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("detectDowngrades", () => {
  // ── Cursor Business → Pro ──────────────────────────────────────────────────
  describe("Cursor Business → Pro", () => {
    it("fires for 1 seat on Cursor Business", () => {
      const input = makeInput("cursor", "business", 40, 1);
      const enriched = [makeEnriched("cursor", "business", 40, 1)];
      const recs = detectDowngrades(input, enriched);
      expect(recs).toHaveLength(1);
      expect(recs[0].type).toBe("downgrade");
      expect(recs[0].toolId).toBe("cursor");
      expect(recs[0].targetPlanId).toBe("pro");
    });

    it("fires for 3 seats on Cursor Business (maxSeats boundary)", () => {
      const input = makeInput("cursor", "business", 120, 3);
      const enriched = [makeEnriched("cursor", "business", 120, 3)];
      const recs = detectDowngrades(input, enriched);
      expect(recs).toHaveLength(1);
    });

    it("does NOT fire for 4 seats on Cursor Business (above maxSeats)", () => {
      const input = makeInput("cursor", "business", 160, 4);
      const enriched = [makeEnriched("cursor", "business", 160, 4)];
      const recs = detectDowngrades(input, enriched);
      expect(recs).toHaveLength(0);
    });

    it("does NOT fire when already on Pro plan", () => {
      const input = makeInput("cursor", "pro", 20, 1);
      const enriched = [makeEnriched("cursor", "pro", 20, 1)];
      const recs = detectDowngrades(input, enriched);
      expect(recs).toHaveLength(0);
    });

    it("calculates saving correctly: Business ($40) - Pro ($20) = $20/mo", () => {
      const input = makeInput("cursor", "business", 40, 1);
      const enriched = [makeEnriched("cursor", "business", 40, 1)];
      const recs = detectDowngrades(input, enriched);
      expect(recs[0].monthlySaving).toBe(20);
      expect(recs[0].annualSaving).toBe(240);
    });
  });

  // ── GitHub Copilot Enterprise → Business ──────────────────────────────────
  describe("GitHub Copilot Enterprise → Business", () => {
    it("fires for 10 seats on Copilot Enterprise", () => {
      const input = makeInput("github-copilot", "enterprise", 390, 10);
      const enriched = [makeEnriched("github-copilot", "enterprise", 390, 10)];
      const recs = detectDowngrades(input, enriched);
      expect(recs).toHaveLength(1);
      expect(recs[0].targetPlanId).toBe("business");
    });

    it("calculates saving: ($39 - $19) × 5 seats = $100/mo", () => {
      const input = makeInput("github-copilot", "enterprise", 195, 5);
      const enriched = [makeEnriched("github-copilot", "enterprise", 195, 5)];
      const recs = detectDowngrades(input, enriched);
      expect(recs[0].monthlySaving).toBe(100); // (39-19)*5
    });

    it("does NOT fire for 26 seats (above maxSeats)", () => {
      const input = makeInput("github-copilot", "enterprise", 1014, 26);
      const enriched = [makeEnriched("github-copilot", "enterprise", 1014, 26)];
      const recs = detectDowngrades(input, enriched);
      expect(recs).toHaveLength(0);
    });
  });

  // ── ChatGPT Enterprise → Team ──────────────────────────────────────────────
  describe("ChatGPT Enterprise → Team", () => {
    it("fires for 5 seats on ChatGPT Enterprise", () => {
      const input = makeInput("chatgpt", "enterprise", 300, 5);
      const enriched = [makeEnriched("chatgpt", "enterprise", 300, 5)];
      const recs = detectDowngrades(input, enriched);
      expect(recs).toHaveLength(1);
      expect(recs[0].targetPlanId).toBe("team");
    });

    it("does NOT fire for 11 seats on ChatGPT Enterprise", () => {
      const input = makeInput("chatgpt", "enterprise", 660, 11);
      const enriched = [makeEnriched("chatgpt", "enterprise", 660, 11)];
      const recs = detectDowngrades(input, enriched);
      expect(recs).toHaveLength(0);
    });
  });

  // ── Claude Team → Pro ──────────────────────────────────────────────────────
  describe("Claude Team → Pro", () => {
    it("fires for 1 seat on Claude Team", () => {
      const input = makeInput("claude", "team", 125, 1); // 5 min seats × $25
      const enriched = [makeEnriched("claude", "team", 125, 1)];
      const recs = detectDowngrades(input, enriched);
      expect(recs).toHaveLength(1);
      expect(recs[0].targetPlanId).toBe("pro");
    });

    it("does NOT fire for 2 seats on Claude Team", () => {
      const input = makeInput("claude", "team", 125, 2);
      const enriched = [makeEnriched("claude", "team", 125, 2)];
      const recs = detectDowngrades(input, enriched);
      expect(recs).toHaveLength(0);
    });
  });

  // ── Reasoning content ─────────────────────────────────────────────────────
  it("includes target plan name in title", () => {
    const input = makeInput("cursor", "business", 40, 1);
    const enriched = [makeEnriched("cursor", "business", 40, 1)];
    const recs = detectDowngrades(input, enriched);
    expect(recs[0].title.toLowerCase()).toContain("pro");
  });

  it("includes dollar saving amount in title", () => {
    const input = makeInput("cursor", "business", 40, 1);
    const enriched = [makeEnriched("cursor", "business", 40, 1)];
    const recs = detectDowngrades(input, enriched);
    expect(recs[0].title).toContain("$20");
  });
});
