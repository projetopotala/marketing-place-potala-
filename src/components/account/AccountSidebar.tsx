"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ACCOUNT_SIDEBAR_ITEMS } from "@/data/account";
import { useAuth } from "@/context/AuthContext";
import styles from "./AccountSidebar.module.css";

interface AccountSidebarProps {
  className?: string;
}

export function AccountSidebar({ className = "" }: AccountSidebarProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  function handleSignOut() {
    signOut();
    router.push("/acesso");
  }

  return (
    <aside className={`${styles.sidebar} ${className}`} aria-label="Menu da conta">
      <h2 className={styles.title}>Minha Conta</h2>
      <nav>
        <ul className={styles.list}>
          {ACCOUNT_SIDEBAR_ITEMS.map((item) => (
            <li key={item.id}>
              {item.available && item.href ? (
                <Link
                  href={item.href}
                  className={`${styles.link} ${item.id === "resumo" ? styles.active : ""}`}
                  aria-current={item.id === "resumo" ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={styles.disabled} aria-disabled="true">
                  {item.label}
                  <small>Disponível em breve</small>
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.help}>
        <h3>Precisa de ajuda?</h3>
        <p>Nossa equipe acompanha sua jornada com cuidado e presença.</p>
        <button type="button" className={styles.support} disabled>
          Falar com o suporte · Em breve
        </button>
        <button type="button" className={styles.logout} onClick={handleSignOut}>
          Sair
        </button>
      </div>
    </aside>
  );
}
