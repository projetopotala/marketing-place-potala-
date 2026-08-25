"use client";

import { ADMIN_SALES_POINTS, ADMIN_SALES_SUMMARY } from "@/data/admin";
import styles from "./admin.module.css";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function SalesPerformanceChart() {
  const width = 640;
  const height = 220;
  const pad = { top: 16, right: 16, bottom: 36, left: 44 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxRevenue = Math.max(...ADMIN_SALES_POINTS.map((p) => p.revenue));
  const maxOrders = Math.max(...ADMIN_SALES_POINTS.map((p) => p.orders));
  const barWidth = innerW / ADMIN_SALES_POINTS.length / 1.8;

  const orderPoints = ADMIN_SALES_POINTS.map((point, index) => {
    const x =
      pad.left +
      (index + 0.5) * (innerW / ADMIN_SALES_POINTS.length);
    const y = pad.top + innerH - (point.orders / maxOrders) * innerH;
    return `${x},${y}`;
  }).join(" ");

  return (
    <section className={styles.panel} aria-labelledby="sales-performance-title">
      <div className={styles.panelHead}>
        <h2 id="sales-performance-title" className={styles.panelTitle}>
          Desempenho de Vendas
        </h2>
        <label>
          <span className="sr-only">Período</span>
          <select className={styles.select} defaultValue="30" aria-label="Período do gráfico">
            <option value="30">Últimos 30 dias</option>
          </select>
        </label>
      </div>

      <svg
        className={styles.chartSvg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Gráfico de receita e pedidos nos últimos 30 dias"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = pad.top + innerH * (1 - ratio);
          return (
            <g key={ratio}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke="rgba(145,162,184,0.18)"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {ADMIN_SALES_POINTS.map((point, index) => {
          const xCenter =
            pad.left + (index + 0.5) * (innerW / ADMIN_SALES_POINTS.length);
          const barH = (point.revenue / maxRevenue) * innerH;
          const y = pad.top + innerH - barH;

          return (
            <g key={point.label}>
              <rect
                x={xCenter - barWidth / 2}
                y={y}
                width={barWidth}
                height={barH}
                rx="4"
                fill="rgba(110, 168, 216, 0.78)"
              />
              <text
                x={xCenter}
                y={height - 12}
                textAnchor="middle"
                fill="#91a2b8"
                fontSize="11"
              >
                {point.label}
              </text>
            </g>
          );
        })}

        <polyline
          points={orderPoints}
          fill="none"
          stroke="#d5a64f"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {ADMIN_SALES_POINTS.map((point, index) => {
          const x =
            pad.left +
            (index + 0.5) * (innerW / ADMIN_SALES_POINTS.length);
          const y = pad.top + innerH - (point.orders / maxOrders) * innerH;
          return <circle key={`pt-${point.label}`} cx={x} cy={y} r="3.5" fill="#d5a64f" />;
        })}
      </svg>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.swatchBar} aria-hidden="true" />
          Receita
        </span>
        <span className={styles.legendItem}>
          <span className={styles.swatchLine} aria-hidden="true" />
          Pedidos
        </span>
      </div>

      <div className={styles.summaryStrip}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Receita Total</span>
          <span className={styles.summaryValue}>
            {formatCurrency(ADMIN_SALES_SUMMARY.totalRevenue)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Pedidos</span>
          <span className={styles.summaryValue}>
            {ADMIN_SALES_SUMMARY.orders.toLocaleString("pt-BR")}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Ticket Médio</span>
          <span className={styles.summaryValue}>
            {formatCurrency(ADMIN_SALES_SUMMARY.averageTicket)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Taxa de Conversão</span>
          <span className={styles.summaryValue}>
            {ADMIN_SALES_SUMMARY.conversionRate.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            %
          </span>
        </div>
      </div>
    </section>
  );
}
