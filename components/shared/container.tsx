import { cva, type VariantProps } from "class-variance-authority";

import { containerWidths, sectionSpacing } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    size: {
      narrow: containerWidths.narrow,
      default: containerWidths.default,
      wide: containerWidths.wide,
      prose: "max-w-prose",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof containerVariants>;

export function Container({ className, size, ...props }: ContainerProps) {
  return (
    <div className={cn(containerVariants({ size }), className)} {...props} />
  );
}

const sectionVariants = cva("", {
  variants: {
    spacing: {
      sm: sectionSpacing.sm,
      default: sectionSpacing.default,
      lg: sectionSpacing.lg,
      none: "",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
});

export type SectionProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof sectionVariants> & {
    as?: "section" | "div";
  };

export function Section({
  className,
  spacing,
  as: Component = "section",
  ...props
}: SectionProps) {
  return (
    <Component
      className={cn(sectionVariants({ spacing }), className)}
      {...props}
    />
  );
}

export function PageHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto max-w-3xl text-center", className)}
      {...props}
    />
  );
}
