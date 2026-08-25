"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { CUSTOMER_STATUS_LABEL } from "@/features/admin/domain/status";
import { formatMoney } from "@/features/admin/utils/currency";
import { formatDateTime } from "@/features/admin/utils/dates";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  AdminEmptyState,
  AdminStatusBadge,
  Field,
} from "@/components/admin/shared/AdminStatusBadge";
import { sharedStyles } from "@/components/admin/shared/AdminDataTable";
import { AdminConfirmDialog } from "@/components/admin/shared/AdminModal";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import moduleStyles from "./modules.module.css";

export function CustomerDetailView({ id }: { id: string }) {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const customer = useMemo(
    () => db.customers.find((c) => c.id === id),
    [db.customers, id],
  );
  const orders = useMemo(
    () => db.orders.filter((o) => o.customerId === id),
    [db.orders, id],
  );
  const [draftNotes, setDraftNotes] = useState<string | null>(null);
  const [draftTags, setDraftTags] = useState<string | null>(null);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const notes = draftNotes ?? customer?.notes ?? "";
  const tags = draftTags ?? customer?.tags.join(", ") ?? "";

  if (!isHydrated) {
    return <div className={sharedStyles.skeleton} aria-busy="true" />;
  }

  if (!customer) {
    return (
      <AdminEmptyState
        title="Cliente não encontrado"
        description="O identificador informado não existe."
      />
    );
  }

  return (
    <div className={sharedStyles.stack}>
      <AdminPageHeader
        title={customer.name}
        description={customer.email}
        actions={
          <div className={sharedStyles.rowActions}>
            <Link href="/admin/clientes" className={sharedStyles.btnGhost}>
              Voltar
            </Link>
            <button
              type="button"
              className={
                customer.status === "active"
                  ? sharedStyles.btnDanger
                  : sharedStyles.btn
              }
              onClick={() => setConfirmBlock(true)}
            >
              {customer.status === "active" ? "Bloquear" : "Desbloquear"}
            </button>
          </div>
        }
      />

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Dados</h2>
        <div className={moduleStyles.kvGrid}>
          <div>
            <p className={moduleStyles.kvLabel}>Status</p>
            <AdminStatusBadge
              label={CUSTOMER_STATUS_LABEL[customer.status]}
              tone={customer.status === "active" ? "success" : "danger"}
            />
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Telefone</p>
            <p className={moduleStyles.kvValue}>{customer.phone || "—"}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Cidade</p>
            <p className={moduleStyles.kvValue}>
              {customer.city}/{customer.state}
            </p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Preferências</p>
            <p className={moduleStyles.kvValue}>
              {customer.preferredProducts.join(", ") || "—"}
            </p>
          </div>
        </div>
      </div>

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Notas e tags</h2>
        <div className={sharedStyles.stack}>
          <Field label="Notas">
            <textarea
              value={notes}
              onChange={(e) => setDraftNotes(e.target.value)}
            />
          </Field>
          <Field label="Tags (vírgula)">
            <input
              value={tags}
              onChange={(e) => setDraftTags(e.target.value)}
            />
          </Field>
          <button
            type="button"
            className={sharedStyles.btn}
            onClick={() => {
              const nextNotes = notes.trim();
              const nextTags = tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
              refresh(
                repo.updateCustomer(customer.id, {
                  notes: nextNotes,
                  tags: nextTags,
                }),
              );
              setDraftNotes(null);
              setDraftTags(null);
              toast.push("Cliente atualizado");
            }}
          >
            Salvar notas/tags
          </button>
        </div>
      </div>

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Pedidos ({orders.length})</h2>
        <ul className={moduleStyles.timeline}>
          {orders.map((order) => (
            <li key={order.id} className={moduleStyles.timelineItem}>
              <Link href={`/admin/pedidos/${order.id}`} className={sharedStyles.linkBtn}>
                {order.code}
              </Link>
              <p className={moduleStyles.timelineDetail}>
                {formatMoney(order.totalCents)}
              </p>
            </li>
          ))}
          {orders.length === 0 ? (
            <li className={moduleStyles.muted}>Nenhum pedido.</li>
          ) : null}
        </ul>
      </div>

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Linha do tempo</h2>
        <ul className={moduleStyles.timeline}>
          {customer.timeline.map((event) => (
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
        open={confirmBlock}
        title={customer.status === "active" ? "Bloquear cliente" : "Desbloquear cliente"}
        description={`Confirma alterar o status de ${customer.name}?`}
        onClose={() => setConfirmBlock(false)}
        onConfirm={() => {
          refresh(
            repo.changeCustomerStatus(
              customer.id,
              customer.status === "active" ? "blocked" : "active",
            ),
          );
          setConfirmBlock(false);
          toast.push("Status atualizado");
        }}
      />
    </div>
  );
}
