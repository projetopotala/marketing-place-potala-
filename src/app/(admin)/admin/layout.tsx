import type { ReactNode } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminToastProvider } from "@/components/admin/shared/AdminToastProvider";
import { AdminDataProvider } from "@/features/admin/context/AdminDataContext";

export const metadata = {
  title: "Painel Administrativo | Instituto Potala Marketplace",
  description:
    "Visão geral e controle completo do ecossistema espiritual do Instituto Potala.",
};

/**
 * Layout administrativo independente do storefront.
 * Proteção demonstrativa — produção exige backend, cookies httpOnly e RBAC.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminDataProvider>
        <AdminToastProvider>
          <AdminShell>{children}</AdminShell>
        </AdminToastProvider>
      </AdminDataProvider>
    </AdminAuthGuard>
  );
}
