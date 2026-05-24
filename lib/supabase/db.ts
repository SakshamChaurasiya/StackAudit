import { getSupabaseClient } from "@/lib/supabase/client";
import type { AuditInput, AuditResult, AuditSummary, Recommendation } from "@/lib/audit-engine/types";

/**
 * Inserts a new audit input and computed result into the database.
 * Returns the generated UUID identifier of the audit record.
 */
export async function insertAudit(
  input: AuditInput,
  result: Omit<AuditResult, "scoredAt">
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
    .select("input, summary, recommendations, created_at")
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
  };
}

/**
 * Inserts a captured lead email into the leads table.
 * Links the lead optional to an audit ID if provided.
 */
export async function insertLead(email: string, auditId?: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Enable configuration.");
  }

  const { error } = await supabase.from("leads").insert({
    email,
    audit_id: auditId || null,
  });

  if (error) {
    console.error("Database error inserting lead capture:", error);
    throw new Error(`Failed to save lead: ${error.message}`);
  }
}
