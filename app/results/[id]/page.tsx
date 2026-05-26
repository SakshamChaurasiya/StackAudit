import type { Metadata } from "next";
import { ResultsPageClient } from "@/app/results/[id]/results-client";
import { selectAudit } from "@/lib/supabase/db";
import { ErrorBoundary } from "@/components/shared/error-boundary";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const pageUrl = `${appUrl}/results/${id}`;
  const ogImageUrl = `/results/${id}/opengraph-image`;

  // Try to fetch audit for personalised metadata
  const result = await selectAudit(id);

  if (!result) {
    return {
      title: "Audit Report",
      description: "View this AI spend audit report on StackAudit.",
      alternates: { canonical: pageUrl },
    };
  }

  const { summary } = result;
  const hasSavings = summary.totalAnnualSaving > 0;

  const title = hasSavings
    ? `Save $${summary.totalAnnualSaving.toFixed(0)}/yr on AI tools`
    : "Well-Optimised AI Stack";

  const description = hasSavings
    ? `StackAudit found $${summary.totalAnnualSaving.toFixed(0)} in potential annual savings across ${summary.toolCount} AI tools — ${summary.recommendationCount} actionable recommendation${summary.recommendationCount !== 1 ? "s" : ""}.`
    : `This ${summary.toolCount}-tool AI stack at $${summary.totalMonthlySpend.toFixed(0)}/month is already well-optimised. View the full breakdown on StackAudit.`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${title} | StackAudit`,
      description,
      url: pageUrl,
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | StackAudit`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ResultsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;

  // Detect external/shared view — hides "Edit Stack" back button for non-owners
  const isShared = sp.shared === "1";

  // Attempt to fetch from Supabase (server-side)
  // Will return null if Supabase is unconfigured or record doesn't exist (triggers sessionStorage fallback)
  const initialResult = await selectAudit(id);

  return (
    <ErrorBoundary>
      <ResultsPageClient id={id} initialResult={initialResult} isShared={isShared} />
    </ErrorBoundary>
  );
}

