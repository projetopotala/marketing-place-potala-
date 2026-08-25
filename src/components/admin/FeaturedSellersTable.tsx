import { ADMIN_FEATURED_SELLERS } from "@/data/admin";
import styles from "./admin.module.css";

export function FeaturedSellersTable() {
  return (
    <section className={styles.panel} aria-labelledby="featured-sellers-title">
      <div className={styles.panelHead}>
        <h2 id="featured-sellers-title" className={styles.panelTitle}>
          Vendedores em Destaque
        </h2>
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Loja / Vendedor</th>
              <th>Status</th>
              <th>Produtos</th>
              <th>Pedidos</th>
              <th>Comissão</th>
              <th>Avaliação</th>
            </tr>
          </thead>
          <tbody>
            {ADMIN_FEATURED_SELLERS.map((seller) => (
              <tr key={seller.id}>
                <td>{seller.name}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      seller.status === "Ativo" ? styles.badgeOk : styles.badgeWarn
                    }`}
                  >
                    {seller.status}
                  </span>
                </td>
                <td>{seller.products}</td>
                <td>{seller.orders}</td>
                <td>
                  {seller.commission.toLocaleString("pt-BR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                  %
                </td>
                <td>{seller.rating.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileCards}>
        {ADMIN_FEATURED_SELLERS.map((seller) => (
          <article key={seller.id} className={styles.mobileCard}>
            <div className={styles.mobileCardTitle}>{seller.name}</div>
            <div className={styles.mobileMeta}>
              <span>{seller.status}</span>
              <span>{seller.rating.toFixed(1)} ★</span>
            </div>
            <div className={styles.mobileMeta}>
              <span>{seller.products} produtos</span>
              <span>{seller.orders} pedidos</span>
            </div>
            <div className={styles.mobileMeta}>
              <span>Comissão</span>
              <span>
                {seller.commission.toLocaleString("pt-BR", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
                %
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
