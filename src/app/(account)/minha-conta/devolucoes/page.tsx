"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AccountChrome } from "@/components/account/AccountChrome";
import { useAccountData } from "@/features/account/AccountDataContext";

export default function AccountReturnsPage() {
  const { db, isHydrated, createReturn } = useAccountData();
  const delivered = useMemo(
    () => db?.orders.filter((order) => order.status === "delivered") ?? [],
    [db?.orders],
  );
  const [orderId, setOrderId] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const selectedOrder = delivered.find((order) => order.id === orderId);

  function toggleItem(productId: string) {
    setItems((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = createReturn({
      orderId,
      itemProductIds: items,
      reason,
      description,
    });
    if (!result.ok) {
      setStatus(result.error);
      return;
    }
    setStatus("Solicitação registrada (demonstrativo).");
    setOrderId("");
    setItems([]);
    setReason("");
    setDescription("");
  }

  return (
    <AccountChrome
      title="Devoluções"
      lead="Somente pedidos entregues são elegíveis neste demo."
      breadcrumbCurrent="Devoluções"
    >
      {!isHydrated || !db ? (
        <p role="status">Carregando…</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 560 }}>
            <div>
              <label htmlFor="ret-order">Pedido entregue</label>
              <select
                id="ret-order"
                value={orderId}
                onChange={(event) => {
                  setOrderId(event.target.value);
                  setItems([]);
                }}
                style={{ width: "100%", minHeight: 44 }}
              >
                <option value="">Selecione</option>
                {delivered.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.code}
                  </option>
                ))}
              </select>
            </div>

            {selectedOrder ? (
              <fieldset>
                <legend>Itens</legend>
                {selectedOrder.items.map((item) => (
                  <label
                    key={item.productId}
                    style={{ display: "flex", gap: 8, minHeight: 44, alignItems: "center" }}
                  >
                    <input
                      type="checkbox"
                      checked={items.includes(item.productId)}
                      onChange={() => toggleItem(item.productId)}
                    />
                    {item.name}
                  </label>
                ))}
              </fieldset>
            ) : null}

            <div>
              <label htmlFor="ret-reason">Motivo</label>
              <input
                id="ret-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                style={{ width: "100%", minHeight: 44 }}
              />
            </div>
            <div>
              <label htmlFor="ret-desc">Descrição</label>
              <textarea
                id="ret-desc"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                style={{ width: "100%", minHeight: 110 }}
              />
            </div>
            <button type="submit" style={{ minHeight: 44 }}>
              Enviar solicitação
            </button>
            {status ? (
              <p role="status" aria-live="polite">
                {status}
              </p>
            ) : null}
          </form>

          <section style={{ marginTop: 24 }}>
            <h2>Solicitações</h2>
            {db.returns.length === 0 ? (
              <p>Nenhuma devolução registrada.</p>
            ) : (
              <ul>
                {db.returns.map((item) => (
                  <li key={item.id}>
                    {item.orderCode} · {item.status} · {item.reason}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </AccountChrome>
  );
}
