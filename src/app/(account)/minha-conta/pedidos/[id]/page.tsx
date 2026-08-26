"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AccountChrome } from "@/components/account/AccountChrome";
import { useAccountData } from "@/features/account/AccountDataContext";
import { CUSTOMER_ORDER_STATUS_LABEL } from "@/features/account/domain";
import { formatPrice } from "@/data/marketplace";

export default function AccountOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { db, isHydrated } = useAccountData();
  const order = db?.orders.find((item) => item.id === params.id);

  return (
    <AccountChrome
      title={order ? `Pedido ${order.code}` : "Pedido"}
      breadcrumbCurrent="Detalhe do pedido"
    >
      {!isHydrated || !db ? (
        <p role="status">Carregando…</p>
      ) : !order ? (
        <p role="alert">
          Pedido não encontrado.{" "}
          <Link href="/minha-conta/pedidos">Voltar à lista</Link>
        </p>
      ) : (
        <>
          <p>
            Status: {CUSTOMER_ORDER_STATUS_LABEL[order.status]} · Total{" "}
            {formatPrice(order.total)}
          </p>

          <section>
            <h2>Itens</h2>
            <ul>
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.slug}`}>
                  <Link href={`/produto/${item.slug}`}>{item.name}</Link> —{" "}
                  {item.quantity}× {formatPrice(item.unitPrice)}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Totais</h2>
            <p>Subtotal {formatPrice(order.subtotal)}</p>
            <p>
              Frete ({order.shippingLabel}) {formatPrice(order.shippingCost)}
            </p>
            <p>Total {formatPrice(order.total)}</p>
          </section>

          <section>
            <h2>Entrega</h2>
            <p>
              {order.addressLabel} — {order.city}/{order.state}
            </p>
          </section>

          <section>
            <h2>Pagamento</h2>
            <p>{order.paymentLabel}</p>
          </section>

          <section>
            <h2>Timeline</h2>
            <ol>
              {order.timeline.map((event) => (
                <li key={event.id}>
                  <strong>{event.label}</strong> —{" "}
                  {new Date(event.at).toLocaleString("pt-BR")}
                  {event.detail ? <div>{event.detail}</div> : null}
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </AccountChrome>
  );
}
