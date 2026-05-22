import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function FormField({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden>
            *
          </span>
        )}
      </Label>
      <div
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        aria-required={required}
      >
        {children}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-caption text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-caption text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
