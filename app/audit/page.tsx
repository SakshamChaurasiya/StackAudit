import { AuditForm } from "@/components/form/audit-form";
import { Container, Section } from "@/components/shared/container";
import { Display, Lead, Text } from "@/components/shared/typography";

export default function AuditPage() {
  return (
    <Section spacing="default">
      <Container size="narrow">
        <div className="mb-10 space-y-3">
          <Display as="h1" size="default">
            AI Spend Audit
          </Display>
          <Lead>
            Tell us what you pay for. We&apos;ll run a deterministic audit in the
            next phase — your progress saves automatically.
          </Lead>
          <Text muted className="text-sm">
            Add each AI tool, pick your plan, and enter monthly spend. Seat-based
            tools ask for licensed seats.
          </Text>
        </div>

        <AuditForm />
      </Container>
    </Section>
  );
}
