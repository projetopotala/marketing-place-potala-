"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChartNoAxesCombined,
  Package,
  ShoppingBag,
  Store,
  Truck,
  WalletCards,
} from "lucide-react";
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
import {
  AdminMetricCard,
} from "@/components/admin/shared/AdminMetricCard";
import { AdminStatusBadge } from "@/components/admin/shared/AdminStatusBadge";
import { sharedStyles } from "@/components/admin/shared/AdminDataTable";
import { SalesPerformanceChart } from "@/components/admin/charts/SalesPerformanceChart";
import { SalesByCategoryChart } from "@/components/admin/charts/SalesByCategoryChart";
import { MarketplaceGrowthChart } from "@/components/admin/charts/MarketplaceGrowthChart";
import { FadeIn } from "@/components/ui/motion/FadeIn";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion/StaggerContainer";
import adminStyles from "@/components/admin/admin.module.css";
import type { SellerStatus } from "@/features/admin/domain/types";
import type { LucideIcon } from "lucide-react";

function sellerTone(status: SellerStatus) {
  if (status === "active") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "suspended") return "danger" as const;
  return "muted" as const;
}

const METRIC_ICONS: Record<string, LucideIcon> = {
  sellers: Store,
  products: Package,
  "orders-today": ShoppingBag,
  "sales-month": ChartNoAxesCombined,
  revenue: WalletCards,
  shipments: Truck,
};

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

  return (
    <div className={sharedStyles.stack}>
      <FadeIn>
        <AdminPageHeader
          title="Painel do Marketplace"
          description="Visão geral e controle completo do seu ecossistema espiritual"
          icon={
            <ChartNoAxesCombined size={18} strokeWidth={1.75} aria-hidden="true" />
          }
        />
      </FadeIn>

      <StaggerContainer className={sharedStyles.metrics}>
        {metrics.map((metric) => (
          <StaggerItem key={metric.id}>
            <AdminMetricCard
              label={metric.label}
              value={metric.value}
              hint={metric.hint}
              icon={METRIC_ICONS[metric.id]}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>

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
          <SalesPerformanceChart data={sales} />
        </div>

        <div className={adminStyles.panel}>
          <div className={adminStyles.panelHead}>
            <h2 className={adminStyles.panelTitle}>Vendas por Categoria</h2>
          </div>
          <SalesByCategoryChart data={categories} />
        </div>

        <div className={adminStyles.panel}>
          <div className={adminStyles.panelHead}>
            <h2 className={adminStyles.panelTitle}>Crescimento do marketplace</h2>
          </div>
          <MarketplaceGrowthChart data={sales} />
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
