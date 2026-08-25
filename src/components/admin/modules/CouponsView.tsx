"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import type {
  Coupon,
  CouponChannel,
  CouponDiscountType,
  CouponStatus,
} from "@/features/admin/domain/types";
import { formatMoney } from "@/features/admin/utils/currency";
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
import { AdminModal, AdminConfirmDialog } from "@/components/admin/shared/AdminModal";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";

const COUPON_STATUS_LABEL: Record<CouponStatus, string> = {
  active: "Ativo",
  scheduled: "Agendado",
  expired: "Expirado",
  disabled: "Desativado",
};

function couponTone(status: CouponStatus) {
  if (status === "active") return "success" as const;
  if (status === "scheduled") return "info" as const;
  if (status === "expired") return "muted" as const;
  return "danger" as const;
}

const EMPTY = {
  code: "",
  name: "",
  discountType: "percent" as CouponDiscountType,
  discountValue: 10,
  channel: "all" as CouponChannel,
  status: "active" as CouponStatus,
  startsAt: "2026-08-01T00:00:00.000Z",
  endsAt: "2026-12-31T23:59:59.000Z",
};

export function CouponsView() {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CouponStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"create" | Coupon | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = db.coupons.filter((coupon) => {
      if (status !== "all" && coupon.status !== status) return false;
      return includesQuery(`${coupon.code} ${coupon.name}`, query);
    });
    return sortBy(list, (c) => c.code, "asc");
  }, [db.coupons, query, status]);

  const paged = paginate(filtered, page, 8);

  const metrics = useMemo(
    () => ({
      total: db.coupons.length,
      active: db.coupons.filter((c) => c.status === "active").length,
      usage: db.coupons.reduce((sum, c) => sum + c.usageCount, 0),
      revenue: db.coupons.reduce((sum, c) => sum + c.revenueCents, 0),
    }),
    [db.coupons],
  );

  function openCreate() {
    setForm(EMPTY);
    setModal("create");
  }

  function openEdit(coupon: Coupon) {
    setForm({
      code: coupon.code,
      name: coupon.name,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      channel: coupon.channel,
      status: coupon.status,
      startsAt: coupon.startsAt,
      endsAt: coupon.endsAt,
    });
    setModal(coupon);
  }

  function save() {
    if (!form.code.trim() || !form.name.trim()) {
      toast.push("Informe código e nome", "error");
      return;
    }
    if (modal === "create") {
      refresh(
        repo.createCoupon({
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          discountType: form.discountType,
          discountValue: form.discountValue,
          channel: form.channel,
          status: form.status,
          startsAt: form.startsAt,
          endsAt: form.endsAt,
        }),
      );
      toast.push("Cupom criado");
    } else if (modal) {
      refresh(
        repo.updateCoupon(modal.id, {
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          discountType: form.discountType,
          discountValue: form.discountValue,
          channel: form.channel,
          status: form.status,
          startsAt: form.startsAt,
          endsAt: form.endsAt,
        }),
      );
      toast.push("Cupom atualizado");
    }
    setModal(null);
  }

  function duplicate(coupon: Coupon) {
    refresh(
      repo.createCoupon({
        code: `${coupon.code}-COPY`,
        name: `${coupon.name} (cópia)`,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        channel: coupon.channel,
        status: "disabled",
        startsAt: coupon.startsAt,
        endsAt: coupon.endsAt,
      }),
    );
    toast.push("Cupom duplicado");
  }

  function exportCsv() {
    downloadCsv(
      "cupons.csv",
      toCsv(
        ["Código", "Nome", "Status", "Desconto", "Usos", "Receita"],
        filtered.map((c) => [
          c.code,
          c.name,
          COUPON_STATUS_LABEL[c.status],
          c.discountType === "percent"
            ? `${c.discountValue}%`
            : formatMoney(c.discountValue),
          String(c.usageCount),
          formatMoney(c.revenueCents),
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
        title="Cupons"
        description="Crie, duplique e controle cupons promocionais."
        actions={
          <>
            <button type="button" className={sharedStyles.btnSecondary} onClick={exportCsv}>
              Exportar CSV
            </button>
            <button type="button" className={sharedStyles.btn} onClick={openCreate}>
              Novo cupom
            </button>
          </>
        }
      />

      <AdminMetricsRow>
        <AdminMetricCard label="Total" value={String(metrics.total)} />
        <AdminMetricCard label="Ativos" value={String(metrics.active)} />
        <AdminMetricCard label="Usos" value={String(metrics.usage)} />
        <AdminMetricCard label="Receita atribuída" value={formatMoney(metrics.revenue)} />
      </AdminMetricsRow>

      <AdminFilterBar>
        <Field label="Buscar">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as CouponStatus | "all");
              setPage(1);
            }}
          >
            <option value="all">Todos</option>
            {(Object.keys(COUPON_STATUS_LABEL) as CouponStatus[]).map((key) => (
              <option key={key} value={key}>
                {COUPON_STATUS_LABEL[key]}
              </option>
            ))}
          </select>
        </Field>
      </AdminFilterBar>

      <AdminDataTable
        caption="Cupons"
        rows={paged.items}
        columns={[
          { key: "code", header: "Código", render: (row) => row.code },
          { key: "name", header: "Nome", render: (row) => row.name },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <AdminStatusBadge
                label={COUPON_STATUS_LABEL[row.status]}
                tone={couponTone(row.status)}
              />
            ),
          },
          {
            key: "discount",
            header: "Desconto",
            render: (row) =>
              row.discountType === "percent"
                ? `${row.discountValue}%`
                : formatMoney(row.discountValue),
          },
          {
            key: "period",
            header: "Vigência",
            render: (row) => `${formatDate(row.startsAt)} – ${formatDate(row.endsAt)}`,
          },
          {
            key: "actions",
            header: "Ações",
            render: (row) => (
              <div className={sharedStyles.rowActions}>
                <button
                  type="button"
                  className={sharedStyles.linkBtn}
                  onClick={() => openEdit(row)}
                >
                  Editar
                </button>
                {row.status !== "active" ? (
                  <button
                    type="button"
                    className={sharedStyles.linkBtn}
                    onClick={() => {
                      refresh(repo.updateCoupon(row.id, { status: "active" }));
                      toast.push("Cupom ativado");
                    }}
                  >
                    Ativar
                  </button>
                ) : (
                  <button
                    type="button"
                    className={sharedStyles.linkBtn}
                    onClick={() => {
                      refresh(repo.updateCoupon(row.id, { status: "disabled" }));
                      toast.push("Cupom desativado");
                    }}
                  >
                    Desativar
                  </button>
                )}
                <button
                  type="button"
                  className={sharedStyles.linkBtn}
                  onClick={() => duplicate(row)}
                >
                  Duplicar
                </button>
                <button
                  type="button"
                  className={sharedStyles.linkBtn}
                  onClick={() => setDeleteId(row.id)}
                >
                  Excluir
                </button>
              </div>
            ),
          },
        ]}
        mobileCard={(row) => (
          <>
            <strong>{row.code}</strong>
            <span>{row.name}</span>
            <AdminStatusBadge
              label={COUPON_STATUS_LABEL[row.status]}
              tone={couponTone(row.status)}
            />
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
        open={Boolean(modal)}
        title={modal === "create" ? "Novo cupom" : "Editar cupom"}
        onClose={() => setModal(null)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setModal(null)}
            >
              Cancelar
            </button>
            <button type="button" className={sharedStyles.btn} onClick={save}>
              Salvar
            </button>
          </>
        }
      >
        <div className={sharedStyles.stack}>
          <Field label="Código">
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </Field>
          <Field label="Nome">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <div className={sharedStyles.grid2}>
            <Field label="Tipo">
              <select
                value={form.discountType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discountType: e.target.value as CouponDiscountType,
                  })
                }
              >
                <option value="percent">Percentual</option>
                <option value="fixed">Valor fixo (centavos)</option>
              </select>
            </Field>
            <Field label="Valor">
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) =>
                  setForm({ ...form, discountValue: Number(e.target.value) || 0 })
                }
              />
            </Field>
          </div>
          <Field label="Canal">
            <select
              value={form.channel}
              onChange={(e) =>
                setForm({ ...form, channel: e.target.value as CouponChannel })
              }
            >
              <option value="all">Todos</option>
              <option value="site">Site</option>
              <option value="app">App</option>
            </select>
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as CouponStatus })
              }
            >
              {(Object.keys(COUPON_STATUS_LABEL) as CouponStatus[]).map((key) => (
                <option key={key} value={key}>
                  {COUPON_STATUS_LABEL[key]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteId)}
        title="Excluir cupom"
        description="Esta ação remove o cupom do banco demonstrativo."
        confirmLabel="Excluir"
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          refresh(repo.deleteCoupon(deleteId));
          setDeleteId(null);
          toast.push("Cupom excluído");
        }}
      />
    </div>
  );
}
