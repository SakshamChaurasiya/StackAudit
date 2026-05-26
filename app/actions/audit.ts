"use server";

import { headers } from "next/headers";
import { runAudit } from "@/lib/audit-engine";
import { auditFormSchema } from "@/lib/audit-form/schema";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { insertAudit, updateAuditSummary } from "@/lib/supabase/db";
import { generateSummary } from "@/lib/ai";
import { checkRateLimit, getClientIp, AUDIT_LIMIT } from "@/lib/security/rate-limit";
import type { AuditInput } from "@/lib/audit-engine/types";

export type AuditActionResponse =
  | { success: true; id: string }
  | { success: false; fallback: true }
  | { success: false; error: string };

/** Rejects after `ms` milliseconds — used to guard against Vercel's 30s limit. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Server action to process and save a stack audit.
 * Runs deterministic calculations server-side, persists to Supabase,
 * and generates a personalized AI summary via Gemini (with graceful fallback).
 *
 * Security: rate-limited to 5 requests/minute per IP.
 * Resilience: DB + AI wrapped in a 25s timeout; falls back to client on timeout.
 */
export async function runAndSaveAuditAction(
  rawInput: unknown
): Promise<AuditActionResponse> {
  try {
    // 0. Rate limit check
    const reqHeaders = await headers();
    const ip = getClientIp(reqHeaders);
    const rateLimitResult = checkRateLimit(ip, AUDIT_LIMIT);
    if (!rateLimitResult.allowed) {
      const waitSec = Math.ceil(rateLimitResult.retryAfterMs / 1000);
      return {
        success: false,
        error: `Too many requests. Please wait ${waitSec} second${waitSec !== 1 ? "s" : ""} before trying again.`,
      };
    }

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

    // 4. Save + summarize within a 25s timeout (Vercel limit is 30s)
    try {
      const id = await withTimeout(
        (async () => {
          const auditId = await insertAudit(input, result);

          // Generate AI summary non-blocking (won't throw — inner try/catch)
          try {
            const { text: summaryText } = await generateSummary(result);
            await updateAuditSummary(auditId, summaryText);
          } catch (summaryErr) {
            console.error("[AI] Failed to generate or persist summary:", summaryErr);
          }

          return auditId;
        })(),
        25_000
      );

      return { success: true, id };
    } catch (timeoutErr) {
      console.error("[Audit] DB/AI operation timed out or failed:", timeoutErr);
      // Gracefully fall back to client-side scoring on timeout
      return { success: false, fallback: true };
    }
  } catch (err) {
    console.error("Failed to run or save audit on server:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred.",
    };
  }
}
