"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import {
  selectAlerts,
  selectCategorySales,
  selectDashboardMetrics,
  selectFeaturedSellers,
  selectFinancialSummary,
  selectPendingApprovals,
  selectRecentOrders,
  selectSalesPerformance,
  selectTopProducts,
} from "@/features/admin/selectors/dashboardSelectors";
import {
  ORDER_STATUS_LABEL,
  SELLER_STATUS_LABEL,
} from "@/features/admin/domain/status";
import { formatMoney } from "@/features/admin/utils/currency";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminMetricCard, AdminMetricsRow } from "@/components/admin/shared/AdminMetricCard";
import { AdminStatusBadge } from "@/components/admin/shared/AdminStatusBadge";
import { sharedStyles } from "@/components/admin/shared/AdminDataTable";
import adminStyles from "@/components/admin/admin.module.css";
import type { SellerStatus } from "@/features/admin/domain/types";

function sellerTone(status: SellerStatus) {
  if (status === "active") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "suspended") return "danger" as const;
  return "muted" as const;
}

export function DashboardView() {
  const { db, isHydrated } = useAdminData();
  const [days, setDays] = useState(30);

  const metrics = useMemo(() => selectDashboardMetrics(db), [db]);
  const sales = useMemo(() => selectSalesPerformance(db, days), [db, days]);
  const categories = useMemo(() => selectCategorySales(db), [db]);
  const featured = useMemo(() => selectFeaturedSellers(db), [db]);
  const recent = useMemo(() => selectRecentOrders(db), [db]);
  const financial = useMemo(() => selectFinancialSummary(db), [db]);
  const alerts = useMemo(() => selectAlerts(db), [db]);
  const approvals = useMemo(() => selectPendingApprovals(db), [db]);
  const topProducts = useMemo(() => selectTopProducts(db), [db]);

  if (!isHydrated) {
    return <div className={sharedStyles.skeleton} aria-busy="true" />;
  }

  const maxRevenue = Math.max(...sales.map((p) => p.revenueCents), 1);
  const maxOrders = Math.max(...sales.map((p) => p.orders), 1);
  const width = 640;
  const height = 220;
  const pad = { top: 16, right: 16, bottom: 36, left: 44 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const barWidth = innerW / Math.max(sales.length, 1) / 1.8;
  const totalCategory = categories.reduce((sum, c) => sum + c.value, 0) || 1;
  const segments = categories.reduce<
    Array<(typeof categories)[number] & { start: number; end: number }>
  >((acc, item) => {
    const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
    const pct = (item.value / totalCategory) * 100;
    acc.push({ ...item, start, end: start + pct });
    return acc;
  }, []);
  const gradient =
    segments.length > 0
      ? segments.map((s) => `${s.color} ${s.start}% ${s.end}%`).join(", ")
      : "var(--admin-elevated) 0% 100%";

  const growthPoints = sales.map((point, index) => {
    const x = pad.left + (index + 0.5) * (innerW / Math.max(sales.length, 1));
    const y = pad.top + innerH - (point.orders / maxOrders) * innerH * 0.85;
    return `${x},${y}`;
  });

  return (
    <div className={sharedStyles.stack}>
      <AdminPageHeader
        title="Painel do Marketplace"
        description="Visão geral e controle completo do seu ecossistema espiritual"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 19V5m0 14h16M7 15l3.5-4 2.5 2.5L17 8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      />

      <AdminMetricsRow>
        {metrics.map((metric) => (
          <AdminMetricCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
          />
        ))}
      </AdminMetricsRow>

      <section className={adminStyles.chartsRow} aria-label="Gráficos">
        <div className={adminStyles.panel}>
          <div className={adminStyles.panelHead}>
            <h2 className={adminStyles.panelTitle}>Desempenho de Vendas</h2>
            <label>
              <span className="sr-only">Período</span>
              <select
                className={adminStyles.select}
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
                aria-label="Período do gráfico"
              >
                <option value={7}>Últimos 7 dias</option>
                <option value={30}>Últimos 30 dias</option>
                <option value={90}>Últimos 90 dias</option>
              </select>
            </label>
          </div>
          <svg
            className={adminStyles.chartSvg}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Gráfico de receita e pedidos"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = pad.top + innerH * (1 - ratio);
              return (
                <line
                  key={ratio}
                  x1={pad.left}
                  x2={width - pad.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(145,162,184,0.18)"
                />
              );
            })}
            {sales.map((point, index) => {
              const xCenter =
                pad.left + (index + 0.5) * (innerW / Math.max(sales.length, 1));
              const barH = (point.revenueCents / maxRevenue) * innerH;
              const y = pad.top + innerH - barH;
              return (
                <g key={`${point.label}-${index}`}>
                  <rect
                    x={xCenter - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx="4"
                    fill="rgba(110, 168, 216, 0.78)"
                  />
                  <text
                    x={xCenter}
                    y={height - 12}
                    textAnchor="middle"
                    fill="#91a2b8"
                    fontSize="11"
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
            <polyline
              points={growthPoints.join(" ")}
              fill="none"
              stroke="#d5a64f"
              strokeWidth="2.5"
            />
          </svg>
          <div className={adminStyles.legend}>
            <span className={adminStyles.legendItem}>
              <span className={adminStyles.swatchBar} /> Receita
            </span>
            <span className={adminStyles.legendItem}>
              <span className={adminStyles.swatchLine} /> Pedidos
            </span>
          </div>
        </div>

        <div className={adminStyles.panel}>
          <div className={adminStyles.panelHead}>
            <h2 className={adminStyles.panelTitle}>Vendas por Categoria</h2>
          </div>
          <div className={adminStyles.donutWrap}>
            <div
              className={adminStyles.donut}
              style={{ background: `conic-gradient(${gradient})` }}
              role="img"
              aria-label="Distribuição por categoria"
            >
              <div className={adminStyles.donutHole}>
                <span className={adminStyles.donutTotalLabel}>Total</span>
                <span className={adminStyles.donutTotal}>
                  {formatMoney(totalCategory)}
                </span>
              </div>
            </div>
            <ul className={adminStyles.catLegend}>
              {categories.map((item) => (
                <li key={item.id} className={adminStyles.catRow}>
                  <span
                    className={adminStyles.catDot}
                    style={{ background: item.color }}
                  />
                  <span className={adminStyles.catLabel}>{item.label}</span>
                  <span className={adminStyles.catValue}>
                    {formatMoney(item.value)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={adminStyles.panel}>
          <div className={adminStyles.panelHead}>
            <h2 className={adminStyles.panelTitle}>Crescimento do marketplace</h2>
          </div>
          <svg
            className={adminStyles.chartSvg}
            viewBox="0 0 320 160"
            role="img"
            aria-label="Linha de crescimento de pedidos"
          >
            <polyline
              points={growthPoints
                .map((pair, index) => {
                  const [, y] = pair.split(",");
                  const x = 20 + index * (280 / Math.max(growthPoints.length - 1, 1));
                  return `${x},${Number(y) * 0.6}`;
                })
                .join(" ")}
              fill="none"
              stroke="#d5a64f"
              strokeWidth="2.5"
            />
          </svg>
          <p className={adminStyles.pageSubtitle}>
            Tendência de pedidos no período selecionado (dados demonstrativos).
          </p>
        </div>
      </section>

      <section className={adminStyles.tablesRow}>
        <div className={adminStyles.panel}>
          <div className={adminStyles.panelHead}>
            <h2 className={adminStyles.panelTitle}>Vendedores em destaque</h2>
            <Link href="/admin/vendedores" className={sharedStyles.linkBtn}>
              Ver todos
            </Link>
          </div>
          <div className={adminStyles.tableScroll}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>Loja</th>
                  <th>Status</th>
                  <th>Produtos</th>
                  <th>Pedidos</th>
                  <th>Comissão</th>
                </tr>
              </thead>
              <tbody>
                {featured.map((seller) => (
                  <tr key={seller.id}>
                    <td>
                      <Link
                        href={`/admin/vendedores/${seller.id}`}
                        className={sharedStyles.linkBtn}
                      >
                        {seller.name}
                      </Link>
                    </td>
                    <td>
                      <AdminStatusBadge
                        label={SELLER_STATUS_LABEL[seller.status]}
                        tone={sellerTone(seller.status)}
                      />
                    </td>
                    <td>{seller.products}</td>
                    <td>{seller.orders}</td>
                    <td>{seller.commission}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={adminStyles.panel}>
          <div className={adminStyles.panelHead}>
            <h2 className={adminStyles.panelTitle}>Pedidos recentes</h2>
            <Link href="/admin/pedidos" className={sharedStyles.linkBtn}>
              Ver todos
            </Link>
          </div>
          <div className={adminStyles.tableScroll}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className={sharedStyles.linkBtn}
                      >
                        {order.code}
                      </Link>
                    </td>
                    <td>{order.customer}</td>
                    <td>{formatMoney(order.amountCents)}</td>
                    <td>
                      <AdminStatusBadge
                        label={ORDER_STATUS_LABEL[order.status]}
                        tone="info"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={adminStyles.bottomRow}>
        <div className={adminStyles.panel}>
          <h2 className={adminStyles.panelTitle}>Resumo financeiro</h2>
          <div className={adminStyles.financeList}>
            {financial.map((item) => (
              <div key={item.id} className={adminStyles.financeRow}>
                <span className={adminStyles.financeLabel}>{item.label}</span>
                <span className={adminStyles.financeValue}>
                  {formatMoney(item.valueCents)}
                </span>
              </div>
            ))}
          </div>
          <Link href="/admin/financeiro" className={sharedStyles.linkBtn}>
            Ver financeiro
          </Link>
        </div>

        <div className={adminStyles.panel}>
          <h2 className={adminStyles.panelTitle}>Alertas</h2>
          <div className={adminStyles.alertList}>
            {alerts.map((alert) => (
              <article key={alert.id} className={adminStyles.alertItem}>
                <h3 className={adminStyles.alertTitle}>{alert.title}</h3>
                <p className={adminStyles.alertDetail}>{alert.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className={adminStyles.panel}>
          <h2 className={adminStyles.panelTitle}>Aprovações pendentes</h2>
          <div className={adminStyles.approvalList}>
            {approvals.map((item) => (
              <article key={item.id} className={adminStyles.approvalItem}>
                <h3 className={adminStyles.approvalTitle}>
                  <Link href={item.href} className={sharedStyles.linkBtn}>
                    {item.title}
                  </Link>
                  <span className={adminStyles.approvalCount}>{item.count}</span>
                </h3>
                <p className={adminStyles.approvalDesc}>{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className={adminStyles.panel}>
          <h2 className={adminStyles.panelTitle}>Top produtos</h2>
          <div className={adminStyles.financeList}>
            {topProducts.map((product) => (
              <div key={product.id} className={adminStyles.financeRow}>
                <span className={adminStyles.financeLabel}>
                  {product.title} · {product.qty} un.
                </span>
                <span className={adminStyles.financeValue}>
                  {formatMoney(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
