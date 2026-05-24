"use client";

import { Link2 } from "lucide-react";

import { toast } from "@/lib/toast";

export function ShareButton() {
  const handleCopy = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        toast.success("Link copied", {
          description: "Shareable reports arrive in Phase 9.",
        });
      })
      .catch(() => {
        toast.error("Could not copy link");
      });
  };

  return (
    <button
      id="share-results-btn"
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-card transition-colors hover:bg-muted"
    >
      <Link2 className="h-4 w-4" aria-hidden />
      Copy link
    </button>
  );
}
