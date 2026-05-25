import { Sparkles, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  summary: string;
  isAiGenerated?: boolean;
};

/**
 * Displays the AI-generated or deterministic fallback summary for an audit result.
 *
 * - Shows a "AI Summary" badge with a Sparkles icon for Gemini-generated content
 * - Shows a "Quick Summary" badge with a FileText icon for fallback content
 */
export function AiSummaryCard({ summary, isAiGenerated = false }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 via-background to-brand/5 p-6">
      {/* Decorative gradient orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/10 blur-2xl"
      />

      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10">
          {isAiGenerated ? (
            <Sparkles className="h-4 w-4 text-brand" aria-hidden />
          ) : (
            <FileText className="h-4 w-4 text-brand" aria-hidden />
          )}
        </div>

        <Badge
          variant="outline"
          className="border-brand/25 bg-brand/5 text-brand"
        >
          {isAiGenerated ? "AI Summary" : "Quick Summary"}
        </Badge>

        {isAiGenerated && (
          <span className="ml-auto text-xs text-muted-foreground">
            Powered by Gemini
          </span>
        )}
      </div>

      {/* Summary text */}
      <p className="relative text-sm leading-relaxed text-foreground/85">
        {summary}
      </p>
    </div>
  );
}
