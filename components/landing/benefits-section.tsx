import { Check } from "lucide-react";

import { SectionHeader } from "@/components/landing/section-header";
import { Container, Section } from "@/components/shared/container";
import { Text, Title } from "@/components/shared/typography";
import { benefits } from "@/data/landing-content";

export function BenefitsSection() {
  return (
    <Section
      id="benefits"
      spacing="default"
      className="border-y border-border/60 bg-muted/20"
    >
      <Container>
        <SectionHeader
          eyebrow="Why StackAudit"
          title="Financial clarity without the finance team"
          description="Stop guessing whether ChatGPT Team is worth it — get a structured audit with real alternatives."
        />

        <div className="grid gap-12 lg:grid-cols-2">
          {benefits.map((benefit, index) => (
            <article
              key={benefit.title}
              className="rounded-xl border border-border/80 bg-background p-8 shadow-card"
            >
              <span className="mb-4 inline-block font-mono text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Title as="h3" className="mb-3 text-title-sm">
                {benefit.title}
              </Title>
              <Text muted className="mb-6">
                {benefit.description}
              </Text>
              <ul className="space-y-3">
                {benefit.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
