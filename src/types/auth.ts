/** Sessão e perfil demonstrativos — não representam autenticação segura. */

export type UserRole = "customer" | "admin";

export interface DemoUserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: UserRole;
}

export interface DemoSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  remember: boolean;
  signedInAt: string;
}

export type AccessMode = "login" | "register";

export const DEMO_USER_STORAGE_KEY = "potala-demo-user-v1";
export const DEMO_SESSION_STORAGE_KEY = "potala-demo-session-v1";
export const ADMIN_DEMO_EMAIL = "admin@potala.demo";

export function resolveUserRole(email: string): UserRole {
  return email.trim().toLowerCase() === ADMIN_DEMO_EMAIL ? "admin" : "customer";
}
