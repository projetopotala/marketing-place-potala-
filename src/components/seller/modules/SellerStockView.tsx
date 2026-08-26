"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import { useAdminData } from "@/features/admin/context/AdminDataContext";
import { selectSellerProducts } from "@/features/seller/selectors";
import { useSellerId } from "@/features/seller/useSellerId";
import styles from "@/components/seller/seller.module.css";

export function SellerStockView() {
  const sellerId = useSellerId();
  const { db, repo, refresh, isHydrated } = useAdminData();
  const { push } = useAdminToast();
  const [draft, setDraft] = useState<Record<string, string>>({});

  const products = useMemo(() => {
    if (!sellerId) return [];
    return selectSellerProducts(db, sellerId);
  }, [db, sellerId]);

  if (!isHydrated || !sellerId) {
    return <p role="status">Carregando estoque…</p>;
  }

  function saveStock(productId: string) {
    const raw = draft[productId];
    const value = Number.parseInt(raw ?? "", 10);
    if (!Number.isFinite(value) || value < 0) {
      push("Estoque inválido.", "error");
      return;
    }
    const next = repo.updateProductStock(productId, value);
    refresh(next);
    push("Estoque atualizado.");
  }

  return (
    <>
      <header>
        <h1 className={styles.pageTitle}>Estoque</h1>
        <p className={styles.pageLead}>
          Ajuste quantidades dos produtos da sua loja.
        </p>
      </header>

      <section className={styles.panel}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Atual</th>
                <th>Novo</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <Link
                      href={`/loja/produtos/${product.id}`}
                      className={styles.rowLink}
                    >
                      {product.title}
                    </Link>
                  </td>
                  <td>{product.stock}</td>
                  <td>
                    <label htmlFor={`stk-${product.id}`}>
                      Novo estoque de {product.title}
                    </label>
                    <input
                      id={`stk-${product.id}`}
                      style={{
                        minHeight: 44,
                        width: 96,
                        borderRadius: 8,
                        border: "1px solid var(--potala-border)",
                        background: "var(--potala-navy-750)",
                        color: "var(--potala-text-primary)",
                        padding: "0 8px",
                      }}
                      value={draft[product.id] ?? String(product.stock)}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          [product.id]: event.target.value,
                        }))
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.ghostBtn}
                      onClick={() => saveStock(product.id)}
                    >
                      Salvar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
