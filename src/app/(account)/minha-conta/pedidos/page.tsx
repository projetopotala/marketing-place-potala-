"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AccountChrome } from "@/components/account/AccountChrome";
import { useAccountData } from "@/features/account/AccountDataContext";
import {
  CUSTOMER_ORDER_STATUS_LABEL,
  type CustomerOrderStatus,
} from "@/features/account/domain";
import { formatPrice } from "@/data/marketplace";
import { textIncludes } from "@/lib/normalizeText";

export default function AccountOrdersPage() {
  const { db, isHydrated } = useAccountData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | CustomerOrderStatus>("all");

  const orders = useMemo(() => {
    const list = db?.orders ?? [];
    return list
      .filter((order) => (status === "all" ? true : order.status === status))
      .filter((order) => textIncludes(order.code, query));
  }, [db?.orders, query, status]);

  return (
    <AccountChrome
      title="Meus pedidos"
      lead="Histórico demonstrativo persistido neste navegador."
      breadcrumbCurrent="Pedidos"
    >
      {!isHydrated || !db ? (
        <p role="status">Carregando pedidos…</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "minmax(0,1fr) 200px",
              marginBottom: 16,
            }}
          >
            <div>
              <label htmlFor="ao-search">Buscar por código</label>
              <input
                id="ao-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                style={{ width: "100%", minHeight: 44 }}
              />
            </div>
            <div>
              <label htmlFor="ao-status">Status</label>
              <select
                id="ao-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "all" | CustomerOrderStatus)
                }
                style={{ width: "100%", minHeight: 44 }}
              >
                <option value="all">Todos</option>
                {(
                  Object.keys(CUSTOMER_ORDER_STATUS_LABEL) as CustomerOrderStatus[]
                ).map((key) => (
                  <option key={key} value={key}>
                    {CUSTOMER_ORDER_STATUS_LABEL[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {orders.length === 0 ? (
            <p>Nenhum pedido encontrado.</p>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th align="left">Código</th>
                      <th align="left">Status</th>
                      <th align="left">Itens</th>
                      <th align="left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Link href={`/minha-conta/pedidos/${order.id}`}>
                            {order.code}
                          </Link>
                        </td>
                        <td>{CUSTOMER_ORDER_STATUS_LABEL[order.status]}</td>
                        <td>{order.items.length}</td>
                        <td>{formatPrice(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="md:hidden" style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
                {orders.map((order) => (
                  <li
                    key={order.id}
                    style={{
                      border: "1px solid var(--potala-border)",
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <Link href={`/minha-conta/pedidos/${order.id}`}>
                      {order.code}
                    </Link>
                    <p>{CUSTOMER_ORDER_STATUS_LABEL[order.status]}</p>
                    <p>{formatPrice(order.total)}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </AccountChrome>
  );
}
