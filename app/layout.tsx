import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "StackAudit — AI Spend Audit for Startups",
    template: "%s | StackAudit",
  },
  description:
    "Analyze and optimize your AI tool spending with deterministic audits and actionable savings recommendations.",
  openGraph: {
    siteName: "StackAudit",
    type: "website",
    title: "StackAudit — AI Spend Audit for Startups",
    description:
      "Analyze and optimize your AI tool spending with deterministic audits and actionable savings recommendations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "StackAudit — AI Spend Audit for Startups",
    description:
      "Analyze and optimize your AI tool spending with deterministic audits and actionable savings recommendations.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans`}
      >
        {children}
        <Toaster position="bottom-right" closeButton richColors />
      </body>
    </html>
  );
}
