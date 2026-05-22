import { SiteLayout } from "@/components/shared/site-layout";

export default function AuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
