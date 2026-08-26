"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState, type FormEvent } from "react";
import type { CheckoutPaymentMethod, OrderSummary, ShippingOptionId } from "@/types/cart";
import {
  calcLineTotal,
  createOrderId,
  ORDER_STORAGE_KEY,
  PAYMENT_LABELS,
  SHIPPING_OPTIONS,
} from "@/data/cart";
import { formatPrice } from "@/data/marketplace";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useAccountData } from "@/features/account/AccountDataContext";
import styles from "./page.module.css";

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, isReady, clearCart } = useCart();
  const { user } = useAuth();
  const { appendOrderFromCheckout } = useAccountData();
  const formId = useId();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [shipping, setShipping] = useState<ShippingOptionId>("economic");
  const [payment, setPayment] = useState<CheckoutPaymentMethod>("pix");
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<string | null>(null);

  const shippingOption = SHIPPING_OPTIONS[shipping];
  const total = useMemo(
    () => Number((subtotal + shippingOption.cost).toFixed(2)),
    [subtotal, shippingOption.cost],
  );

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (!fullName.trim()) next.fullName = "Informe seu nome completo.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Informe um e-mail válido.";
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      next.phone = "Informe um telefone válido.";
    }
    if (!cep.trim() || cep.replace(/\D/g, "").length < 8) {
      next.cep = "Informe um CEP válido.";
    }
    if (!street.trim()) next.street = "Informe a rua.";
    if (!number.trim()) next.number = "Informe o número.";
    if (!neighborhood.trim()) next.neighborhood = "Informe o bairro.";
    if (!city.trim()) next.city = "Informe a cidade.";
    if (!state.trim() || state.trim().length !== 2) {
      next.state = "Informe o UF com 2 letras.";
    }

    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("Revise os campos destacados para continuar.");
      return;
    }

    const order: OrderSummary = {
      orderId: createOrderId(Math.floor(Math.random() * 90) + 10),
      items: items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        imageSrc: item.imageSrc,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: calcLineTotal(item.unitPrice, item.quantity),
      })),
      subtotal,
      shippingOption: shipping,
      shippingLabel: shippingOption.label,
      shippingCost: shippingOption.cost,
      total,
      paymentMethod: payment,
      paymentLabel: PAYMENT_LABELS[payment],
      customerName: fullName.trim(),
      createdAt: new Date().toISOString(),
    };

    window.sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
    if (user?.role === "customer") {
      appendOrderFromCheckout(order);
    }
    clearCart();
    router.push("/checkout/sucesso");
  }

  if (!isReady) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p role="status">Carregando checkout…</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Checkout</h1>
          <div className={styles.empty}>
            <p>Não há itens no carrinho para finalizar a compra.</p>
            <Link href="/#produtos" className={styles.primaryBtn}>
              Voltar ao marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Início</Link>
            </li>
            <li>
              <Link href="/carrinho">Carrinho</Link>
            </li>
            <li aria-current="page">Checkout</li>
          </ol>
        </nav>

        <h1 className={styles.title}>Checkout</h1>

        <form className={styles.layout} onSubmit={handleSubmit} noValidate>
          <div className={styles.forms}>
            <fieldset className={styles.fieldset}>
              <legend>Identificação</legend>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label htmlFor={`${formId}-name`}>Nome completo</label>
                  <input
                    id={`${formId}-name`}
                    name="fullName"
                    required
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? `${formId}-name-error` : undefined}
                  />
                  {errors.fullName ? (
                    <p id={`${formId}-name-error`} className={styles.error}>
                      {errors.fullName}
                    </p>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor={`${formId}-email`}>E-mail</label>
                  <input
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? `${formId}-email-error` : undefined}
                  />
                  {errors.email ? (
                    <p id={`${formId}-email-error`} className={styles.error}>
                      {errors.email}
                    </p>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor={`${formId}-phone`}>Telefone</label>
                  <input
                    id={`${formId}-phone`}
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? `${formId}-phone-error` : undefined}
                  />
                  {errors.phone ? (
                    <p id={`${formId}-phone-error`} className={styles.error}>
                      {errors.phone}
                    </p>
                  ) : null}
                </div>
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend>Endereço</legend>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label htmlFor={`${formId}-cep`}>CEP</label>
                  <input
                    id={`${formId}-cep`}
                    name="cep"
                    required
                    inputMode="numeric"
                    value={cep}
                    onChange={(event) => setCep(event.target.value)}
                    aria-invalid={Boolean(errors.cep)}
                    aria-describedby={errors.cep ? `${formId}-cep-error` : undefined}
                  />
                  {errors.cep ? (
                    <p id={`${formId}-cep-error`} className={styles.error}>
                      {errors.cep}
                    </p>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor={`${formId}-street`}>Rua</label>
                  <input
                    id={`${formId}-street`}
                    name="street"
                    required
                    value={street}
                    onChange={(event) => setStreet(event.target.value)}
                    aria-invalid={Boolean(errors.street)}
                    aria-describedby={errors.street ? `${formId}-street-error` : undefined}
                  />
                  {errors.street ? (
                    <p id={`${formId}-street-error`} className={styles.error}>
                      {errors.street}
                    </p>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor={`${formId}-number`}>Número</label>
                  <input
                    id={`${formId}-number`}
                    name="number"
                    required
                    value={number}
                    onChange={(event) => setNumber(event.target.value)}
                    aria-invalid={Boolean(errors.number)}
                    aria-describedby={errors.number ? `${formId}-number-error` : undefined}
                  />
                  {errors.number ? (
                    <p id={`${formId}-number-error`} className={styles.error}>
                      {errors.number}
                    </p>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor={`${formId}-complement`}>Complemento</label>
                  <input
                    id={`${formId}-complement`}
                    name="complement"
                    value={complement}
                    onChange={(event) => setComplement(event.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor={`${formId}-neighborhood`}>Bairro</label>
                  <input
                    id={`${formId}-neighborhood`}
                    name="neighborhood"
                    required
                    value={neighborhood}
                    onChange={(event) => setNeighborhood(event.target.value)}
                    aria-invalid={Boolean(errors.neighborhood)}
                    aria-describedby={
                      errors.neighborhood ? `${formId}-neighborhood-error` : undefined
                    }
                  />
                  {errors.neighborhood ? (
                    <p id={`${formId}-neighborhood-error`} className={styles.error}>
                      {errors.neighborhood}
                    </p>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor={`${formId}-city`}>Cidade</label>
                  <input
                    id={`${formId}-city`}
                    name="city"
                    required
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? `${formId}-city-error` : undefined}
                  />
                  {errors.city ? (
                    <p id={`${formId}-city-error`} className={styles.error}>
                      {errors.city}
                    </p>
                  ) : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor={`${formId}-state`}>Estado (UF)</label>
                  <input
                    id={`${formId}-state`}
                    name="state"
                    required
                    maxLength={2}
                    value={state}
                    onChange={(event) => setState(event.target.value.toUpperCase())}
                    aria-invalid={Boolean(errors.state)}
                    aria-describedby={errors.state ? `${formId}-state-error` : undefined}
                  />
                  {errors.state ? (
                    <p id={`${formId}-state-error`} className={styles.error}>
                      {errors.state}
                    </p>
                  ) : null}
                </div>
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend>Entrega</legend>
              <div className={styles.options}>
                {(Object.values(SHIPPING_OPTIONS) as Array<(typeof SHIPPING_OPTIONS)[ShippingOptionId]>).map(
                  (option) => (
                    <label key={option.id} className={styles.option}>
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={shipping === option.id}
                        onChange={() => setShipping(option.id)}
                      />
                      <span>
                        <strong>{option.label}</strong>
                        <small>
                          {option.description} · {formatPrice(option.cost)}
                        </small>
                      </span>
                    </label>
                  ),
                )}
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend>Pagamento</legend>
              <div className={styles.options}>
                {(
                  [
                    ["pix", "Pix"],
                    ["card", "Cartão de crédito"],
                    ["boleto", "Boleto"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className={styles.option}>
                    <input
                      type="radio"
                      name="payment"
                      value={value}
                      checked={payment === value}
                      onChange={() => setPayment(value)}
                    />
                    <span>
                      <strong>{label}</strong>
                      <small>
                        {value === "pix"
                          ? "Confirmação imediata"
                          : value === "card"
                            ? "Campos ilustrativos — sem captura real"
                            : "Compensação em até 1 dia útil"}
                      </small>
                    </span>
                  </label>
                ))}
              </div>

              {payment === "card" ? (
                <div className={styles.cardDemo} aria-hidden="true">
                  <p>Demonstração visual — não informe dados reais de cartão.</p>
                  <div className={styles.grid2}>
                    <input disabled placeholder="Número do cartão (demonstração)" />
                    <input disabled placeholder="Nome impresso (demonstração)" />
                    <input disabled placeholder="Validade MM/AA" />
                    <input disabled placeholder="CVV" />
                  </div>
                </div>
              ) : null}
            </fieldset>
          </div>

          <aside className={styles.summary} aria-labelledby="checkout-summary-title">
            <h2 id="checkout-summary-title">Resumo do pedido</h2>
            <ul className={styles.summaryItems}>
              {items.map((item) => (
                <li key={item.productId}>
                  <span className={styles.thumb}>
                    <Image src={item.imageSrc} alt="" fill sizes="56px" />
                  </span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </small>
                  </span>
                  <span>{formatPrice(calcLineTotal(item.unitPrice, item.quantity))}</span>
                </li>
              ))}
            </ul>

            <dl className={styles.totals}>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div>
                <dt>Entrega ({shippingOption.label})</dt>
                <dd>{formatPrice(shippingOption.cost)}</dd>
              </div>
              <div className={styles.totalRow}>
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            {status ? (
              <p role="status" className={styles.status}>
                {status}
              </p>
            ) : null}

            <button type="submit" className={styles.primaryBtn}>
              Finalizar pedido
            </button>
            <Link href="/carrinho" className={styles.secondaryLink}>
              Voltar ao carrinho
            </Link>
          </aside>
        </form>
      </div>
    </div>
  );
}
