/** Domínio demonstrativo da conta do comprador (localStorage). */

export type CustomerOrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface CustomerOrderItem {
  productId: string;
  slug: string;
  name: string;
  imageSrc: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CustomerOrderTimelineEvent {
  id: string;
  at: string;
  label: string;
  detail?: string;
}

export interface CustomerOrder {
  id: string;
  code: string;
  status: CustomerOrderStatus;
  createdAt: string;
  updatedAt: string;
  items: CustomerOrderItem[];
  subtotal: number;
  shippingCost: number;
  shippingLabel: string;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentLabel: string;
  addressLabel: string;
  city: string;
  state: string;
  timeline: CustomerOrderTimelineEvent[];
}

export interface CustomerAddress {
  id: string;
  label: string;
  recipient: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  isDefault: boolean;
}

export interface CustomerFavorite {
  productId: string;
  slug: string;
  name: string;
  imageSrc: string;
  price: number;
  addedAt: string;
}

export interface CustomerReview {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSlug: string;
  rating: number;
  comment: string;
  status: "pending" | "published";
  createdAt: string;
  updatedAt: string;
}

export type ReturnRequestStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "completed";

export interface CustomerReturnRequest {
  id: string;
  orderId: string;
  orderCode: string;
  itemProductIds: string[];
  reason: string;
  description: string;
  status: ReturnRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSupportTicket {
  id: string;
  protocol: string;
  category: string;
  subject: string;
  message: string;
  status: "open" | "answered" | "closed";
  createdAt: string;
}

export interface CustomerAccountDb {
  version: 1;
  userId: string;
  orders: CustomerOrder[];
  addresses: CustomerAddress[];
  favorites: CustomerFavorite[];
  reviews: CustomerReview[];
  returns: CustomerReturnRequest[];
  tickets: CustomerSupportTicket[];
  updatedAt: string;
}

export const CUSTOMER_ACCOUNT_STORAGE_KEY = "potala-customer-account-v1";

export const CUSTOMER_ORDER_STATUS_LABEL: Record<CustomerOrderStatus, string> = {
  pending_payment: "Aguardando pagamento",
  paid: "Pago",
  processing: "Em separação",
  shipped: "Em trânsito",
  delivered: "Entregue",
  cancelled: "Cancelado",
  refunded: "Estornado",
};
