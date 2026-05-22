import { Container, Section } from "@/components/shared/container";
import { Display, Lead, Text } from "@/components/shared/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Section spacing="default">
      <Container size="narrow">
        <div className="mb-10 space-y-3">
          <Display as="h1" size="default">
            Audit Results
          </Display>
          <Lead>
            Savings breakdown and recommendations — Phase 3–4.
          </Lead>
          <Text muted>
            Audit ID:{" "}
            <span className="font-mono text-foreground">{id}</span>
          </Text>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Deterministic audit output will render here.
            </p>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}
