import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { Lead, Title } from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cta } from "@/data/landing-content";

export function CtaSection() {
  return (
    <Section spacing="default">
      <Container size="narrow">
        <Card className="overflow-hidden border-border/80 bg-gradient-to-br from-brand/5 via-background to-background shadow-elevated">
          <CardHeader className="space-y-3 pb-2 text-center">
            <Title className="text-title sm:text-title">
              {cta.headline}
            </Title>
            <Lead className="mx-auto max-w-lg text-muted-foreground">
              {cta.subheadline}
            </Lead>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-8">
            <Button asChild variant="brand" size="lg">
              <Link href={cta.href}>
                {cta.button}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <p className="text-caption text-muted-foreground">
              Free · No credit card · Results in minutes
            </p>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}
