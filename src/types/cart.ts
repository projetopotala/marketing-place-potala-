export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  category: string;
  imageSrc: string;
  unitPrice: number;
  quantity: number;
  stock: number;
}

export type ShippingOptionId = "economic" | "express";

export type CheckoutPaymentMethod = "pix" | "card" | "boleto";

export interface CheckoutLineItem {
  productId: string;
  slug: string;
  name: string;
  imageSrc: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CheckoutAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface OrderSummary {
  orderId: string;
  items: CheckoutLineItem[];
  subtotal: number;
  shippingOption: ShippingOptionId;
  shippingLabel: string;
  shippingCost: number;
  total: number;
  paymentMethod: CheckoutPaymentMethod;
  paymentLabel: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: CheckoutAddress;
  createdAt: string;
}

export interface AddCartItemInput {
  productId: string;
  slug: string;
  name: string;
  category: string;
  imageSrc: string;
  unitPrice: number;
  stock: number;
  quantity: number;
}

/** Rótulo de rua/número/complemento para histórico e confirmação. */
export function formatCheckoutAddressLabel(address: CheckoutAddress): string {
  const complement = address.complement?.trim()
    ? ` — ${address.complement.trim()}`
    : "";
  return `${address.street.trim()}, ${address.number.trim()}${complement}`;
}
