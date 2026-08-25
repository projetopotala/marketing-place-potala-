import Image from "next/image";
import Link from "next/link";
import type { AccountFavorite } from "@/types/account";
import { formatPrice } from "@/data/marketplace";
import styles from "./FavoriteProducts.module.css";

interface FavoriteProductsProps {
  favorites: AccountFavorite[];
}

export function FavoriteProducts({ favorites }: FavoriteProductsProps) {
  return (
    <section className={styles.section} aria-labelledby="favorites-title">
      <h2 id="favorites-title">Produtos favoritos</h2>
      <ul className={styles.grid}>
        {favorites.map((item) => (
          <li key={item.id}>
            <Link href={`/produto/${item.slug}`} className={styles.card}>
              <span className={styles.media}>
                <Image
                  src={item.imageSrc}
                  alt={item.name}
                  fill
                  sizes="140px"
                  className={styles.image}
                />
              </span>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.price}>{formatPrice(item.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
