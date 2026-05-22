import { SectionHeader } from "@/components/landing/section-header";
import { Container, Section } from "@/components/shared/container";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { workflow } from "@/data/landing-content";

export function WorkflowSection() {
  return (
    <Section id="workflow" spacing="default">
      <Container>
        <SectionHeader
          eyebrow="Workflow"
          title="From stack to savings in three steps"
          description="A conversion-focused flow designed for busy founders — minimal friction, maximum clarity."
        />

        <ol className="grid gap-6 md:grid-cols-3">
          {workflow.map((step) => (
            <li key={step.step}>
              <Card className="relative h-full overflow-hidden border-border/80">
                <div
                  className="absolute right-4 top-4 font-mono text-4xl font-bold text-muted-foreground/20"
                  aria-hidden
                >
                  {step.step}
                </div>
                <CardHeader className="relative pt-8">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <step.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
