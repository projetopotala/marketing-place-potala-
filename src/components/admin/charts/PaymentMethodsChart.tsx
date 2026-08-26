"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney } from "@/features/admin/utils/currency";
import { AdminChartContainer } from "./AdminChartContainer";
import { AdminChartTooltip } from "./AdminChartTooltip";
import { ADMIN_CHART_COLORS, CHART_ANIMATION_MS } from "./chartTheme";
import styles from "./charts.module.css";

const METHOD_COLORS: Record<string, string> = {
  pix: ADMIN_CHART_COLORS.gold,
  card: ADMIN_CHART_COLORS.blue,
  boleto: ADMIN_CHART_COLORS.purple,
  outros: ADMIN_CHART_COLORS.orange,
};

const METHOD_LABELS: Record<string, string> = {
  pix: "Pix",
  card: "Cartão",
  boleto: "Boleto",
  outros: "Outros",
};

interface PaymentMethodsChartProps {
  data: Array<{ method: string; value: number }>;
}

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const chartData = data.map((item) => ({
    name: METHOD_LABELS[item.method] ?? item.method,
    value: item.value,
    color: METHOD_COLORS[item.method] ?? ADMIN_CHART_COLORS.orange,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return <div className={styles.empty}>Sem pagamentos aprovados para exibir.</div>;
  }

  return (
    <AdminChartContainer
      title="Formas de pagamento"
      description="Participação de Pix, cartão e boleto na receita aprovada."
      summary={`Total ${formatMoney(total)} entre ${chartData.length} meios.`}
      compact
    >
      <div className={styles.legendSide}>
        <div className={styles.donutWrap}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius="55%"
                outerRadius="78%"
                paddingAngle={2}
                stroke="transparent"
                animationDuration={CHART_ANIMATION_MS}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<AdminChartTooltip moneyKeys={["value"]} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className={styles.legendList}>
          {chartData.map((item) => (
            <li key={item.name} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ background: item.color }}
                aria-hidden="true"
              />
              <span className={styles.legendName}>{item.name}</span>
              <span className={styles.legendValue}>{formatMoney(item.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </AdminChartContainer>
  );
}
