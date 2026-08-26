"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/features/admin/utils/currency";
import { AdminChartContainer } from "./AdminChartContainer";
import { AdminChartTooltip } from "./AdminChartTooltip";
import { ADMIN_CHART_COLORS, CHART_ANIMATION_MS } from "./chartTheme";
import styles from "./charts.module.css";

interface FinancePoint {
  label: string;
  grossCents: number;
  netCents: number;
}

interface FinanceRevenueChartProps {
  data: FinancePoint[];
}

export function FinanceRevenueChart({ data }: FinanceRevenueChartProps) {
  if (data.length === 0) {
    return <div className={styles.empty}>Sem evolução de receita no período.</div>;
  }

  const chartData = data.map((point) => ({
    label: point.label,
    bruto: point.grossCents,
    liquido: point.netCents,
  }));

  const gross = data.reduce((sum, point) => sum + point.grossCents, 0);
  const net = data.reduce((sum, point) => sum + point.netCents, 0);

  return (
    <AdminChartContainer
      title="Evolução da receita"
      description="Receita bruta e líquida aprovada ao longo do tempo."
      summary={`Bruto ${formatMoney(gross)} · Líquido ${formatMoney(net)}.`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="grossFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ADMIN_CHART_COLORS.blue} stopOpacity={0.35} />
              <stop offset="100%" stopColor={ADMIN_CHART_COLORS.blue} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ADMIN_CHART_COLORS.gold} stopOpacity={0.3} />
              <stop offset="100%" stopColor={ADMIN_CHART_COLORS.gold} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={ADMIN_CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: ADMIN_CHART_COLORS.text, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: ADMIN_CHART_COLORS.text, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(value: number) =>
              (value / 100).toLocaleString("pt-BR", {
                notation: "compact",
                maximumFractionDigits: 1,
              })
            }
          />
          <Tooltip content={<AdminChartTooltip moneyKeys={["bruto", "liquido"]} />} />
          <Legend wrapperStyle={{ color: ADMIN_CHART_COLORS.text, fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="bruto"
            name="Receita bruta"
            stroke={ADMIN_CHART_COLORS.blue}
            fill="url(#grossFill)"
            strokeWidth={2}
            animationDuration={CHART_ANIMATION_MS}
          />
          <Area
            type="monotone"
            dataKey="liquido"
            name="Receita líquida"
            stroke={ADMIN_CHART_COLORS.gold}
            fill="url(#netFill)"
            strokeWidth={2}
            animationDuration={CHART_ANIMATION_MS}
          />
        </AreaChart>
      </ResponsiveContainer>
    </AdminChartContainer>
  );
}
