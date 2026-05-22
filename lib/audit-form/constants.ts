export const USE_CASES = [
  "engineering",
  "product",
  "design",
  "marketing",
  "operations",
  "leadership",
  "mixed",
] as const;

export type UseCase = (typeof USE_CASES)[number];

export const USE_CASE_OPTIONS: { value: UseCase; label: string }[] = [
  { value: "engineering", label: "Engineering / Development" },
  { value: "product", label: "Product" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "operations", label: "Operations" },
  { value: "leadership", label: "Leadership / Strategy" },
  { value: "mixed", label: "Mixed / Company-wide" },
];

export const AUDIT_FORM_STORAGE_KEY = "stackaudit-audit-draft";

export const MAX_TOOL_ROWS = 15;
