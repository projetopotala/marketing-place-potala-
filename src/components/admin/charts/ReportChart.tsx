"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminChartContainer } from "./AdminChartContainer";
import { AdminChartTooltip } from "./AdminChartTooltip";
import { ADMIN_CHART_COLORS, CHART_ANIMATION_MS } from "./chartTheme";
import styles from "./charts.module.css";

interface ReportChartProps {
  data: Array<{ label: string; value: number }>;
  title?: string;
}

export function ReportChart({
  data,
  title = "Distribuição do relatório",
}: ReportChartProps) {
  if (data.length === 0) {
    return <div className={styles.empty}>Sem dados no período selecionado.</div>;
  }

  const chartData = data.map((item) => ({
    label: item.label.slice(0, 14),
    valor: item.value,
  }));

  return (
    <AdminChartContainer
      title={title}
      description="Barras derivadas dos registros filtrados do relatório."
      summary={`${data.length} pontos exibidos no gráfico.`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid stroke={ADMIN_CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: ADMIN_CHART_COLORS.text, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={data.length > 5 ? -20 : 0}
            textAnchor={data.length > 5 ? "end" : "middle"}
            height={data.length > 5 ? 48 : 28}
          />
          <YAxis
            tick={{ fill: ADMIN_CHART_COLORS.text, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<AdminChartTooltip moneyKeys={[]} />} />
          <Bar
            dataKey="valor"
            name="Valor"
            fill={ADMIN_CHART_COLORS.blue}
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
            animationDuration={CHART_ANIMATION_MS}
          />
        </BarChart>
      </ResponsiveContainer>
    </AdminChartContainer>
  );
}
