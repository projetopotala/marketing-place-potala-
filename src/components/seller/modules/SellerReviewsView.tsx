"use client";

import { useMemo } from "react";
import { useAdminData } from "@/features/admin/context/AdminDataContext";
import { selectSellerProducts } from "@/features/seller/selectors";
import { useSellerId } from "@/features/seller/useSellerId";
import styles from "@/components/seller/seller.module.css";

/**
 * Avaliações do vendedor — demonstrativo derivado do seed/admin.
 * Sem endpoint dedicado, exibimos produtos ativos como base de reputação.
 */
export function SellerReviewsView() {
  const sellerId = useSellerId();
  const { db, isHydrated } = useAdminData();

  const seller = useMemo(
    () => db.sellers.find((item) => item.id === sellerId),
    [db.sellers, sellerId],
  );

  const products = useMemo(() => {
    if (!sellerId) return [];
    return selectSellerProducts(db, sellerId).filter(
      (product) => product.status === "active",
    );
  }, [db, sellerId]);

  if (!isHydrated || !sellerId) {
    return <p role="status">Carregando avaliações…</p>;
  }

  return (
    <>
      <header>
        <h1 className={styles.pageTitle}>Avaliações</h1>
        <p className={styles.pageLead}>
          Nota média da loja e produtos ativos. Moderação detalhada exige
          backend.
        </p>
      </header>

      <section className={styles.metrics}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Nota da loja</p>
          <p className={styles.metricValue}>
            {(seller?.rating ?? 0).toFixed(1)}
          </p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Produtos avaliáveis</p>
          <p className={styles.metricValue}>{products.length}</p>
        </article>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Produtos ativos</h2>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.title} — aguardando avaliações de clientes autenticados.
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
