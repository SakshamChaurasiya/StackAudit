"use server";

import { runAudit } from "@/lib/audit-engine";
import { auditFormSchema } from "@/lib/audit-form/schema";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { insertAudit, updateAuditSummary } from "@/lib/supabase/db";
import { generateSummary } from "@/lib/ai";
import type { AuditInput } from "@/lib/audit-engine/types";

export type AuditActionResponse =
  | { success: true; id: string }
  | { success: false; fallback: true }
  | { success: false; error: string };

/**
 * Server action to process and save a stack audit.
 * Runs deterministic calculations server-side, persists to Supabase,
 * and generates a personalized AI summary via Gemini (with graceful fallback).
 */
export async function runAndSaveAuditAction(
  rawInput: unknown
): Promise<AuditActionResponse> {
  try {
    // 1. Validate inputs on the server
    const parsed = auditFormSchema.safeParse(rawInput);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      return { success: false, error: `Validation failed: ${messages}` };
    }

    const input: AuditInput = parsed.data;

    // 2. Check if Supabase is configured; if not, return fallback signal
    if (!isSupabaseConfigured()) {
      console.warn("Supabase is not configured. Falling back to client storage.");
      return { success: false, fallback: true };
    }

    // 3. Compute audit calculations deterministically
    const result = runAudit(input);

    // 4. Save core audit to database
    const id = await insertAudit(input, result);

    // 5. Generate personalized AI summary (Gemini → fallback, non-blocking failure)
    try {
      const { text: summaryText } = await generateSummary(result);
      // Persist the summary back to the audit record
      await updateAuditSummary(id, summaryText);
    } catch (summaryErr) {
      // Non-fatal: audit is already saved; summary persistence failure is acceptable
      console.error("[AI] Failed to generate or persist summary:", summaryErr);
    }

    return { success: true, id };
  } catch (err) {
    console.error("Failed to run or save audit on server:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred.",
    };
  }
}
