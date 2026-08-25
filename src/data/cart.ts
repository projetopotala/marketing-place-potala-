import type { CartItem, CheckoutPaymentMethod, ShippingOptionId } from "@/types/cart";

export const CART_STORAGE_KEY = "potala-marketplace-cart-v1";
export const ORDER_STORAGE_KEY = "potala-marketplace-last-order-v1";

export const SHIPPING_OPTIONS: Record<
  ShippingOptionId,
  { id: ShippingOptionId; label: string; description: string; cost: number }
> = {
  economic: {
    id: "economic",
    label: "Econômica",
    description: "5 a 8 dias úteis",
    cost: 18.9,
  },
  express: {
    id: "express",
    label: "Expressa",
    description: "2 a 3 dias úteis",
    cost: 32.9,
  },
};

export const PAYMENT_LABELS: Record<CheckoutPaymentMethod, string> = {
  pix: "Pix",
  card: "Cartão de crédito",
  boleto: "Boleto bancário",
};

export function clampQuantity(quantity: number, stock: number): number {
  if (!Number.isFinite(quantity) || quantity < 1) {
    return 1;
  }

  const max = Math.max(1, Math.floor(stock));
  return Math.min(Math.floor(quantity), max);
}

export function calcLineTotal(unitPrice: number, quantity: number): number {
  return Number((unitPrice * quantity).toFixed(2));
}

export function calcCartSubtotal(items: CartItem[]): number {
  return Number(
    items
      .reduce((total, item) => total + calcLineTotal(item.unitPrice, item.quantity), 0)
      .toFixed(2),
  );
}

export function calcCartTotalItems(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.category === "string" &&
    typeof item.imageSrc === "string" &&
    typeof item.unitPrice === "number" &&
    Number.isFinite(item.unitPrice) &&
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity) &&
    typeof item.stock === "number" &&
    Number.isFinite(item.stock)
  );
}

export function parseCartItems(raw: string | null): CartItem[] | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return null;
    }

    const items: CartItem[] = [];

    for (const entry of parsed) {
      if (!isCartItem(entry)) {
        return null;
      }

      items.push({
        ...entry,
        quantity: clampQuantity(entry.quantity, entry.stock),
        unitPrice: Number(entry.unitPrice),
        stock: Math.max(1, Math.floor(entry.stock)),
      });
    }

    return items;
  } catch {
    return null;
  }
}

export function createOrderId(sequence = 1): string {
  const year = new Date().getFullYear();
  return `POT-${year}-${String(sequence).padStart(4, "0")}`;
}
