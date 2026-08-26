"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import { useAdminData } from "@/features/admin/context/AdminDataContext";
import type { Seller } from "@/features/admin/domain/types";
import { useSellerId } from "@/features/seller/useSellerId";
import styles from "@/components/seller/seller.module.css";

export function SellerSettingsView() {
  const sellerId = useSellerId();
  const { db, repo, refresh, isHydrated } = useAdminData();

  const seller = useMemo(
    () => db.sellers.find((item) => item.id === sellerId),
    [db.sellers, sellerId],
  );

  if (!isHydrated || !sellerId || !seller) {
    return <p role="status">Carregando configurações…</p>;
  }

  return (
    <SellerSettingsForm
      key={`${seller.id}-${seller.updatedAt}`}
      seller={seller}
      onSave={(patch) => {
        const next = repo.updateSeller(seller.id, patch);
        refresh(next);
      }}
    />
  );
}

function SellerSettingsForm({
  seller,
  onSave,
}: {
  seller: Seller;
  onSave: (patch: Partial<Seller>) => void;
}) {
  const { push } = useAdminToast();
  const [name, setName] = useState(seller.name);
  const [description, setDescription] = useState(seller.description ?? "");
  const [phone, setPhone] = useState(seller.phone);

  function save(event: FormEvent) {
    event.preventDefault();
    onSave({
      name: name.trim() || seller.name,
      description: description.trim(),
      phone: phone.trim() || seller.phone,
    });
    push("Configurações da loja salvas (demonstrativo).");
  }

  return (
    <>
      <header>
        <h1 className={styles.pageTitle}>Configurações</h1>
        <p className={styles.pageLead}>
          Identidade pública da loja. Slug: {seller.slug ?? "definir-no-admin"}
        </p>
      </header>

      <form className={`${styles.panel} ${styles.formGrid}`} onSubmit={save}>
        <div className={styles.field}>
          <label htmlFor="shop-name">Nome da loja</label>
          <input
            id="shop-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="shop-phone">Telefone</label>
          <input
            id="shop-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="shop-description">Descrição</label>
          <textarea
            id="shop-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <button type="submit" className={styles.primaryBtn}>
          Salvar
        </button>
      </form>
    </>
  );
}
