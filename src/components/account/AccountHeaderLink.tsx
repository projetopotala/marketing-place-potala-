"use client";

import Link from "next/link";
import { UserIcon } from "@/components/storefront/icons";
import { useAuth } from "@/context/AuthContext";

export function AccountHeaderLink() {
  const { user, isHydrated, isAuthenticated } = useAuth();

  if (!isHydrated) {
    return (
      <span className="inline-flex items-center gap-3 px-1 py-1 text-left text-potala-text md:px-2">
        <UserIcon className="h-7 w-7 text-potala-gold" />
        <span className="hidden leading-tight md:block">
          <span className="block text-sm font-medium">Entrar</span>
          <span className="block text-xs text-potala-muted">Minha conta</span>
        </span>
      </span>
    );
  }

  if (isAuthenticated && user) {
    const firstName = user.name.trim().split(/\s+/)[0] || "Conta";
    const href = user.role === "admin" ? "/admin" : "/minha-conta";
    const label =
      user.role === "admin"
        ? `Abrir painel administrativo de ${user.name}`
        : `Abrir minha conta de ${user.name}`;

    return (
      <Link
        href={href}
        className="inline-flex items-center gap-3 px-1 py-1 text-left text-potala-text transition hover:text-potala-gold md:px-2"
        aria-label={label}
      >
        <UserIcon className="h-7 w-7 text-potala-gold" />
        <span className="hidden leading-tight md:block">
          <span className="block text-sm font-medium">{firstName}</span>
          <span className="block text-xs text-potala-muted">
            {user.role === "admin" ? "Painel admin" : "Minha conta"}
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/acesso"
      className="inline-flex items-center gap-3 px-1 py-1 text-left text-potala-text transition hover:text-potala-gold md:px-2"
      aria-label="Entrar ou acessar minha conta"
    >
      <UserIcon className="h-7 w-7 text-potala-gold" />
      <span className="hidden leading-tight md:block">
        <span className="block text-sm font-medium">Entrar</span>
        <span className="block text-xs text-potala-muted">Minha conta</span>
      </span>
    </Link>
  );
}
