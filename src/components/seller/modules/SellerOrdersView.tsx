"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAdminData } from "@/features/admin/context/AdminDataContext";
import { ORDER_STATUS_LABEL } from "@/features/admin/domain/status";
import type { OrderStatus } from "@/features/admin/domain/types";
import { formatMoney } from "@/features/admin/utils/currency";
import { selectSellerOrders } from "@/features/seller/selectors";
import { useSellerId } from "@/features/seller/useSellerId";
import { textIncludes } from "@/lib/normalizeText";
import styles from "@/components/seller/seller.module.css";

export function SellerOrdersView() {
  const sellerId = useSellerId();
  const { db, isHydrated } = useAdminData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");

  const orders = useMemo(() => {
    if (!sellerId) return [];
    return selectSellerOrders(db, sellerId)
      .filter((order) => (status === "all" ? true : order.status === status))
      .filter(
        (order) =>
          textIncludes(order.code, query) ||
          textIncludes(order.city, query) ||
          textIncludes(order.addressLabel, query),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [db, query, sellerId, status]);

  if (!isHydrated || !sellerId) {
    return <p role="status">Carregando pedidos…</p>;
  }

  return (
    <>
      <header>
        <h1 className={styles.pageTitle}>Pedidos</h1>
        <p className={styles.pageLead}>
          Somente pedidos vinculados ao seu sellerId.
        </p>
      </header>

      <section className={styles.panel}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 200px",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div className={styles.field}>
            <label htmlFor="so-search">Buscar</label>
            <input
              id="so-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Código ou cidade"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="so-status">Status</label>
            <select
              id="so-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "all" | OrderStatus)
              }
            >
              <option value="all">Todos</option>
              {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((key) => (
                <option key={key} value={key}>
                  {ORDER_STATUS_LABEL[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {orders.length === 0 ? (
          <p>Nenhum pedido encontrado.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Cidade</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link
                        href={`/loja/pedidos/${order.id}`}
                        className={styles.rowLink}
                      >
                        {order.code}
                      </Link>
                    </td>
                    <td>
                      <span className={styles.badge}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                    </td>
                    <td>{formatMoney(order.totalCents)}</td>
                    <td>
                      {order.city}/{order.state}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
