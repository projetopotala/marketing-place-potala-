"use client";

import Link from "next/link";
import { ACCOUNT_ACTIVE_COUPONS } from "@/data/account";
import { formatPrice } from "@/data/marketplace";
import { AccountChrome } from "@/components/account/AccountChrome";
import { AccountWelcomePanel } from "@/components/account/AccountWelcomePanel";
import { AccountMetricCard } from "@/components/account/AccountMetricCard";
import { ActiveCoupons } from "@/components/account/ActiveCoupons";
import { useAuth } from "@/context/AuthContext";
import { useAccountData } from "@/features/account/AccountDataContext";
import {
  CUSTOMER_ORDER_STATUS_LABEL,
} from "@/features/account/domain";
import styles from "./page.module.css";

export default function MinhaContaPage() {
  const { user } = useAuth();
  const { db, isHydrated } = useAccountData();
  const name = user?.name?.trim() || "Cliente Potala";

  const orders = db?.orders ?? [];
  const favorites = db?.favorites ?? [];
  const addresses = db?.addresses ?? [];
  const pendingReviews =
    db?.reviews.filter((review) => review.status === "pending").length ?? 0;

  const metrics = [
    {
      id: "pedidos-recentes",
      label: "Pedidos recentes",
      value: String(orders.length),
      hint: "Histórico demonstrativo",
    },
    {
      id: "cupons",
      label: "Cupons disponíveis",
      value: String(ACCOUNT_ACTIVE_COUPONS.length),
      hint: "Prontos para uso",
    },
    {
      id: "enderecos",
      label: "Endereços salvos",
      value: String(addresses.length),
      hint: "Entrega e cobrança",
    },
    {
      id: "favoritos",
      label: "Favoritos",
      value: String(favorites.length),
      hint: "Lista de desejos",
    },
    {
      id: "avaliacoes",
      label: "Avaliações pendentes",
      value: String(pendingReviews),
      hint: "Aguardando sua opinião",
    },
  ];

  return (
    <AccountChrome
      title="Resumo da Conta"
      lead="Acompanhe suas atividades, pedidos e preferências em um só lugar."
      breadcrumbCurrent="Resumo da Conta"
    >
      {!isHydrated || !db ? (
        <p role="status">Carregando dados da conta…</p>
      ) : (
        <>
          <AccountWelcomePanel name={name} />

          <section className={styles.metrics} aria-label="Indicadores da conta">
            {metrics.map((metric) => (
              <AccountMetricCard key={metric.id} metric={metric} />
            ))}
          </section>

          <div className={styles.lower}>
            <section aria-labelledby="recent-orders-title">
              <h2 id="recent-orders-title">Pedidos recentes</h2>
              {orders.length === 0 ? (
                <p>Nenhum pedido no histórico ainda.</p>
              ) : (
                <ul>
                  {orders.slice(0, 3).map((order) => (
                    <li key={order.id}>
                      <Link href={`/minha-conta/pedidos/${order.id}`}>
                        {order.code}
                      </Link>{" "}
                      · {CUSTOMER_ORDER_STATUS_LABEL[order.status]} ·{" "}
                      {formatPrice(order.total)}
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/minha-conta/pedidos">Ver todos</Link>
            </section>

            <ActiveCoupons coupons={ACCOUNT_ACTIVE_COUPONS} />

            <section aria-labelledby="addr-title">
              <h2 id="addr-title">Endereços</h2>
              <ul>
                {addresses.map((address) => (
                  <li key={address.id}>
                    {address.label}
                    {address.isDefault ? " (padrão)" : ""} — {address.street},{" "}
                    {address.number}
                  </li>
                ))}
              </ul>
              <Link href="/minha-conta/enderecos">Gerenciar</Link>
            </section>

            <section aria-labelledby="fav-title">
              <h2 id="fav-title">Favoritos</h2>
              {favorites.length === 0 ? (
                <p>Sua lista de desejos está vazia.</p>
              ) : (
                <ul>
                  {favorites.slice(0, 4).map((item) => (
                    <li key={item.productId}>
                      <Link href={`/produto/${item.slug}`}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/minha-conta/favoritos">Ver favoritos</Link>
            </section>
          </div>
        </>
      )}
    </AccountChrome>
  );
}
