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
