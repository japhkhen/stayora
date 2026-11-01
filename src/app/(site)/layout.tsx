import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProfile } from "@/lib/hotel";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile().catch(() => null);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader signedIn={Boolean(profile)} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <SiteFooter />
    </div>
  );
}
