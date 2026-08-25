import type { AccountOrderSummary } from "@/types/account";
import { formatPrice } from "@/data/marketplace";
import styles from "./RecentOrders.module.css";

interface RecentOrdersProps {
  orders: AccountOrderSummary[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <section className={styles.section} aria-labelledby="recent-orders-title">
      <h2 id="recent-orders-title">Últimos pedidos</h2>
      <ul className={styles.list}>
        {orders.map((order) => (
          <li key={order.id} className={styles.item}>
            <div>
              <strong>{order.code}</strong>
              <p>
                {order.date} · {order.itemCount}{" "}
                {order.itemCount === 1 ? "item" : "itens"}
              </p>
            </div>
            <div className={styles.meta}>
              <span className={styles.status}>{order.status}</span>
              <span className={styles.total}>{formatPrice(order.total)}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
