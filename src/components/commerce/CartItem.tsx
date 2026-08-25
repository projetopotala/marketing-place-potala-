"use client";

import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/types/cart";
import { calcLineTotal } from "@/data/cart";
import { formatPrice } from "@/data/marketplace";
import { useCart } from "@/context/CartContext";
import styles from "./CartItem.module.css";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart();
  const lineTotal = calcLineTotal(item.unitPrice, item.quantity);

  return (
    <article className={styles.item}>
      <Link href={`/produto/${item.slug}`} className={styles.media}>
        <Image
          src={item.imageSrc}
          alt={item.name}
          fill
          className={styles.image}
          sizes="120px"
        />
      </Link>

      <div className={styles.body}>
        <p className={styles.category}>{item.category}</p>
        <h2 className={styles.name}>
          <Link href={`/produto/${item.slug}`}>{item.name}</Link>
        </h2>
        <p className={styles.unit}>{formatPrice(item.unitPrice)} / un.</p>

        <div className={styles.controls}>
          <div className={styles.quantity} aria-label={`Quantidade de ${item.name}`}>
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label={`Diminuir quantidade de ${item.name}`}
            >
              −
            </button>
            <span className={styles.qtyValue} aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              aria-label={`Aumentar quantidade de ${item.name}`}
            >
              +
            </button>
          </div>

          <p className={styles.lineTotal}>{formatPrice(lineTotal)}</p>

          <button
            type="button"
            className={styles.remove}
            onClick={() => removeItem(item.productId)}
          >
            Remover
          </button>
        </div>
      </div>
    </article>
  );
}
