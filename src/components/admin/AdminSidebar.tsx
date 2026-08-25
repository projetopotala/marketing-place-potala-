"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/data/admin";
import { BRAND } from "@/data/marketplace";
import { useAuth } from "@/context/AuthContext";
import styles from "./admin.module.css";

interface AdminSidebarProps {
  open: boolean;
}

export function AdminSidebar({ open }: AdminSidebarProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  function handleLogout() {
    signOut();
    router.push("/acesso");
  }

  return (
    <aside
      className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}
      aria-label="Navegação administrativa"
    >
      <div className={styles.logoWrap}>
        <Image
          src={BRAND.logoSrc}
          alt=""
          width={42}
          height={42}
          className={styles.logoMark}
          priority
        />
        <div className={styles.logoText}>
          <span className={styles.logoInstituto}>Instituto</span>
          <span className={styles.logoName}>Potala</span>
          <span className={styles.logoMarket}>Admin</span>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Menu do painel">
        {ADMIN_NAV_ITEMS.map((item) => {
          if (item.active && item.available) {
            return (
              <button
                key={item.id}
                type="button"
                className={styles.navItemActive}
                aria-current="page"
              >
                {item.label}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              className={styles.navItemSoon}
              aria-disabled="true"
              title="Disponível em breve"
              onClick={(event) => event.preventDefault()}
            >
              <span>{item.label}</span>
              <span className={styles.soonHint}>Disponível em breve</span>
            </button>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          Sair
        </button>
        <div className={styles.ornament} aria-hidden="true" />
      </div>
    </aside>
  );
}
