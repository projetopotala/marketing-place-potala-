"use client";

import Link from "next/link";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { SalesPerformanceChart } from "@/components/admin/charts/SalesPerformanceChart";
import { useAdminData } from "@/features/admin/context/AdminDataContext";
import { formatMoney } from "@/features/admin/utils/currency";
import { ORDER_STATUS_LABEL } from "@/features/admin/domain/status";
import {
  buildSellerSalesSeries,
  selectSellerDashboardMetrics,
  selectSellerOrders,
} from "@/features/seller/selectors";
import { useSellerId } from "@/features/seller/useSellerId";
import styles from "@/components/seller/seller.module.css";

const PIE_COLORS = ["#d5a64f", "#5b8fb9", "#c95c57"];

export function SellerDashboardView() {
  const sellerId = useSellerId();
  const { db, isHydrated } = useAdminData();

  if (!isHydrated || !sellerId) {
    return (
      <p role="status" aria-live="polite">
        Carregando métricas…
      </p>
    );
  }

  const metrics = selectSellerDashboardMetrics(db, sellerId);
  const orders = selectSellerOrders(db, sellerId);
  const series = buildSellerSalesSeries(orders);
  const alerts: string[] = [];

  if (metrics.lowStock > 0) {
    alerts.push(`${metrics.lowStock} produto(s) com estoque baixo.`);
  }
  if (orders.some((order) => order.status === "processing")) {
    alerts.push("Há pedidos em separação aguardando envio.");
  }

  return (
    <>
      <header>
        <h1 className={styles.pageTitle}>Painel</h1>
        <p className={styles.pageLead}>
          Indicadores derivados dos pedidos e produtos da sua loja demonstrativa.
        </p>
      </header>

      <section className={styles.metrics} aria-label="Indicadores">
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Vendas do período</p>
          <p className={styles.metricValue}>{formatMoney(metrics.salesCents)}</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Pedidos</p>
          <p className={styles.metricValue}>{metrics.ordersCount}</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Ticket médio</p>
          <p className={styles.metricValue}>
            {formatMoney(metrics.avgTicketCents)}
          </p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Saldo disponível</p>
          <p className={styles.metricValue}>
            {formatMoney(metrics.availableBalanceCents)}
          </p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Produtos ativos</p>
          <p className={styles.metricValue}>{metrics.activeProducts}</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Estoque baixo</p>
          <p className={styles.metricValue}>{metrics.lowStock}</p>
        </article>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: 16,
        }}
      >
        <SalesPerformanceChart data={series} />
        <section className={styles.panel} aria-label="Formas de pagamento">
          <h2 className={styles.panelTitle}>Pagamentos</h2>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.paymentBreakdown}
                  dataKey="value"
                  nameKey="method"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {metrics.paymentBreakdown.map((entry, index) => (
                    <Cell
                      key={entry.method}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              color: "var(--potala-text-secondary)",
            }}
          >
            {metrics.paymentBreakdown.map((item) => (
              <li key={item.method}>
                {item.method}: {item.value}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {alerts.length > 0 ? (
        <section className={styles.panel} aria-label="Alertas operacionais">
          <h2 className={styles.panelTitle}>Alertas</h2>
          <ul>
            {alerts.map((alert) => (
              <li key={alert}>{alert}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Pedidos recentes</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link
                      href={`/loja/pedidos/${order.id}`}
                      className={styles.rowLink}
                    >
                      {order.code}
                    </Link>
                  </td>
                  <td>
                    <span className={styles.badge}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td>{formatMoney(order.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Produtos em destaque</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Estoque</th>
                <th>Preço</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <Link
                      href={`/loja/produtos/${product.id}`}
                      className={styles.rowLink}
                    >
                      {product.title}
                    </Link>
                  </td>
                  <td>{product.stock}</td>
                  <td>{formatMoney(product.priceCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
