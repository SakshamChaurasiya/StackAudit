"use client";

import { forwardRef } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FormNumberInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "onChange"
> & {
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
};

export const FormNumberInput = forwardRef<HTMLInputElement, FormNumberInputProps>(
  ({ value, onValueChange, className, min, max, step = "any", ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        className={cn("tabular-nums", className)}
        value={value === undefined ? "" : value}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onValueChange(undefined);
            return;
          }
          const parsed = Number(raw);
          onValueChange(Number.isNaN(parsed) ? undefined : parsed);
        }}
        {...props}
      />
    );
  },
);
FormNumberInput.displayName = "FormNumberInput";
