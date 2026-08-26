"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import { useAdminData } from "@/features/admin/context/AdminDataContext";
import {
  ORDER_STATUS_LABEL,
  ORDER_TRANSITIONS,
  SHIPMENT_STATUS_LABEL,
  canTransitionOrder,
} from "@/features/admin/domain/status";
import type { OrderStatus } from "@/features/admin/domain/types";
import { formatMoney } from "@/features/admin/utils/currency";
import { sellerOwnsOrder } from "@/features/seller/selectors";
import { useSellerId } from "@/features/seller/useSellerId";
import styles from "@/components/seller/seller.module.css";

export function SellerOrderDetailView() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const sellerId = useSellerId();
  const { db, repo, refresh, isHydrated } = useAdminData();
  const { push } = useAdminToast();
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("Correios");

  const order = useMemo(
    () => db.orders.find((item) => item.id === orderId),
    [db.orders, orderId],
  );
  const shipment = useMemo(
    () => db.shipments.find((item) => item.orderId === orderId),
    [db.shipments, orderId],
  );
  const transaction = useMemo(
    () => db.transactions.find((item) => item.orderId === orderId),
    [db.transactions, orderId],
  );

  if (!isHydrated || !sellerId) {
    return <p role="status">Carregando pedido…</p>;
  }

  if (!order || !sellerOwnsOrder(db, sellerId, orderId)) {
    return (
      <section className={styles.denied} role="alert">
        <h1 className={styles.pageTitle}>Pedido indisponível</h1>
        <p>
          Este pedido não pertence à sua loja. O isolamento por sellerId
          impede acesso cruzado mesmo via URL.
        </p>
      </section>
    );
  }

  const currentOrder = order;
  const nextStatuses = ORDER_TRANSITIONS[currentOrder.status];

  function changeStatus(status: OrderStatus) {
    if (!canTransitionOrder(currentOrder.status, status)) {
      push("Transição de status inválida.", "error");
      return;
    }
    try {
      const next = repo.updateOrderStatus(currentOrder.id, status);
      refresh(next);
      push(`Status atualizado para ${ORDER_STATUS_LABEL[status]}.`);
    } catch (error) {
      push(
        error instanceof Error ? error.message : "Falha ao atualizar status.",
        "error",
      );
    }
  }

  function saveTracking(event: FormEvent) {
    event.preventDefault();
    const code = tracking.trim();
    if (!code) {
      push("Informe um código de rastreio.", "error");
      return;
    }

    if (shipment) {
      const next = repo.updateShipmentStatus(shipment.id, "posted", {
        trackingCode: code,
        carrier,
      });
      refresh(next);
      push("Rastreio atualizado.");
      return;
    }

    const next = repo.createShipment({
      orderId: currentOrder.id,
      sellerId: currentOrder.sellerId,
      customerId: currentOrder.customerId,
      carrier,
      trackingCode: code,
      eta: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
      status: "posted",
      destination: `${currentOrder.city}/${currentOrder.state}`,
      delayed: false,
    });
    refresh(next);
    push("Rastreio demonstrativo inserido.");
  }

  return (
    <>
      <header>
        <h1 className={styles.pageTitle}>Pedido {currentOrder.code}</h1>
        <p className={styles.pageLead}>
          {ORDER_STATUS_LABEL[currentOrder.status]} ·{" "}
          {formatMoney(currentOrder.totalCents)}
        </p>
      </header>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Itens</h2>
        <ul>
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.title}`}>
              {item.quantity}× {item.title} —{" "}
              {formatMoney(item.unitPriceCents * item.quantity)}
            </li>
          ))}
        </ul>
        <p>
          Subtotal {formatMoney(order.subtotalCents)} · Frete{" "}
          {formatMoney(order.shippingCents)} · Desconto{" "}
          {formatMoney(order.discountCents)} · Total{" "}
          {formatMoney(order.totalCents)}
        </p>
      </section>

      {transaction ? (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Financeiro do pedido</h2>
          <p>
            Bruto {formatMoney(transaction.grossCents)} · Taxas{" "}
            {formatMoney(transaction.feeCents)} · Comissão{" "}
            {formatMoney(transaction.commissionCents)} · Líquido{" "}
            {formatMoney(transaction.netCents)}
          </p>
        </section>
      ) : null}

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Timeline</h2>
        <ol>
          {order.timeline.map((event) => (
            <li key={event.id}>
              <strong>{event.label}</strong>
              <span> — {new Date(event.at).toLocaleString("pt-BR")}</span>
              {event.detail ? <div>{event.detail}</div> : null}
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Avançar status</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {nextStatuses.length === 0 ? (
            <p>Sem transições disponíveis.</p>
          ) : (
            nextStatuses.map((status) => (
              <button
                key={status}
                type="button"
                className={styles.ghostBtn}
                onClick={() => changeStatus(status)}
              >
                {ORDER_STATUS_LABEL[status]}
              </button>
            ))
          )}
        </div>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Entrega / rastreio</h2>
        {shipment ? (
          <p>
            {SHIPMENT_STATUS_LABEL[shipment.status]} · {shipment.carrier} ·{" "}
            {shipment.trackingCode || "sem código"}
          </p>
        ) : (
          <p>Nenhuma entrega registrada ainda.</p>
        )}
        <form className={styles.formGrid} onSubmit={saveTracking}>
          <div className={styles.field}>
            <label htmlFor="track-carrier">Transportadora</label>
            <input
              id="track-carrier"
              value={carrier}
              onChange={(event) => setCarrier(event.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="track-code">Código de rastreio</label>
            <input
              id="track-code"
              value={tracking}
              onChange={(event) => setTracking(event.target.value)}
            />
          </div>
          <button type="submit" className={styles.primaryBtn}>
            Salvar rastreio demonstrativo
          </button>
        </form>
      </section>
    </>
  );
}
