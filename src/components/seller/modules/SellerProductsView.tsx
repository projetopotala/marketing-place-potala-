"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAdminData } from "@/features/admin/context/AdminDataContext";
import { PRODUCT_STATUS_LABEL } from "@/features/admin/domain/status";
import type { ProductStatus } from "@/features/admin/domain/types";
import { formatMoney } from "@/features/admin/utils/currency";
import { selectSellerProducts } from "@/features/seller/selectors";
import { useSellerId } from "@/features/seller/useSellerId";
import { textIncludes } from "@/lib/normalizeText";
import styles from "@/components/seller/seller.module.css";

const PAGE_SIZE = 8;

export function SellerProductsView() {
  const sellerId = useSellerId();
  const { db, isHydrated } = useAdminData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ProductStatus>("all");
  const [page, setPage] = useState(0);

  const products = useMemo(() => {
    if (!sellerId) return [];
    return selectSellerProducts(db, sellerId)
      .filter((product) => (status === "all" ? true : product.status === status))
      .filter(
        (product) =>
          textIncludes(product.title, query) ||
          textIncludes(product.description, query),
      );
  }, [db, query, sellerId, status]);

  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const pageItems = products.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (!isHydrated || !sellerId) {
    return <p role="status">Carregando produtos…</p>;
  }

  return (
    <>
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 className={styles.pageTitle}>Produtos</h1>
          <p className={styles.pageLead}>
            Gerencie rascunhos e envie para revisão. A aprovação é exclusiva do
            admin.
          </p>
        </div>
        <Link href="/loja/produtos/novo" className={styles.primaryBtn}>
          Novo produto
        </Link>
      </header>

      <section className={styles.panel}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 180px",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div className={styles.field}>
            <label htmlFor="seller-product-search">Buscar</label>
            <input
              id="seller-product-search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Nome ou descrição"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="seller-product-status">Status</label>
            <select
              id="seller-product-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as "all" | ProductStatus);
                setPage(0);
              }}
            >
              <option value="all">Todos</option>
              {(Object.keys(PRODUCT_STATUS_LABEL) as ProductStatus[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {PRODUCT_STATUS_LABEL[key]}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        {pageItems.length === 0 ? (
          <p>Nenhum produto encontrado.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Status</th>
                  <th>Estoque</th>
                  <th>Preço</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <Link
                        href={`/loja/produtos/${product.id}`}
                        className={styles.rowLink}
                      >
                        {product.title}
                      </Link>
                    </td>
                    <td>
                      <span className={styles.badge}>
                        {PRODUCT_STATUS_LABEL[product.status]}
                      </span>
                    </td>
                    <td>{product.stock}</td>
                    <td>{formatMoney(product.priceCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 16,
            alignItems: "center",
          }}
        >
          <button
            type="button"
            className={styles.ghostBtn}
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            Anterior
          </button>
          <span>
            Página {page + 1} de {pageCount}
          </span>
          <button
            type="button"
            className={styles.ghostBtn}
            disabled={page + 1 >= pageCount}
            onClick={() =>
              setPage((current) => Math.min(pageCount - 1, current + 1))
            }
          >
            Próxima
          </button>
        </div>
      </section>
    </>
  );
}
