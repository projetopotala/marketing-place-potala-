"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import styles from "./shared.module.css";

interface ToastItem {
  id: string;
  message: string;
  tone: "success" | "error" | "info";
}

interface ToastContextValue {
  push: (message: string, tone?: ToastItem["tone"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, tone: ToastItem["tone"] = "success") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setItems((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.toastRegion} aria-live="polite" aria-relevant="additions">
        {items.map((item) => (
          <div
            key={item.id}
            className={`${styles.toast} ${
              item.tone === "success"
                ? styles.toastSuccess
                : item.tone === "error"
                  ? styles.toastError
                  : ""
            }`}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useAdminToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAdminToast deve ser usado dentro de AdminToastProvider.");
  }
  return context;
}
