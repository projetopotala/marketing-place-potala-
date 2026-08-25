"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { SELLER_STATUS_LABEL } from "@/features/admin/domain/status";
import type { Seller, SellerStatus } from "@/features/admin/domain/types";
import { downloadCsv, toCsv } from "@/features/admin/utils/csv";
import { includesQuery, paginate, sortBy } from "@/features/admin/utils/filters";
import { formatDate } from "@/features/admin/utils/dates";
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

function sellerTone(status: SellerStatus) {
  if (status === "active") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "suspended") return "danger" as const;
  return "muted" as const;
}

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  category: "",
  status: "pending" as SellerStatus,
  commissionPercent: 12,
  documentLabel: "",
  notes: "",
};

export function SellersView() {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SellerStatus | "all">("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = useMemo(() => {
    const list = db.sellers.filter((seller) => {
      if (status !== "all" && seller.status !== status) return false;
      return includesQuery(
        `${seller.name} ${seller.email} ${seller.city} ${seller.category}`,
        query,
      );
    });
    return sortBy(list, (s) => s.name, sortDir);
  }, [db.sellers, query, status, sortDir]);

  const paged = paginate(filtered, page, 8);

  const metrics = useMemo(() => {
    const total = db.sellers.length;
    const active = db.sellers.filter((s) => s.status === "active").length;
    const pending = db.sellers.filter((s) => s.status === "pending").length;
    const suspended = db.sellers.filter((s) => s.status === "suspended").length;
    return { total, active, pending, suspended };
  }, [db.sellers]);

  function exportCsv() {
    downloadCsv(
      "vendedores.csv",
      toCsv(
        ["Nome", "E-mail", "Status", "Cidade", "Comissão", "Criado em"],
        filtered.map((s) => [
          s.name,
          s.email,
          SELLER_STATUS_LABEL[s.status],
          `${s.city}/${s.state}`,
          `${s.commissionPercent}%`,
          formatDate(s.createdAt),
        ]),
      ),
    );
    toast.push("CSV exportado");
  }

  function createSeller() {
    if (!form.name.trim() || !form.email.trim()) {
      toast.push("Informe nome e e-mail", "error");
      return;
    }
    const next = repo.createSeller({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim() || "São Paulo",
      state: form.state.trim() || "SP",
      category: form.category.trim() || "Geral",
      status: form.status,
      commissionPercent: form.commissionPercent,
      documentLabel: form.documentLabel.trim() || "CNPJ pendente",
      notes: form.notes.trim(),
    });
    refresh(next);
    setCreateOpen(false);
    setForm(EMPTY_FORM);
    toast.push("Vendedor criado");
  }

  if (!isHydrated) {
    return <div className={sharedStyles.skeleton} aria-busy="true" />;
  }

  return (
    <div className={sharedStyles.stack}>
      <AdminPageHeader
        title="Vendedores"
        description="Aprove, suspenda e gerencie comissões dos sellers do marketplace."
        actions={
          <>
            <button type="button" className={sharedStyles.btnSecondary} onClick={exportCsv}>
              Exportar CSV
            </button>
            <button
              type="button"
              className={sharedStyles.btn}
              onClick={() => setCreateOpen(true)}
            >
              Novo vendedor
            </button>
          </>
        }
      />

      <AdminMetricsRow>
        <AdminMetricCard label="Total" value={String(metrics.total)} />
        <AdminMetricCard label="Ativos" value={String(metrics.active)} />
        <AdminMetricCard label="Pendentes" value={String(metrics.pending)} />
        <AdminMetricCard label="Suspensos" value={String(metrics.suspended)} />
      </AdminMetricsRow>

      <AdminFilterBar>
        <Field label="Buscar">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Nome, e-mail, cidade…"
          />
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as SellerStatus | "all");
              setPage(1);
            }}
          >
            <option value="all">Todos</option>
            {(Object.keys(SELLER_STATUS_LABEL) as SellerStatus[]).map((key) => (
              <option key={key} value={key}>
                {SELLER_STATUS_LABEL[key]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ordenar nome">
          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
          >
            <option value="asc">A → Z</option>
            <option value="desc">Z → A</option>
          </select>
        </Field>
      </AdminFilterBar>

      <AdminDataTable
        caption="Lista de vendedores"
        rows={paged.items}
        columns={[
          {
            key: "name",
            header: "Loja",
            render: (row: Seller) => (
              <Link href={`/admin/vendedores/${row.id}`} className={sharedStyles.linkBtn}>
                {row.name}
              </Link>
            ),
          },
          { key: "email", header: "E-mail", render: (row) => row.email },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <AdminStatusBadge
                label={SELLER_STATUS_LABEL[row.status]}
                tone={sellerTone(row.status)}
              />
            ),
          },
          {
            key: "city",
            header: "Cidade",
            render: (row) => `${row.city}/${row.state}`,
          },
          {
            key: "commission",
            header: "Comissão",
            render: (row) => `${row.commissionPercent}%`,
          },
          {
            key: "actions",
            header: "Ações",
            render: (row) => (
              <div className={sharedStyles.rowActions}>
                {row.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      className={sharedStyles.linkBtn}
                      onClick={() => {
                        refresh(repo.changeSellerStatus(row.id, "active"));
                        toast.push("Vendedor aprovado");
                      }}
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      className={sharedStyles.linkBtn}
                      onClick={() => {
                        refresh(repo.changeSellerStatus(row.id, "rejected", "Rejeitado"));
                        toast.push("Vendedor rejeitado");
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
                      refresh(repo.changeSellerStatus(row.id, "suspended"));
                      toast.push("Vendedor suspenso");
                    }}
                  >
                    Suspender
                  </button>
                ) : null}
                {row.status === "suspended" || row.status === "rejected" ? (
                  <button
                    type="button"
                    className={sharedStyles.linkBtn}
                    onClick={() => {
                      refresh(repo.changeSellerStatus(row.id, "active"));
                      toast.push("Vendedor reativado");
                    }}
                  >
                    Reativar
                  </button>
                ) : null}
              </div>
            ),
          },
        ]}
        mobileCard={(row) => (
          <>
            <Link href={`/admin/vendedores/${row.id}`} className={sharedStyles.linkBtn}>
              {row.name}
            </Link>
            <span>{row.email}</span>
            <AdminStatusBadge
              label={SELLER_STATUS_LABEL[row.status]}
              tone={sellerTone(row.status)}
            />
            <span>
              {row.city}/{row.state} · {row.commissionPercent}%
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
        open={createOpen}
        title="Novo vendedor"
        onClose={() => setCreateOpen(false)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setCreateOpen(false)}
            >
              Cancelar
            </button>
            <button type="button" className={sharedStyles.btn} onClick={createSeller}>
              Criar
            </button>
          </>
        }
      >
        <div className={sharedStyles.stack}>
          <Field label="Nome">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="E-mail">
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Telefone">
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <div className={sharedStyles.grid2}>
            <Field label="Cidade">
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </Field>
            <Field label="UF">
              <input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Categoria">
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </Field>
          <Field label="Comissão (%)">
            <input
              type="number"
              min={0}
              max={100}
              value={form.commissionPercent}
              onChange={(e) =>
                setForm({ ...form, commissionPercent: Number(e.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Documento">
            <input
              value={form.documentLabel}
              onChange={(e) => setForm({ ...form, documentLabel: e.target.value })}
            />
          </Field>
          <Field label="Notas">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
        </div>
      </AdminModal>
    </div>
  );
}
