"use client";

import { useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import styles from "./admin.module.css";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.shell}>
      {menuOpen ? (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
      <AdminSidebar open={menuOpen} />
      <div className={styles.mainColumn}>
        <AdminTopbar onOpenMenu={() => setMenuOpen(true)} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
