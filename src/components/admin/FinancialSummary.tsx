import { ADMIN_FINANCIAL_SUMMARY } from "@/data/admin";
import styles from "./admin.module.css";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function FinancialSummary() {
  return (
    <section className={styles.panel} aria-labelledby="financial-summary-title">
      <div className={styles.panelHead}>
        <h2 id="financial-summary-title" className={styles.panelTitle}>
          Resumo Financeiro
        </h2>
      </div>

      <div className={styles.financeList}>
        {ADMIN_FINANCIAL_SUMMARY.map((item) => {
          const valueClass =
            item.tone === "success"
              ? styles.financeSuccess
              : item.tone === "warning"
                ? styles.financeWarning
                : undefined;

          return (
            <div key={item.id} className={styles.financeRow}>
              <span className={styles.financeLabel}>{item.label}</span>
              <span className={`${styles.financeValue} ${valueClass ?? ""}`}>
                {formatCurrency(item.value)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
