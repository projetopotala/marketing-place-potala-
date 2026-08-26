"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import type { EmblaCarouselType } from "embla-carousel";
import type { Product } from "@/types/marketplace";
import { ProductCard } from "@/components/storefront/ProductCard";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@/components/storefront/icons";

interface FeaturedProductsCarouselProps {
  products: Product[];
}

function subscribeEmbla(
  emblaApi: EmblaCarouselType | undefined,
  onStoreChange: () => void,
) {
  if (!emblaApi) return () => {};
  emblaApi.on("select", onStoreChange);
  emblaApi.on("reInit", onStoreChange);
  return () => {
    emblaApi.off("select", onStoreChange);
    emblaApi.off("reInit", onStoreChange);
  };
}

function useEmblaScrollState(emblaApi: EmblaCarouselType | undefined) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeEmbla(emblaApi, onStoreChange),
    [emblaApi],
  );

  const canPrev = useSyncExternalStore(
    subscribe,
    () => emblaApi?.canScrollPrev() ?? false,
    () => false,
  );
  const canNext = useSyncExternalStore(
    subscribe,
    () => emblaApi?.canScrollNext() ?? false,
    () => false,
  );

  return { canPrev, canNext };
}

export function FeaturedProductsCarousel({
  products,
}: FeaturedProductsCarouselProps) {
  const reduceMotion = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    duration: reduceMotion ? 0 : 22,
  });
  const { canPrev, canNext } = useEmblaScrollState(emblaApi);

  useEffect(() => {
    emblaApi?.reInit({ duration: reduceMotion ? 0 : 22 });
  }, [emblaApi, reduceMotion]);

  return (
    <div className="relative">
      <div
        className="featured-products-track"
        ref={emblaRef}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Produtos em destaque"
      >
        <div>
          {products.map((product) => (
            <div key={product.id} className="featured-products-slide">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="featured-products-nav featured-products-nav--prev"
        aria-label="Produtos anteriores"
        disabled={!canPrev}
        onClick={() => emblaApi?.scrollPrev()}
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        className="featured-products-nav featured-products-nav--next"
        aria-label="Próximos produtos"
        disabled={!canNext}
        onClick={() => emblaApi?.scrollNext()}
      >
        <ArrowRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
