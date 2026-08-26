"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  SELLER_ICON_STROKE,
  SELLER_NAVIGATION,
} from "@/components/seller/sellerNav";
import styles from "./seller.module.css";

interface SellerSidebarProps {
  variant: "desktop" | "drawer";
  onNavigate?: () => void;
  onClose?: () => void;
}

export function SellerSidebar({
  variant,
  onNavigate,
  onClose,
}: SellerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  function handleLogout() {
    signOut();
    router.push("/acesso");
  }

  return (
    <aside
      id={variant === "drawer" ? "seller-sidebar" : "seller-sidebar-desktop"}
      className={`${styles.sidebar} ${variant === "desktop" ? styles.sidebarDesktop : ""}`}
      aria-label="Navegação do vendedor"
    >
      <div className={styles.brand}>
        <span className={styles.brandEyebrow}>Área do vendedor</span>
        <span className={styles.brandTitle}>Minha loja</span>
        {user?.name ? (
          <span className={styles.brandEyebrow}>{user.name}</span>
        ) : null}
        {variant === "drawer" && onClose ? (
          <button
            type="button"
            className={styles.ghostBtn}
            aria-label="Fechar menu"
            onClick={onClose}
            style={{ marginTop: 8, width: "100%" }}
          >
            <X size={18} strokeWidth={SELLER_ICON_STROKE} aria-hidden="true" />
            Fechar
          </button>
        ) : null}
      </div>

      <nav className={styles.nav} aria-label="Menu da loja">
        {SELLER_NAVIGATION.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
            >
              <Icon
                size={18}
                strokeWidth={SELLER_ICON_STROKE}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button type="button" className={styles.logout} onClick={handleLogout}>
        Sair da conta
      </button>
    </aside>
  );
}
