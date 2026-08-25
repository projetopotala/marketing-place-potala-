import { AdminAlerts } from "@/components/admin/AdminAlerts";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { FeaturedSellersTable } from "@/components/admin/FeaturedSellersTable";
import { FinancialSummary } from "@/components/admin/FinancialSummary";
import { PendingApprovals } from "@/components/admin/PendingApprovals";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { SalesCategoryChart } from "@/components/admin/SalesCategoryChart";
import { SalesPerformanceChart } from "@/components/admin/SalesPerformanceChart";
import { ADMIN_METRICS } from "@/data/admin";
import styles from "./page.module.css";
import adminStyles from "@/components/admin/admin.module.css";

export default function AdminDashboardPage() {
  return (
    <>
      <header className={adminStyles.pageHeader}>
        <span className={adminStyles.pageIcon} aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 19V5m0 14h16M7 15l3.5-4 2.5 2.5L17 8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <h1 className={adminStyles.pageTitle}>Painel do Marketplace</h1>
          <p className={adminStyles.pageSubtitle}>
            Visão geral e controle completo do seu ecossistema espiritual
          </p>
        </div>
      </header>

      <section className={adminStyles.metricsGrid} aria-label="Métricas principais">
        {ADMIN_METRICS.map((metric) => (
          <AdminMetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className={adminStyles.chartsRow} aria-label="Gráficos de desempenho">
        <SalesPerformanceChart />
        <SalesCategoryChart />
      </section>

      <section className={adminStyles.tablesRow} aria-label="Tabelas operacionais">
        <FeaturedSellersTable />
        <RecentOrdersTable />
      </section>

      <section className={adminStyles.bottomRow} aria-label="Resumo e pendências">
        <FinancialSummary />
        <AdminAlerts />
        <PendingApprovals />
      </section>

      <p className={styles.note}>
        Painel demonstrativo — dados simulados para validação visual do protótipo.
      </p>
    </>
  );
}
