import { getSupabaseClient } from "@/lib/supabase/client";
import type { AuditInput, AuditResult, AuditSummary, Recommendation } from "@/lib/audit-engine/types";

/**
 * Inserts a new audit input and computed result into the database.
 * Returns the generated UUID identifier of the audit record.
 */
export async function insertAudit(
  input: AuditInput,
  result: Omit<AuditResult, "scoredAt" | "aiSummary" | "isAiGenerated">
): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Enable configuration.");
  }

  const { data, error } = await supabase
    .from("audits")
    .insert({
      input,
      summary: result.summary,
      recommendations: result.recommendations,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Database error inserting audit record:", error);
    throw new Error(`Failed to save audit: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error("Failed to retrieve generated audit ID.");
  }

  return data.id;
}

/**
 * Updates the AI summary text on an existing audit record.
 * Called after the audit has been inserted and the AI summary generated.
 */
export async function updateAuditSummary(
  id: string,
  aiSummary: string
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return; // no-op in fallback mode

  const { error } = await supabase
    .from("audits")
    .update({ ai_summary: aiSummary })
    .eq("id", id);

  if (error) {
    console.error(`Database error updating ai_summary for audit ${id}:`, error);
    // Non-fatal — audit is saved, summary just won't persist
  }
}

/**
 * Queries an audit result by its UUID from the database.
 * Returns the reconstructed AuditResult or null if not found.
 */
export async function selectAudit(id: string): Promise<AuditResult | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("audits")
    .select("input, summary, recommendations, ai_summary, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Database error fetching audit ${id}:`, error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    input: data.input as AuditInput,
    summary: data.summary as unknown as AuditSummary,
    recommendations: data.recommendations as unknown as Recommendation[],
    scoredAt: data.created_at,
    aiSummary: data.ai_summary ?? undefined,
    isAiGenerated: data.ai_summary ? true : undefined,
  };
}

/**
 * Inserts a captured lead email into the leads table.
 * Links the lead optionally to an audit ID if provided.
 * Accepts an optional name field for richer lead data.
 */
export async function insertLead(
  email: string,
  auditId?: string,
  name?: string
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Enable configuration.");
  }

  const { error } = await supabase.from("leads").insert({
    email,
    audit_id: auditId || null,
    name: name || null,
  });

  if (error) {
    console.error("Database error inserting lead capture:", error);
    throw new Error(`Failed to save lead: ${error.message}`);
  }
}

/**
 * Checks if a lead with the given email was captured within the last `windowMinutes`.
 * Used to prevent duplicate emails and spam submissions.
 * Returns false if Supabase is not configured (fallback mode).
 */
export async function hasRecentLead(
  email: string,
  windowMinutes: number = 10
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("leads")
    .select("id")
    .eq("email", email)
    .gte("created_at", since)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Database error checking recent lead:", error);
    return false; // fail open — allow the submission
  }

  return Boolean(data);
}

