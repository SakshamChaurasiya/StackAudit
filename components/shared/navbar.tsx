"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#benefits", label: "Benefits" },
  { href: "/#workflow", label: "Workflow" },
  { href: "/#faq", label: "FAQ" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <Container size="wide">
        <nav
          className="flex h-16 items-center justify-between gap-4"
          aria-label="Main navigation"
        >
          <Logo />

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    pathname === link.href && "text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/#faq">FAQ</Link>
            </Button>
            <Button asChild variant="brand" size="sm">
              <Link href="/audit">Start audit</Link>
            </Button>
          </div>
        </nav>
      </Container>
    </header>
  );
}
