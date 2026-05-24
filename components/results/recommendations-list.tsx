import { Lightbulb } from "lucide-react";

import { RecommendationCard } from "@/components/results/recommendation-card";
import type { Recommendation } from "@/lib/audit-engine/types";

const PRIORITY_LABELS: Record<1 | 2 | 3, string> = {
  1: "High impact",
  2: "Medium impact",
  3: "Low impact",
};

type Props = {
  recommendations: Recommendation[];
};

export function RecommendationsList({ recommendations }: Props) {
  if (recommendations.length === 0) {
    return (
      <section aria-label="Recommendations">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center">
          <Lightbulb className="h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="text-body font-medium text-muted-foreground">
            No recommendations found
          </p>
          <p className="text-caption text-muted-foreground">
            Your AI stack is already well-optimised.
          </p>
        </div>
      </section>
    );
  }

  // Group by priority
  const groups = new Map<1 | 2 | 3, Recommendation[]>();
  for (const rec of recommendations) {
    const p = rec.priority as 1 | 2 | 3;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p)!.push(rec);
  }

  return (
    <section aria-label="Recommendations" className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-title-sm font-semibold tracking-tight">
          Recommendations
        </h2>
        <span className="rounded-full bg-brand/10 px-3 py-0.5 text-sm font-medium text-brand">
          {recommendations.length} finding{recommendations.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-8">
        {([1, 2, 3] as const).map((priority) => {
          const group = groups.get(priority);
          if (!group || group.length === 0) return null;
          return (
            <div key={priority} className="space-y-3">
              {/* Priority tier divider */}
              <div className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${
                    priority === 1
                      ? "bg-red-400"
                      : priority === 2
                        ? "bg-amber-400"
                        : "bg-sky-400"
                  }`}
                  aria-hidden
                />
                <span className="text-caption font-medium uppercase tracking-wide text-muted-foreground">
                  {PRIORITY_LABELS[priority]}
                </span>
                <div className="flex-1 border-t border-border" />
              </div>

              <ul className="space-y-3">
                {group.map((rec) => (
                  <li key={rec.id}>
                    <RecommendationCard rec={rec} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
