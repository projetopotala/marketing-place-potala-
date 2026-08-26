"use client";

import { useMemo } from "react";
import { useAdminData } from "@/features/admin/context/AdminDataContext";
import { formatMoney } from "@/features/admin/utils/currency";
import {
  selectSellerPayouts,
  selectSellerTransactions,
} from "@/features/seller/selectors";
import { useSellerId } from "@/features/seller/useSellerId";
import styles from "@/components/seller/seller.module.css";

export function SellerFinanceView() {
  const sellerId = useSellerId();
  const { db, isHydrated } = useAdminData();

  const transactions = useMemo(() => {
    if (!sellerId) return [];
    return selectSellerTransactions(db, sellerId);
  }, [db, sellerId]);

  const payouts = useMemo(() => {
    if (!sellerId) return [];
    return selectSellerPayouts(db, sellerId);
  }, [db, sellerId]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        acc.gross += tx.grossCents;
        acc.fees += tx.feeCents;
        acc.commission += tx.commissionCents;
        acc.net += tx.netCents;
        return acc;
      },
      { gross: 0, fees: 0, commission: 0, net: 0 },
    );
  }, [transactions]);

  if (!isHydrated || !sellerId) {
    return <p role="status">Carregando financeiro…</p>;
  }

  return (
    <>
      <header>
        <h1 className={styles.pageTitle}>Financeiro</h1>
        <p className={styles.pageLead}>
          Comissão, taxas, líquido e repasses da sua loja.
        </p>
      </header>

      <section className={styles.metrics} aria-label="Totais">
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Bruto</p>
          <p className={styles.metricValue}>{formatMoney(totals.gross)}</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Taxas</p>
          <p className={styles.metricValue}>{formatMoney(totals.fees)}</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Comissão</p>
          <p className={styles.metricValue}>{formatMoney(totals.commission)}</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Líquido</p>
          <p className={styles.metricValue}>{formatMoney(totals.net)}</p>
        </article>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Transações</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Bruto</th>
                <th>Taxas</th>
                <th>Comissão</th>
                <th>Líquido</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.orderId}</td>
                  <td>{formatMoney(tx.grossCents)}</td>
                  <td>{formatMoney(tx.feeCents)}</td>
                  <td>{formatMoney(tx.commissionCents)}</td>
                  <td>{formatMoney(tx.netCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Repasses</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id}>
                  <td>{payout.periodLabel}</td>
                  <td>{formatMoney(payout.amountCents)}</td>
                  <td>
                    <span className={styles.badge}>{payout.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
