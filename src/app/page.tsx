import { AnnouncementBar } from "@/components/storefront/AnnouncementBar";
import { DiscoverySections } from "@/components/storefront/DiscoverySections";
import { FeaturedCategories } from "@/components/storefront/FeaturedCategories";
import { FeaturedProducts } from "@/components/storefront/FeaturedProducts";
import { HeroSection } from "@/components/storefront/HeroSection";
import { MarketplaceFooter } from "@/components/storefront/MarketplaceFooter";
import { MarketplaceHeader } from "@/components/storefront/MarketplaceHeader";
import { NewsletterSection } from "@/components/storefront/NewsletterSection";
import { PhilosophySection } from "@/components/storefront/PhilosophySection";
import { TestimonialsSection } from "@/components/storefront/TestimonialsSection";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <MarketplaceHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturedCategories />
        <FeaturedProducts />
        <DiscoverySections />
        <PhilosophySection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <MarketplaceFooter />
    </>
  );
}
