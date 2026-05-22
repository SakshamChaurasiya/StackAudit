import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AuditPreview } from "@/components/landing/audit-preview";
import { Container, Section } from "@/components/shared/container";
import { Display, Eyebrow, Lead } from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { hero } from "@/data/landing-content";

export function HeroSection() {
  return (
    <Section
      spacing="lg"
      className="relative overflow-hidden border-b border-border/60"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(var(--brand)/0.12),transparent)]"
        aria-hidden
      />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
            <Eyebrow className="mb-4">{hero.eyebrow}</Eyebrow>
            <Display size="lg" className="mb-5">
              {hero.headline}
            </Display>
            <Lead className="mb-8">{hero.subheadline}</Lead>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild variant="brand" size="lg">
                <Link href={hero.primaryCtaHref}>
                  {hero.primaryCta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={hero.secondaryCtaHref}>{hero.secondaryCta}</Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <AuditPreview />
          </div>
        </div>
      </Container>
    </Section>
  );
}
