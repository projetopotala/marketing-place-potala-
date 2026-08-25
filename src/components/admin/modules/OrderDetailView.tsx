"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import {
  ORDER_STATUS_LABEL,
  ORDER_TRANSITIONS,
  PAYMENT_STATUS_LABEL,
  canTransitionOrder,
} from "@/features/admin/domain/status";
import type { OrderStatus } from "@/features/admin/domain/types";
import { formatMoney } from "@/features/admin/utils/currency";
import { formatDateTime } from "@/features/admin/utils/dates";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  AdminEmptyState,
  AdminStatusBadge,
} from "@/components/admin/shared/AdminStatusBadge";
import { sharedStyles } from "@/components/admin/shared/AdminDataTable";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import moduleStyles from "./modules.module.css";

export function OrderDetailView({ id }: { id: string }) {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const order = useMemo(() => db.orders.find((o) => o.id === id), [db.orders, id]);
  const customer = useMemo(
    () => db.customers.find((c) => c.id === order?.customerId),
    [db.customers, order?.customerId],
  );
  const seller = useMemo(
    () => db.sellers.find((s) => s.id === order?.sellerId),
    [db.sellers, order?.sellerId],
  );
  const shipment = useMemo(
    () => db.shipments.find((s) => s.orderId === id),
    [db.shipments, id],
  );
  const txn = useMemo(
    () => db.transactions.find((t) => t.orderId === id),
    [db.transactions, id],
  );

  if (!isHydrated) {
    return <div className={sharedStyles.skeleton} aria-busy="true" />;
  }

  if (!order) {
    return (
      <AdminEmptyState
        title="Pedido não encontrado"
        description="O ID informado não existe no banco demonstrativo."
      />
    );
  }

  const current = order;

  function transition(next: OrderStatus) {
    if (!canTransitionOrder(current.status, next)) {
      toast.push("Transição não permitida", "error");
      return;
    }
    try {
      refresh(repo.updateOrderStatus(current.id, next));
      toast.push(`Status: ${ORDER_STATUS_LABEL[next]}`);
    } catch {
      toast.push("Falha na transição", "error");
    }
  }

  const allowed = ORDER_TRANSITIONS[current.status];

  return (
    <div className={sharedStyles.stack}>
      <AdminPageHeader
        title={order.code}
        description={`${customer?.name ?? order.customerId} · ${order.city}/${order.state}`}
        actions={
          <div className={sharedStyles.rowActions}>
            <Link href="/admin/pedidos" className={sharedStyles.btnGhost}>
              Voltar
            </Link>
            {order.status === "pending_payment" ? (
              <button
                type="button"
                className={sharedStyles.btn}
                onClick={() => transition("paid")}
              >
                Marcar pago
              </button>
            ) : null}
            {allowed.map((next) =>
              next === "paid" && order.status === "pending_payment" ? null : (
                <button
                  key={next}
                  type="button"
                  className={
                    next === "cancelled" || next === "refunded"
                      ? sharedStyles.btnDanger
                      : sharedStyles.btnSecondary
                  }
                  onClick={() => transition(next)}
                >
                  {ORDER_STATUS_LABEL[next]}
                </button>
              ),
            )}
          </div>
        }
      />

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Resumo</h2>
        <div className={moduleStyles.kvGrid}>
          <div>
            <p className={moduleStyles.kvLabel}>Status</p>
            <AdminStatusBadge label={ORDER_STATUS_LABEL[order.status]} tone="info" />
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Pagamento</p>
            <p className={moduleStyles.kvValue}>
              {PAYMENT_STATUS_LABEL[order.paymentStatus]} · {order.paymentMethod}
            </p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Vendedor</p>
            <p className={moduleStyles.kvValue}>
              {seller ? (
                <Link href={`/admin/vendedores/${seller.id}`} className={sharedStyles.linkBtn}>
                  {seller.name}
                </Link>
              ) : (
                order.sellerId
              )}
            </p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Endereço</p>
            <p className={moduleStyles.kvValue}>{order.addressLabel}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Subtotal</p>
            <p className={moduleStyles.kvValue}>{formatMoney(order.subtotalCents)}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Frete</p>
            <p className={moduleStyles.kvValue}>{formatMoney(order.shippingCents)}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Desconto</p>
            <p className={moduleStyles.kvValue}>{formatMoney(order.discountCents)}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Total</p>
            <p className={moduleStyles.kvValue}>{formatMoney(order.totalCents)}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Notas</p>
            <p className={moduleStyles.kvValue}>{order.notes || "—"}</p>
          </div>
        </div>
      </div>

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Itens</h2>
        <ul className={moduleStyles.timeline}>
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.title}`} className={moduleStyles.timelineItem}>
              <p className={moduleStyles.timelineLabel}>
                <Link
                  href={`/admin/produtos/${item.productId}`}
                  className={sharedStyles.linkBtn}
                >
                  {item.title}
                </Link>
              </p>
              <p className={moduleStyles.timelineDetail}>
                {item.quantity} × {formatMoney(item.unitPriceCents)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className={sharedStyles.grid2}>
        <div className={sharedStyles.panel}>
          <h2 className={sharedStyles.panelTitle}>Entrega</h2>
          {shipment ? (
            <p className={moduleStyles.kvValue}>
              <Link href="/admin/entregas" className={sharedStyles.linkBtn}>
                {shipment.carrier} · {shipment.trackingCode || "sem rastreio"}
              </Link>
            </p>
          ) : (
            <p className={moduleStyles.muted}>Sem remessa vinculada.</p>
          )}
        </div>
        <div className={sharedStyles.panel}>
          <h2 className={sharedStyles.panelTitle}>Transação</h2>
          {txn ? (
            <Link
              href={`/admin/financeiro/transacoes/${txn.id}`}
              className={sharedStyles.linkBtn}
            >
              {txn.id} · {formatMoney(txn.netCents)}
            </Link>
          ) : (
            <p className={moduleStyles.muted}>Sem transação.</p>
          )}
        </div>
      </div>

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Linha do tempo</h2>
        <ul className={moduleStyles.timeline}>
          {order.timeline.map((event) => (
            <li key={event.id} className={moduleStyles.timelineItem}>
              <p className={moduleStyles.timelineAt}>{formatDateTime(event.at)}</p>
              <p className={moduleStyles.timelineLabel}>{event.label}</p>
              {event.detail ? (
                <p className={moduleStyles.timelineDetail}>{event.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
