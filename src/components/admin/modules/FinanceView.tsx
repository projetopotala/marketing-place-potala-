"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { PAYMENT_STATUS_LABEL } from "@/features/admin/domain/status";
import type { FinancialTransaction, PaymentStatus } from "@/features/admin/domain/types";
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
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import { PaymentMethodsChart } from "@/components/admin/charts/PaymentMethodsChart";
import { FinanceRevenueChart } from "@/components/admin/charts/FinanceRevenueChart";
import { WalletCards } from "lucide-react";
import moduleStyles from "./modules.module.css";

export function FinanceView() {
  const { db, isHydrated } = useAdminData();
  const toast = useAdminToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const [page, setPage] = useState(1);

  const sellerName = useMemo(() => {
    const map = new Map(db.sellers.map((s) => [s.id, s.name]));
    return (id: string) => map.get(id) ?? id;
  }, [db.sellers]);

  const summary = useMemo(() => {
    const approved = db.transactions.filter((t) => t.paymentStatus === "approved");
    const gross = approved.reduce((sum, t) => sum + t.grossCents, 0);
    const fees = approved.reduce((sum, t) => sum + t.feeCents, 0);
    const commission = approved.reduce((sum, t) => sum + t.commissionCents, 0);
    const net = approved.reduce((sum, t) => sum + t.netCents, 0);
    return { gross, fees, commission, net, count: approved.length };
  }, [db.transactions]);

  const methodBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const txn of db.transactions.filter((t) => t.paymentStatus === "approved")) {
      map.set(txn.paymentMethod, (map.get(txn.paymentMethod) ?? 0) + txn.grossCents);
    }
    return [...map.entries()].map(([method, value]) => ({ method, value }));
  }, [db.transactions]);

  const sellerRanking = useMemo(() => {
    const map = new Map<string, number>();
    for (const txn of db.transactions.filter((t) => t.paymentStatus === "approved")) {
      map.set(txn.sellerId, (map.get(txn.sellerId) ?? 0) + txn.netCents);
    }
    return [...map.entries()]
      .map(([sellerId, net]) => ({ sellerId, net, name: sellerName(sellerId) }))
      .sort((a, b) => b.net - a.net)
      .slice(0, 5);
  }, [db.transactions, sellerName]);

  const revenueSeries = useMemo(() => {
    const buckets = new Map<string, { grossCents: number; netCents: number }>();
    for (const txn of db.transactions.filter((t) => t.paymentStatus === "approved")) {
      const key = txn.createdAt.slice(0, 10);
      const current = buckets.get(key) ?? { grossCents: 0, netCents: 0 };
      current.grossCents += txn.grossCents;
      current.netCents += txn.netCents;
      buckets.set(key, current);
    }
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([iso, values]) => ({
        label: new Date(iso).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        }),
        ...values,
      }));
  }, [db.transactions]);

  const filtered = useMemo(() => {
    const list = db.transactions.filter((txn) => {
      if (status !== "all" && txn.paymentStatus !== status) return false;
      return includesQuery(
        `${txn.id} ${txn.orderId} ${sellerName(txn.sellerId)} ${txn.paymentMethod}`,
        query,
      );
    });
    return sortBy(list, (t) => t.createdAt, "desc");
  }, [db.transactions, query, status, sellerName]);

  const paged = paginate(filtered, page, 8);

  function exportCsv() {
    downloadCsv(
      "financeiro-transacoes.csv",
      toCsv(
        ["ID", "Pedido", "Vendedor", "Bruto", "Taxa", "Comissão", "Líquido", "Status"],
        filtered.map((t) => [
          t.id,
          t.orderId,
          sellerName(t.sellerId),
          formatMoney(t.grossCents),
          formatMoney(t.feeCents),
          formatMoney(t.commissionCents),
          formatMoney(t.netCents),
          PAYMENT_STATUS_LABEL[t.paymentStatus],
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
        title="Financeiro"
        description="Resumo de receitas, métodos de pagamento e ranking de sellers."
        icon={<WalletCards size={18} strokeWidth={1.75} aria-hidden="true" />}
        actions={
          <>
            <Link href="/admin/financeiro/integracoes" className={sharedStyles.btnGhost}>
              Integrações
            </Link>
            <Link href="/admin/financeiro/repasses" className={sharedStyles.btnGhost}>
              Repasses
            </Link>
            <button type="button" className={sharedStyles.btnSecondary} onClick={exportCsv}>
              Exportar CSV
            </button>
          </>
        }
      />

      <AdminMetricsRow>
        <AdminMetricCard label="Bruto aprovado" value={formatMoney(summary.gross)} />
        <AdminMetricCard label="Taxas" value={formatMoney(summary.fees)} />
        <AdminMetricCard label="Comissões" value={formatMoney(summary.commission)} />
        <AdminMetricCard label="Líquido sellers" value={formatMoney(summary.net)} />
      </AdminMetricsRow>

      <div className={sharedStyles.grid2}>
        <div className={sharedStyles.panel}>
          <h2 className={sharedStyles.panelTitle}>Evolução da receita</h2>
          <FinanceRevenueChart data={revenueSeries} />
        </div>
        <div className={sharedStyles.panel}>
          <h2 className={sharedStyles.panelTitle}>Métodos de pagamento</h2>
          <PaymentMethodsChart data={methodBreakdown} />
        </div>
      </div>

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Ranking de vendedores</h2>
        <ul className={moduleStyles.timeline}>
          {sellerRanking.map((item) => (
            <li key={item.sellerId} className={moduleStyles.timelineItem}>
              <Link
                href={`/admin/vendedores/${item.sellerId}`}
                className={sharedStyles.linkBtn}
              >
                {item.name}
              </Link>
              <p className={moduleStyles.timelineDetail}>{formatMoney(item.net)}</p>
            </li>
          ))}
        </ul>
      </div>

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
              setStatus(e.target.value as PaymentStatus | "all");
              setPage(1);
            }}
          >
            <option value="all">Todos</option>
            {(Object.keys(PAYMENT_STATUS_LABEL) as PaymentStatus[]).map((key) => (
              <option key={key} value={key}>
                {PAYMENT_STATUS_LABEL[key]}
              </option>
            ))}
          </select>
        </Field>
      </AdminFilterBar>

      <AdminDataTable
        caption="Transações"
        rows={paged.items}
        columns={[
          {
            key: "id",
            header: "Transação",
            render: (row: FinancialTransaction) => (
              <Link
                href={`/admin/financeiro/transacoes/${row.id}`}
                className={sharedStyles.linkBtn}
              >
                {row.id}
              </Link>
            ),
          },
          {
            key: "order",
            header: "Pedido",
            render: (row) => (
              <Link href={`/admin/pedidos/${row.orderId}`} className={sharedStyles.linkBtn}>
                {db.orders.find((o) => o.id === row.orderId)?.code ?? row.orderId}
              </Link>
            ),
          },
          {
            key: "seller",
            header: "Vendedor",
            render: (row) => sellerName(row.sellerId),
          },
          {
            key: "gross",
            header: "Bruto",
            render: (row) => formatMoney(row.grossCents),
          },
          {
            key: "net",
            header: "Líquido",
            render: (row) => formatMoney(row.netCents),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <AdminStatusBadge
                label={PAYMENT_STATUS_LABEL[row.paymentStatus]}
                tone={
                  row.paymentStatus === "approved"
                    ? "success"
                    : row.paymentStatus === "refunded"
                      ? "danger"
                      : "warning"
                }
              />
            ),
          },
          {
            key: "date",
            header: "Data",
            render: (row) => formatDate(row.createdAt),
          },
        ]}
        mobileCard={(row) => (
          <>
            <Link
              href={`/admin/financeiro/transacoes/${row.id}`}
              className={sharedStyles.linkBtn}
            >
              {row.id}
            </Link>
            <span>{formatMoney(row.grossCents)}</span>
            <AdminStatusBadge label={PAYMENT_STATUS_LABEL[row.paymentStatus]} />
          </>
        )}
      />

      <AdminPagination
        page={paged.page}
        pages={paged.pages}
        total={paged.total}
        onChange={setPage}
      />
    </div>
  );
}
