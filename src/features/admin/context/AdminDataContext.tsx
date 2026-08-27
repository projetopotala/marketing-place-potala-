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
import {
  ADMIN_STORAGE_KEY,
  ADMIN_STORAGE_KEY_V1,
  createAdminSeed,
} from "@/features/admin/data/seed";
import { migrateAdminDemoDb } from "@/features/admin/data/migrateAdminDemoDb";
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

type HydrateSource = "v2" | "v1" | "seed";

function diagnoseError(error: unknown): string {
  if (error instanceof Error) {
    return error.name || "Error";
  }
  return typeof error === "string" ? "string" : "unknown";
}

/** Diagnóstico breve — sem dados de clientes, pedidos ou dump do banco. */
function logAdminStorageFailure(stage: string, error: unknown) {
  console.warn(`[admin-demo-db] ${stage}: ${diagnoseError(error)}`);
}

function readRaw(key: string): unknown | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch (error) {
    logAdminStorageFailure(`read:${key === ADMIN_STORAGE_KEY ? "v2" : "v1"}`, error);
    return null;
  }
}

function tryPersistV2(db: AdminDemoDb): boolean {
  try {
    window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(db));
    return true;
  } catch (error) {
    logAdminStorageFailure("persist-v2", error);
    return false;
  }
}

function tryRemoveV1(): void {
  try {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY_V1);
  } catch (error) {
    logAdminStorageFailure("remove-v1", error);
  }
}

/**
 * Hidratação: V2 → migrar; senão V1 → migrar; senão seed em memória.
 * Cada tentativa é isolada — falha em V2 não pula direto para o seed.
 * Storage inválido/corrompido não é sobrescrito nem removido automaticamente.
 */
function hydrateAdminDemoDb(): {
  db: AdminDemoDb;
  source: HydrateSource;
  shouldPersistV2: boolean;
} {
  try {
    const rawV2 = readRaw(ADMIN_STORAGE_KEY);
    if (rawV2 !== null) {
      const fromV2 = migrateAdminDemoDb(rawV2);
      if (fromV2) {
        return { db: fromV2, source: "v2", shouldPersistV2: true };
      }
    }
  } catch (error) {
    logAdminStorageFailure("load-v2", error);
  }

  try {
    const rawV1 = readRaw(ADMIN_STORAGE_KEY_V1);
    if (rawV1 !== null) {
      const fromV1 = migrateAdminDemoDb(rawV1);
      if (fromV1) {
        return { db: fromV1, source: "v1", shouldPersistV2: true };
      }
    }
  } catch (error) {
    logAdminStorageFailure("load-v1", error);
  }

  return { db: createAdminSeed(), source: "seed", shouldPersistV2: false };
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
    Promise.resolve()
      .then(() => {
        if (cancelled) return;
        const { db: next, source, shouldPersistV2 } = hydrateAdminDemoDb();
        if (cancelled) return;

        repo.setDb(next);
        setDb(next);

        if (shouldPersistV2) {
          const wroteV2Ok = tryPersistV2(next);
          if (wroteV2Ok && source === "v1") {
            tryRemoveV1();
          }
        }
      })
      .catch((error) => {
        logAdminStorageFailure("hydrate", error);
      })
      .finally(() => {
        if (!cancelled) {
          setIsHydrated(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const refresh = useCallback(
    (next: AdminDemoDb) => {
      const normalized = { ...next, version: 2 as const };
      repo.setDb(normalized);
      setDb(normalized);
      tryPersistV2(normalized);
    },
    [repo],
  );

  const resetDemoData = useCallback(() => {
    const next = repo.resetDemoData();
    const normalized = { ...next, version: 2 as const };
    repo.setDb(normalized);
    setDb(normalized);
    tryPersistV2(normalized);
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
