"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./admin.module.css";

interface AdminTopbarProps {
  onOpenMenu: () => void;
}

export function AdminTopbar({ onOpenMenu }: AdminTopbarProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleLogout() {
    signOut();
    router.push("/acesso");
  }

  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.menuBtn}
        aria-label="Abrir menu administrativo"
        onClick={onOpenMenu}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M20 20l-3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          className={styles.searchInput}
          placeholder="Buscar vendedores, produtos, pedidos, clientes..."
          aria-label="Busca administrativa"
        />
        <kbd className={styles.kbd}>Ctrl + K</kbd>
      </div>

      <div className={styles.topbarRight}>
        <div className={styles.adminChip}>
          <span className={styles.adminName}>{user?.name ?? "Administrador"}</span>
          <span className={styles.adminRole}>Admin</span>
        </div>
        <button type="button" className={styles.topLogout} onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  );
}
