"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AddCartItemInput, CartItem } from "@/types/cart";
import {
  calcCartSubtotal,
  calcCartTotalItems,
  CART_STORAGE_KEY,
  clampQuantity,
  parseCartItems,
} from "@/data/cart";

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isReady: boolean;
  addItem: (input: AddCartItemInput) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  return parseCartItems(window.localStorage.getItem(CART_STORAGE_KEY)) ?? [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) {
        return;
      }

      setItems(readStoredCart());
      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, isReady]);

  const addItem = useCallback((input: AddCartItemInput) => {
    const rawStock = Math.floor(input.stock);
    if (!Number.isFinite(rawStock) || rawStock < 1) {
      return false;
    }

    const stock = rawStock;
    const quantityToAdd = clampQuantity(input.quantity, stock);
    let added = false;

    setItems((current) => {
      const existing = current.find((item) => item.productId === input.productId);

      if (!existing) {
        added = true;
        return [
          ...current,
          {
            productId: input.productId,
            slug: input.slug,
            name: input.name,
            category: input.category,
            imageSrc: input.imageSrc,
            unitPrice: input.unitPrice,
            stock,
            quantity: quantityToAdd,
          },
        ];
      }

      const nextQuantity = clampQuantity(existing.quantity + quantityToAdd, stock);
      added = nextQuantity > existing.quantity;

      return current.map((item) =>
        item.productId === input.productId
          ? {
              ...item,
              stock,
              unitPrice: input.unitPrice,
              imageSrc: input.imageSrc,
              name: input.name,
              category: input.category,
              slug: input.slug,
              quantity: nextQuantity,
            }
          : item,
      );
    });

    return added;
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: clampQuantity(quantity, item.stock) }
          : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems: calcCartTotalItems(items),
      subtotal: calcCartSubtotal(items),
      isReady,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, isReady, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider.");
  }

  return context;
}
