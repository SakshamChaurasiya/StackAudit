import { Container, Section } from "@/components/shared/container";
import { Caption } from "@/components/shared/typography";
import {
  footnote,
  trustIndicators,
  trustStats,
} from "@/data/landing-content";
import { cn } from "@/lib/utils";

export function TrustSection() {
  return (
    <Section spacing="sm" className="border-b border-border/60 bg-muted/20">
      <Container>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {trustIndicators.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <item.icon
                className="h-4 w-4 text-brand"
                aria-hidden
              />
              {item.label}
            </li>
          ))}
        </ul>

        <div className="mt-10 grid grid-cols-1 gap-6 border-t border-border/60 pt-10 sm:grid-cols-3">
          {trustStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                {stat.value}
              </p>
              <Caption className="mt-1">{stat.label}</Caption>
            </div>
          ))}
        </div>

        <Caption className={cn("mt-6 text-center")}>{footnote}</Caption>
      </Container>
    </Section>
  );
}
