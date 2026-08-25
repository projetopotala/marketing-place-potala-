"use client";

import Link from "next/link";
import {
  ACCOUNT_ACTIVE_COUPONS,
  ACCOUNT_ADDRESSES,
  ACCOUNT_METRICS,
  ACCOUNT_RECENT_ORDERS,
  getAccountFavorites,
} from "@/data/account";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AccountMobileNavigation } from "@/components/account/AccountMobileNavigation";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { AccountWelcomePanel } from "@/components/account/AccountWelcomePanel";
import { AccountMetricCard } from "@/components/account/AccountMetricCard";
import { RecentOrders } from "@/components/account/RecentOrders";
import { ActiveCoupons } from "@/components/account/ActiveCoupons";
import { SavedAddresses } from "@/components/account/SavedAddresses";
import { FavoriteProducts } from "@/components/account/FavoriteProducts";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

function AccountDashboardContent() {
  const { user } = useAuth();
  const name = user?.name?.trim() || "Cliente Potala";
  const favorites = getAccountFavorites();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Início</Link>
            </li>
            <li>
              <Link href="/minha-conta">Minha conta</Link>
            </li>
            <li aria-current="page">Resumo da Conta</li>
          </ol>
        </nav>

        <AccountMobileNavigation />

        <div className={styles.layout}>
          <div className={styles.sidebarDesktop}>
            <AccountSidebar />
          </div>

          <div className={styles.content}>
            <header className={styles.heading}>
              <h1>Resumo da Conta</h1>
              <p>
                Acompanhe suas atividades, pedidos e preferências em um só lugar.
              </p>
            </header>

            <AccountWelcomePanel name={name} />

            <section
              className={styles.metrics}
              aria-label="Indicadores da conta"
            >
              {ACCOUNT_METRICS.map((metric) => (
                <AccountMetricCard key={metric.id} metric={metric} />
              ))}
            </section>

            <div className={styles.lower}>
              <RecentOrders orders={ACCOUNT_RECENT_ORDERS} />
              <ActiveCoupons coupons={ACCOUNT_ACTIVE_COUPONS} />
              <SavedAddresses addresses={ACCOUNT_ADDRESSES} />
              <FavoriteProducts favorites={favorites} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyAccountPage() {
  return (
    <AuthGuard>
      <AccountDashboardContent />
    </AuthGuard>
  );
}
