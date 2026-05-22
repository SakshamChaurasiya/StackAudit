import { beforeEach, describe, expect, it } from "vitest";

import { AUDIT_FORM_STORAGE_KEY } from "@/lib/audit-form/constants";
import { defaultAuditFormValues } from "@/lib/audit-form/schema";
import {
  clearAuditDraft,
  loadAuditDraft,
  saveAuditDraft,
} from "@/lib/audit-form/storage";

describe("audit form storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads a draft with in-progress spend", () => {
    const draft = {
      ...defaultAuditFormValues,
      teamSize: 8,
      tools: [{ ...defaultAuditFormValues.tools[0], monthlySpend: 0 }],
    };
    saveAuditDraft(draft);
    expect(localStorage.getItem(AUDIT_FORM_STORAGE_KEY)).toBeTruthy();
    expect(loadAuditDraft()).toEqual(draft);
  });

  it("clears draft", () => {
    saveAuditDraft(defaultAuditFormValues);
    clearAuditDraft();
    expect(loadAuditDraft()).toBeNull();
  });

  it("returns null for invalid stored JSON", () => {
    localStorage.setItem(AUDIT_FORM_STORAGE_KEY, '{"teamSize":"x"}');
    expect(loadAuditDraft()).toBeNull();
  });
});
