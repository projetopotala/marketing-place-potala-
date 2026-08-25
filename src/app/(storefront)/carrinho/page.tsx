"use client";

import Link from "next/link";
import { CartItemRow } from "@/components/commerce/CartItem";
import { CartSummary } from "@/components/commerce/CartSummary";
import { EmptyCart } from "@/components/commerce/EmptyCart";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";

export default function CartPage() {
  const { items, isReady } = useCart();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Início</Link>
            </li>
            <li aria-current="page">Carrinho</li>
          </ol>
        </nav>

        <h1 className={styles.title}>Meu carrinho</h1>

        {!isReady ? (
          <p className={styles.loading} role="status">
            Carregando carrinho…
          </p>
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className={styles.layout}>
            <div className={styles.items}>
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </div>
            <CartSummary />
          </div>
        )}
      </div>
    </div>
  );
}
