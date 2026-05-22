/**
 * Design tokens — semantic spacing and layout widths.
 * Prefer these constants in shared layout components for consistency.
 */

export const containerWidths = {
  narrow: "max-w-2xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

export const sectionSpacing = {
  sm: "py-12 md:py-16",
  default: "py-16 md:py-24",
  lg: "py-20 md:py-28",
} as const;

export const stackSpacing = {
  xs: "gap-2",
  sm: "gap-4",
  default: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
} as const;
