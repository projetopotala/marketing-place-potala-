"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./AuthGuard.module.css";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Proteção apenas demonstrativa no frontend.
 * Em produção, a autorização deve ser validada no backend com sessão segura e cookie httpOnly.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace("/acesso");
      return;
    }
    if (user?.role === "seller") {
      router.replace("/loja");
      return;
    }
    if (user?.role === "admin") {
      router.replace("/admin");
    }
  }, [isAuthenticated, isHydrated, router, user?.role]);

  if (!isHydrated) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <div className={styles.skeleton} />
        <p>Carregando sua conta…</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "customer") {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <p>Redirecionando…</p>
      </div>
    );
  }

  return <>{children}</>;
}
