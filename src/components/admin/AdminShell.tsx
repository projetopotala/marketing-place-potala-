"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import styles from "./admin.module.css";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
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
      {menuOpen ? (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Fechar menu"
          onClick={closeMenu}
        />
      ) : null}
      <AdminSidebar open={menuOpen} onClose={closeMenu} />
      <div className={styles.mainColumn}>
        <AdminTopbar
          onOpenMenu={() => setMenuOpen(true)}
          menuButtonRef={menuButtonRef}
        />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
