"use client";

import { useMemo } from "react";
import { useAdminData } from "@/features/admin/context/AdminDataContext";
import { formatMoney } from "@/features/admin/utils/currency";
import { selectSellerCoupons } from "@/features/seller/selectors";
import { useSellerId } from "@/features/seller/useSellerId";
import styles from "@/components/seller/seller.module.css";

export function SellerCouponsView() {
  const sellerId = useSellerId();
  const { db, isHydrated } = useAdminData();

  const coupons = useMemo(() => {
    if (!sellerId) return [];
    return selectSellerCoupons(db, sellerId);
  }, [db, sellerId]);

  if (!isHydrated || !sellerId) {
    return <p role="status">Carregando cupons…</p>;
  }

  return (
    <>
      <header>
        <h1 className={styles.pageTitle}>Cupons</h1>
        <p className={styles.pageLead}>
          Visão demonstrativa dos cupons do marketplace. Criação avançada
          permanece no admin até existir backend.
        </p>
      </header>

      <section className={styles.panel}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Status</th>
                <th>Receita</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>{coupon.code}</td>
                  <td>{coupon.name}</td>
                  <td>
                    <span className={styles.badge}>{coupon.status}</span>
                  </td>
                  <td>{formatMoney(coupon.revenueCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
