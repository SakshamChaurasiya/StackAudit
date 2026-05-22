"use client";

import { forwardRef } from "react";

import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type FormSelectProps = React.ComponentProps<"select"> & {
  options: SelectOption[];
  placeholder?: string;
};

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ options, placeholder, className, value, ...props }, ref) => {
    return (
      <Select
        ref={ref}
        className={cn(className)}
        value={value ?? ""}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </Select>
    );
  },
);
FormSelect.displayName = "FormSelect";
