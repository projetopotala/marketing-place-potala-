import { DiscoverySections } from "@/components/storefront/DiscoverySections";
import { FeaturedCategories } from "@/components/storefront/FeaturedCategories";
import { FeaturedProducts } from "@/components/storefront/FeaturedProducts";
import { HeroSection } from "@/components/storefront/HeroSection";
import { NewsletterSection } from "@/components/storefront/NewsletterSection";
import { PhilosophySection } from "@/components/storefront/PhilosophySection";
import { TestimonialsSection } from "@/components/storefront/TestimonialsSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <DiscoverySections />
      <PhilosophySection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
