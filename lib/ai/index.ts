/**
 * Public AI summary API for StackAudit.
 *
 * Usage:
 *   import { generateSummary, isGeminiConfigured } from "@/lib/ai";
 *
 * `generateSummary` will:
 *   1. Try Gemini API if GEMINI_API_KEY is configured
 *   2. Fall back to a deterministic template summary on any failure
 *
 * AI is ONLY used for personalized summary generation — never for audit logic.
 */

export { isGeminiConfigured } from "@/lib/ai/gemini";
export { generateFallbackSummary } from "@/lib/ai/fallback";

import type { AuditResult } from "@/lib/audit-engine/types";
import { generateAuditSummary } from "@/lib/ai/gemini";
import { generateFallbackSummary } from "@/lib/ai/fallback";

/**
 * Generates a personalized summary for the given audit result.
 *
 * - If Gemini is configured and responds successfully: returns AI-generated text
 * - Otherwise: returns the deterministic fallback summary
 *
 * Also returns whether the result is AI-generated (`isAiGenerated`),
 * so the UI can display the appropriate badge.
 */
export async function generateSummary(
  result: AuditResult
): Promise<{ text: string; isAiGenerated: boolean }> {
  const aiText = await generateAuditSummary(result);

  if (aiText) {
    return { text: aiText, isAiGenerated: true };
  }

  return {
    text: generateFallbackSummary(result),
    isAiGenerated: false,
  };
}
