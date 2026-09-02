"use client";

import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { Dialog, AlertDialog } from "radix-ui";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "./shared.module.css";

interface AdminModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  actions?: ReactNode;
}

/**
 * Dialog controlado sem Trigger: captura o foco do gatilho antes do trap
 * e devolve após o fechamento (Escape / backdrop / onOpenChange).
 */
function useRestoreFocus(open: boolean) {
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  useLayoutEffect(() => {
    if (open && !wasOpen.current) {
      previouslyFocused.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    }

    if (!open && wasOpen.current) {
      const el = previouslyFocused.current;
      const timer = window.setTimeout(() => {
        if (el && typeof el.focus === "function") {
          el.focus();
        }
      }, 50);
      wasOpen.current = open;
      return () => window.clearTimeout(timer);
    }

    wasOpen.current = open;
  }, [open]);
}

export function AdminModal({
  open,
  title,
  children,
  onClose,
  actions,
}: AdminModalProps) {
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  useRestoreFocus(open);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className={styles.dialogBackdrop}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </Dialog.Overlay>
            <div className={styles.dialogPositioner}>
              <Dialog.Content asChild aria-labelledby={titleId}>
                <motion.div
                  className={styles.dialog}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <Dialog.Title id={titleId} className={styles.dialogTitle}>
                    {title}
                  </Dialog.Title>
                  <div className={styles.dialogBody}>{children}</div>
                  {actions ? (
                    <div className={styles.dialogActions}>{actions}</div>
                  ) : null}
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
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
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={styles.dialogBackdrop} />
        <div className={styles.dialogPositioner}>
          <AlertDialog.Content className={styles.dialog}>
            <AlertDialog.Title className={styles.dialogTitle}>
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className={styles.dialogBody}>
              {description}
            </AlertDialog.Description>
            <div className={styles.dialogActions}>
              <AlertDialog.Cancel asChild>
                <button type="button" className={styles.btnGhost} onClick={onClose}>
                  Cancelar
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  className={styles.btnDanger}
                  disabled={busy}
                  onClick={onConfirm}
                >
                  {confirmLabel}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </div>
      </AlertDialog.Portal>
    </AlertDialog.Root>
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
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.button
                type="button"
                className={styles.drawerBackdrop}
                aria-label="Fechar painel"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-labelledby={titleId}>
              <motion.aside
                className={styles.drawer}
                initial={reduceMotion ? false : { x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={reduceMotion ? undefined : { x: 24, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <div className={styles.header}>
                  <Dialog.Title id={titleId} className={styles.panelTitle}>
                    {title}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      ref={closeRef}
                      type="button"
                      className={styles.btnGhost}
                      onClick={onClose}
                    >
                      Fechar
                    </button>
                  </Dialog.Close>
                </div>
                {children}
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
