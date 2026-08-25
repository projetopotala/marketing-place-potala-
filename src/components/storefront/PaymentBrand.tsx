import type { PaymentMethod } from "@/types/marketplace";

interface PaymentBrandProps {
  method: PaymentMethod;
}

export function PaymentBrand({ method }: PaymentBrandProps) {
  return (
    <span className={`payment-brand payment-brand--${method.id}`} aria-label={method.label}>
      <span aria-hidden="true" className="payment-brand__mark">
        {method.id === "visa" ? "VISA" : null}
        {method.id === "mastercard" ? (
          <>
            <span className="payment-brand__mc payment-brand__mc--red" />
            <span className="payment-brand__mc payment-brand__mc--yellow" />
          </>
        ) : null}
        {method.id === "elo" ? "elo" : null}
        {method.id === "pix" ? "Pix" : null}
        {method.id === "boleto" ? "Boleto" : null}
      </span>
    </span>
  );
}
