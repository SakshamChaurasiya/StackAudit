"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { SectionHeader } from "@/components/landing/section-header";
import { Container, Section } from "@/components/shared/container";
import { faq } from "@/data/landing-content";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" spacing="default" className="bg-muted/20">
      <Container size="narrow">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions founders ask before they audit"
          description="Straight answers — no hand-waving about how the product works."
        />

        <ul className="space-y-3">
          {faq.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <li key={item.question}>
                <div className="overflow-hidden rounded-lg border border-border/80 bg-background shadow-sm">
                  <button
                    type="button"
                    id={`faq-trigger-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    onClick={() =>
                      setOpenIndex(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-muted/50"
                  >
                    {item.question}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                  <div
                    id={`faq-panel-${index}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${index}`}
                    hidden={!isOpen}
                    className={cn(!isOpen && "hidden")}
                  >
                    <p className="border-t border-border/60 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
