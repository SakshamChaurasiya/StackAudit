"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, DatabaseBackup, Loader2 } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { Display, Text } from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { SavingsHero } from "@/components/results/savings-hero";
import { AuditSummaryBar } from "@/components/results/audit-summary-bar";
import { RecommendationsList } from "@/components/results/recommendations-list";
import { ToolBreakdown } from "@/components/results/tool-breakdown";
import { ResultsCta } from "@/components/results/results-cta";

import type { AuditResult } from "@/lib/audit-engine/types";

type Props = {
  id: string;
  initialResult?: AuditResult | null;
};

export function ResultsPageClient({ id, initialResult }: Props) {
  const [result, setResult] = useState<AuditResult | null>(initialResult || null);
  const [loading, setLoading] = useState(!initialResult);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    // If the server preloaded the result from Supabase, skip sessionStorage lookup
    if (initialResult) {
      setLoading(false);
      return;
    }

    try {
      const dataStr = sessionStorage.getItem(`stackaudit-result-${id}`);
      if (dataStr) {
        setResult(JSON.parse(dataStr));
        setIsFallback(true);
      }
    } catch (err) {
      console.error("Failed to parse audit result from sessionStorage:", err);
    } finally {
      setLoading(false);
    }
  }, [id, initialResult]);

  if (loading) {
    return (
      <Section spacing="lg">
        <Container size="narrow" className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
          <Text className="mt-4 text-muted-foreground">Loading your audit results...</Text>
        </Container>
      </Section>
    );
  }

  if (!result) {
    return (
      <Section spacing="lg">
        <Container size="narrow" className="py-12">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
            </div>
            <h1 className="text-title-sm font-semibold tracking-tight">Audit Report Not Found</h1>
            <p className="mt-2 text-body text-muted-foreground">
              We couldn&apos;t find an audit report matching this ID. It may have expired or was run in a different browser.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button asChild variant="outline">
                <Link href="/">Home</Link>
              </Button>
              <Button asChild variant="brand">
                <Link href="/audit">Run a new audit</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section spacing="lg">
      <Container size="narrow" className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="-ml-3 text-muted-foreground hover:text-foreground">
                <Link href="/audit">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Edit Stack
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Display as="h1" size="default" className="font-bold tracking-tight">
                Audit Report
              </Display>
              {isFallback && (
                <Badge variant="outline" className="flex items-center gap-1 border-amber-500/20 bg-amber-500/5 text-amber-600">
                  <DatabaseBackup className="h-3 w-3" />
                  Local Preview
                </Badge>
              )}
            </div>
            <Text muted className="text-xs font-mono">
              ID: {id}
            </Text>
          </div>
        </div>

        <SavingsHero summary={result.summary} />

        <div className="space-y-2">
          <h2 className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
            Financial Health
          </h2>
          <AuditSummaryBar summary={result.summary} />
        </div>

        <RecommendationsList recommendations={result.recommendations} />

        <ToolBreakdown input={result.input} />

        <ResultsCta summary={result.summary} auditId={id} />
      </Container>
    </Section>
  );
}
