import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/marketplace";
import { formatPrice } from "@/data/marketplace";
import { StarIcon } from "@/components/storefront/icons";
import styles from "./RelatedProducts.module.css";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-labelledby="related-products-title">
      <h2 id="related-products-title" className={styles.title}>
        Produtos relacionados
      </h2>

      <ul className={styles.grid}>
        {products.map((product) => (
          <li key={product.id} className={styles.card}>
            <Link href={`/produto/${product.slug}`} className={styles.link}>
              <span className={styles.media}>
                <Image
                  src={product.imageSrc}
                  alt={product.name}
                  fill
                  className={styles.image}
                  sizes="(max-width: 767px) 70vw, (max-width: 1199px) 30vw, 18vw"
                />
              </span>
              <span className={styles.category}>{product.category}</span>
              <span className={styles.name}>{product.name}</span>
              <span
                className={styles.rating}
                aria-label={`Avaliação ${product.rating} de 5`}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon
                    key={`${product.id}-related-star-${index}`}
                    className="h-3 w-3"
                    filled={index < Math.round(product.rating)}
                  />
                ))}
              </span>
              <span className={styles.price}>{formatPrice(product.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
