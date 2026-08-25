"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AdminDemoDb } from "@/features/admin/domain/types";
import { ADMIN_STORAGE_KEY, createAdminSeed } from "@/features/admin/data/seed";
import { LocalAdminRepository } from "@/features/admin/repository/LocalAdminRepository";
import type { AdminRepository } from "@/features/admin/repository/AdminRepository";

interface AdminDataContextValue {
  db: AdminDemoDb;
  isHydrated: boolean;
  repo: AdminRepository;
  refresh: (next: AdminDemoDb) => void;
  resetDemoData: () => void;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

function isAdminDemoDb(value: unknown): value is AdminDemoDb {
  if (!value || typeof value !== "object") return false;
  const db = value as Record<string, unknown>;
  return (
    db.version === 1 &&
    Array.isArray(db.sellers) &&
    Array.isArray(db.products) &&
    Array.isArray(db.orders) &&
    Array.isArray(db.customers)
  );
}

/**
 * Estado administrativo demonstrativo com persistência local.
 * Em produção: API autenticada, RBAC no servidor e auditoria.
 */
export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [repo] = useState(() => new LocalAdminRepository(createAdminSeed()));
  const [db, setDb] = useState<AdminDemoDb>(() => createAdminSeed());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (isAdminDemoDb(parsed)) {
            repo.setDb(parsed);
            setDb(parsed);
          }
        }
      } catch {
        // ignora storage corrompido e mantém seed
      }
      setIsHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const refresh = useCallback(
    (next: AdminDemoDb) => {
      repo.setDb(next);
      setDb(next);
      window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(next));
    },
    [repo],
  );

  const resetDemoData = useCallback(() => {
    const next = repo.resetDemoData();
    setDb(next);
    window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(next));
  }, [repo]);

  const value = useMemo<AdminDataContextValue>(
    () => ({
      db,
      isHydrated,
      repo,
      refresh,
      resetDemoData,
    }),
    [db, isHydrated, repo, refresh, resetDemoData],
  );

  return (
    <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
  );
}

export function useAdminData(): AdminDataContextValue {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData deve ser usado dentro de AdminDataProvider.");
  }
  return context;
}
