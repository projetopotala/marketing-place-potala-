import { ADMIN_CATEGORY_SALES, ADMIN_SALES_SUMMARY } from "@/data/admin";
import styles from "./admin.module.css";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function SalesCategoryChart() {
  const total = ADMIN_SALES_SUMMARY.totalRevenue;

  const segments = ADMIN_CATEGORY_SALES.reduce<
    Array<(typeof ADMIN_CATEGORY_SALES)[number] & { start: number; end: number }>
  >((acc, item) => {
    const start = acc.length === 0 ? 0 : acc[acc.length - 1].end;
    const end = start + (item.value / total) * 100;
    acc.push({ ...item, start, end });
    return acc;
  }, []);

  const gradient = segments
    .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
    .join(", ");

  return (
    <section className={styles.panel} aria-labelledby="sales-category-title">
      <div className={styles.panelHead}>
        <h2 id="sales-category-title" className={styles.panelTitle}>
          Vendas por Categoria
        </h2>
      </div>

      <div className={styles.donutWrap}>
        <div
          className={styles.donut}
          style={{ background: `conic-gradient(${gradient})` }}
          role="img"
          aria-label="Distribuição de vendas por categoria"
        >
          <div className={styles.donutHole}>
            <span className={styles.donutTotalLabel}>Total</span>
            <span className={styles.donutTotal}>{formatCurrency(total)}</span>
          </div>
        </div>

        <ul className={styles.catLegend}>
          {ADMIN_CATEGORY_SALES.map((item) => (
            <li key={item.id} className={styles.catRow}>
              <span
                className={styles.catDot}
                style={{ background: item.color }}
                aria-hidden="true"
              />
              <span className={styles.catLabel}>{item.label}</span>
              <span className={styles.catValue}>{formatCurrency(item.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
