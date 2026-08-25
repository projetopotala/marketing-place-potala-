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
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace("/acesso");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <div className={styles.skeleton} />
        <p>Carregando sua conta…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <p>Redirecionando para o acesso…</p>
      </div>
    );
  }

  return <>{children}</>;
}
