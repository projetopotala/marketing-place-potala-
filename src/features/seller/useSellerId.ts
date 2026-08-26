"use client";

import { useAuth } from "@/context/AuthContext";

/** sellerId da sessão demonstrativa — vazio se não for vendedor. */
export function useSellerId(): string | null {
  const { user } = useAuth();
  if (user?.role !== "seller") return null;
  return user.sellerId ?? null;
}
