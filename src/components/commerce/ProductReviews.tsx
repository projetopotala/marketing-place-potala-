import type { Product } from "@/types/marketplace";
import { StarIcon } from "@/components/storefront/icons";
import styles from "./ProductReviews.module.css";

interface ProductReviewsProps {
  product: Product;
}

export function ProductReviews({ product }: ProductReviewsProps) {
  const reviews = product.reviews ?? [];

  return (
    <section className={styles.section} aria-labelledby="product-reviews-title">
      <h2 id="product-reviews-title" className={styles.title}>
        Avaliações
      </h2>

      {reviews.length === 0 ? (
        <p className={styles.empty}>
          Este produto ainda não possui avaliações detalhadas.
        </p>
      ) : (
        <ul className={styles.list}>
          {reviews.map((review) => (
            <li key={review.id} className={styles.item}>
              <div className={styles.itemHead}>
                <strong>{review.author}</strong>
                <span className={styles.date}>{review.date}</span>
              </div>
              <div
                className={styles.stars}
                aria-label={`Avaliação ${review.rating} de 5`}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon
                    key={`${review.id}-star-${index}`}
                    className="h-3.5 w-3.5"
                    filled={index < review.rating}
                  />
                ))}
              </div>
              <p className={styles.comment}>{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
