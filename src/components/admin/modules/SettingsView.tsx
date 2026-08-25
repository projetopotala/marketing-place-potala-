"use client";

import { useState } from "react";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import type { MarketplaceSettings } from "@/features/admin/domain/types";
import { formatMoney } from "@/features/admin/utils/currency";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { sharedStyles } from "@/components/admin/shared/AdminDataTable";
import { Field } from "@/components/admin/shared/AdminStatusBadge";
import { AdminConfirmDialog } from "@/components/admin/shared/AdminModal";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import moduleStyles from "./modules.module.css";

type TabId =
  | "identidade"
  | "comissoes"
  | "entregas"
  | "pagamentos"
  | "notificacoes"
  | "seguranca";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "identidade", label: "Identidade" },
  { id: "comissoes", label: "Comissões" },
  { id: "entregas", label: "Entregas" },
  { id: "pagamentos", label: "Pagamentos" },
  { id: "notificacoes", label: "Notificações" },
  { id: "seguranca", label: "Segurança" },
];

export function SettingsView() {
  const { db, isHydrated, repo, refresh, resetDemoData } = useAdminData();
  const toast = useAdminToast();
  const [tab, setTab] = useState<TabId>("identidade");
  const [draft, setDraft] = useState<MarketplaceSettings | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const form = draft ?? db.settings;

  function patch(next: Partial<MarketplaceSettings>) {
    setDraft({ ...form, ...next });
  }

  function save() {
    refresh(repo.saveSettings(form));
    setDraft(null);
    toast.push("Configurações salvas");
  }

  function cancel() {
    setDraft(null);
    toast.push("Alterações descartadas", "info");
  }

  function restoreDefaults() {
    const seed = {
      marketplaceName: "Instituto Potala Marketplace",
      supportEmail: "contato@institutopotala.demo",
      defaultCommissionPercent: 12,
      freeShippingFromCents: 29900,
      defaultCarrier: "Correios",
      pixEnabled: true,
      cardEnabled: true,
      boletoEnabled: true,
      notifyNewOrders: true,
      notifyApprovals: true,
      notifyShipments: true,
      sessionTimeoutMinutes: 60,
      twoFactorHintEnabled: true,
    } satisfies MarketplaceSettings;
    refresh(repo.saveSettings(seed));
    setDraft(null);
    toast.push("Padrões restaurados");
  }

  if (!isHydrated) {
    return <div className={sharedStyles.skeleton} aria-busy="true" />;
  }

  return (
    <div className={sharedStyles.stack}>
      <AdminPageHeader
        title="Configurações"
        description="Identidade, comissões, entregas, pagamentos e segurança do marketplace demo."
        actions={
          <>
            <button type="button" className={sharedStyles.btnGhost} onClick={cancel}>
              Cancelar
            </button>
            <button
              type="button"
              className={sharedStyles.btnSecondary}
              onClick={restoreDefaults}
            >
              Restaurar padrões
            </button>
            <button type="button" className={sharedStyles.btn} onClick={save}>
              Salvar
            </button>
          </>
        }
      />

      <div className={moduleStyles.tabs} role="tablist" aria-label="Seções de configuração">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? moduleStyles.tabActive : moduleStyles.tab}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={sharedStyles.panel}>
        {tab === "identidade" ? (
          <div className={sharedStyles.stack}>
            <Field label="Nome do marketplace">
              <input
                value={form.marketplaceName}
                onChange={(e) => patch({ marketplaceName: e.target.value })}
              />
            </Field>
            <Field label="E-mail de suporte">
              <input
                value={form.supportEmail}
                onChange={(e) => patch({ supportEmail: e.target.value })}
              />
            </Field>
          </div>
        ) : null}

        {tab === "comissoes" ? (
          <Field label="Comissão padrão (%)">
            <input
              type="number"
              min={0}
              max={100}
              value={form.defaultCommissionPercent}
              onChange={(e) =>
                patch({ defaultCommissionPercent: Number(e.target.value) || 0 })
              }
            />
          </Field>
        ) : null}

        {tab === "entregas" ? (
          <div className={sharedStyles.stack}>
            <Field label="Frete grátis a partir (centavos)">
              <input
                type="number"
                value={form.freeShippingFromCents}
                onChange={(e) =>
                  patch({ freeShippingFromCents: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <p className={moduleStyles.muted}>
              Equivale a {formatMoney(form.freeShippingFromCents)}
            </p>
            <Field label="Transportadora padrão">
              <input
                value={form.defaultCarrier}
                onChange={(e) => patch({ defaultCarrier: e.target.value })}
              />
            </Field>
          </div>
        ) : null}

        {tab === "pagamentos" ? (
          <div className={sharedStyles.stack}>
            <label className={moduleStyles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.pixEnabled}
                onChange={(e) => patch({ pixEnabled: e.target.checked })}
              />
              PIX habilitado
            </label>
            <label className={moduleStyles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.cardEnabled}
                onChange={(e) => patch({ cardEnabled: e.target.checked })}
              />
              Cartão habilitado
            </label>
            <label className={moduleStyles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.boletoEnabled}
                onChange={(e) => patch({ boletoEnabled: e.target.checked })}
              />
              Boleto habilitado
            </label>
          </div>
        ) : null}

        {tab === "notificacoes" ? (
          <div className={sharedStyles.stack}>
            <label className={moduleStyles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.notifyNewOrders}
                onChange={(e) => patch({ notifyNewOrders: e.target.checked })}
              />
              Novos pedidos
            </label>
            <label className={moduleStyles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.notifyApprovals}
                onChange={(e) => patch({ notifyApprovals: e.target.checked })}
              />
              Aprovações
            </label>
            <label className={moduleStyles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.notifyShipments}
                onChange={(e) => patch({ notifyShipments: e.target.checked })}
              />
              Entregas
            </label>
          </div>
        ) : null}

        {tab === "seguranca" ? (
          <div className={sharedStyles.stack}>
            <Field label="Timeout de sessão (minutos)">
              <input
                type="number"
                min={5}
                value={form.sessionTimeoutMinutes}
                onChange={(e) =>
                  patch({ sessionTimeoutMinutes: Number(e.target.value) || 5 })
                }
              />
            </Field>
            <label className={moduleStyles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.twoFactorHintEnabled}
                onChange={(e) =>
                  patch({ twoFactorHintEnabled: e.target.checked })
                }
              />
              Exibir dica de 2FA (demo)
            </label>
            <button
              type="button"
              className={sharedStyles.btnDanger}
              onClick={() => setConfirmReset(true)}
            >
              Resetar dados demonstrativos
            </button>
          </div>
        ) : null}
      </div>

      <AdminConfirmDialog
        open={confirmReset}
        title="Resetar dados demo"
        description="Isso restaura o seed inicial e apaga alterações locais do painel. Continuar?"
        confirmLabel="Resetar"
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemoData();
          setDraft(null);
          setConfirmReset(false);
          toast.push("Dados demonstrativos restaurados");
        }}
      />
    </div>
  );
}
