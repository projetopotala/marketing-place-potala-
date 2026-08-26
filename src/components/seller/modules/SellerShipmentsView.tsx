"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import { useAdminData } from "@/features/admin/context/AdminDataContext";
import { SHIPMENT_STATUS_LABEL } from "@/features/admin/domain/status";
import { selectSellerShipments } from "@/features/seller/selectors";
import { useSellerId } from "@/features/seller/useSellerId";
import styles from "@/components/seller/seller.module.css";

export function SellerShipmentsView() {
  const sellerId = useSellerId();
  const { db, repo, refresh, isHydrated } = useAdminData();
  const { push } = useAdminToast();
  const [trackingById, setTrackingById] = useState<Record<string, string>>({});

  const shipments = useMemo(() => {
    if (!sellerId) return [];
    return selectSellerShipments(db, sellerId);
  }, [db, sellerId]);

  if (!isHydrated || !sellerId) {
    return <p role="status">Carregando entregas…</p>;
  }

  function saveTracking(event: FormEvent, shipmentId: string) {
    event.preventDefault();
    const code = (trackingById[shipmentId] ?? "").trim();
    if (!code) {
      push("Informe o rastreio.", "error");
      return;
    }
    const next = repo.updateShipmentStatus(shipmentId, "in_transit", {
      trackingCode: code,
    });
    refresh(next);
    push("Entrega atualizada.");
  }

  return (
    <>
      <header>
        <h1 className={styles.pageTitle}>Entregas</h1>
        <p className={styles.pageLead}>
          Acompanhe envios da sua loja e registre rastreio demonstrativo.
        </p>
      </header>

      <section className={styles.panel}>
        {shipments.length === 0 ? (
          <p>Nenhuma entrega vinculada ao seu sellerId.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
            {shipments.map((shipment) => (
              <li key={shipment.id} className={styles.metricCard}>
                <p className={styles.metricLabel}>
                  Pedido {shipment.orderId} ·{" "}
                  {SHIPMENT_STATUS_LABEL[shipment.status]}
                </p>
                <p>
                  {shipment.carrier} → {shipment.destination}
                </p>
                <p>Atual: {shipment.trackingCode || "sem código"}</p>
                <form
                  onSubmit={(event) => saveTracking(event, shipment.id)}
                  style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                >
                  <label htmlFor={`trk-${shipment.id}`}>Novo rastreio</label>
                  <input
                    id={`trk-${shipment.id}`}
                    style={{
                      minHeight: 44,
                      flex: 1,
                      borderRadius: 8,
                      border: "1px solid var(--potala-border)",
                      background: "var(--potala-navy-750)",
                      color: "var(--potala-text-primary)",
                      padding: "0 12px",
                    }}
                    value={trackingById[shipment.id] ?? ""}
                    onChange={(event) =>
                      setTrackingById((current) => ({
                        ...current,
                        [shipment.id]: event.target.value,
                      }))
                    }
                    placeholder="Código de rastreio"
                  />
                  <button type="submit" className={styles.ghostBtn}>
                    Atualizar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
