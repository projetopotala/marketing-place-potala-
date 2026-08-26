"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import type { Product } from "@/types/marketplace";
import { formatPrice } from "@/data/marketplace";
import { useCart } from "@/context/CartContext";
import {
  CartIcon,
  ClockIcon,
  MinusIcon,
  PlusIcon,
  StarIcon,
  TruckIcon,
} from "@/components/storefront/icons";
import styles from "./ProductPurchasePanel.module.css";

interface ProductPurchasePanelProps {
  product: Product;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const stock = product.stock ?? 1;
  const [quantity, setQuantity] = useState(1);
  const [cep, setCep] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const quantityId = useId();
  const cepId = useId();
  const feedbackId = useId();

  function decrease() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increase() {
    setQuantity((current) => Math.min(stock, current + 1));
  }

  function buildCartInput() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      imageSrc: product.imageSrc,
      unitPrice: product.price,
      stock,
      quantity,
    };
  }

  function handleAddToCart() {
    addItem(buildCartInput());
    setFeedback(
      `${quantity} ${quantity === 1 ? "unidade adicionada" : "unidades adicionadas"} ao carrinho.`,
    );
  }

  function handleBuyNow() {
    addItem(buildCartInput());
    router.push("/checkout");
  }

  return (
    <aside className={styles.panel} aria-labelledby="purchase-panel-title">
      <h2 id="purchase-panel-title" className={styles.price}>
        {formatPrice(product.price)}
      </h2>

      {product.originalPrice && product.discountPercent ? (
        <p className={styles.discountRow}>
          <span className={styles.original}>{formatPrice(product.originalPrice)}</span>
          <span className={styles.badge}>-{product.discountPercent}%</span>
        </p>
      ) : null}

      <p className={styles.stock}>
        {stock > 0 ? `${stock} em estoque` : "Indisponível"}
      </p>

      {product.seller ? (
        <p className={styles.seller}>
          Vendido por <strong>{product.seller.name}</strong>
        </p>
      ) : null}

      <div className={styles.quantityBlock}>
        <label htmlFor={quantityId} className={styles.label}>
          Quantidade
        </label>
        <div className={styles.quantityControls}>
          <button
            type="button"
            className={styles.qtyBtn}
            onClick={decrease}
            disabled={quantity <= 1}
            aria-label="Diminuir quantidade"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <input
            id={quantityId}
            className={styles.qtyInput}
            type="number"
            min={1}
            max={stock}
            value={quantity}
            readOnly
          />
          <button
            type="button"
            className={styles.qtyBtn}
            onClick={increase}
            disabled={quantity >= stock}
            aria-label="Aumentar quantidade"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.addCart}
          onClick={handleAddToCart}
          disabled={stock < 1}
        >
          <CartIcon className="h-4 w-4" />
          Adicionar ao carrinho
        </button>
        <button
          type="button"
          className={styles.buyNow}
          onClick={handleBuyNow}
          disabled={stock < 1}
        >
          Comprar agora
        </button>
      </div>

      <p id={feedbackId} role="status" aria-live="polite" className={styles.feedback}>
        {feedback}
      </p>

      <div className={styles.shipping}>
        <label htmlFor={cepId} className={styles.label}>
          Calcular frete
        </label>
        <div className={styles.cepRow}>
          <input
            id={cepId}
            type="text"
            inputMode="numeric"
            placeholder="00000-000"
            value={cep}
            onChange={(event) => setCep(event.target.value)}
            className={styles.cepInput}
            aria-describedby="cep-help"
          />
          <button type="button" className={styles.cepBtn}>
            Calcular
          </button>
        </div>
        <p id="cep-help" className={styles.help}>
          Cálculo visual — integração de frete em etapa futura.
        </p>
      </div>

      <ul className={styles.summaryList}>
        <li>
          <TruckIcon className="h-4 w-4" />
          <span>Frete sob consulta por CEP</span>
        </li>
        <li>
          <ClockIcon className="h-4 w-4" />
          <span>Envio em até 2 dias úteis</span>
        </li>
        <li>
          <StarIcon className="h-4 w-4" filled />
          <span>Compra segura Instituto Potala</span>
        </li>
      </ul>

      {product.paymentSummary && product.paymentSummary.length > 0 ? (
        <div className={styles.payment}>
          <h3 className={styles.subheading}>Formas de pagamento</h3>
          <ul>
            {product.paymentSummary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
