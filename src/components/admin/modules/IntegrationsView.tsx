"use client";

import Link from "next/link";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { formatPercent } from "@/features/admin/utils/currency";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  AdminMetricCard,
  AdminMetricsRow,
} from "@/components/admin/shared/AdminMetricCard";
import { sharedStyles } from "@/components/admin/shared/AdminDataTable";
import { AdminStatusBadge } from "@/components/admin/shared/AdminStatusBadge";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import moduleStyles from "./modules.module.css";

export function IntegrationsView() {
  const { db, isHydrated, repo, refresh } = useAdminData();
  const toast = useAdminToast();

  if (!isHydrated) {
    return <div className={sharedStyles.skeleton} aria-busy="true" />;
  }

  const connected = db.gateways.filter((g) => g.status === "connected").length;
  const healthy = db.gateways.filter((g) => g.health === "healthy").length;

  return (
    <div className={sharedStyles.stack}>
      <AdminPageHeader
        title="Integrações de pagamento"
        description="Gateways demonstrativos — credenciais nunca são exibidas."
        actions={
          <Link href="/admin/financeiro" className={sharedStyles.btnGhost}>
            Voltar ao financeiro
          </Link>
        }
      />

      <AdminMetricsRow>
        <AdminMetricCard label="Gateways" value={String(db.gateways.length)} />
        <AdminMetricCard label="Conectados" value={String(connected)} />
        <AdminMetricCard label="Saudáveis" value={String(healthy)} />
      </AdminMetricsRow>

      <div className={sharedStyles.grid2}>
        {db.gateways.map((gateway) => (
          <article key={gateway.id} className={sharedStyles.panel}>
            <div className={sharedStyles.rowActions} style={{ justifyContent: "space-between" }}>
              <h2 className={sharedStyles.panelTitle} style={{ margin: 0 }}>
                {gateway.name}
              </h2>
              <AdminStatusBadge
                label={gateway.status === "connected" ? "Conectado" : "Desconectado"}
                tone={gateway.status === "connected" ? "success" : "muted"}
              />
            </div>
            <div className={moduleStyles.kvGrid}>
              <div>
                <p className={moduleStyles.kvLabel}>Métodos</p>
                <p className={moduleStyles.kvValue}>
                  {gateway.methods.map((m) => m.toUpperCase()).join(", ")}
                </p>
              </div>
              <div>
                <p className={moduleStyles.kvLabel}>Taxa</p>
                <p className={moduleStyles.kvValue}>{formatPercent(gateway.feePercent)}</p>
              </div>
              <div>
                <p className={moduleStyles.kvLabel}>Saúde</p>
                <AdminStatusBadge
                  label={
                    gateway.health === "healthy"
                      ? "Saudável"
                      : gateway.health === "degraded"
                        ? "Degradado"
                        : "Indisponível"
                  }
                  tone={
                    gateway.health === "healthy"
                      ? "success"
                      : gateway.health === "degraded"
                        ? "warning"
                        : "danger"
                  }
                />
              </div>
              <div>
                <p className={moduleStyles.kvLabel}>Segredos</p>
                <p className={moduleStyles.kvValue}>•••••••• (oculto)</p>
              </div>
            </div>
            <div className={sharedStyles.rowActions} style={{ marginTop: 12 }}>
              <button
                type="button"
                className={sharedStyles.btnSecondary}
                onClick={() => {
                  refresh(repo.toggleGateway(gateway.id));
                  toast.push(
                    gateway.status === "connected"
                      ? `${gateway.name} desconectado`
                      : `${gateway.name} conectado`,
                  );
                }}
              >
                {gateway.status === "connected" ? "Desconectar" : "Conectar"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
