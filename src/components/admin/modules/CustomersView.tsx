"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { CUSTOMER_STATUS_LABEL } from "@/features/admin/domain/status";
import type { Customer, CustomerStatus } from "@/features/admin/domain/types";
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
import { AdminConfirmDialog } from "@/components/admin/shared/AdminModal";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";

export function CustomersView() {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CustomerStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [blockTarget, setBlockTarget] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    const list = db.customers.filter((customer) => {
      if (status !== "all" && customer.status !== status) return false;
      return includesQuery(
        `${customer.name} ${customer.email} ${customer.city} ${customer.tags.join(" ")}`,
        query,
      );
    });
    return sortBy(list, (c) => c.name, "asc");
  }, [db.customers, query, status]);

  const paged = paginate(filtered, page, 8);

  const metrics = useMemo(
    () => ({
      total: db.customers.length,
      active: db.customers.filter((c) => c.status === "active").length,
      blocked: db.customers.filter((c) => c.status === "blocked").length,
      tagged: db.customers.filter((c) => c.tags.length > 0).length,
    }),
    [db.customers],
  );

  function exportCsv() {
    downloadCsv(
      "clientes.csv",
      toCsv(
        ["Nome", "E-mail", "Status", "Cidade", "Tags", "Criado"],
        filtered.map((c) => [
          c.name,
          c.email,
          CUSTOMER_STATUS_LABEL[c.status],
          `${c.city}/${c.state}`,
          c.tags.join("; "),
          formatDate(c.createdAt),
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
        title="Clientes"
        description="Bloqueie contas, edite notas e acompanhe tags."
        actions={
          <button type="button" className={sharedStyles.btnSecondary} onClick={exportCsv}>
            Exportar CSV
          </button>
        }
      />

      <AdminMetricsRow>
        <AdminMetricCard label="Total" value={String(metrics.total)} />
        <AdminMetricCard label="Ativos" value={String(metrics.active)} />
        <AdminMetricCard label="Bloqueados" value={String(metrics.blocked)} />
        <AdminMetricCard label="Com tags" value={String(metrics.tagged)} />
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
              setStatus(e.target.value as CustomerStatus | "all");
              setPage(1);
            }}
          >
            <option value="all">Todos</option>
            <option value="active">Ativo</option>
            <option value="blocked">Bloqueado</option>
          </select>
        </Field>
      </AdminFilterBar>

      <AdminDataTable
        caption="Clientes"
        rows={paged.items}
        columns={[
          {
            key: "name",
            header: "Cliente",
            render: (row) => (
              <Link href={`/admin/clientes/${row.id}`} className={sharedStyles.linkBtn}>
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
                label={CUSTOMER_STATUS_LABEL[row.status]}
                tone={row.status === "active" ? "success" : "danger"}
              />
            ),
          },
          {
            key: "city",
            header: "Cidade",
            render: (row) => `${row.city}/${row.state}`,
          },
          {
            key: "tags",
            header: "Tags",
            render: (row) => row.tags.join(", ") || "—",
          },
          {
            key: "actions",
            header: "Ações",
            render: (row) => (
              <button
                type="button"
                className={sharedStyles.linkBtn}
                onClick={() => setBlockTarget(row)}
              >
                {row.status === "active" ? "Bloquear" : "Desbloquear"}
              </button>
            ),
          },
        ]}
        mobileCard={(row) => (
          <>
            <Link href={`/admin/clientes/${row.id}`} className={sharedStyles.linkBtn}>
              {row.name}
            </Link>
            <span>{row.email}</span>
            <AdminStatusBadge
              label={CUSTOMER_STATUS_LABEL[row.status]}
              tone={row.status === "active" ? "success" : "danger"}
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

      <AdminConfirmDialog
        open={Boolean(blockTarget)}
        title={
          blockTarget?.status === "active" ? "Bloquear cliente" : "Desbloquear cliente"
        }
        description={`Confirma alterar o status de ${blockTarget?.name ?? ""}?`}
        confirmLabel="Confirmar"
        onClose={() => setBlockTarget(null)}
        onConfirm={() => {
          if (!blockTarget) return;
          const nextStatus: CustomerStatus =
            blockTarget.status === "active" ? "blocked" : "active";
          refresh(repo.changeCustomerStatus(blockTarget.id, nextStatus));
          setBlockTarget(null);
          toast.push(
            nextStatus === "blocked" ? "Cliente bloqueado" : "Cliente desbloqueado",
          );
        }}
      />
    </div>
  );
}
