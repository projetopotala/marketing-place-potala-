import { POTALA_TOKENS } from "@/styles/tokens";

export const ADMIN_CHART_COLORS = {
  gold: POTALA_TOKENS.gold500,
  goldLight: POTALA_TOKENS.gold400,
  blue: POTALA_TOKENS.info,
  green: POTALA_TOKENS.success,
  red: POTALA_TOKENS.danger,
  purple: POTALA_TOKENS.purple,
  orange: POTALA_TOKENS.orange,
  grid: POTALA_TOKENS.grid,
  text: POTALA_TOKENS.textSecondary,
  surface: POTALA_TOKENS.navy800,
  elevated: POTALA_TOKENS.navy750,
  border: POTALA_TOKENS.border,
  ink: POTALA_TOKENS.textPrimary,
} as const;

export const ADMIN_CHART_SERIES = [
  ADMIN_CHART_COLORS.gold,
  ADMIN_CHART_COLORS.blue,
  ADMIN_CHART_COLORS.green,
  ADMIN_CHART_COLORS.purple,
  ADMIN_CHART_COLORS.orange,
  ADMIN_CHART_COLORS.red,
  ADMIN_CHART_COLORS.goldLight,
] as const;

export const CHART_ANIMATION_MS = 280;
