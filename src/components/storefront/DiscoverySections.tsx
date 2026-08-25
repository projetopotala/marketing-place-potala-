import {
  MOST_SEARCHED_PRODUCTS,
  NEW_ARRIVAL_PRODUCTS,
} from "@/data/marketplace";
import { CompactProductCard } from "@/components/storefront/CompactProductCard";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@/components/storefront/icons";
import type { CompactProduct } from "@/types/marketplace";

function DiscoveryGroup({
  id,
  title,
  products,
  viewAllHref,
}: {
  id: string;
  title: string;
  products: CompactProduct[];
  viewAllHref: string;
}) {
  return (
    <div id={id} className="discovery-group min-w-0">
      <div className="discovery-group-header">
        <h3 className="font-serif text-[1.45rem] font-semibold leading-none text-potala-bg md:text-[1.7rem]">
          {title}
        </h3>
        <a
          href={viewAllHref}
          className="inline-flex shrink-0 items-center gap-2 text-[0.8125rem] text-potala-gold transition hover:text-[color:var(--potala-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-potala-gold"
        >
          Ver todos
          <span
            aria-hidden="true"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-potala-gold/40 text-potala-gold"
          >
            <ArrowRightIcon className="h-3 w-3" />
          </span>
        </a>
      </div>

      <div className="discovery-product-grid">
        {products.map((product) => (
          <CompactProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export function DiscoverySections() {
  return (
    <section
      aria-labelledby="descobertas-title"
      className="discovery-section"
    >
      <div className="discovery-container">
        <span
          aria-hidden="true"
          className="discovery-side-control discovery-side-control--left"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
        </span>

        <h2 id="descobertas-title" className="sr-only">
          Mais procurados e novidades
        </h2>

        <div className="discovery-layout">
          <DiscoveryGroup
            id="mais-procurados"
            title="Mais procurados"
            products={MOST_SEARCHED_PRODUCTS}
            viewAllHref="#mais-procurados"
          />

          <div aria-hidden="true" className="discovery-divider" />

          <DiscoveryGroup
            id="novidades"
            title="Novidades"
            products={NEW_ARRIVAL_PRODUCTS}
            viewAllHref="#novidades"
          />
        </div>

        <span
          aria-hidden="true"
          className="discovery-side-control discovery-side-control--right"
        >
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </span>
      </div>
    </section>
  );
}
