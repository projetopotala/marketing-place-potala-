"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { PRODUCT_STATUS_LABEL } from "@/features/admin/domain/status";
import type { ProductStatus } from "@/features/admin/domain/types";
import { formatMoney } from "@/features/admin/utils/currency";
import { formatDateTime } from "@/features/admin/utils/dates";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  AdminEmptyState,
  AdminStatusBadge,
  Field,
} from "@/components/admin/shared/AdminStatusBadge";
import { sharedStyles } from "@/components/admin/shared/AdminDataTable";
import { AdminModal } from "@/components/admin/shared/AdminModal";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import moduleStyles from "./modules.module.css";

function productTone(status: ProductStatus) {
  if (status === "active") return "success" as const;
  if (status === "review") return "warning" as const;
  if (status === "rejected") return "danger" as const;
  return "muted" as const;
}

export function ProductDetailView({ id }: { id: string }) {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const product = useMemo(() => db.products.find((p) => p.id === id), [db.products, id]);
  const seller = useMemo(
    () => db.sellers.find((s) => s.id === product?.sellerId),
    [db.sellers, product?.sellerId],
  );
  const category = useMemo(
    () => db.categories.find((c) => c.id === product?.categoryId),
    [db.categories, product?.categoryId],
  );
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  if (!isHydrated) {
    return <div className={sharedStyles.skeleton} aria-busy="true" />;
  }

  if (!product) {
    return (
      <AdminEmptyState
        title="Produto não encontrado"
        description="Verifique o link ou volte para a listagem de produtos."
      />
    );
  }

  return (
    <div className={sharedStyles.stack}>
      <AdminPageHeader
        title={product.title}
        description={seller ? `Vendedor: ${seller.name}` : product.sellerId}
        actions={
          <div className={sharedStyles.rowActions}>
            <Link href="/admin/produtos" className={sharedStyles.btnGhost}>
              Voltar
            </Link>
            {product.status === "review" ? (
              <>
                <button
                  type="button"
                  className={sharedStyles.btn}
                  onClick={() => {
                    refresh(repo.changeProductStatus(product.id, "active"));
                    toast.push("Aprovado");
                  }}
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  className={sharedStyles.btnDanger}
                  onClick={() => {
                    setRejectNote("");
                    setRejectOpen(true);
                  }}
                >
                  Rejeitar
                </button>
              </>
            ) : null}
            {product.status === "active" ? (
              <button
                type="button"
                className={sharedStyles.btnSecondary}
                onClick={() => {
                  refresh(repo.changeProductStatus(product.id, "inactive"));
                  toast.push("Desativado");
                }}
              >
                Desativar
              </button>
            ) : null}
            {product.status === "inactive" || product.status === "rejected" ? (
              <button
                type="button"
                className={sharedStyles.btn}
                onClick={() => {
                  refresh(repo.changeProductStatus(product.id, "active"));
                  toast.push("Ativado");
                }}
              >
                Ativar
              </button>
            ) : null}
            <button
              type="button"
              className={sharedStyles.btnSecondary}
              onClick={() => {
                refresh(
                  repo.updateProduct(product.id, { featured: !product.featured }),
                );
                toast.push(product.featured ? "Destaque removido" : "Em destaque");
              }}
            >
              {product.featured ? "Remover destaque" : "Destacar"}
            </button>
            <button
              type="button"
              className={sharedStyles.btnSecondary}
              onClick={() => {
                setTitle(product.title);
                setPrice(String(product.priceCents / 100));
                setStock(String(product.stock));
                setEditOpen(true);
              }}
            >
              Editar
            </button>
          </div>
        }
      />

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Detalhes</h2>
        <div className={moduleStyles.kvGrid}>
          <div>
            <p className={moduleStyles.kvLabel}>Status</p>
            <AdminStatusBadge
              label={PRODUCT_STATUS_LABEL[product.status]}
              tone={productTone(product.status)}
            />
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Preço</p>
            <p className={moduleStyles.kvValue}>{formatMoney(product.priceCents)}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Estoque</p>
            <p className={moduleStyles.kvValue}>{product.stock}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Categoria</p>
            <p className={moduleStyles.kvValue}>{category?.name ?? product.categoryId}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Destaque</p>
            <p className={moduleStyles.kvValue}>{product.featured ? "Sim" : "Não"}</p>
          </div>
          <div>
            <p className={moduleStyles.kvLabel}>Descrição</p>
            <p className={moduleStyles.kvValue}>{product.description || "—"}</p>
          </div>
          {product.moderationNote ? (
            <div>
              <p className={moduleStyles.kvLabel}>Nota de moderação</p>
              <p className={moduleStyles.kvValue}>{product.moderationNote}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Atributos</h2>
        <div className={moduleStyles.tagList}>
          {Object.entries(product.attributes).map(([key, value]) => (
            <span key={key} className={moduleStyles.tag}>
              {key}: {value}
            </span>
          ))}
          {Object.keys(product.attributes).length === 0 ? (
            <span className={moduleStyles.muted}>Sem atributos.</span>
          ) : null}
        </div>
      </div>

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Linha do tempo</h2>
        <ul className={moduleStyles.timeline}>
          {product.timeline.map((event) => (
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
        open={rejectOpen}
        title="Rejeitar produto"
        onClose={() => setRejectOpen(false)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setRejectOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={sharedStyles.btnDanger}
              onClick={() => {
                refresh(repo.changeProductStatus(product.id, "rejected", rejectNote));
                setRejectOpen(false);
                toast.push("Rejeitado");
              }}
            >
              Confirmar
            </button>
          </>
        }
      >
        <Field label="Motivo">
          <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
        </Field>
      </AdminModal>

      <AdminModal
        open={editOpen}
        title="Editar produto"
        onClose={() => setEditOpen(false)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setEditOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={sharedStyles.btn}
              onClick={() => {
                const priceCents = Math.round(Number(price.replace(",", ".")) * 100);
                const stockValue = Math.max(0, Math.floor(Number(stock) || 0));
                if (!Number.isFinite(priceCents) || priceCents < 0) {
                  toast.push("Preço inválido", "error");
                  return;
                }
                refresh(
                  repo.updateProduct(product.id, {
                    title: title.trim() || product.title,
                    priceCents,
                    stock: stockValue,
                  }),
                );
                setEditOpen(false);
                toast.push("Atualizado");
              }}
            >
              Salvar
            </button>
          </>
        }
      >
        <div className={sharedStyles.stack}>
          <Field label="Título">
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Preço (R$)">
            <input value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
          <Field label="Estoque">
            <input value={stock} onChange={(e) => setStock(e.target.value)} />
          </Field>
        </div>
      </AdminModal>
    </div>
  );
}
