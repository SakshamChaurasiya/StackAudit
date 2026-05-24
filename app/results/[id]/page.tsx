import { ResultsPageClient } from "@/app/results/[id]/results-client";
import { selectAudit } from "@/lib/supabase/db";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return {
    title: `Audit Results (${id.slice(0, 8)}) | StackAudit`,
    description: "Detailed SaaS spend breakdown, savings recommendations, and plan optimizations.",
  };
}

export default async function ResultsPage({ params }: Props) {
  const { id } = await params;

  // Attempt to fetch from Supabase (server-side)
  // Will return null if Supabase is unconfigured or record doesn't exist (triggers sessionStorage fallback)
  const initialResult = await selectAudit(id);

  return <ResultsPageClient id={id} initialResult={initialResult} />;
}
