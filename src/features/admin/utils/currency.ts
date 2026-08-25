import type { MoneyCents } from "@/features/admin/domain/types";

export function formatMoney(cents: MoneyCents): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

export function parseMoneyInputToCents(raw: string): MoneyCents | null {
  const normalized = raw.replace(/[^\d,.-]/g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}
