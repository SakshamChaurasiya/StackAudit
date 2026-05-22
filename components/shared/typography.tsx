import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const displayVariants = cva("font-semibold text-balance tracking-tight", {
  variants: {
    size: {
      default: "text-4xl sm:text-5xl lg:text-display-sm",
      lg: "text-4xl sm:text-5xl lg:text-display",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export function Display({
  className,
  size,
  as: Component = "h1",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof displayVariants> & {
    as?: "h1" | "h2" | "p";
  }) {
  return (
    <Component
      className={cn(displayVariants({ size }), className)}
      {...props}
    />
  );
}

export function Title({
  className,
  as: Component = "h2",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  as?: "h2" | "h3" | "h4";
}) {
  return (
    <Component
      className={cn("text-title-sm font-semibold sm:text-title", className)}
      {...props}
    />
  );
}

export function Lead({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-lead text-muted-foreground text-pretty", className)}
      {...props}
    />
  );
}

export function Eyebrow({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-eyebrow font-medium uppercase text-brand",
        className,
      )}
      {...props}
    />
  );
}

export function Text({
  className,
  muted,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & { muted?: boolean }) {
  return (
    <p
      className={cn(
        "text-body",
        muted && "text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function Caption({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-caption text-muted-foreground", className)}
      {...props}
    />
  );
}
