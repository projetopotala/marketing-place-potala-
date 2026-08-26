/** Sessão e perfil demonstrativos — não representam autenticação segura. */

export type UserRole = "customer" | "seller" | "admin";

export interface DemoUserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: UserRole;
  sellerId?: string;
}

export interface DemoSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  remember: boolean;
  signedInAt: string;
  sellerId?: string;
}

export type AccessMode = "login" | "register";

export const DEMO_USER_STORAGE_KEY = "potala-demo-user-v1";
export const DEMO_SESSION_STORAGE_KEY = "potala-demo-session-v1";
export const ADMIN_DEMO_EMAIL = "admin@potala.demo";
export const SELLER_DEMO_EMAIL = "vendedor@potala.demo";
/** Conta seller demo vinculada ao seed `sel-1` (Casa das Ervas Sagradas). */
export const SELLER_DEMO_ID = "sel-1";

export function resolveUserRole(email: string): UserRole {
  const normalized = email.trim().toLowerCase();
  if (normalized === ADMIN_DEMO_EMAIL) return "admin";
  if (normalized === SELLER_DEMO_EMAIL) return "seller";
  return "customer";
}

export function resolveSellerId(email: string, role: UserRole): string | undefined {
  if (role !== "seller") return undefined;
  if (email.trim().toLowerCase() === SELLER_DEMO_EMAIL) return SELLER_DEMO_ID;
  return undefined;
}
