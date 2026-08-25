import type { ReactNode } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Painel Administrativo | Instituto Potala Marketplace",
  description:
    "Visão geral e controle completo do ecossistema espiritual do Instituto Potala.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminShell>{children}</AdminShell>
    </AdminAuthGuard>
  );
}
