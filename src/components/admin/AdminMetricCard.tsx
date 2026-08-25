import type { ReactNode } from "react";
import type { AdminMetric } from "@/types/admin";
import styles from "./admin.module.css";

const ICONS: Record<AdminMetric["icon"], ReactNode> = {
  sellers: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16 11a3 3 0 1 0-2-5.236M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 2c1.657 0 3 .895 3 2v2H13v-2c0-1.105 1.343-2 3-2ZM8 13c2.21 0 4 1.12 4 2.5V18H4v-2.5C4 14.12 5.79 13 8 13Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  products: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 12v8M12 12 4.5 8M12 12l7.5-4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  orders: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 7h13l-1.5 8H8.5L7 7Zm0 0L6 4H3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19" r="1.4" fill="currentColor" />
      <circle cx="17" cy="19" r="1.4" fill="currentColor" />
    </svg>
  ),
  sales: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 18V6m0 12h16M7 14l3-3 3 2 5-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

interface AdminMetricCardProps {
  metric: AdminMetric;
}

export function AdminMetricCard({ metric }: AdminMetricCardProps) {
  return (
    <article className={styles.metricCard}>
      <div className={styles.metricTop}>
        <p className={styles.metricLabel}>{metric.label}</p>
        <span className={styles.metricIcon}>{ICONS[metric.icon]}</span>
      </div>
      <p className={styles.metricValue}>{metric.value}</p>
      <div className={styles.metricGrowth}>
        <span className={styles.growthUp}>{metric.growth}</span>
        <span className={styles.growthCmp}>{metric.comparison}</span>
      </div>
    </article>
  );
}
