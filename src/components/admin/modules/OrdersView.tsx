"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  canTransitionOrder,
} from "@/features/admin/domain/status";
import type { AdminOrder, OrderStatus } from "@/features/admin/domain/types";
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

function orderTone(status: OrderStatus) {
  if (status === "delivered" || status === "paid") return "success" as const;
  if (status === "pending_payment" || status === "processing") return "warning" as const;
  if (status === "cancelled" || status === "refunded") return "danger" as const;
  return "info" as const;
}

export function OrdersView() {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);

  const customerName = useMemo(() => {
    const map = new Map(db.customers.map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? id;
  }, [db.customers]);

  const filtered = useMemo(() => {
    const list = db.orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      return includesQuery(
        `${order.code} ${customerName(order.customerId)} ${order.city}`,
        query,
      );
    });
    return sortBy(list, (o) => o.createdAt, "desc");
  }, [db.orders, query, status, customerName]);

  const paged = paginate(filtered, page, 8);

  const metrics = useMemo(() => {
    const open = db.orders.filter(
      (o) => !["cancelled", "refunded", "delivered"].includes(o.status),
    ).length;
    const pendingPay = db.orders.filter((o) => o.status === "pending_payment").length;
    const revenue = db.orders
      .filter((o) => !["cancelled", "refunded"].includes(o.status))
      .reduce((sum, o) => sum + o.totalCents, 0);
    return { total: db.orders.length, open, pendingPay, revenue };
  }, [db.orders]);

  function transition(order: AdminOrder, next: OrderStatus) {
    if (!canTransitionOrder(order.status, next)) {
      toast.push("Transição não permitida", "error");
      return;
    }
    try {
      refresh(repo.updateOrderStatus(order.id, next));
      toast.push(`Pedido → ${ORDER_STATUS_LABEL[next]}`);
    } catch {
      toast.push("Falha na transição", "error");
    }
  }

  function exportCsv() {
    downloadCsv(
      "pedidos.csv",
      toCsv(
        ["Código", "Cliente", "Status", "Pagamento", "Total", "Data"],
        filtered.map((o) => [
          o.code,
          customerName(o.customerId),
          ORDER_STATUS_LABEL[o.status],
          PAYMENT_STATUS_LABEL[o.paymentStatus],
          formatMoney(o.totalCents),
          formatDate(o.createdAt),
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
        title="Pedidos"
        description="Acompanhe e avance status apenas pelas transições permitidas."
        actions={
          <button type="button" className={sharedStyles.btnSecondary} onClick={exportCsv}>
            Exportar CSV
          </button>
        }
      />

      <AdminMetricsRow>
        <AdminMetricCard label="Total" value={String(metrics.total)} />
        <AdminMetricCard label="Em aberto" value={String(metrics.open)} />
        <AdminMetricCard label="Aguardando pag." value={String(metrics.pendingPay)} />
        <AdminMetricCard label="Receita" value={formatMoney(metrics.revenue)} />
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
              setStatus(e.target.value as OrderStatus | "all");
              setPage(1);
            }}
          >
            <option value="all">Todos</option>
            {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((key) => (
              <option key={key} value={key}>
                {ORDER_STATUS_LABEL[key]}
              </option>
            ))}
          </select>
        </Field>
      </AdminFilterBar>

      <AdminDataTable
        caption="Pedidos"
        rows={paged.items}
        columns={[
          {
            key: "code",
            header: "Pedido",
            render: (row) => (
              <Link href={`/admin/pedidos/${row.id}`} className={sharedStyles.linkBtn}>
                {row.code}
              </Link>
            ),
          },
          {
            key: "customer",
            header: "Cliente",
            render: (row) => customerName(row.customerId),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <AdminStatusBadge
                label={ORDER_STATUS_LABEL[row.status]}
                tone={orderTone(row.status)}
              />
            ),
          },
          {
            key: "payment",
            header: "Pagamento",
            render: (row) => PAYMENT_STATUS_LABEL[row.paymentStatus],
          },
          {
            key: "total",
            header: "Total",
            render: (row) => formatMoney(row.totalCents),
          },
          {
            key: "actions",
            header: "Ações",
            render: (row) => (
              <div className={sharedStyles.rowActions}>
                {row.status === "pending_payment" ? (
                  <button
                    type="button"
                    className={sharedStyles.linkBtn}
                    onClick={() => transition(row, "paid")}
                  >
                    Marcar pago
                  </button>
                ) : null}
                {canTransitionOrder(row.status, "processing") ? (
                  <button
                    type="button"
                    className={sharedStyles.linkBtn}
                    onClick={() => transition(row, "processing")}
                  >
                    Separar
                  </button>
                ) : null}
                {canTransitionOrder(row.status, "shipped") ? (
                  <button
                    type="button"
                    className={sharedStyles.linkBtn}
                    onClick={() => transition(row, "shipped")}
                  >
                    Enviar
                  </button>
                ) : null}
              </div>
            ),
          },
        ]}
        mobileCard={(row) => (
          <>
            <Link href={`/admin/pedidos/${row.id}`} className={sharedStyles.linkBtn}>
              {row.code}
            </Link>
            <span>{customerName(row.customerId)}</span>
            <AdminStatusBadge
              label={ORDER_STATUS_LABEL[row.status]}
              tone={orderTone(row.status)}
            />
            <span>{formatMoney(row.totalCents)}</span>
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
