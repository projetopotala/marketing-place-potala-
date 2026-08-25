import type { ReactNode } from "react";
import styles from "./shared.module.css";

interface AdminMetricCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function AdminMetricCard({ label, value, hint }: AdminMetricCardProps) {
  return (
    <article className={styles.metric}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
      {hint ? <p className={styles.metricHint}>{hint}</p> : null}
    </article>
  );
}

export function AdminMetricsRow({ children }: { children: ReactNode }) {
  return <section className={styles.metrics}>{children}</section>;
}
