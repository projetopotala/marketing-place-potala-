"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useAdminToast } from "@/components/admin/shared/AdminToastProvider";
import { useAdminData } from "@/features/admin/context/AdminDataContext";
import { PRODUCT_STATUS_LABEL } from "@/features/admin/domain/status";
import type { AdminProduct } from "@/features/admin/domain/types";
import { formatMoney } from "@/features/admin/utils/currency";
import { sellerOwnsProduct } from "@/features/seller/selectors";
import { useSellerId } from "@/features/seller/useSellerId";
import styles from "@/components/seller/seller.module.css";

export function SellerProductDetailView() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const sellerId = useSellerId();
  const { db, repo, refresh, isHydrated } = useAdminData();

  const product = useMemo(
    () => db.products.find((item) => item.id === productId),
    [db.products, productId],
  );

  if (!isHydrated || !sellerId) {
    return <p role="status">Carregando produto…</p>;
  }

  if (!product || !sellerOwnsProduct(db, sellerId, productId)) {
    return (
      <section className={styles.denied} role="alert">
        <h1 className={styles.pageTitle}>Produto indisponível</h1>
        <p>
          Este produto não pertence à sua loja ou não existe. O acesso é
          isolado por sellerId.
        </p>
      </section>
    );
  }

  return (
    <SellerProductEditor
      key={`${product.id}-${product.updatedAt}`}
      product={product}
      onSave={(patch) => {
        const next = repo.updateProduct(product.id, patch);
        refresh(next);
      }}
      onReview={() => {
        const next = repo.changeProductStatus(product.id, "review");
        refresh(next);
      }}
      onAddAttribute={(key, value) => {
        const next = repo.updateProduct(product.id, {
          attributes: {
            ...product.attributes,
            [key]: value,
          },
        });
        refresh(next);
      }}
    />
  );
}

function SellerProductEditor({
  product,
  onSave,
  onReview,
  onAddAttribute,
}: {
  product: AdminProduct;
  onSave: (patch: Partial<AdminProduct>) => void;
  onReview: () => void;
  onAddAttribute: (key: string, value: string) => void;
}) {
  const { push } = useAdminToast();
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.priceCents / 100));
  const [stock, setStock] = useState(String(product.stock));
  const [attrKey, setAttrKey] = useState("");
  const [attrValue, setAttrValue] = useState("");

  function saveEdits(event: FormEvent) {
    event.preventDefault();
    const priceCents = Math.round(Number(price.replace(",", ".")) * 100);
    const stockValue = Number.parseInt(stock, 10);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      push("Preço inválido.", "error");
      return;
    }
    if (!Number.isFinite(stockValue) || stockValue < 0) {
      push("Estoque inválido.", "error");
      return;
    }

    onSave({
      title: title.trim() || product.title,
      description: description.trim() || product.description,
      priceCents,
      stock: stockValue,
    });
    push("Produto atualizado.");
  }

  function submitReview() {
    if (product.status !== "draft" && product.status !== "rejected") {
      push("Somente rascunhos ou rejeitados podem ir para revisão.", "error");
      return;
    }
    onReview();
    push("Produto enviado para revisão do admin.");
  }

  function addAttribute(event: FormEvent) {
    event.preventDefault();
    if (!attrKey.trim()) return;
    onAddAttribute(attrKey.trim(), attrValue.trim() || "—");
    setAttrKey("");
    setAttrValue("");
    push("Atributo adicionado.");
  }

  return (
    <>
      <header>
        <h1 className={styles.pageTitle}>{product.title}</h1>
        <p className={styles.pageLead}>
          Status: {PRODUCT_STATUS_LABEL[product.status]} ·{" "}
          {formatMoney(product.priceCents)}
        </p>
      </header>

      <form className={`${styles.panel} ${styles.formGrid}`} onSubmit={saveEdits}>
        <div className={styles.field}>
          <label htmlFor="ep-title">Título</label>
          <input
            id="ep-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="ep-description">Descrição</label>
          <textarea
            id="ep-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="ep-price">Preço (R$)</label>
          <input
            id="ep-price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="ep-stock">Estoque</label>
          <input
            id="ep-stock"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
          />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="submit" className={styles.primaryBtn}>
            Salvar alterações
          </button>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={submitReview}
          >
            Enviar para revisão
          </button>
        </div>
      </form>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Imagem demonstrativa</h2>
        <Image
          src={product.imageSrc}
          alt={product.imageAlt ?? product.title}
          width={240}
          height={240}
          style={{
            borderRadius: 12,
            border: "1px solid var(--potala-border)",
            objectFit: "cover",
          }}
        />
        <p className={styles.pageLead}>
          Sem backend de upload — mantém a imagem do catálogo ou placeholder.
        </p>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Atributos</h2>
        <ul>
          {Object.entries(product.attributes).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
        <form
          className={styles.formGrid}
          onSubmit={addAttribute}
          style={{ marginTop: 12 }}
        >
          <div className={styles.field}>
            <label htmlFor="attr-key">Chave</label>
            <input
              id="attr-key"
              value={attrKey}
              onChange={(event) => setAttrKey(event.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="attr-value">Valor</label>
            <input
              id="attr-value"
              value={attrValue}
              onChange={(event) => setAttrValue(event.target.value)}
            />
          </div>
          <button type="submit" className={styles.ghostBtn}>
            Adicionar atributo
          </button>
        </form>
      </section>
    </>
  );
}
