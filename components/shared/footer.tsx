import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/shared/container";
import { Separator } from "@/components/ui/separator";
import { Caption } from "@/components/shared/typography";

const footerLinks = {
  product: [
    { href: "/audit", label: "Start audit" },
    { href: "/#features", label: "Features" },
    { href: "/#workflow", label: "Workflow" },
    { href: "/#faq", label: "FAQ" },
  ],
  company: [
    { href: "#", label: "About" },
    { href: "#", label: "Contact" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <Container size="wide" className="py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <Caption className="max-w-xs">
              Deterministic AI spend audits for startups. Find savings without
              spreadsheet guesswork.
            </Caption>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">Product</p>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-caption text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">Company</p>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-caption text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Caption>
            © {new Date().getFullYear()} StackAudit. Built for Credex assignment.
          </Caption>
          <Caption>Audit logic is deterministic — not AI-generated.</Caption>
        </div>
      </Container>
    </footer>
  );
}
