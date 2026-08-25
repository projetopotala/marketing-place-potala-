"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { Product } from "@/types/marketplace";
import { ProductCard } from "@/components/storefront/ProductCard";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@/components/storefront/icons";

interface FeaturedProductsCarouselProps {
  products: Product[];
}

export function FeaturedProductsCarousel({
  products,
}: FeaturedProductsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanPrev(track.scrollLeft > 4);
    setCanNext(maxScroll > 4 && track.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    updateControls();
    track.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);

    return () => {
      track.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [products, updateControls]);

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const amount = Math.max(track.clientWidth * 0.92, 240);
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByPage(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByPage(-1);
    }
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="featured-products-track"
        tabIndex={0}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Produtos em destaque"
        onKeyDown={handleKeyDown}
      >
        {products.map((product) => (
          <div key={product.id} className="featured-products-slide">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <button
        type="button"
        className="featured-products-nav featured-products-nav--prev"
        aria-label="Produtos anteriores"
        disabled={!canPrev}
        onClick={() => scrollByPage(-1)}
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        className="featured-products-nav featured-products-nav--next"
        aria-label="Próximos produtos"
        disabled={!canNext}
        onClick={() => scrollByPage(1)}
      >
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
