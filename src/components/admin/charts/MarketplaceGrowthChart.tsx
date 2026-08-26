"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/features/admin/utils/currency";
import { AdminChartContainer } from "./AdminChartContainer";
import { AdminChartTooltip } from "./AdminChartTooltip";
import { ADMIN_CHART_COLORS, CHART_ANIMATION_MS } from "./chartTheme";

interface GrowthPoint {
  label: string;
  orders: number;
  revenueCents: number;
}

interface MarketplaceGrowthChartProps {
  data: GrowthPoint[];
}

export function MarketplaceGrowthChart({ data }: MarketplaceGrowthChartProps) {
  const chartData = data.map((point) => ({
    label: point.label,
    pedidos: point.orders,
    receita: point.revenueCents,
  }));

  const first = data[0]?.orders ?? 0;
  const last = data[data.length - 1]?.orders ?? 0;
  const growth =
    first > 0 ? ((last - first) / first) * 100 : last > 0 ? 100 : 0;

  return (
    <AdminChartContainer
      title="Crescimento do marketplace"
      description={`Evolução de pedidos no período. Variação aproximada: ${growth.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%.`}
      summary={`Pedidos passaram de ${first} para ${last} no recorte exibido.`}
      compact
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ADMIN_CHART_COLORS.gold} stopOpacity={0.35} />
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
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: ADMIN_CHART_COLORS.text, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<AdminChartTooltip moneyKeys={["receita"]} />} />
          <Area
            type="monotone"
            dataKey="pedidos"
            name="Pedidos"
            stroke={ADMIN_CHART_COLORS.gold}
            fill="url(#growthFill)"
            strokeWidth={2.2}
            animationDuration={CHART_ANIMATION_MS}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="sr-only">
        Receita acumulada no recorte:{" "}
        {formatMoney(data.reduce((sum, point) => sum + point.revenueCents, 0))}
      </p>
    </AdminChartContainer>
  );
}
