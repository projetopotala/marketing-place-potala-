import type { AccountCoupon } from "@/types/account";
import styles from "./ActiveCoupons.module.css";

interface ActiveCouponsProps {
  coupons: AccountCoupon[];
}

export function ActiveCoupons({ coupons }: ActiveCouponsProps) {
  return (
    <section className={styles.section} aria-labelledby="coupons-title">
      <h2 id="coupons-title">Cupons ativos</h2>
      <ul className={styles.list}>
        {coupons.map((coupon) => (
          <li key={coupon.id}>
            <strong>{coupon.code}</strong>
            <p>{coupon.description}</p>
            <span>Validade: {coupon.expiresAt}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
