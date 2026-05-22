import { AUDIT_FORM_STORAGE_KEY } from "@/lib/audit-form/constants";
import {
  auditFormDraftSchema,
  defaultAuditFormValues,
} from "@/lib/audit-form/schema";
import type { AuditFormValues } from "@/types/audit-form";

export function loadAuditDraft(): AuditFormValues | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(AUDIT_FORM_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    const result = auditFormDraftSchema.safeParse(parsed);
    return result.success ? (result.data as AuditFormValues) : null;
  } catch {
    return null;
  }
}

/** Persists draft JSON — may be partially invalid while the user is editing. */
export function saveAuditDraft(values: unknown): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(AUDIT_FORM_STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Quota exceeded or private browsing — fail silently
  }
}

export function clearAuditDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUDIT_FORM_STORAGE_KEY);
}

export function getInitialFormValues(): AuditFormValues {
  return loadAuditDraft() ?? defaultAuditFormValues;
}
