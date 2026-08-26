"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import styles from "./shared.module.css";

interface AdminMetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
}

export function AdminMetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: AdminMetricCardProps) {
  const reduce = useReducedMotion();

  const body = (
    <>
      <div className={styles.metricTop}>
        <p className={styles.metricLabel}>{label}</p>
        {Icon ? (
          <span className={styles.metricIcon}>
            <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className={styles.metricValue}>{value}</p>
      {hint ? <p className={styles.metricHint}>{hint}</p> : null}
    </>
  );

  if (reduce) {
    return <article className={styles.metric}>{body}</article>;
  }

  return (
    <motion.article
      className={styles.metric}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
    >
      {body}
    </motion.article>
  );
}

export function AdminMetricsRow({ children }: { children: ReactNode }) {
  return <section className={styles.metrics}>{children}</section>;
}
