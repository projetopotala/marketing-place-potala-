"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, LogOut, UserRound } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { globalSearch } from "@/features/admin/selectors/dashboardSelectors";
import { ADMIN_ICON_STROKE } from "@/components/admin/adminNav";
import styles from "./admin.module.css";

interface AdminTopbarProps {
  onOpenMenu: () => void;
  menuOpen: boolean;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}

type SearchHit = {
  id: string;
  label: string;
  href: string;
  meta: string;
  group: string;
};

export function AdminTopbar({
  onOpenMenu,
  menuOpen,
  menuButtonRef,
}: AdminTopbarProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { db } = useAdminData();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogInputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const grouped = globalSearch(db, query);
    const flat: SearchHit[] = [
      ...grouped.sellers.map((item) => ({ ...item, group: "Vendedores" })),
      ...grouped.products.map((item) => ({ ...item, group: "Produtos" })),
      ...grouped.orders.map((item) => ({ ...item, group: "Pedidos" })),
      ...grouped.customers.map((item) => ({ ...item, group: "Clientes" })),
      ...grouped.contents.map((item) => ({ ...item, group: "Conteúdos" })),
    ];
    return flat;
  }, [db, query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const typing =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target?.isContentEditable;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        if (typing && target !== inputRef.current && !open) {
          return;
        }
        event.preventDefault();
        setOpen(true);
        setQuery("");
        setActiveIndex(0);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => dialogInputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  function closePalette() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  function openResult(href: string) {
    closePalette();
    router.push(href);
  }

  function onDialogKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePalette();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        results.length === 0 ? 0 : (current + 1) % results.length,
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        results.length === 0
          ? 0
          : (current - 1 + results.length) % results.length,
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const hit = results[activeIndex];
      if (hit) openResult(hit.href);
    }
  }

  function handleLogout() {
    signOut();
    router.push("/acesso");
  }

  const groups = ["Vendedores", "Produtos", "Pedidos", "Clientes", "Conteúdos"];

  return (
    <>
      <header className={styles.topbar}>
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuBtn}
          aria-label="Abrir menu administrativo"
          aria-controls="admin-sidebar"
          aria-expanded={menuOpen}
          onClick={onOpenMenu}
        >
          <Menu size={20} strokeWidth={ADMIN_ICON_STROKE} aria-hidden="true" />
        </button>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">
            <Search size={16} strokeWidth={ADMIN_ICON_STROKE} />
          </span>
          <input
            ref={inputRef}
            type="search"
            className={styles.searchInput}
            placeholder="Buscar vendedores, produtos, pedidos, clientes..."
            aria-label="Busca administrativa"
            readOnly
            onFocus={() => {
              setOpen(true);
              setQuery("");
            }}
            onClick={() => {
              setOpen(true);
              setQuery("");
            }}
          />
          <kbd className={styles.kbd}>Ctrl + K</kbd>
        </div>

        <div className={styles.topbarRight}>
          <div className={styles.adminChip}>
            <UserRound size={16} strokeWidth={ADMIN_ICON_STROKE} aria-hidden="true" />
            <span className={styles.adminChipText}>
              <span className={styles.adminName}>{user?.name ?? "Administrador"}</span>
              <span className={styles.adminRole}>Admin</span>
            </span>
          </div>
          <button type="button" className={styles.topLogout} onClick={handleLogout}>
            <LogOut size={16} strokeWidth={ADMIN_ICON_STROKE} aria-hidden="true" />
            Sair
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            className={styles.searchPalette}
            role="presentation"
            onClick={closePalette}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className={styles.searchDialog}
              role="dialog"
              aria-modal="true"
              aria-label="Busca administrativa"
              onClick={(event) => event.stopPropagation()}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <input
                ref={dialogInputRef}
                className={styles.searchDialogInput}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onDialogKeyDown}
                placeholder="Buscar vendedores, produtos, pedidos, clientes..."
                aria-label="Termo de busca"
              />
              {query.trim() && results.length === 0 ? (
                <p className={styles.searchEmpty}>Nenhum resultado para “{query}”.</p>
              ) : null}
              {!query.trim() ? (
                <p className={styles.searchEmpty}>
                  Digite para buscar em vendedores, produtos, pedidos, clientes e conteúdos.
                </p>
              ) : null}
              {groups.map((group) => {
                const items = results.filter((item) => item.group === group);
                if (items.length === 0) return null;
                return (
                  <div key={group} className={styles.searchGroup}>
                    <p className={styles.searchGroupTitle}>{group}</p>
                    {items.map((item) => {
                      const index = results.findIndex(
                        (hit) => hit.id === item.id && hit.group === item.group,
                      );
                      return (
                        <button
                          key={`${item.group}-${item.id}`}
                          type="button"
                          className={`${styles.searchResult} ${
                            index === activeIndex ? styles.searchResultActive : ""
                          }`}
                          onClick={() => openResult(item.href)}
                          onMouseEnter={() => setActiveIndex(index)}
                        >
                          <span>{item.label}</span>
                          <span className={styles.searchResultMeta}>{item.meta}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
