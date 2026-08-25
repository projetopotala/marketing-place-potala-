"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import type { Payout } from "@/features/admin/domain/types";
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
import { AdminModal } from "@/components/admin/shared/AdminModal";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";

const PAYOUT_STATUS_LABEL: Record<Payout["status"], string> = {
  pending: "Pendente",
  processing: "Processando",
  paid: "Pago",
  failed: "Falhou",
};

export function PayoutsView() {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Payout["status"] | "all">("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [sellerId, setSellerId] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("Agosto/2026");

  const sellerName = useMemo(() => {
    const map = new Map(db.sellers.map((s) => [s.id, s.name]));
    return (id: string) => map.get(id) ?? id;
  }, [db.sellers]);

  const filtered = useMemo(() => {
    const list = db.payouts.filter((payout) => {
      if (status !== "all" && payout.status !== status) return false;
      return includesQuery(
        `${payout.id} ${sellerName(payout.sellerId)} ${payout.periodLabel}`,
        query,
      );
    });
    return sortBy(list, (p) => p.createdAt, "desc");
  }, [db.payouts, query, status, sellerName]);

  const paged = paginate(filtered, page, 8);

  const metrics = useMemo(() => {
    const pending = db.payouts
      .filter((p) => p.status === "pending" || p.status === "processing")
      .reduce((sum, p) => sum + p.amountCents, 0);
    const paid = db.payouts
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amountCents, 0);
    return {
      total: db.payouts.length,
      pending,
      paid,
      processing: db.payouts.filter((p) => p.status === "processing").length,
    };
  }, [db.payouts]);

  function createBatch() {
    if (!sellerId) {
      toast.push("Selecione um vendedor", "error");
      return;
    }
    const amountCents = Math.round(Number(amount.replace(",", ".")) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      toast.push("Valor inválido", "error");
      return;
    }
    const commissionCents = Math.round(amountCents * 0.12);
    refresh(
      repo.createPayout({
        sellerId,
        amountCents,
        commissionCents,
        retentionCents: 0,
        status: "pending",
        periodLabel: period.trim() || "Lote demo",
      }),
    );
    setCreateOpen(false);
    setAmount("");
    toast.push("Lote de repasse criado");
  }

  function exportCsv() {
    downloadCsv(
      "repasses.csv",
      toCsv(
        ["ID", "Vendedor", "Período", "Valor", "Comissão", "Status", "Criado"],
        filtered.map((p) => [
          p.id,
          sellerName(p.sellerId),
          p.periodLabel,
          formatMoney(p.amountCents),
          formatMoney(p.commissionCents),
          PAYOUT_STATUS_LABEL[p.status],
          formatDate(p.createdAt),
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
        title="Repasses"
        description="Crie lotes de pagamento e marque processados."
        actions={
          <>
            <Link href="/admin/financeiro" className={sharedStyles.btnGhost}>
              Voltar
            </Link>
            <button type="button" className={sharedStyles.btnSecondary} onClick={exportCsv}>
              Exportar CSV
            </button>
            <button
              type="button"
              className={sharedStyles.btn}
              onClick={() => {
                setSellerId(db.sellers[0]?.id ?? "");
                setCreateOpen(true);
              }}
            >
              Novo lote
            </button>
          </>
        }
      />

      <AdminMetricsRow>
        <AdminMetricCard label="Lotes" value={String(metrics.total)} />
        <AdminMetricCard label="Pendentes (R$)" value={formatMoney(metrics.pending)} />
        <AdminMetricCard label="Pagos (R$)" value={formatMoney(metrics.paid)} />
        <AdminMetricCard label="Em processamento" value={String(metrics.processing)} />
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
              setStatus(e.target.value as Payout["status"] | "all");
              setPage(1);
            }}
          >
            <option value="all">Todos</option>
            {(Object.keys(PAYOUT_STATUS_LABEL) as Payout["status"][]).map((key) => (
              <option key={key} value={key}>
                {PAYOUT_STATUS_LABEL[key]}
              </option>
            ))}
          </select>
        </Field>
      </AdminFilterBar>

      <AdminDataTable
        caption="Repasses"
        rows={paged.items}
        columns={[
          { key: "id", header: "Lote", render: (row) => row.id },
          {
            key: "seller",
            header: "Vendedor",
            render: (row) => (
              <Link
                href={`/admin/vendedores/${row.sellerId}`}
                className={sharedStyles.linkBtn}
              >
                {sellerName(row.sellerId)}
              </Link>
            ),
          },
          { key: "period", header: "Período", render: (row) => row.periodLabel },
          {
            key: "amount",
            header: "Valor",
            render: (row) => formatMoney(row.amountCents),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <AdminStatusBadge
                label={PAYOUT_STATUS_LABEL[row.status]}
                tone={
                  row.status === "paid"
                    ? "success"
                    : row.status === "failed"
                      ? "danger"
                      : "warning"
                }
              />
            ),
          },
          {
            key: "actions",
            header: "Ações",
            render: (row) => (
              <div className={sharedStyles.rowActions}>
                {row.status === "pending" ? (
                  <button
                    type="button"
                    className={sharedStyles.linkBtn}
                    onClick={() => {
                      refresh(repo.updatePayoutStatus(row.id, "processing"));
                      toast.push("Marcado como processando");
                    }}
                  >
                    Processar
                  </button>
                ) : null}
                {row.status === "processing" ? (
                  <button
                    type="button"
                    className={sharedStyles.linkBtn}
                    onClick={() => {
                      refresh(repo.updatePayoutStatus(row.id, "paid"));
                      toast.push("Repasse pago");
                    }}
                  >
                    Marcar pago
                  </button>
                ) : null}
              </div>
            ),
          },
        ]}
        mobileCard={(row) => (
          <>
            <strong>{row.periodLabel}</strong>
            <span>{sellerName(row.sellerId)}</span>
            <span>{formatMoney(row.amountCents)}</span>
            <AdminStatusBadge label={PAYOUT_STATUS_LABEL[row.status]} />
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
        title="Novo lote de repasse"
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
            <button type="button" className={sharedStyles.btn} onClick={createBatch}>
              Criar
            </button>
          </>
        }
      >
        <div className={sharedStyles.stack}>
          <Field label="Vendedor">
            <select value={sellerId} onChange={(e) => setSellerId(e.target.value)}>
              {db.sellers.map((seller) => (
                <option key={seller.id} value={seller.id}>
                  {seller.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Valor (R$)">
            <input value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Período">
            <input value={period} onChange={(e) => setPeriod(e.target.value)} />
          </Field>
        </div>
      </AdminModal>
    </div>
  );
}
