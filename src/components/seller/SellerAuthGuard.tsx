"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./seller.module.css";

interface SellerAuthGuardProps {
  children: ReactNode;
}

/**
 * Proteção demonstrativa da área do vendedor.
 * Em produção, a autorização e o sellerId devem ser validados no backend.
 */
export function SellerAuthGuard({ children }: SellerAuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace("/acesso");
      return;
    }

    if (user?.role === "admin") {
      router.replace("/admin");
      return;
    }

    if (user?.role !== "seller" || !user.sellerId) {
      router.replace("/minha-conta");
    }
  }, [isAuthenticated, isHydrated, router, user?.role, user?.sellerId]);

  if (!isHydrated) {
    return (
      <div className={styles.guard} role="status" aria-live="polite">
        <p>Carregando painel do vendedor…</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "seller" || !user.sellerId) {
    return (
      <div className={styles.guard} role="status" aria-live="polite">
        <p>Redirecionando…</p>
      </div>
    );
  }

  return <>{children}</>;
}
