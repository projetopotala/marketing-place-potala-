"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BRAND } from "@/data/marketplace";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAV } from "@/data/admin";
import styles from "./admin.module.css";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  function handleLogout() {
    signOut();
    router.push("/acesso");
  }

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside
      id="admin-sidebar"
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
        <button
          type="button"
          className={styles.sidebarClose}
          aria-label="Fechar menu"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <nav className={styles.nav} aria-label="Menu do painel">
        {ADMIN_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <div key={item.id} className={styles.navGroup}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                aria-current={active && !item.children ? "page" : undefined}
                onClick={onClose}
              >
                {item.label}
              </Link>
              {item.children?.map((child) => {
                const childActive = isActive(child.href);
                return (
                  <Link
                    key={child.id}
                    href={child.href}
                    className={`${styles.navSubLink} ${
                      childActive ? styles.navSubLinkActive : ""
                    }`}
                    aria-current={childActive ? "page" : undefined}
                    onClick={onClose}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
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
