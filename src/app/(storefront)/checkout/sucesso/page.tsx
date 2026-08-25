"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { OrderSummary } from "@/types/cart";
import { ORDER_STORAGE_KEY } from "@/data/cart";
import { formatPrice } from "@/data/marketplace";
import styles from "./page.module.css";

function parseOrder(raw: string | null): OrderSummary | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OrderSummary;
    if (!parsed || typeof parsed.orderId !== "string" || !Array.isArray(parsed.items)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) {
        return;
      }

      setOrder(parseOrder(window.sessionStorage.getItem(ORDER_STORAGE_KEY)));
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const demoPixCode =
    "00020126580014BR.GOV.BCB.PIX0136potala-demo-codigo-ficticio52040000530398654041.005802BR5925INSTITUTO POTALA DEMO6009SAO PAULO62070503***6304ABCD";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(demoPixCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (!ready) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p role="status">Carregando confirmação…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Confirmação indisponível</h1>
          <p className={styles.text}>
            Não encontramos um pedido recente neste navegador. Finalize uma compra
            no checkout para visualizar a confirmação.
          </p>
          <Link href="/#produtos" className={styles.primaryBtn}>
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <span className={styles.check} aria-hidden="true">
            ✓
          </span>
          <h1 className={styles.title}>Pedido realizado com sucesso</h1>
          <p className={styles.code}>
            Código do pedido: <strong>{order.orderId}</strong>
          </p>
          <p className={styles.text}>
            Olá, {order.customerName}. Este é um fluxo demonstrativo — nenhum
            pagamento real foi processado.
          </p>
        </div>

        <section className={styles.card} aria-labelledby="success-summary-title">
          <h2 id="success-summary-title">Resumo</h2>
          <ul>
            {order.items.map((item) => (
              <li key={item.productId}>
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span>{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div>
              <dt>Entrega ({order.shippingLabel})</dt>
              <dd>{formatPrice(order.shippingCost)}</dd>
            </div>
            <div>
              <dt>Pagamento</dt>
              <dd>{order.paymentLabel}</dd>
            </div>
            <div className={styles.total}>
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        {order.paymentMethod === "pix" ? (
          <section className={styles.pix} aria-labelledby="pix-demo-title">
            <h2 id="pix-demo-title">Pix (demonstração)</h2>
            <div className={styles.qr} aria-hidden="true" />
            <p className={styles.pixCode}>{demoPixCode}</p>
            <button type="button" className={styles.secondaryBtn} onClick={handleCopy}>
              Copiar código
            </button>
            <p role="status" aria-live="polite" className={styles.copyStatus}>
              {copied ? "Código fictício copiado." : "Código demonstrativo — sem validade real."}
            </p>
          </section>
        ) : null}

        <section className={styles.next}>
          <h2>Próximos passos</h2>
          <p>
            Em breve você poderá acompanhar pedidos na área autenticada. Por ora,
            este protótipo encerra o fluxo público de compra.
          </p>
          <div className={styles.actions}>
            <Link href="/#produtos" className={styles.primaryBtn}>
              Continuar comprando
            </Link>
            <span className={styles.disabledLink} aria-disabled="true">
              Ver meus pedidos · Disponível em breve
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
