import type { ReactNode } from "react";
import { SellerAuthGuard } from "@/components/seller/SellerAuthGuard";
import { SellerShell } from "@/components/seller/SellerShell";
import { AdminToastProvider } from "@/components/admin/shared/AdminToastProvider";
import { AdminDataProvider } from "@/features/admin/context/AdminDataContext";

export const metadata = {
  title: "Área do Vendedor | Instituto Potala Marketplace",
  description:
    "Painel demonstrativo do vendedor para pedidos, produtos, estoque e financeiro.",
};

/**
 * Layout do vendedor — chrome próprio, dados do mesmo repositório admin demo.
 * Isolamento por sellerId é aplicado nos selectors e nas telas.
 */
export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <SellerAuthGuard>
      <AdminDataProvider>
        <AdminToastProvider>
          <SellerShell>{children}</SellerShell>
        </AdminToastProvider>
      </AdminDataProvider>
    </SellerAuthGuard>
  );
}
