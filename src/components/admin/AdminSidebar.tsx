"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BRAND } from "@/data/marketplace";
import { useAuth } from "@/context/AuthContext";
import {
  ADMIN_ICON_STROKE,
  ADMIN_NAVIGATION,
  AdminLogoutIcon,
} from "@/components/admin/adminNav";
import styles from "./admin.module.css";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const reduceMotion = useReducedMotion();

  function handleLogout() {
    signOut();
    router.push("/acesso");
  }

  const sidebarBody = (
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
          <X size={18} strokeWidth={ADMIN_ICON_STROKE} aria-hidden="true" />
        </button>
      </div>

      <nav className={styles.nav} aria-label="Menu do painel">
        {ADMIN_NAVIGATION.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <div key={item.id} className={styles.navGroup}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                aria-current={active && !item.children ? "page" : undefined}
                onClick={onClose}
                title={item.label}
              >
                <span className={styles.navLinkInner}>
                  <Icon size={18} strokeWidth={ADMIN_ICON_STROKE} aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
              </Link>
              {item.children?.map((child) => {
                const childActive = child.match(pathname);
                const ChildIcon = child.icon;
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
                    {ChildIcon ? (
                      <ChildIcon
                        size={14}
                        strokeWidth={ADMIN_ICON_STROKE}
                        aria-hidden="true"
                      />
                    ) : null}
                    <span>{child.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          <AdminLogoutIcon size={16} strokeWidth={ADMIN_ICON_STROKE} aria-hidden="true" />
          Sair
        </button>
        <div className={styles.ornament} aria-hidden="true" />
      </div>
    </aside>
  );

  if (reduceMotion) {
    return sidebarBody;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="admin-sidebar-motion"
        initial={false}
        animate={open ? { x: 0 } : undefined}
        style={{ display: "contents" }}
      >
        {sidebarBody}
      </motion.div>
    </AnimatePresence>
  );
}
