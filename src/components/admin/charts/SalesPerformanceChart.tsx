"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/features/admin/utils/currency";
import { AdminChartContainer } from "./AdminChartContainer";
import { AdminChartTooltip } from "./AdminChartTooltip";
import { ADMIN_CHART_COLORS, CHART_ANIMATION_MS } from "./chartTheme";

interface SalesPoint {
  label: string;
  revenueCents: number;
  orders: number;
}

interface SalesPerformanceChartProps {
  data: SalesPoint[];
}

export function SalesPerformanceChart({ data }: SalesPerformanceChartProps) {
  const chartData = data.map((point) => ({
    label: point.label,
    receita: point.revenueCents,
    pedidos: point.orders,
  }));

  const totalRevenue = data.reduce((sum, point) => sum + point.revenueCents, 0);
  const totalOrders = data.reduce((sum, point) => sum + point.orders, 0);

  return (
    <AdminChartContainer
      title="Desempenho de vendas"
      description="Barras de receita e linha de pedidos no período selecionado."
      summary={`Receita ${formatMoney(totalRevenue)} em ${totalOrders} pedidos no período.`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid stroke={ADMIN_CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: ADMIN_CHART_COLORS.text, fontSize: 11 }}
            axisLine={{ stroke: ADMIN_CHART_COLORS.grid }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            yAxisId="revenue"
            tick={{ fill: ADMIN_CHART_COLORS.text, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(value: number) =>
              (value / 100).toLocaleString("pt-BR", {
                notation: "compact",
                maximumFractionDigits: 1,
              })
            }
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            tick={{ fill: ADMIN_CHART_COLORS.text, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            content={<AdminChartTooltip moneyKeys={["receita"]} />}
            cursor={{ fill: "rgba(213, 166, 79, 0.06)" }}
          />
          <Legend
            wrapperStyle={{ color: ADMIN_CHART_COLORS.text, fontSize: 12 }}
          />
          <Bar
            yAxisId="revenue"
            dataKey="receita"
            name="Receita"
            fill={ADMIN_CHART_COLORS.blue}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            animationDuration={CHART_ANIMATION_MS}
          />
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="pedidos"
            name="Pedidos"
            stroke={ADMIN_CHART_COLORS.gold}
            strokeWidth={2.4}
            dot={{ r: 3, fill: ADMIN_CHART_COLORS.gold }}
            activeDot={{ r: 4 }}
            animationDuration={CHART_ANIMATION_MS}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </AdminChartContainer>
  );
}
