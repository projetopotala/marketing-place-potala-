import { FEATURED_CATEGORIES } from "@/data/marketplace";
import { CategoryCard } from "@/components/storefront/CategoryCard";

export function FeaturedCategories() {
  return (
    <section
      id="categorias"
      aria-labelledby="featured-categories-heading"
      className="border-b-4 border-potala-bg bg-potala-cream py-5 md:py-6"
    >
      <div className="featured-categories-container">
        <div className="mb-5 flex items-center justify-center gap-3 md:mb-[1.35rem]">
          <span
            aria-hidden="true"
            className="category-heading-ornament"
          />
          <h2
            id="featured-categories-heading"
            className="font-serif text-[1.375rem] font-semibold leading-none text-potala-bg md:text-[1.55rem]"
          >
            Categorias em destaque
          </h2>
          <span
            aria-hidden="true"
            className="category-heading-ornament category-heading-ornament--reverse"
          />
        </div>

        <div className="featured-categories-grid">
          {FEATURED_CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
