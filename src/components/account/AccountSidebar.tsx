"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  MapPin,
  CreditCard,
  Heart,
  Star,
  TicketPercent,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { ACCOUNT_SIDEBAR_ITEMS } from "@/data/account";
import { useAuth } from "@/context/AuthContext";
import styles from "./AccountSidebar.module.css";

interface AccountSidebarProps {
  className?: string;
}

const ICONS: Record<string, LucideIcon> = {
  resumo: LayoutDashboard,
  pedidos: Package,
  enderecos: MapPin,
  pagamentos: CreditCard,
  favoritos: Heart,
  avaliacoes: Star,
  cupons: TicketPercent,
  configuracoes: Settings,
};

export function AccountSidebar({ className = "" }: AccountSidebarProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [status, setStatus] = useState<string | null>(null);

  function handleSignOut() {
    signOut();
    router.push("/acesso");
  }

  function handleSoon(label: string) {
    setStatus(`${label}: disponível em breve.`);
    window.setTimeout(() => setStatus(null), 2800);
  }

  return (
    <aside className={`${styles.sidebar} ${className}`} aria-label="Menu da conta">
      <h2 className={styles.title}>Minha Conta</h2>
      <nav>
        <ul className={styles.list}>
          {ACCOUNT_SIDEBAR_ITEMS.map((item) => {
            const Icon = ICONS[item.id] ?? LayoutDashboard;
            if (item.available && item.href) {
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`${styles.link} ${item.id === "resumo" ? styles.active : ""}`}
                    aria-current={item.id === "resumo" ? "page" : undefined}
                  >
                    <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.disabled}
                  onClick={() => handleSoon(item.label)}
                >
                  <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                  <span>
                    {item.label}
                    <small>Disponível em breve</small>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.help}>
        <h3>Precisa de ajuda?</h3>
        <p>Nossa equipe acompanha sua jornada com cuidado e presença.</p>
        <button
          type="button"
          className={styles.support}
          onClick={() => handleSoon("Suporte")}
        >
          Falar com o suporte · Em breve
        </button>
        <button type="button" className={styles.logout} onClick={handleSignOut}>
          <LogOut size={16} strokeWidth={1.7} aria-hidden="true" />
          Sair
        </button>
        {status ? (
          <p className={styles.status} role="status" aria-live="polite">
            {status}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
