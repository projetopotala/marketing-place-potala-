import type { ReactNode } from "react";
import styles from "./shared.module.css";

type Tone = "success" | "warning" | "danger" | "muted" | "info";

const TONE_CLASS: Record<Tone, string> = {
  success: styles.badgeSuccess,
  warning: styles.badgeWarning,
  danger: styles.badgeDanger,
  muted: styles.badgeMuted,
  info: styles.badgeInfo,
};

export function AdminStatusBadge({
  label,
  tone = "muted",
}: {
  label: string;
  tone?: Tone;
}) {
  return <span className={`${styles.badge} ${TONE_CLASS[tone]}`}>{label}</span>;
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className={styles.empty} role="status">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function AdminPagination({
  page,
  pages,
  total,
  onChange,
}: {
  page: number;
  pages: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>
        Página {page} de {pages} · {total} itens
      </span>
      <div className={styles.paginationBtns}>
        <button
          type="button"
          className={styles.btnGhost}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Anterior
        </button>
        <button
          type="button"
          className={styles.btnGhost}
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

export function AdminFilterBar({ children }: { children: ReactNode }) {
  return <div className={styles.filterBar}>{children}</div>;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      {children}
    </div>
  );
}
