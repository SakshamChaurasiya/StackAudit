import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { SkipLink } from "@/components/shared/skip-link";

type SiteLayoutProps = {
  children: React.ReactNode;
};

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
