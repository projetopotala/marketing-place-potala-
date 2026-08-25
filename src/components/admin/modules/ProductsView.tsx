"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { PRODUCT_STATUS_LABEL } from "@/features/admin/domain/status";
import type { AdminProduct, ProductStatus } from "@/features/admin/domain/types";
import { formatMoney } from "@/features/admin/utils/currency";
import { downloadCsv, toCsv } from "@/features/admin/utils/csv";
import { includesQuery, paginate, sortBy } from "@/features/admin/utils/filters";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  AdminMetricCard,
  AdminMetricsRow,
} from "@/components/admin/shared/AdminMetricCard";
import {
  AdminDataTable,
  sharedStyles,
} from "@/components/admin/shared/AdminDataTable";
import {
  AdminFilterBar,
  AdminPagination,
  AdminStatusBadge,
  Field,
} from "@/components/admin/shared/AdminStatusBadge";
import { AdminModal } from "@/components/admin/shared/AdminModal";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import moduleStyles from "./modules.module.css";

function productTone(status: ProductStatus) {
  if (status === "active") return "success" as const;
  if (status === "review") return "warning" as const;
  if (status === "rejected") return "danger" as const;
  return "muted" as const;
}

export function ProductsView() {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProductStatus | "all">("all");
  const [sortKey, setSortKey] = useState<"title" | "price" | "stock">("title");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");

  const sellerName = useMemo(() => {
    const map = new Map(db.sellers.map((s) => [s.id, s.name]));
    return (id: string) => map.get(id) ?? id;
  }, [db.sellers]);

  const filtered = useMemo(() => {
    const list = db.products.filter((product) => {
      if (status !== "all" && product.status !== status) return false;
      return includesQuery(
        `${product.title} ${sellerName(product.sellerId)}`,
        query,
      );
    });
    if (sortKey === "price") return sortBy(list, (p) => p.priceCents, "desc");
    if (sortKey === "stock") return sortBy(list, (p) => p.stock, "desc");
    return sortBy(list, (p) => p.title, "asc");
  }, [db.products, query, status, sortKey, sellerName]);

  const paged = paginate(filtered, page, 8);

  const metrics = useMemo(() => {
    return {
      total: db.products.length,
      review: db.products.filter((p) => p.status === "review").length,
      active: db.products.filter((p) => p.status === "active").length,
      featured: db.products.filter((p) => p.featured).length,
    };
  }, [db.products]);

  function toggleSelect(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }

  function bulkActivate() {
    let next = db;
    for (const id of selected) {
      repo.setDb(next);
      next = repo.changeProductStatus(id, "active");
    }
    refresh(next);
    setSelected([]);
    toast.push("Produtos ativados em lote");
  }

  function exportCsv() {
    downloadCsv(
      "produtos.csv",
      toCsv(
        ["Título", "Vendedor", "Status", "Preço", "Estoque", "Destaque"],
        filtered.map((p) => [
          p.title,
          sellerName(p.sellerId),
          PRODUCT_STATUS_LABEL[p.status],
          formatMoney(p.priceCents),
          String(p.stock),
          p.featured ? "Sim" : "Não",
        ]),
      ),
    );
    toast.push("CSV exportado");
  }

  if (!isHydrated) {
    return <div className={sharedStyles.skeleton} aria-busy="true" />;
  }

  return (
    <div className={sharedStyles.stack}>
      <AdminPageHeader
        title="Produtos"
        description="Moderação, estoque, preço e destaque dos itens do catálogo."
        actions={
          <>
            <button type="button" className={sharedStyles.btnSecondary} onClick={exportCsv}>
              Exportar CSV
            </button>
            <button
              type="button"
              className={sharedStyles.btn}
              disabled={selected.length === 0}
              onClick={bulkActivate}
            >
              Ativar selecionados ({selected.length})
            </button>
          </>
        }
      />

      <AdminMetricsRow>
        <AdminMetricCard label="Total" value={String(metrics.total)} />
        <AdminMetricCard label="Em revisão" value={String(metrics.review)} />
        <AdminMetricCard label="Ativos" value={String(metrics.active)} />
        <AdminMetricCard label="Em destaque" value={String(metrics.featured)} />
      </AdminMetricsRow>

      <AdminFilterBar>
        <Field label="Buscar">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Título ou vendedor…"
          />
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ProductStatus | "all");
              setPage(1);
            }}
          >
            <option value="all">Todos</option>
            {(Object.keys(PRODUCT_STATUS_LABEL) as ProductStatus[]).map((key) => (
              <option key={key} value={key}>
                {PRODUCT_STATUS_LABEL[key]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ordenar">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
          >
            <option value="title">Título</option>
            <option value="price">Preço</option>
            <option value="stock">Estoque</option>
          </select>
        </Field>
      </AdminFilterBar>

      <AdminDataTable
        caption="Lista de produtos"
        rows={paged.items}
        columns={[
          {
            key: "select",
            header: "",
            render: (row) => (
              <label className={moduleStyles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={selected.includes(row.id)}
                  onChange={() => toggleSelect(row.id)}
                  aria-label={`Selecionar ${row.title}`}
                />
              </label>
            ),
          },
          {
            key: "title",
            header: "Produto",
            render: (row) => (
              <Link href={`/admin/produtos/${row.id}`} className={sharedStyles.linkBtn}>
                {row.title}
              </Link>
            ),
          },
          {
            key: "seller",
            header: "Vendedor",
            render: (row) => sellerName(row.sellerId),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <AdminStatusBadge
                label={PRODUCT_STATUS_LABEL[row.status]}
                tone={productTone(row.status)}
              />
            ),
          },
          {
            key: "price",
            header: "Preço",
            render: (row) => formatMoney(row.priceCents),
          },
          { key: "stock", header: "Estoque", render: (row) => String(row.stock) },
          {
            key: "actions",
            header: "Ações",
            render: (row) => (
              <div className={sharedStyles.rowActions}>
                {row.status === "review" ? (
                  <>
                    <button
                      type="button"
                      className={sharedStyles.linkBtn}
                      onClick={() => {
                        refresh(repo.changeProductStatus(row.id, "active"));
                        toast.push("Produto aprovado");
                      }}
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      className={sharedStyles.linkBtn}
                      onClick={() => {
                        setRejectId(row.id);
                        setRejectNote("");
                      }}
                    >
                      Rejeitar
                    </button>
                  </>
                ) : null}
                {row.status === "active" ? (
                  <button
                    type="button"
                    className={sharedStyles.linkBtn}
                    onClick={() => {
                      refresh(repo.changeProductStatus(row.id, "inactive"));
                      toast.push("Produto desativado");
                    }}
                  >
                    Desativar
                  </button>
                ) : null}
                {row.status === "inactive" || row.status === "rejected" ? (
                  <button
                    type="button"
                    className={sharedStyles.linkBtn}
                    onClick={() => {
                      refresh(repo.changeProductStatus(row.id, "active"));
                      toast.push("Produto ativado");
                    }}
                  >
                    Ativar
                  </button>
                ) : null}
                <button
                  type="button"
                  className={sharedStyles.linkBtn}
                  onClick={() => {
                    refresh(
                      repo.updateProduct(row.id, { featured: !row.featured }),
                    );
                    toast.push(row.featured ? "Destaque removido" : "Produto em destaque");
                  }}
                >
                  {row.featured ? "Remover destaque" : "Destacar"}
                </button>
                <button
                  type="button"
                  className={sharedStyles.linkBtn}
                  onClick={() => {
                    setEditProduct(row);
                    setEditTitle(row.title);
                    setEditPrice(String(row.priceCents / 100));
                    setEditStock(String(row.stock));
                  }}
                >
                  Editar
                </button>
              </div>
            ),
          },
        ]}
        mobileCard={(row) => (
          <>
            <label className={moduleStyles.checkboxRow}>
              <input
                type="checkbox"
                checked={selected.includes(row.id)}
                onChange={() => toggleSelect(row.id)}
              />
              <Link href={`/admin/produtos/${row.id}`} className={sharedStyles.linkBtn}>
                {row.title}
              </Link>
            </label>
            <span>{sellerName(row.sellerId)}</span>
            <AdminStatusBadge
              label={PRODUCT_STATUS_LABEL[row.status]}
              tone={productTone(row.status)}
            />
            <span>
              {formatMoney(row.priceCents)} · estoque {row.stock}
            </span>
          </>
        )}
      />

      <AdminPagination
        page={paged.page}
        pages={paged.pages}
        total={paged.total}
        onChange={setPage}
      />

      <AdminModal
        open={Boolean(rejectId)}
        title="Rejeitar produto"
        onClose={() => setRejectId(null)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setRejectId(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={sharedStyles.btnDanger}
              onClick={() => {
                if (!rejectId) return;
                refresh(repo.changeProductStatus(rejectId, "rejected", rejectNote));
                setRejectId(null);
                toast.push("Produto rejeitado");
              }}
            >
              Rejeitar
            </button>
          </>
        }
      >
        <Field label="Motivo">
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Descreva o motivo da rejeição"
          />
        </Field>
      </AdminModal>

      <AdminModal
        open={Boolean(editProduct)}
        title="Editar produto"
        onClose={() => setEditProduct(null)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setEditProduct(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={sharedStyles.btn}
              onClick={() => {
                if (!editProduct) return;
                const price = Math.round(Number(editPrice.replace(",", ".")) * 100);
                const stock = Math.max(0, Math.floor(Number(editStock) || 0));
                if (!Number.isFinite(price) || price < 0) {
                  toast.push("Preço inválido", "error");
                  return;
                }
                refresh(
                  repo.updateProduct(editProduct.id, {
                    title: editTitle.trim() || editProduct.title,
                    priceCents: price,
                    stock,
                  }),
                );
                setEditProduct(null);
                toast.push("Produto atualizado");
              }}
            >
              Salvar
            </button>
          </>
        }
      >
        <div className={sharedStyles.stack}>
          <Field label="Título">
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          </Field>
          <Field label="Preço (R$)">
            <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
          </Field>
          <Field label="Estoque">
            <input value={editStock} onChange={(e) => setEditStock(e.target.value)} />
          </Field>
        </div>
      </AdminModal>

    </div>
  );
}
