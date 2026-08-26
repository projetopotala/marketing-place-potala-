"use client";

import styles from "./charts.module.css";

type PayloadItem = {
  name?: string | number;
  value?: number | string;
  dataKey?: string | number;
  color?: string;
};

interface AdminChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<PayloadItem>;
  moneyKeys?: string[];
}

function formatTooltipValue(
  key: string,
  value: number | string | undefined,
  moneyKeys: string[],
): string {
  const raw = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(raw)) return String(value ?? "—");

  const isMoney = moneyKeys.some((candidate) =>
    key.toLowerCase().includes(candidate.toLowerCase()),
  );

  if (isMoney) {
    return (raw / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return raw.toLocaleString("pt-BR");
}

export function AdminChartTooltip({
  active,
  label,
  payload,
  moneyKeys = ["receita", "revenue", "gross", "net", "value", "bruto", "liquido"],
}: AdminChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.tooltip} role="status">
      {label !== undefined ? (
        <p className={styles.tooltipLabel}>{String(label)}</p>
      ) : null}
      {payload.map((item) => {
        const key = String(item.dataKey ?? item.name ?? "valor");
        return (
          <p key={key} className={styles.tooltipRow}>
            <span className={styles.tooltipMuted}>{String(item.name ?? key)}</span>
            <span>{formatTooltipValue(key, item.value, moneyKeys)}</span>
          </p>
        );
      })}
    </div>
  );
}
