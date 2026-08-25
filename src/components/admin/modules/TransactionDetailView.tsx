"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { PAYMENT_STATUS_LABEL } from "@/features/admin/domain/status";
import { formatMoney } from "@/features/admin/utils/currency";
import { formatDateTime } from "@/features/admin/utils/dates";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  AdminEmptyState,
  AdminStatusBadge,
} from "@/components/admin/shared/AdminStatusBadge";
import { sharedStyles } from "@/components/admin/shared/AdminDataTable";
import { AdminConfirmDialog } from "@/components/admin/shared/AdminModal";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import moduleStyles from "./modules.module.css";

export function TransactionDetailView({ id }: { id: string }) {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const txn = useMemo(
    () => db.transactions.find((t) => t.id === id),
    [db.transactions, id],
  );
  const [confirmRefund, setConfirmRefund] = useState(false);

  const seller = useMemo(
    () => db.sellers.find((s) => s.id === txn?.sellerId),
    [db.sellers, txn?.sellerId],
  );
  const order = useMemo(
    () => db.orders.find((o) => o.id === txn?.orderId),
    [db.orders, txn?.orderId],
  );

  if (!isHydrated) {
    return <div className={sharedStyles.skeleton} aria-busy="true" />;
  }

  if (!txn) {
    return (
      <AdminEmptyState
        title="Transação não encontrada"
        description="O identificador informado não existe."
      />
    );
  }

  return (
    <div className={sharedStyles.stack}>
      <AdminPageHeader
        title={txn.id}
        description={`Pedido ${order?.code ?? txn.orderId}`}
        actions={
          <div className={sharedStyles.rowActions}>
            <Link href="/admin/financeiro" className={sharedStyles.btnGhost}>
              Voltar
            </Link>
            {txn.paymentStatus === "approved" ? (
              <button
                type="button"
                className={sharedStyles.btnDanger}
                onClick={() => setConfirmRefund(true)}
              >
                Estornar
              </button>
            ) : null}
          </div>
        }
      />

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Detalhes</h2>
        <div className={moduleStyles.kvGrid}>
          <div>
            <p className={moduleStyles.kvLabel}>Status</p>
            <AdminStatusBadge label={PAYMENT_STATUS_LABEL[txn.paymentStatus]} />
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Método</p>
            <p className={moduleStyles.kvValue}>{txn.paymentMethod.toUpperCase()}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Bruto</p>
            <p className={moduleStyles.kvValue}>{formatMoney(txn.grossCents)}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Taxa</p>
            <p className={moduleStyles.kvValue}>{formatMoney(txn.feeCents)}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Comissão</p>
            <p className={moduleStyles.kvValue}>{formatMoney(txn.commissionCents)}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Líquido</p>
            <p className={moduleStyles.kvValue}>{formatMoney(txn.netCents)}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Vendedor</p>
            <p className={moduleStyles.kvValue}>
              {seller ? (
                <Link
                  href={`/admin/vendedores/${seller.id}`}
                  className={sharedStyles.linkBtn}
                >
                  {seller.name}
                </Link>
              ) : (
                txn.sellerId
              )}
            </p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Pedido</p>
            <p className={moduleStyles.kvValue}>
              <Link href={`/admin/pedidos/${txn.orderId}`} className={sharedStyles.linkBtn}>
                {order?.code ?? txn.orderId}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Linha do tempo</h2>
        <ul className={moduleStyles.timeline}>
          {txn.timeline.map((event) => (
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

      <AdminConfirmDialog
        open={confirmRefund}
        title="Estornar transação"
        description="O estorno atualiza o pagamento do pedido vinculado. Confirma?"
        confirmLabel="Estornar"
        onClose={() => setConfirmRefund(false)}
        onConfirm={() => {
          refresh(repo.refundTransaction(txn.id));
          setConfirmRefund(false);
          toast.push("Transação estornada");
        }}
      />
    </div>
  );
}
