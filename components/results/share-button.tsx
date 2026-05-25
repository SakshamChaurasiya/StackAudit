"use client";

import { useState } from "react";
import { Check, Link2, Linkedin, Share2, Twitter } from "lucide-react";
import { toast } from "@/lib/toast";

export function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    // Append ?shared=1 so external viewers get the public read-only UX
    const url = new URL(window.location.href);
    url.searchParams.set("shared", "1");
    return url.toString();
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(getShareUrl())
      .then(() => {
        setCopied(true);
        toast.success("Link copied!", {
          description: "Share this link to let others view your audit report.",
        });
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => toast.error("Could not copy link"));
    setOpen(false);
  };

  const handleTwitter = () => {
    const url = getShareUrl();
    const text = `Just audited my AI tool stack with @StackAudit — check out the savings breakdown:`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleLinkedIn = () => {
    const url = getShareUrl();
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(liUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        id="share-results-btn"
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-card transition-colors hover:bg-muted"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Share
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Link2 className="h-4 w-4 text-muted-foreground" />
              )}
              {copied ? "Copied!" : "Copy link"}
            </button>
            <div className="h-px bg-border" />
            <button
              type="button"
              onClick={handleTwitter}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Twitter className="h-4 w-4 text-muted-foreground" />
              Share on X / Twitter
            </button>
            <div className="h-px bg-border" />
            <button
              type="button"
              onClick={handleLinkedIn}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Linkedin className="h-4 w-4 text-muted-foreground" />
              Share on LinkedIn
            </button>
          </div>
        </>
      )}
    </div>
  );
}

