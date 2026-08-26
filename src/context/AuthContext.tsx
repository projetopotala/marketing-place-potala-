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
import type { DemoSession, DemoUserProfile, UserRole } from "@/types/auth";
import {
  DEMO_SESSION_STORAGE_KEY,
  DEMO_USER_STORAGE_KEY,
  resolveSellerId,
  resolveUserRole,
} from "@/types/auth";

interface AuthContextValue {
  user: DemoSession | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  signIn: (input: {
    email: string;
    password: string;
    remember: boolean;
  }) => { ok: true; role: UserRole } | { ok: false; error: string };
  signUp: (input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => { ok: true; profile: DemoUserProfile } | { ok: false; error: string };
  signOut: () => void;
  getDemoProfile: () => DemoUserProfile | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isDemoProfile(value: unknown): value is DemoUserProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Record<string, unknown>;
  return (
    typeof profile.id === "string" &&
    typeof profile.name === "string" &&
    typeof profile.email === "string" &&
    typeof profile.createdAt === "string"
  );
}

function normalizeSession(value: unknown): DemoSession | null {
  if (!value || typeof value !== "object") return null;
  const session = value as Record<string, unknown>;

  if (
    typeof session.userId !== "string" ||
    typeof session.email !== "string" ||
    typeof session.name !== "string" ||
    typeof session.remember !== "boolean" ||
    typeof session.signedInAt !== "string"
  ) {
    return null;
  }

  const role: UserRole =
    session.role === "admin" ||
    session.role === "customer" ||
    session.role === "seller"
      ? session.role
      : resolveUserRole(session.email);

  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    role,
    remember: session.remember,
    signedInAt: session.signedInAt,
    sellerId:
      typeof session.sellerId === "string"
        ? session.sellerId
        : resolveSellerId(session.email, role),
  };
}

function readJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function readProfile(): DemoUserProfile | null {
  if (typeof window === "undefined") return null;
  const parsed = readJson(window.localStorage.getItem(DEMO_USER_STORAGE_KEY));
  if (!isDemoProfile(parsed)) return null;

  return {
    ...parsed,
    role:
      parsed.role === "admin" ||
      parsed.role === "seller" ||
      parsed.role === "customer"
        ? parsed.role
        : resolveUserRole(parsed.email),
  };
}

function readSession(): DemoSession | null {
  if (typeof window === "undefined") return null;

  const fromSession = normalizeSession(
    readJson(window.sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY)),
  );
  if (fromSession) return fromSession;

  return normalizeSession(
    readJson(window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY)),
  );
}

function clearSessionStorage() {
  window.sessionStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
  window.localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
}

/**
 * Autenticação demonstrativa apenas para o protótipo frontend.
 * A proteção real deve ocorrer no backend com sessão segura e cookie httpOnly.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setUser(readSession());
      setIsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const getDemoProfile = useCallback(() => readProfile(), []);

  const signUp = useCallback(
    (input: {
      name: string;
      email: string;
      phone?: string;
      password: string;
    }) => {
      void input.password;
      void input.phone;

      const email = input.email.trim().toLowerCase();
      const profile: DemoUserProfile = {
        id: `demo-${Date.now()}`,
        name: input.name.trim(),
        email,
        createdAt: new Date().toISOString(),
        role: "customer",
      };

      window.localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(profile));
      return { ok: true as const, profile };
    },
    [],
  );

  const signIn = useCallback(
    (input: { email: string; password: string; remember: boolean }) => {
      const email = input.email.trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { ok: false as const, error: "Informe um e-mail válido." };
      }

      if (input.password.length < 6) {
        return {
          ok: false as const,
          error: "A senha deve ter ao menos 6 caracteres.",
        };
      }

      const role = resolveUserRole(email);
      const profile = readProfile();
      const session: DemoSession = {
        userId: profile?.id ?? `demo-guest-${Date.now()}`,
        email,
        name:
          role === "admin"
            ? "Administrador Potala"
            : role === "seller"
              ? "Vendedor Potala"
              : profile?.name?.trim() || "Cliente Potala",
        role,
        sellerId: resolveSellerId(email, role),
        remember: input.remember,
        signedInAt: new Date().toISOString(),
      };

      clearSessionStorage();

      if (input.remember) {
        window.localStorage.setItem(
          DEMO_SESSION_STORAGE_KEY,
          JSON.stringify(session),
        );
      } else {
        window.sessionStorage.setItem(
          DEMO_SESSION_STORAGE_KEY,
          JSON.stringify(session),
        );
      }

      setUser(session);
      return { ok: true as const, role };
    },
    [],
  );

  const signOut = useCallback(() => {
    clearSessionStorage();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isHydrated,
      signIn,
      signUp,
      signOut,
      getDemoProfile,
    }),
    [user, isHydrated, signIn, signUp, signOut, getDemoProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}
