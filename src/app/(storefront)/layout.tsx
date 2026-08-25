import { AnnouncementBar } from "@/components/storefront/AnnouncementBar";
import { MarketplaceFooter } from "@/components/storefront/MarketplaceFooter";
import { MarketplaceHeader } from "@/components/storefront/MarketplaceHeader";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar />
      <MarketplaceHeader />
      <main className="flex-1">{children}</main>
      <MarketplaceFooter />
    </>
  );
}
