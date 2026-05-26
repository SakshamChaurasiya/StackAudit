"use client";

import { Trash2 } from "lucide-react";
import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";

import { FormField } from "@/components/shared/form-field";
import { FormNumberInput } from "@/components/form/form-number-input";
import { FormSelect } from "@/components/form/form-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { USE_CASE_OPTIONS } from "@/lib/audit-form/constants";
import {
  getDefaultPlanForTool,
  getPlansForTool,
  TOOL_OPTIONS,
  toolRequiresSeatsForPlan,
} from "@/lib/pricing/catalog";
import type { AuditFormValues } from "@/types/audit-form";
import type { SupportedTool } from "@/types";

type ToolRowProps = {
  index: number;
  control: Control<AuditFormValues>;
  errors: FieldErrors<AuditFormValues>;
  setValue: UseFormSetValue<AuditFormValues>;
  onRemove: () => void;
  canRemove: boolean;
  usedTools: SupportedTool[];
};

export function ToolRow({
  index,
  control,
  errors,
  setValue,
  onRemove,
  canRemove,
  usedTools,
}: ToolRowProps) {
  const tool = useWatch({
    control,
    name: `tools.${index}.tool`,
  }) as SupportedTool;

  const plan = useWatch({ control, name: `tools.${index}.plan` });
  const showSeats =
    tool && plan ? toolRequiresSeatsForPlan(tool, plan) : false;
  const planOptions = tool
    ? getPlansForTool(tool).map((p) => ({ value: p.id, label: p.label }))
    : [];
  const toolOptions = TOOL_OPTIONS.map((opt) => ({
    ...opt,
    disabled:
      usedTools.includes(opt.value as SupportedTool) &&
      opt.value !== tool,
  }));
  const rowErrors = errors.tools?.[index];

  return (
    <Card className="border-border/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <p className="text-sm font-semibold">
          Tool {index + 1}
          {tool && (
            <span className="ml-2 font-normal text-muted-foreground">
              · {TOOL_OPTIONS.find((t) => t.value === tool)?.label}
            </span>
          )}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={!canRemove}
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Remove tool ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Remove</span>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <Controller
          name={`tools.${index}.tool`}
          control={control}
          render={({ field }) => (
            <FormField
              id={`tools-${index}-tool`}
              label="AI tool"
              required
              error={rowErrors?.tool?.message}
            >
              <FormSelect
                id={`tools-${index}-tool`}
                {...field}
                options={toolOptions}
                onChange={(e) => {
                  const nextTool = e.target.value as SupportedTool;
                  field.onChange(nextTool);
                  setValue(`tools.${index}.plan`, getDefaultPlanForTool(nextTool), {
                    shouldValidate: true,
                  });
                  const defaultPlan = getDefaultPlanForTool(nextTool);
                  if (toolRequiresSeatsForPlan(nextTool, defaultPlan)) {
                    setValue(`tools.${index}.seats`, 1, { shouldValidate: true });
                  } else {
                    setValue(`tools.${index}.seats`, undefined, {
                      shouldValidate: true,
                    });
                  }
                }}
              />
            </FormField>
          )}
        />

        <Controller
          name={`tools.${index}.plan`}
          control={control}
          render={({ field }) => (
            <FormField
              id={`tools-${index}-plan`}
              label="Plan"
              required
              error={rowErrors?.plan?.message}
            >
              <FormSelect
                id={`tools-${index}-plan`}
                {...field}
                options={planOptions}
                disabled={!tool}
                onChange={(e) => {
                  field.onChange(e);
                  const nextPlan = e.target.value;
                  if (tool && toolRequiresSeatsForPlan(tool, nextPlan)) {
                    setValue(`tools.${index}.seats`, 1, {
                      shouldValidate: true,
                    });
                  } else {
                    setValue(`tools.${index}.seats`, undefined, {
                      shouldValidate: true,
                    });
                  }
                }}
              />
            </FormField>
          )}
        />

        <Controller
          name={`tools.${index}.monthlySpend`}
          control={control}
          render={({ field }) => (
            <FormField
              id={`tools-${index}-spend`}
              label="Monthly spend (USD)"
              required
              hint="Total monthly cost for this tool"
              error={rowErrors?.monthlySpend?.message}
            >
              <FormNumberInput
                id={`tools-${index}-spend`}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                min={0}
                placeholder="e.g. 120"
              />
            </FormField>
          )}
        />

        {showSeats ? (
          <Controller
            name={`tools.${index}.seats`}
            control={control}
            render={({ field }) => (
              <FormField
                id={`tools-${index}-seats`}
                label="Seats"
                required
                hint="Licensed seats for this tool"
                error={rowErrors?.seats?.message}
              >
                <FormNumberInput
                  id={`tools-${index}-seats`}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  min={1}
                  step={1}
                  placeholder="e.g. 8"
                />
              </FormField>
            )}
          />
        ) : (
          <div className="hidden sm:block" aria-hidden />
        )}

        <Controller
          name={`tools.${index}.useCase`}
          control={control}
          render={({ field }) => (
            <FormField
              id={`tools-${index}-use-case`}
              label="Primary use case"
              required
              error={rowErrors?.useCase?.message}
              className="sm:col-span-2"
            >
              <FormSelect
                id={`tools-${index}-use-case`}
                {...field}
                options={USE_CASE_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
              />
            </FormField>
          )}
        />
      </CardContent>
    </Card>
  );
}
