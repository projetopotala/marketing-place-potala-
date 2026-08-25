import Image from "next/image";
import type { CategoryHighlight } from "@/types/marketplace";

interface CategoryCardProps {
  category: CategoryHighlight;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <a
      id={`categoria-${category.id}`}
      href={category.href}
      aria-label={`Explorar categoria ${category.name}`}
      className="featured-category-card group"
    >
      <Image
        src={category.imageSrc}
        alt=""
        fill
        sizes="(max-width: 639px) 50vw, (max-width: 899px) 33vw, (max-width: 1279px) 25vw, 14vw"
        className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    </a>
  );
}
