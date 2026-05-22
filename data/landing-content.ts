import {
  BarChart3,
  CircleDollarSign,
  Layers,
  LineChart,
  Lock,
  Repeat,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

export const hero = {
  eyebrow: "AI Spend Audit for Startups",
  headline: "Stop overpaying for AI tools you barely use",
  subheadline:
    "StackAudit maps your AI stack, runs a deterministic spend audit, and surfaces real savings — with monthly totals, annual impact, and reasoning your CFO will actually trust.",
  primaryCta: "Start free audit",
  secondaryCta: "See how it works",
  primaryCtaHref: "/audit",
  secondaryCtaHref: "#workflow",
} as const;

export const trustIndicators = [
  { label: "No credit card", icon: Lock },
  { label: "3-minute audit", icon: Zap },
  { label: "Deterministic logic", icon: ShieldCheck },
  { label: "Shareable reports", icon: Users },
] as const;

export const trustStats = [
  { value: "9+", label: "AI tools supported" },
  { value: "$480", label: "Avg. annual savings found*" },
  { value: "100%", label: "Transparent rules" },
] as const;

export const features = [
  {
    icon: Layers,
    title: "Full-stack visibility",
    description:
      "Cursor, Copilot, ChatGPT, Claude, Gemini, and API spend in one structured audit — no scattered invoices.",
  },
  {
    icon: ShieldCheck,
    title: "Deterministic engine",
    description:
      "Savings come from hardcoded financial rules, not LLM guesses. Every recommendation is explainable.",
  },
  {
    icon: CircleDollarSign,
    title: "Real dollar impact",
    description:
      "Monthly and annual savings on every finding. Prioritize what actually moves your burn rate.",
  },
  {
    icon: BarChart3,
    title: "Plan-level analysis",
    description:
      "Detect team plans you do not need, retail vs API mispricing, and redundant overlapping subscriptions.",
  },
  {
    icon: Sparkles,
    title: "AI summary layer",
    description:
      "Optional ~100-word founder brief — personalized narrative on top of deterministic numbers.",
  },
  {
    icon: Repeat,
    title: "Shareable reports",
    description:
      "Send a public link to your co-founder or finance lead. Align the team on what to cut or downgrade.",
  },
] as const;

export const benefits = [
  {
    title: "Built for startup burn, not enterprise procurement",
    description:
      "Generic spend tools assume SAP integrations and 90-day reviews. StackAudit assumes a 12-person team paying for ChatGPT Team, Cursor Business, and three APIs — and needs answers today.",
    bullets: [
      "Seat vs API pricing comparisons",
      "Overlap detection across dev + chat tools",
      "Downgrade paths with plain-English rationale",
    ],
  },
  {
    title: "Credible enough to act on immediately",
    description:
      "Every recommendation links spend to a specific plan change or alternative. No vague “optimize your stack” advice — you get a line item and a number.",
    bullets: [
      "Monthly + annual savings per finding",
      "Reasoning written for founders, not finance bots",
      "Export-ready for board updates and budget reviews",
    ],
  },
] as const;

export const workflow = [
  {
    step: "01",
    icon: LineChart,
    title: "List your tools & spend",
    description:
      "Select plans, monthly spend, seats, and use case for each tool in your stack. Takes about three minutes.",
  },
  {
    step: "02",
    icon: ShieldCheck,
    title: "Run the deterministic audit",
    description:
      "Our engine applies financially literate rules: redundant subs, wrong tier, API cheaper than seats, and more.",
  },
  {
    step: "03",
    icon: CircleDollarSign,
    title: "Review savings & share",
    description:
      "See prioritized recommendations, optional AI summary, and a shareable report URL for your team.",
  },
] as const;

export const faq = [
  {
    question: "Is StackAudit just ChatGPT analyzing my bills?",
    answer:
      "No. All savings calculations and recommendations come from a deterministic audit engine with hardcoded pricing logic. AI is only used for an optional short summary — never for the math.",
  },
  {
    question: "Which AI tools do you support?",
    answer:
      "Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, and Windsurf or v0. We add tools as pricing tiers stabilize.",
  },
  {
    question: "How long does an audit take?",
    answer:
      "Most founders complete the intake in under three minutes. Results are generated instantly from your inputs.",
  },
  {
    question: "Do I need to connect my bank or invoices?",
    answer:
      "Not for the MVP. You enter spend manually — which keeps setup friction low and makes the audit easy to try before you trust us with integrations.",
  },
  {
    question: "Can I share results with my team?",
    answer:
      "Yes. Each audit gets a shareable public report URL so co-founders and finance leads can review the same numbers and reasoning.",
  },
  {
    question: "Is it really free?",
    answer:
      "The audit is free. We capture your email to deliver results and follow up — standard lead-gen for a startup tool validating demand.",
  },
] as const;

export const cta = {
  headline: "Your AI stack should not be a black box on your P&L",
  subheadline:
    "Run a free audit in under three minutes. See exactly where you are overpaying — and what to do about it.",
  button: "Start your free audit",
  href: "/audit",
} as const;

export const footnote =
  "*Illustrative benchmark for demo purposes. Actual savings depend on your stack.";
