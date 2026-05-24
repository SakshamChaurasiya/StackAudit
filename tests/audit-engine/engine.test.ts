import { describe, it, expect } from "vitest";
import { runAudit } from "@/lib/audit-engine/engine";
import type { AuditInput } from "@/lib/audit-engine/types";

// ─── Scenario fixtures ────────────────────────────────────────────────────────

/**
 * Scenario A: Solo dev with Cursor Pro + GitHub Copilot Individual.
 * Expected: 1 redundant recommendation (both IDE tools paid).
 */
const scenarioA: AuditInput = {
  teamSize: 1,
  tools: [
    { tool: "cursor", plan: "pro", monthlySpend: 20, seats: 1, useCase: "engineering" },
    { tool: "github-copilot", plan: "individual", monthlySpend: 10, seats: 1, useCase: "engineering" },
  ],
};

/**
 * Scenario B: 5-person startup with heavy spend.
 * Cursor Business × 5, Claude Team × 5 (seat floor issue), ChatGPT Plus.
 * Expected: downgrade (Cursor), unused-tier (Claude Team), possibly more.
 */
const scenarioB: AuditInput = {
  teamSize: 5,
  tools: [
    { tool: "cursor", plan: "business", monthlySpend: 200, seats: 5, useCase: "engineering" },
    { tool: "claude", plan: "team", monthlySpend: 125, seats: 1, useCase: "engineering" }, // 1 seat, min 5 → waste
    { tool: "chatgpt", plan: "plus", monthlySpend: 20, seats: 1, useCase: "engineering" },
  ],
};

/**
 * Scenario C: Clean stack — only free tools.
 * Expected: 0 recommendations.
 */
const scenarioC: AuditInput = {
  teamSize: 3,
  tools: [
    { tool: "cursor", plan: "free", monthlySpend: 0, seats: 1, useCase: "engineering" },
    { tool: "chatgpt", plan: "free", monthlySpend: 0, seats: 1, useCase: "mixed" },
  ],
};

/**
 * Scenario D: Large dual-API spend on same use case.
 * Expected: redundant API recommendation fires.
 */
const scenarioD: AuditInput = {
  teamSize: 10,
  tools: [
    { tool: "anthropic-api", plan: "pay-as-you-go", monthlySpend: 350, useCase: "engineering" },
    { tool: "openai-api", plan: "pay-as-you-go", monthlySpend: 280, useCase: "engineering" },
  ],
};

/**
 * Scenario E: Mixed API tools on DIFFERENT use cases.
 * Expected: 0 redundant recommendations (different purpose).
 */
const scenarioE: AuditInput = {
  teamSize: 10,
  tools: [
    { tool: "anthropic-api", plan: "pay-as-you-go", monthlySpend: 350, useCase: "engineering" },
    { tool: "openai-api", plan: "pay-as-you-go", monthlySpend: 280, useCase: "product" },
  ],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("runAudit — integration scenarios", () => {
  // ── Scenario A ──────────────────────────────────────────────────────────────
  describe("Scenario A: Solo dev, Cursor Pro + Copilot Individual", () => {
    it("returns an AuditResult with the correct shape", () => {
      const result = runAudit(scenarioA);
      expect(result).toHaveProperty("input");
      expect(result).toHaveProperty("summary");
      expect(result).toHaveProperty("recommendations");
      expect(result).toHaveProperty("scoredAt");
    });

    it("generates at least 1 recommendation (redundant IDE tools)", () => {
      const result = runAudit(scenarioA);
      const redundant = result.recommendations.filter((r) => r.type === "redundant");
      expect(redundant.length).toBeGreaterThanOrEqual(1);
    });

    it("summary.totalMonthlySpend equals $30", () => {
      const result = runAudit(scenarioA);
      expect(result.summary.totalMonthlySpend).toBe(30);
    });

    it("summary.totalAnnualSpend equals $360", () => {
      const result = runAudit(scenarioA);
      expect(result.summary.totalAnnualSpend).toBe(360);
    });

    it("recommendations are sorted P1 first", () => {
      const result = runAudit(scenarioA);
      const priorities = result.recommendations.map((r) => r.priority);
      const sorted = [...priorities].sort((a, b) => a - b);
      expect(priorities).toEqual(sorted);
    });

    it("scoredAt is a valid ISO timestamp", () => {
      const result = runAudit(scenarioA);
      expect(() => new Date(result.scoredAt)).not.toThrow();
      expect(new Date(result.scoredAt).toISOString()).toBe(result.scoredAt);
    });
  });

  // ── Scenario B ──────────────────────────────────────────────────────────────
  describe("Scenario B: 5-person team, Cursor Business + Claude Team (1 seat)", () => {
    it("generates an unused-tier recommendation for Claude Team", () => {
      const result = runAudit(scenarioB);
      const unusedTier = result.recommendations.filter((r) => r.type === "unused-tier");
      expect(unusedTier.length).toBeGreaterThanOrEqual(1);
      expect(unusedTier[0].toolId).toBe("claude");
    });

    it("totalMonthlySaving > 0", () => {
      const result = runAudit(scenarioB);
      expect(result.summary.totalMonthlySaving).toBeGreaterThan(0);
    });

    it("totalAnnualSaving = totalMonthlySaving × 12", () => {
      const result = runAudit(scenarioB);
      expect(result.summary.totalAnnualSaving).toBe(
        Math.round(result.summary.totalMonthlySaving * 12),
      );
    });

    it("savingsPercent is between 0 and 100", () => {
      const result = runAudit(scenarioB);
      expect(result.summary.savingsPercent).toBeGreaterThan(0);
      expect(result.summary.savingsPercent).toBeLessThanOrEqual(100);
    });

    it("recommendationCount matches recommendations array length", () => {
      const result = runAudit(scenarioB);
      expect(result.summary.recommendationCount).toBe(result.recommendations.length);
    });
  });

  // ── Scenario C ──────────────────────────────────────────────────────────────
  describe("Scenario C: Clean stack — free tools only", () => {
    it("returns 0 recommendations", () => {
      const result = runAudit(scenarioC);
      expect(result.recommendations).toHaveLength(0);
    });

    it("totalMonthlySaving is 0", () => {
      const result = runAudit(scenarioC);
      expect(result.summary.totalMonthlySaving).toBe(0);
    });

    it("savingsPercent is 0", () => {
      const result = runAudit(scenarioC);
      expect(result.summary.savingsPercent).toBe(0);
    });
  });

  // ── Scenario D ──────────────────────────────────────────────────────────────
  describe("Scenario D: Large dual-API spend on same use case", () => {
    it("generates a redundant recommendation for the API pair", () => {
      const result = runAudit(scenarioD);
      const redundant = result.recommendations.filter((r) => r.type === "redundant");
      expect(redundant.length).toBeGreaterThanOrEqual(1);
    });

    it("monthlySaving for the API redundancy rec is > 0", () => {
      const result = runAudit(scenarioD);
      const redundant = result.recommendations.filter((r) => r.type === "redundant");
      expect(redundant[0].monthlySaving).toBeGreaterThan(0);
    });
  });

  // ── Scenario E ──────────────────────────────────────────────────────────────
  describe("Scenario E: Dual APIs on DIFFERENT use cases — no false positive", () => {
    it("does NOT generate a redundant recommendation", () => {
      const result = runAudit(scenarioE);
      const redundant = result.recommendations.filter((r) => r.type === "redundant");
      expect(redundant).toHaveLength(0);
    });
  });

  // ── Determinism ──────────────────────────────────────────────────────────────
  describe("Determinism", () => {
    it("produces identical results for the same input (run twice)", () => {
      const result1 = runAudit(scenarioA);
      const result2 = runAudit(scenarioA);
      // scoredAt will differ slightly; compare everything else
      expect(result1.summary).toEqual(result2.summary);
      expect(result1.recommendations.map((r) => ({ ...r }))).toEqual(
        result2.recommendations.map((r) => ({ ...r })),
      );
    });
  });

  // ── Annual saving consistency ─────────────────────────────────────────────
  describe("Annual saving consistency", () => {
    it("every recommendation has annualSaving = monthlySaving × 12 (rounded)", () => {
      const result = runAudit(scenarioB);
      for (const rec of result.recommendations) {
        expect(rec.annualSaving).toBe(Math.round(rec.monthlySaving * 12));
      }
    });
  });
});
