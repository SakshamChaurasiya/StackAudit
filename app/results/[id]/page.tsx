import { ResultsPageClient } from "@/app/results/[id]/results-client";

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

  return <ResultsPageClient id={id} />;
}
