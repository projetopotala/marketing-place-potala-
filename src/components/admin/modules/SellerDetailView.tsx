"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { SELLER_STATUS_LABEL } from "@/features/admin/domain/status";
import type { SellerStatus } from "@/features/admin/domain/types";
import { formatMoney } from "@/features/admin/utils/currency";
import { formatDateTime } from "@/features/admin/utils/dates";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  AdminEmptyState,
  AdminStatusBadge,
  Field,
} from "@/components/admin/shared/AdminStatusBadge";
import { sharedStyles } from "@/components/admin/shared/AdminDataTable";
import { AdminModal, AdminConfirmDialog } from "@/components/admin/shared/AdminModal";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import moduleStyles from "./modules.module.css";

function sellerTone(status: SellerStatus) {
  if (status === "active") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "suspended") return "danger" as const;
  return "muted" as const;
}

export function SellerDetailView({ id }: { id: string }) {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const seller = useMemo(() => db.sellers.find((s) => s.id === id), [db.sellers, id]);
  const products = useMemo(
    () => db.products.filter((p) => p.sellerId === id),
    [db.products, id],
  );
  const orders = useMemo(
    () => db.orders.filter((o) => o.sellerId === id),
    [db.orders, id],
  );
  const [commissionOpen, setCommissionOpen] = useState(false);
  const [commission, setCommission] = useState(12);
  const [confirm, setConfirm] = useState<{
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  if (!isHydrated) {
    return <div className={sharedStyles.skeleton} aria-busy="true" />;
  }

  if (!seller) {
    return (
      <AdminEmptyState
        title="Vendedor não encontrado"
        description="O identificador informado não existe no banco demonstrativo."
      />
    );
  }

  return (
    <div className={sharedStyles.stack}>
      <AdminPageHeader
        title={seller.name}
        description={`${seller.email} · ${seller.city}/${seller.state}`}
        actions={
          <div className={sharedStyles.rowActions}>
            <Link href="/admin/vendedores" className={sharedStyles.btnGhost}>
              Voltar
            </Link>
            {seller.status === "pending" ? (
              <>
                <button
                  type="button"
                  className={sharedStyles.btn}
                  onClick={() => {
                    refresh(repo.changeSellerStatus(seller.id, "active"));
                    toast.push("Aprovado");
                  }}
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  className={sharedStyles.btnDanger}
                  onClick={() =>
                    setConfirm({
                      title: "Rejeitar vendedor",
                      description: `Confirma rejeitar ${seller.name}?`,
                      action: () => {
                        refresh(
                          repo.changeSellerStatus(seller.id, "rejected", "Rejeitado"),
                        );
                        toast.push("Rejeitado");
                        setConfirm(null);
                      },
                    })
                  }
                >
                  Rejeitar
                </button>
              </>
            ) : null}
            {seller.status === "active" ? (
              <button
                type="button"
                className={sharedStyles.btnDanger}
                onClick={() =>
                  setConfirm({
                    title: "Suspender vendedor",
                    description: `Confirma suspender ${seller.name}?`,
                    action: () => {
                      refresh(repo.changeSellerStatus(seller.id, "suspended"));
                      toast.push("Suspenso");
                      setConfirm(null);
                    },
                  })
                }
              >
                Suspender
              </button>
            ) : null}
            {seller.status === "suspended" || seller.status === "rejected" ? (
              <button
                type="button"
                className={sharedStyles.btn}
                onClick={() => {
                  refresh(repo.changeSellerStatus(seller.id, "active"));
                  toast.push("Reativado");
                }}
              >
                Reativar
              </button>
            ) : null}
            <button
              type="button"
              className={sharedStyles.btnSecondary}
              onClick={() => {
                setCommission(seller.commissionPercent);
                setCommissionOpen(true);
              }}
            >
              Editar comissão
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
              label={SELLER_STATUS_LABEL[seller.status]}
              tone={sellerTone(seller.status)}
            />
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Comissão</p>
            <p className={moduleStyles.kvValue}>{seller.commissionPercent}%</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Categoria</p>
            <p className={moduleStyles.kvValue}>{seller.category}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Documento</p>
            <p className={moduleStyles.kvValue}>{seller.documentLabel}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Telefone</p>
            <p className={moduleStyles.kvValue}>{seller.phone || "—"}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Avaliação</p>
            <p className={moduleStyles.kvValue}>{seller.rating}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Notas</p>
            <p className={moduleStyles.kvValue}>{seller.notes || "—"}</p>
          </div>
        </div>
      </div>

      <div className={sharedStyles.grid2}>
        <div className={sharedStyles.panel}>
          <h2 className={sharedStyles.panelTitle}>Produtos ({products.length})</h2>
          <ul className={moduleStyles.timeline}>
            {products.slice(0, 8).map((product) => (
              <li key={product.id} className={moduleStyles.timelineItem}>
                <Link
                  href={`/admin/produtos/${product.id}`}
                  className={sharedStyles.linkBtn}
                >
                  {product.title}
                </Link>
                <p className={moduleStyles.timelineDetail}>
                  {formatMoney(product.priceCents)} · estoque {product.stock}
                </p>
              </li>
            ))}
            {products.length === 0 ? (
              <li className={moduleStyles.muted}>Nenhum produto.</li>
            ) : null}
          </ul>
        </div>
        <div className={sharedStyles.panel}>
          <h2 className={sharedStyles.panelTitle}>Pedidos ({orders.length})</h2>
          <ul className={moduleStyles.timeline}>
            {orders.slice(0, 8).map((order) => (
              <li key={order.id} className={moduleStyles.timelineItem}>
                <Link
                  href={`/admin/pedidos/${order.id}`}
                  className={sharedStyles.linkBtn}
                >
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
      </div>

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Linha do tempo</h2>
        <ul className={moduleStyles.timeline}>
          {seller.timeline.map((event) => (
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

      <AdminModal
        open={commissionOpen}
        title="Editar comissão"
        onClose={() => setCommissionOpen(false)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setCommissionOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={sharedStyles.btn}
              onClick={() => {
                refresh(repo.updateSellerCommission(seller.id, commission));
                setCommissionOpen(false);
                toast.push("Comissão atualizada");
              }}
            >
              Salvar
            </button>
          </>
        }
      >
        <Field label="Comissão (%)">
          <input
            type="number"
            min={0}
            max={100}
            value={commission}
            onChange={(e) => setCommission(Number(e.target.value) || 0)}
          />
        </Field>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title ?? ""}
        description={confirm?.description ?? ""}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm?.action()}
      />
    </div>
  );
}
