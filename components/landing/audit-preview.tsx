import { ArrowDownRight, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuditPreviewProps = {
  className?: string;
};

const mockRecommendations = [
  {
    tool: "ChatGPT",
    action: "Downgrade to Plus",
    monthly: 40,
  },
  {
    tool: "GitHub Copilot",
    action: "Remove — overlap with Cursor",
    monthly: 19,
  },
] as const;

export function AuditPreview({ className }: AuditPreviewProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/80 shadow-elevated",
        className,
      )}
      aria-hidden
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
      <CardHeader className="space-y-4 border-b border-border/60 bg-muted/20 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Sample audit preview
            </p>
            <p className="text-lg font-semibold tracking-tight">
              Acme Labs · 8-person team
            </p>
          </div>
          <Badge variant="success" className="shrink-0">
            <TrendingDown className="mr-1 h-3 w-3" aria-hidden />
            $59/mo saved
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/60 bg-background p-3">
            <p className="text-xs text-muted-foreground">Monthly spend</p>
            <p className="text-xl font-semibold tabular-nums">$847</p>
          </div>
          <div className="rounded-lg border border-brand/20 bg-brand/5 p-3">
            <p className="text-xs text-brand">After audit</p>
            <p className="text-xl font-semibold tabular-nums text-brand">
              $788
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Top recommendations
        </p>
        <ul className="space-y-2">
          {mockRecommendations.map((item) => (
            <li
              key={item.tool}
              className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.tool}</p>
                <p className="text-xs text-muted-foreground">{item.action}</p>
              </div>
              <span className="flex shrink-0 items-center gap-0.5 text-sm font-semibold tabular-nums text-success">
                <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />$
                {item.monthly}/mo
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
