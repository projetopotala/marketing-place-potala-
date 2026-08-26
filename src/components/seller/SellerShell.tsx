"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SellerSidebar } from "@/components/seller/SellerSidebar";
import { SellerTopbar } from "@/components/seller/SellerTopbar";
import styles from "./seller.module.css";

interface SellerShellProps {
  children: ReactNode;
}

export function SellerShell({ children }: SellerShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const sidebar = document.getElementById("seller-sidebar");
    const focusable = sidebar?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  return (
    <div className={styles.shell}>
      <SellerSidebar variant="desktop" />

      <AnimatePresence>
        {menuOpen ? (
          reduceMotion ? (
            <button
              type="button"
              className={styles.overlay}
              aria-label="Fechar menu"
              onClick={closeMenu}
            />
          ) : (
            <motion.button
              type="button"
              className={styles.overlay}
              aria-label="Fechar menu"
              onClick={closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen ? (
          reduceMotion ? (
            <div className={styles.drawer}>
              <SellerSidebar
                variant="drawer"
                onNavigate={closeMenu}
                onClose={closeMenu}
              />
            </div>
          ) : (
            <motion.div
              className={styles.drawer}
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -16, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SellerSidebar
                variant="drawer"
                onNavigate={closeMenu}
                onClose={closeMenu}
              />
            </motion.div>
          )
        ) : null}
      </AnimatePresence>

      <div className={styles.main}>
        <SellerTopbar
          onOpenMenu={() => setMenuOpen(true)}
          menuOpen={menuOpen}
          menuButtonRef={menuButtonRef}
        />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
