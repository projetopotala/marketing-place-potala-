"use client";

import type { ReactNode } from "react";
import styles from "./charts.module.css";

interface AdminChartContainerProps {
  title: string;
  description: string;
  summary: string;
  children: ReactNode;
  compact?: boolean;
}

export function AdminChartContainer({
  title,
  description,
  summary,
  children,
  compact = false,
}: AdminChartContainerProps) {
  return (
    <figure className={styles.figure} aria-label={title}>
      <p className={styles.srSummary}>{summary}</p>
      <div className={compact ? styles.containerCompact : styles.container}>
        {children}
      </div>
      <figcaption className={styles.caption}>{description}</figcaption>
    </figure>
  );
}
