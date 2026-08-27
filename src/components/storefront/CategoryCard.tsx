import Image from "next/image";
import Link from "next/link";
import type { CategoryHighlight } from "@/types/marketplace";

interface CategoryCardProps {
  category: CategoryHighlight;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const count = category.productCount;
  const countLabel =
    typeof count === "number"
      ? `${count} ${count === 1 ? "produto" : "produtos"}`
      : null;

  return (
    <Link
      id={`categoria-${category.id}`}
      href={category.href}
      aria-label={`Explorar categoria ${category.name}${countLabel ? `, ${countLabel}` : ""}`}
      className="featured-category-card group scroll-mt-28"
    >
      <div className="featured-category-media" aria-hidden="true">
        <Image
          src={category.imageSrc}
          alt=""
          fill
          sizes="(max-width: 639px) 50vw, (max-width: 899px) 33vw, (max-width: 1279px) 25vw, 14vw"
          className="object-cover object-[center_28%] transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="featured-category-caption">
        <span className="featured-category-title">{category.name}</span>
        {countLabel ? (
          <span className="featured-category-count">{countLabel}</span>
        ) : null}
        <span className="featured-category-cta" aria-hidden="true">
          Ver categoria →
        </span>
      </div>
    </Link>
  );
}
