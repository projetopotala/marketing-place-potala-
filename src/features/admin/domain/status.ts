import type {
  ContentStatus,
  CustomerStatus,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  SellerStatus,
  ShipmentStatus,
} from "./types";

export const SELLER_STATUS_LABEL: Record<SellerStatus, string> = {
  pending: "Pendente",
  active: "Ativo",
  suspended: "Suspenso",
  rejected: "Rejeitado",
};

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  draft: "Rascunho",
  review: "Em revisão",
  active: "Ativo",
  rejected: "Rejeitado",
  inactive: "Inativo",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Aguardando pagamento",
  paid: "Pago",
  processing: "Em separação",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  refunded: "Estornado",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  declined: "Recusado",
  refunded: "Estornado",
  chargeback: "Chargeback",
};

export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  pending: "Pendente",
  posted: "Postado",
  in_transit: "Em trânsito",
  delivered: "Entregue",
  delayed: "Atrasado",
  returned: "Devolvido",
};

export const CUSTOMER_STATUS_LABEL: Record<CustomerStatus, string> = {
  active: "Ativo",
  blocked: "Bloqueado",
};

export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  draft: "Rascunho",
  review: "Em revisão",
  published: "Publicado",
  rejected: "Rejeitado",
  archived: "Arquivado",
};

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["paid", "cancelled"],
  paid: ["processing", "cancelled", "refunded"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}
