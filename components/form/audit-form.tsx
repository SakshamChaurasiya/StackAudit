"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { ToolRow } from "@/components/form/tool-row";
import { FormField } from "@/components/shared/form-field";
import { FormNumberInput } from "@/components/form/form-number-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MAX_TOOL_ROWS } from "@/lib/audit-form/constants";
import {
  auditFormSchema,
  createEmptyToolRow,
  defaultAuditFormValues,
} from "@/lib/audit-form/schema";
import { runAudit } from "@/lib/audit-engine";
import { runAndSaveAuditAction } from "@/app/actions/audit";
import { findUnusedTool } from "@/lib/pricing/catalog";
import {
  clearAuditDraft,
  loadAuditDraft,
  saveAuditDraft,
} from "@/lib/audit-form/storage";
import { toast } from "@/lib/toast";
import type { AuditFormValues } from "@/types/audit-form";

const PERSIST_DEBOUNCE_MS = 400;

export function AuditForm() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: defaultAuditFormValues,
    mode: "onTouched",
  });

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tools",
  });

  const watchedTools = watch("tools");

  useEffect(() => {
    const draft = loadAuditDraft();
    if (draft) reset(draft);
    setHydrated(true);
  }, [reset]);

  const persistDraft = useCallback((values: AuditFormValues) => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      saveAuditDraft(values);
    }, PERSIST_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const subscription = watch((data) => {
      persistDraft(data as AuditFormValues);
    });

    return () => subscription.unsubscribe();
  }, [watch, hydrated, persistDraft]);

  const addToolRow = () => {
    if (fields.length >= MAX_TOOL_ROWS) {
      toast.error(`Maximum ${MAX_TOOL_ROWS} tools per audit`);
      return;
    }
    const usedTools = watch("tools").map((t) => t.tool);
    const nextTool = findUnusedTool(usedTools);
    if (!nextTool) {
      toast.error("All supported tools are already in your stack");
      return;
    }
    append(createEmptyToolRow(nextTool));
  };

  const onSubmit = handleSubmit(async (data) => {
    saveAuditDraft(data);
    setServerError(null);
    try {
      const res = await runAndSaveAuditAction(data);
      if (res.success) {
        setRetryCount(0);
        toast.success("Audit complete!", {
          description: "Redirecting to your results...",
        });
        router.push(`/results/${res.id}`);
        return;
      }

      if (res.success === false && "fallback" in res && res.fallback) {
        // Fallback: run engine client-side and save to sessionStorage
        const result = runAudit(data);
        const uuid = crypto.randomUUID();
        sessionStorage.setItem(`stackaudit-result-${uuid}`, JSON.stringify(result));
        toast.success("Audit complete (local draft)!", {
          description: "Redirecting to your results...",
        });
        router.push(`/results/${uuid}`);
        return;
      }

      // Server returned an explicit error — show retry banner
      const errorMsg = "error" in res ? res.error : "Something went wrong. Please try again.";
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);

      if (newRetryCount >= 3) {
        // Auto-fallback after 3 server failures
        console.warn("[AuditForm] 3 server failures — falling back to client-side audit.");
        const result = runAudit(data);
        const uuid = crypto.randomUUID();
        sessionStorage.setItem(`stackaudit-result-${uuid}`, JSON.stringify(result));
        toast.success("Audit complete (offline mode)!", {
          description: "Server unavailable — running locally.",
        });
        router.push(`/results/${uuid}`);
        return;
      }

      setServerError(errorMsg);
      toast.error("Failed to run audit", { description: errorMsg });
    } catch (err) {
      console.error("Audit run error:", err);
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      setServerError("An unexpected error occurred. Please try again.");
      toast.error("Failed to run audit");
    }
  });

  const onClearDraft = () => {
    clearAuditDraft();
    reset(defaultAuditFormValues);
    toast.info("Draft cleared");
  };

  if (!hydrated) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading form">
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-destructive">Submission failed</p>
            <p className="text-xs text-muted-foreground">{serverError}</p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Retry
          </button>
        </div>
      )}
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>Company</CardTitle>
          <CardDescription>
            Team context helps the audit engine right-size plan recommendations
            (Phase 4).
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-xs">
          <Controller
            name="teamSize"
            control={control}
            render={({ field }) => (
              <FormField
                id="team-size"
                label="Team size"
                required
                hint="Total people at your company"
                error={errors.teamSize?.message}
              >
                <FormNumberInput
                  id="team-size"
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  min={1}
                  step={1}
                  placeholder="e.g. 12"
                />
              </FormField>
            )}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Your AI stack</h2>
            <p className="text-sm text-muted-foreground">
              Add every paid tool — overlap is where savings hide.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addToolRow}
            disabled={fields.length >= MAX_TOOL_ROWS}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add tool
          </Button>
        </div>

        {errors.tools?.message && (
          <p className="text-sm text-destructive" role="alert">
            {errors.tools.message}
          </p>
        )}

        <ul className="space-y-4">
          {fields.map((field, index) => (
            <li key={field.id}>
              <ToolRow
                index={index}
                control={control}
                errors={errors}
                setValue={setValue}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
                usedTools={watchedTools.map((t) => t.tool)}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-caption text-muted-foreground">
          Progress auto-saves to this browser.{" "}
          <button
            type="button"
            onClick={onClearDraft}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Clear draft
          </button>
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" type="button">
            <Link href="/">Back</Link>
          </Button>
          <Button type="submit" variant="brand" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save & continue"}
          </Button>
        </div>
      </div>
    </form>
  );
}
