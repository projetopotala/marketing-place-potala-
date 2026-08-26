"use client";

import { useState, type FormEvent } from "react";
import { AccountChrome } from "@/components/account/AccountChrome";
import { useAuth } from "@/context/AuthContext";

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [status, setStatus] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus(
      "Preferências salvas apenas nesta sessão de UI. Sem backend, o perfil permanente não é alterado.",
    );
  }

  return (
    <AccountChrome
      title="Configurações"
      lead="Preferências demonstrativas da conta."
      breadcrumbCurrent="Configurações"
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 480 }}>
        <div>
          <label htmlFor="cfg-email">E-mail</label>
          <input
            id="cfg-email"
            value={user?.email ?? ""}
            readOnly
            style={{ width: "100%", minHeight: 44 }}
          />
        </div>
        <div>
          <label htmlFor="cfg-name">Nome exibido</label>
          <input
            id="cfg-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            style={{ width: "100%", minHeight: 44 }}
          />
        </div>
        <button type="submit" style={{ minHeight: 44 }}>
          Salvar preferências
        </button>
        {status ? (
          <p role="status" aria-live="polite">
            {status}
          </p>
        ) : null}
      </form>
    </AccountChrome>
  );
}
