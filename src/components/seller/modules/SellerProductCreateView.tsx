"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import { useAdminData } from "@/features/admin/context/AdminDataContext";
import { useSellerId } from "@/features/seller/useSellerId";
import styles from "@/components/seller/seller.module.css";

export function SellerProductCreateView() {
  const sellerId = useSellerId();
  const router = useRouter();
  const { db, repo, refresh, isHydrated } = useAdminData();
  const { push } = useAdminToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const defaultCategoryId = useMemo(
    () => db.categories[0]?.id ?? "cat-1",
    [db.categories],
  );

  if (!isHydrated || !sellerId) {
    return <p role="status">Carregando formulário…</p>;
  }

  const currentSellerId = sellerId;

  function handleSubmit(event: React.FormEvent, asReview: boolean) {
    event.preventDefault();
    setError(null);

    const trimmed = title.trim();
    if (trimmed.length < 3) {
      setError("Informe um título com pelo menos 3 caracteres.");
      return;
    }

    const priceCents = Math.round(Number(price.replace(",", ".")) * 100);
    const stockValue = Number.parseInt(stock, 10);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      setError("Preço inválido.");
      return;
    }
    if (!Number.isFinite(stockValue) || stockValue < 0) {
      setError("Estoque inválido.");
      return;
    }

    const next = repo.createProduct({
      title: trimmed,
      description: description.trim() || "Descrição demonstrativa.",
      sellerId: currentSellerId,
      categoryId: defaultCategoryId,
      priceCents,
      stock: stockValue,
      status: asReview ? "review" : "draft",
      featured: false,
      imageSrc: "/images/potala/category-incensos-final.png",
      imageAlt: `${trimmed} (imagem demonstrativa)`,
      attributes: {},
      slug: trimmed
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    });
    refresh(next);
    push(
      asReview
        ? "Produto enviado para revisão do admin."
        : "Rascunho criado com sucesso.",
    );
    const created = next.products[0];
    router.push(`/loja/produtos/${created.id}`);
  }

  return (
    <>
      <header>
        <h1 className={styles.pageTitle}>Novo produto</h1>
        <p className={styles.pageLead}>
          Crie um rascunho ou envie para revisão. Você não pode aprovar o próprio
          produto.
        </p>
      </header>

      <form className={`${styles.panel} ${styles.formGrid}`}>
        <div className={styles.field}>
          <label htmlFor="np-title">Título</label>
          <input
            id="np-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="np-description">Descrição</label>
          <textarea
            id="np-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="np-price">Preço (R$)</label>
          <input
            id="np-price"
            inputMode="decimal"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="np-stock">Estoque</label>
          <input
            id="np-stock"
            inputMode="numeric"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
          />
        </div>

        {error ? (
          <p role="alert" style={{ color: "var(--potala-danger)" }}>
            {error}
          </p>
        ) : null}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={(event) => handleSubmit(event, false)}
          >
            Salvar rascunho
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={(event) => handleSubmit(event, true)}
          >
            Enviar para revisão
          </button>
        </div>
      </form>
    </>
  );
}
