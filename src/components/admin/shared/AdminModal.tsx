"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./shared.module.css";

interface AdminModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  actions?: ReactNode;
}

export function AdminModal({
  open,
  title,
  children,
  onClose,
  actions,
}: AdminModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("button, input, select, textarea")?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.dialogBackdrop} role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className={styles.dialogTitle}>
          {title}
        </h2>
        <div className={styles.dialogBody}>{children}</div>
        {actions ? <div className={styles.dialogActions}>{actions}</div> : null}
      </div>
    </div>
  );
}

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  busy = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AdminModal
      open={open}
      title={title}
      onClose={onClose}
      actions={
        <>
          <button type="button" className={styles.btnGhost} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.btnDanger}
            disabled={busy}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p>{description}</p>
    </AdminModal>
  );
}

export function AdminDrawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className={styles.drawerBackdrop}
        aria-label="Fechar painel"
        onClick={onClose}
      />
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.panelTitle}>
            {title}
          </h2>
          <button type="button" className={styles.btnGhost} onClick={onClose}>
            Fechar
          </button>
        </div>
        {children}
      </aside>
    </>
  );
}
