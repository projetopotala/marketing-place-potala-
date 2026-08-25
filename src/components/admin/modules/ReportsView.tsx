"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import type { ReportKind } from "@/features/admin/domain/types";
import { buildReport } from "@/features/admin/selectors/reportSelectors";
import { downloadCsv, toCsv } from "@/features/admin/utils/csv";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  AdminMetricCard,
  AdminMetricsRow,
} from "@/components/admin/shared/AdminMetricCard";
import { sharedStyles } from "@/components/admin/shared/AdminDataTable";
import { AdminFilterBar, Field } from "@/components/admin/shared/AdminStatusBadge";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import moduleStyles from "./modules.module.css";

const KINDS: Array<{ value: ReportKind; label: string }> = [
  { value: "sales", label: "Vendas" },
  { value: "orders", label: "Pedidos" },
  { value: "sellers", label: "Vendedores" },
  { value: "products", label: "Produtos" },
  { value: "customers", label: "Clientes" },
  { value: "shipments", label: "Entregas" },
  { value: "finance", label: "Financeiro" },
  { value: "contents", label: "Conteúdos" },
];

export function ReportsView() {
  const { db, isHydrated } = useAdminData();
  const toast = useAdminToast();
  const [kind, setKind] = useState<ReportKind>("sales");
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState("2026-12-31");

  const report = useMemo(
    () =>
      buildReport(
        db,
        kind,
        from ? `${from}T00:00:00.000Z` : undefined,
        to ? `${to}T23:59:59.999Z` : undefined,
      ),
    [db, kind, from, to],
  );

  const chartValues = useMemo(() => {
    return report.rows.slice(0, 8).map((row, index) => {
      const numeric = row
        .map((cell) => Number(cell.replace(/[^\d.-]/g, "")))
        .find((n) => Number.isFinite(n) && n > 0);
      return {
        label: row[0] ?? `#${index + 1}`,
        value: numeric && numeric > 0 ? numeric : Math.max(1, row.length),
      };
    });
  }, [report.rows]);

  const maxChart = Math.max(...chartValues.map((c) => c.value), 1);

  function exportCsv() {
    downloadCsv(
      `relatorio-${kind}.csv`,
      toCsv(report.headers, report.rows),
    );
    toast.push("Relatório CSV exportado (UTF-8 BOM)");
  }

  if (!isHydrated) {
    return <div className={sharedStyles.skeleton} aria-busy="true" />;
  }

  return (
    <div className={sharedStyles.stack}>
      <AdminPageHeader
        title="Relatórios"
        description="Selecione o tipo, período e exporte com BOM para Excel."
        actions={
          <button type="button" className={sharedStyles.btnSecondary} onClick={exportCsv}>
            Exportar CSV
          </button>
        }
      />

      <AdminFilterBar>
        <Field label="Tipo">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ReportKind)}
          >
            {KINDS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="De">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="Até">
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </AdminFilterBar>

      <AdminMetricsRow>
        {report.summary.map((item) => (
          <AdminMetricCard key={item.label} label={item.label} value={item.value} />
        ))}
      </AdminMetricsRow>

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Distribuição (barras SVG)</h2>
        <svg
          viewBox="0 0 640 200"
          role="img"
          aria-label="Gráfico de barras do relatório"
          style={{ width: "100%", height: "auto" }}
        >
          {chartValues.map((item, index) => {
            const barW = 640 / Math.max(chartValues.length, 1) / 1.6;
            const gap = 640 / Math.max(chartValues.length, 1);
            const x = index * gap + (gap - barW) / 2;
            const h = (item.value / maxChart) * 140;
            const y = 160 - h;
            return (
              <g key={`${item.label}-${index}`}>
                <rect x={x} y={y} width={barW} height={h} rx="4" fill="rgba(110,168,216,0.78)" />
                <text
                  x={x + barW / 2}
                  y={180}
                  textAnchor="middle"
                  fill="#91a2b8"
                  fontSize="10"
                >
                  {item.label.slice(0, 10)}
                </text>
              </g>
            );
          })}
        </svg>
        {chartValues.length === 0 ? (
          <p className={moduleStyles.muted}>Sem dados no período.</p>
        ) : null}
      </div>

      <div className={sharedStyles.panel}>
        <h2 className={sharedStyles.panelTitle}>Tabela</h2>
        {report.rows.length === 0 ? (
          <p className={moduleStyles.muted}>Nenhum registro no filtro.</p>
        ) : (
          <div className={sharedStyles.tableWrap}>
            <table className={sharedStyles.table}>
              <thead>
                <tr>
                  {report.headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.slice(0, 50).map((row, index) => (
                  <tr key={`${row[0]}-${index}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${cellIndex}-${cell}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
