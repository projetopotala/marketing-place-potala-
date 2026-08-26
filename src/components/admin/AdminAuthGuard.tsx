"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./admin.module.css";

interface AdminAuthGuardProps {
  children: ReactNode;
}

/**
 * Proteção demonstrativa do painel administrativo.
 * Em produção, a autorização deve ser validada no backend.
 */
export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace("/acesso");
      return;
    }

    if (user?.role !== "admin") {
      if (user?.role === "seller") {
        router.replace("/loja");
        return;
      }
      router.replace("/minha-conta");
    }
  }, [isAuthenticated, isHydrated, router, user?.role]);

  if (!isHydrated) {
    return (
      <div className={styles.guard} role="status" aria-live="polite">
        <p>Carregando painel administrativo…</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className={styles.guard} role="status" aria-live="polite">
        <p>Redirecionando…</p>
      </div>
    );
  }

  return <>{children}</>;
}
