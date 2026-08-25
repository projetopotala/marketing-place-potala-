"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { SHIPMENT_STATUS_LABEL } from "@/features/admin/domain/status";
import type { Shipment, ShipmentStatus } from "@/features/admin/domain/types";
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

const EDITABLE: ShipmentStatus[] = [
  "posted",
  "in_transit",
  "delivered",
  "delayed",
  "returned",
];

function shipmentTone(status: ShipmentStatus) {
  if (status === "delivered") return "success" as const;
  if (status === "delayed" || status === "returned") return "danger" as const;
  if (status === "in_transit" || status === "posted") return "info" as const;
  return "warning" as const;
}

export function ShipmentsView() {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ShipmentStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<Shipment | null>(null);
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [nextStatus, setNextStatus] = useState<ShipmentStatus>("posted");

  const orderCode = useMemo(() => {
    const map = new Map(db.orders.map((o) => [o.id, o.code]));
    return (id: string) => map.get(id) ?? id;
  }, [db.orders]);

  const filtered = useMemo(() => {
    const list = db.shipments.filter((shipment) => {
      if (status !== "all" && shipment.status !== status) return false;
      return includesQuery(
        `${orderCode(shipment.orderId)} ${shipment.carrier} ${shipment.trackingCode} ${shipment.destination}`,
        query,
      );
    });
    return sortBy(list, (s) => s.updatedAt, "desc");
  }, [db.shipments, query, status, orderCode]);

  const paged = paginate(filtered, page, 8);

  const metrics = useMemo(
    () => ({
      total: db.shipments.length,
      transit: db.shipments.filter((s) => s.status === "in_transit").length,
      delayed: db.shipments.filter((s) => s.delayed || s.status === "delayed").length,
      delivered: db.shipments.filter((s) => s.status === "delivered").length,
    }),
    [db.shipments],
  );

  function openEdit(shipment: Shipment) {
    setEdit(shipment);
    setCarrier(shipment.carrier);
    setTracking(shipment.trackingCode);
    setNextStatus(
      EDITABLE.includes(shipment.status) ? shipment.status : "posted",
    );
  }

  function save() {
    if (!edit) return;
    refresh(
      repo.updateShipmentStatus(edit.id, nextStatus, {
        carrier: carrier.trim() || edit.carrier,
        trackingCode: tracking.trim(),
        delayed: nextStatus === "delayed",
      }),
    );
    setEdit(null);
    toast.push("Entrega atualizada");
  }

  function exportCsv() {
    downloadCsv(
      "entregas.csv",
      toCsv(
        ["Pedido", "Transportadora", "Rastreio", "Status", "Destino", "ETA"],
        filtered.map((s) => [
          orderCode(s.orderId),
          s.carrier,
          s.trackingCode,
          SHIPMENT_STATUS_LABEL[s.status],
          s.destination,
          formatDate(s.eta),
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
        title="Entregas"
        description="Atualize rastreio, transportadora e status das remessas."
        actions={
          <button type="button" className={sharedStyles.btnSecondary} onClick={exportCsv}>
            Exportar CSV
          </button>
        }
      />

      <AdminMetricsRow>
        <AdminMetricCard label="Total" value={String(metrics.total)} />
        <AdminMetricCard label="Em trânsito" value={String(metrics.transit)} />
        <AdminMetricCard label="Atrasadas" value={String(metrics.delayed)} />
        <AdminMetricCard label="Entregues" value={String(metrics.delivered)} />
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
              setStatus(e.target.value as ShipmentStatus | "all");
              setPage(1);
            }}
          >
            <option value="all">Todos</option>
            {(Object.keys(SHIPMENT_STATUS_LABEL) as ShipmentStatus[]).map((key) => (
              <option key={key} value={key}>
                {SHIPMENT_STATUS_LABEL[key]}
              </option>
            ))}
          </select>
        </Field>
      </AdminFilterBar>

      <AdminDataTable
        caption="Entregas"
        rows={paged.items}
        columns={[
          {
            key: "order",
            header: "Pedido",
            render: (row) => (
              <Link href={`/admin/pedidos/${row.orderId}`} className={sharedStyles.linkBtn}>
                {orderCode(row.orderId)}
              </Link>
            ),
          },
          { key: "carrier", header: "Transportadora", render: (row) => row.carrier },
          {
            key: "tracking",
            header: "Rastreio",
            render: (row) => row.trackingCode || "—",
          },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <AdminStatusBadge
                label={SHIPMENT_STATUS_LABEL[row.status]}
                tone={shipmentTone(row.status)}
              />
            ),
          },
          { key: "destination", header: "Destino", render: (row) => row.destination },
          {
            key: "actions",
            header: "Ações",
            render: (row) => (
              <button
                type="button"
                className={sharedStyles.linkBtn}
                onClick={() => openEdit(row)}
              >
                Atualizar
              </button>
            ),
          },
        ]}
        mobileCard={(row) => (
          <>
            <Link href={`/admin/pedidos/${row.orderId}`} className={sharedStyles.linkBtn}>
              {orderCode(row.orderId)}
            </Link>
            <span>
              {row.carrier} · {row.trackingCode || "sem rastreio"}
            </span>
            <AdminStatusBadge
              label={SHIPMENT_STATUS_LABEL[row.status]}
              tone={shipmentTone(row.status)}
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
        open={Boolean(edit)}
        title="Atualizar entrega"
        onClose={() => setEdit(null)}
        actions={
          <>
            <button
              type="button"
              className={sharedStyles.btnGhost}
              onClick={() => setEdit(null)}
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
          <Field label="Transportadora">
            <input value={carrier} onChange={(e) => setCarrier(e.target.value)} />
          </Field>
          <Field label="Código de rastreio">
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} />
          </Field>
          <Field label="Status">
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value as ShipmentStatus)}
            >
              {EDITABLE.map((key) => (
                <option key={key} value={key}>
                  {SHIPMENT_STATUS_LABEL[key]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </AdminModal>
    </div>
  );
}
