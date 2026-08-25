import type { AccountMetric } from "@/types/account";
import styles from "./AccountMetricCard.module.css";

interface AccountMetricCardProps {
  metric: AccountMetric;
}

export function AccountMetricCard({ metric }: AccountMetricCardProps) {
  return (
    <article className={styles.card}>
      <p className={styles.label}>{metric.label}</p>
      <p className={styles.value}>{metric.value}</p>
      <p className={styles.hint}>{metric.hint}</p>
    </article>
  );
}
