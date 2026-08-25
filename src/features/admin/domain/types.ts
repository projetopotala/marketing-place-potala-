/** Domínio administrativo demonstrativo — sem backend real. */

export type MoneyCents = number;

export type SellerStatus = "pending" | "active" | "suspended" | "rejected";
export type ProductStatus =
  | "draft"
  | "review"
  | "active"
  | "rejected"
  | "inactive";
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type PaymentStatus =
  | "pending"
  | "approved"
  | "declined"
  | "refunded"
  | "chargeback";
export type ShipmentStatus =
  | "pending"
  | "posted"
  | "in_transit"
  | "delivered"
  | "delayed"
  | "returned";
export type PayoutStatus = "pending" | "processing" | "paid" | "failed";
export type CustomerStatus = "active" | "blocked";
export type ContentStatus =
  | "draft"
  | "review"
  | "published"
  | "rejected"
  | "archived";
export type CouponStatus = "active" | "scheduled" | "expired" | "disabled";
export type CouponDiscountType = "percent" | "fixed";
export type CouponChannel = "site" | "app" | "all";
export type CategoryStatus = "active" | "inactive";
export type GatewayStatus = "connected" | "disconnected";
export type ReportKind =
  | "sales"
  | "orders"
  | "sellers"
  | "products"
  | "customers"
  | "shipments"
  | "finance"
  | "contents";

export interface AdminTimelineEvent {
  id: string;
  at: string;
  label: string;
  detail?: string;
  actor?: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  category: string;
  status: SellerStatus;
  commissionPercent: number;
  rating: number;
  documentLabel: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  timeline: AdminTimelineEvent[];
}

export interface AdminProduct {
  id: string;
  title: string;
  sellerId: string;
  categoryId: string;
  priceCents: MoneyCents;
  stock: number;
  status: ProductStatus;
  featured: boolean;
  description: string;
  imageSrc: string;
  attributes: Record<string, string>;
  moderationNote?: string;
  createdAt: string;
  updatedAt: string;
  timeline: AdminTimelineEvent[];
}

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  unitPriceCents: MoneyCents;
}

export interface AdminOrder {
  id: string;
  code: string;
  customerId: string;
  sellerId: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "pix" | "card" | "boleto";
  subtotalCents: MoneyCents;
  shippingCents: MoneyCents;
  discountCents: MoneyCents;
  totalCents: MoneyCents;
  addressLabel: string;
  city: string;
  state: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  timeline: AdminTimelineEvent[];
}

export interface Shipment {
  id: string;
  orderId: string;
  sellerId: string;
  customerId: string;
  carrier: string;
  trackingCode: string;
  eta: string;
  status: ShipmentStatus;
  destination: string;
  delayed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialTransaction {
  id: string;
  orderId: string;
  sellerId: string;
  customerId: string;
  grossCents: MoneyCents;
  feeCents: MoneyCents;
  commissionCents: MoneyCents;
  netCents: MoneyCents;
  paymentMethod: "pix" | "card" | "boleto";
  paymentStatus: PaymentStatus;
  createdAt: string;
  timeline: AdminTimelineEvent[];
}

export interface Payout {
  id: string;
  sellerId: string;
  amountCents: MoneyCents;
  commissionCents: MoneyCents;
  retentionCents: MoneyCents;
  status: PayoutStatus;
  periodLabel: string;
  createdAt: string;
  paidAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: CustomerStatus;
  tags: string[];
  notes: string;
  preferredProducts: string[];
  createdAt: string;
  updatedAt: string;
  timeline: AdminTimelineEvent[];
}

export interface CourseLesson {
  id: string;
  title: string;
  durationMinutes: number;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface CourseContent {
  id: string;
  title: string;
  instructor: string;
  category: string;
  format: "video" | "live" | "text";
  priceCents: MoneyCents;
  students: number;
  status: ContentStatus;
  description: string;
  modules: CourseModule[];
  moderationNote?: string;
  createdAt: string;
  updatedAt: string;
  timeline: AdminTimelineEvent[];
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  discountType: CouponDiscountType;
  discountValue: number;
  channel: CouponChannel;
  status: CouponStatus;
  startsAt: string;
  endsAt: string;
  usageCount: number;
  revenueCents: MoneyCents;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  status: CategoryStatus;
  attributeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Attribute {
  id: string;
  name: string;
  values: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  status: GatewayStatus;
  methods: Array<"pix" | "card" | "boleto">;
  feePercent: number;
  health: "healthy" | "degraded" | "down";
}

export interface MarketplaceSettings {
  marketplaceName: string;
  supportEmail: string;
  defaultCommissionPercent: number;
  freeShippingFromCents: MoneyCents;
  defaultCarrier: string;
  pixEnabled: boolean;
  cardEnabled: boolean;
  boletoEnabled: boolean;
  notifyNewOrders: boolean;
  notifyApprovals: boolean;
  notifyShipments: boolean;
  sessionTimeoutMinutes: number;
  twoFactorHintEnabled: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  severity: "info" | "warning" | "danger";
  createdAt: string;
  read: boolean;
}

export interface ReportDefinition {
  id: string;
  kind: ReportKind;
  label: string;
  description: string;
}

export interface AdminDemoDb {
  version: 1;
  sellers: Seller[];
  products: AdminProduct[];
  orders: AdminOrder[];
  shipments: Shipment[];
  transactions: FinancialTransaction[];
  payouts: Payout[];
  customers: Customer[];
  contents: CourseContent[];
  coupons: Coupon[];
  categories: Category[];
  attributes: Attribute[];
  gateways: PaymentGateway[];
  settings: MarketplaceSettings;
  notifications: NotificationItem[];
  updatedAt: string;
}
