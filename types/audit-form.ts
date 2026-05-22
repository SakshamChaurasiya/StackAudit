import type { z } from "zod";

import type { auditFormSchema } from "@/lib/audit-form/schema";

export type AuditFormValues = z.infer<typeof auditFormSchema>;

export type ToolRowValues = AuditFormValues["tools"][number];
