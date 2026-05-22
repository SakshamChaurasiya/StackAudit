import Link from "next/link";
import { Layers } from "lucide-react";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80",
        className,
      )}
      aria-label="StackAudit home"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Layers className="h-4 w-4" aria-hidden />
      </span>
      <span>StackAudit</span>
    </Link>
  );
}
