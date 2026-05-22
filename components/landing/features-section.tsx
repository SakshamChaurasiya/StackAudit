import { SectionHeader } from "@/components/landing/section-header";
import { Container, Section } from "@/components/shared/container";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { features } from "@/data/landing-content";

export function FeaturesSection() {
  return (
    <Section id="features" spacing="default">
      <Container>
        <SectionHeader
          eyebrow="Features"
          title="Everything you need to audit AI spend"
          description="Purpose-built for founders who want numbers they can defend — not another generic dashboard."
        />

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <li key={feature.title}>
              <Card className="h-full border-border/80 transition-shadow hover:shadow-card">
                <CardHeader>
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <feature.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
