"use client";

import Link from "next/link";
import { formatPrice } from "@/data/marketplace";
import { useCart } from "@/context/CartContext";
import styles from "./CartSummary.module.css";

export function CartSummary() {
  const { subtotal, totalItems } = useCart();

  return (
    <aside className={styles.summary} aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title" className={styles.title}>
        Resumo do pedido
      </h2>

      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt>Itens ({totalItems})</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className={styles.row}>
          <dt>Entrega</dt>
          <dd>Calculada no checkout</dd>
        </div>
        <div className={`${styles.row} ${styles.total}`}>
          <dt>Total</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
      </dl>

      <Link href="/checkout" className={styles.checkout}>
        Continuar para o checkout
      </Link>
      <Link href="/#produtos" className={styles.continue}>
        Continuar comprando
      </Link>
    </aside>
  );
}
