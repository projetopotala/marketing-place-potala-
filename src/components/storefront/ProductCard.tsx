import Image from "next/image";
import type { Product } from "@/types/marketplace";
import { formatPrice } from "@/data/marketplace";
import {
  ArrowRightIcon,
  CartIcon,
  StarIcon,
} from "@/components/storefront/icons";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  tone?: "dark" | "light";
}

export function ProductCard({
  product,
  compact = false,
  tone = "dark",
}: ProductCardProps) {
  const isDetails = product.action === "details";
  const actionLabel = isDetails ? "Ver detalhes" : "Adicionar ao carrinho";
  const isLight = tone === "light";

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden border transition ${
        compact
          ? "w-[11.5rem] shrink-0 sm:w-52"
          : "featured-product-card w-full min-w-0"
      } ${
        isLight
          ? "rounded-[0.55rem] border-[rgb(4_17_38_/_12%)] bg-white/75 shadow-[0_10px_24px_rgb(4_17_38_/_8%)]"
          : compact
            ? "rounded-[0.55rem] border-potala-border bg-potala-panel"
            : ""
      }`}
    >
      <div
        className={`relative overflow-hidden ${
          compact ? "aspect-square" : "aspect-[4/3]"
        }`}
      >
        <Image
          src={product.imageSrc}
          alt={product.name}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          sizes={
            compact
              ? "(max-width: 639px) 70vw, 208px"
              : "(max-width: 639px) 82vw, (max-width: 899px) 46vw, (max-width: 1279px) 31vw, 18vw"
          }
        />
        {product.badge ? (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-[0.3rem] bg-potala-gold px-2 py-[0.2rem] text-[0.7rem] font-semibold leading-none text-potala-bg">
            {product.badge}
          </span>
        ) : null}
      </div>

      <div
        className={`flex flex-1 flex-col ${
          compact ? "gap-1.5 p-3" : "gap-2 px-3.5 pb-3.5 pt-3"
        }`}
      >
        <p
          className={`text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
            isLight ? "text-[color:var(--potala-bg)]/60" : "text-potala-gold"
          }`}
        >
          {product.category}
        </p>

        <h3
          className={`font-medium leading-snug ${
            compact
              ? "min-h-[2.5rem] text-sm"
              : "min-h-[2.6rem] text-[0.95rem] md:text-[1rem]"
          } ${isLight ? "text-potala-bg" : "text-potala-cream"}`}
        >
          {product.name}
        </h3>

        <div
          className="flex items-center gap-0.5 text-potala-gold"
          aria-label={`Avaliação ${product.rating} de 5 com ${product.reviewCount} avaliações`}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <StarIcon
              key={`${product.id}-star-${index}`}
              className="h-3 w-3"
              filled={index < Math.round(product.rating)}
            />
          ))}
          <span
            className={`ml-1 text-[0.7rem] ${
              isLight ? "text-[color:var(--potala-bg)]/55" : "text-potala-muted"
            }`}
          >
            ({product.reviewCount})
          </span>
        </div>

        <p
          className={`mt-auto font-bold ${
            compact ? "text-base" : "text-[1.1rem] md:text-[1.15rem]"
          } ${isLight ? "text-potala-bg" : "text-potala-cream"}`}
        >
          {formatPrice(product.price)}
        </p>

        <button
          type="button"
          className={`mt-1 inline-flex w-full items-center gap-2 rounded-[0.375rem] border border-potala-gold/55 bg-transparent px-3 text-[0.8rem] font-semibold text-potala-gold transition hover:border-potala-gold-light hover:bg-potala-gold/10 hover:text-potala-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-potala-gold-light ${
            compact ? "min-h-9" : "min-h-[2.5rem]"
          } ${isDetails ? "justify-center" : "justify-between"} ${
            isLight
              ? "border-[color:var(--potala-bg)]/25 text-[color:var(--potala-bg)] hover:bg-[color:var(--potala-bg)]/5"
              : ""
          }`}
          aria-label={`${actionLabel}: ${product.name}`}
        >
          {!isDetails ? <CartIcon className="h-4 w-4 shrink-0" /> : null}
          <span className={isDetails ? "" : "flex-1 text-left"}>
            {actionLabel}
          </span>
          <ArrowRightIcon className="h-4 w-4 shrink-0" />
        </button>
      </div>
    </article>
  );
}
