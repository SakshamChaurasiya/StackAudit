import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuditResult } from "@/lib/audit-engine/types";
import { buildAuditSummaryPrompt } from "@/lib/ai/prompt";

const apiKey = process.env.GEMINI_API_KEY;

/**
 * Returns true if the Gemini API key is configured.
 * Used to determine whether AI generation or fallback summary is used.
 */
export function isGeminiConfigured(): boolean {
  return Boolean(apiKey && apiKey.trim().length > 0);
}

/**
 * Generates a personalized AI summary for the given audit result using Gemini.
 *
 * Uses `gemini-1.5-flash` for fast, cost-effective text generation.
 * Returns `null` on any API failure — callers must handle the fallback case.
 */
export async function generateAuditSummary(
  result: AuditResult
): Promise<string | null> {
  if (!isGeminiConfigured()) {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = buildAuditSummaryPrompt(result);
    const response = await model.generateContent(prompt);
    const text = response.response.text().trim();

    if (!text || text.length < 20) {
      console.warn("[Gemini] Received empty or too-short summary response.");
      return null;
    }

    return text;
  } catch (err) {
    console.error("[Gemini] Failed to generate audit summary:", err);
    return null;
  }
}
