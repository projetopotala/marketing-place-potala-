import { ADMIN_RECENT_ORDERS } from "@/data/admin";
import styles from "./admin.module.css";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function RecentOrdersTable() {
  return (
    <section className={styles.panel} aria-labelledby="recent-orders-title">
      <div className={styles.panelHead}>
        <h2 id="recent-orders-title" className={styles.panelTitle}>
          Pedidos Recentes
        </h2>
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Vendedor</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th>Entrega</th>
            </tr>
          </thead>
          <tbody>
            {ADMIN_RECENT_ORDERS.map((order) => (
              <tr key={order.id}>
                <td>{order.code}</td>
                <td>{order.customer}</td>
                <td>{order.seller}</td>
                <td>{formatCurrency(order.amount)}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      order.status === "Pago" ? styles.badgeOk : styles.badgeWarn
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td>{order.payment}</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeMuted}`}>
                    {order.delivery}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileCards}>
        {ADMIN_RECENT_ORDERS.map((order) => (
          <article key={order.id} className={styles.mobileCard}>
            <div className={styles.mobileCardTitle}>{order.code}</div>
            <div className={styles.mobileMeta}>
              <span>{order.customer}</span>
              <span>{formatCurrency(order.amount)}</span>
            </div>
            <div className={styles.mobileMeta}>
              <span>{order.seller}</span>
              <span>{order.status}</span>
            </div>
            <div className={styles.mobileMeta}>
              <span>{order.payment}</span>
              <span>{order.delivery}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
