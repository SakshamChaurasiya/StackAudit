import { SiteLayout } from "@/components/shared/site-layout";

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
