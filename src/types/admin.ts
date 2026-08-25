export interface AdminNavItem {
  id: string;
  label: string;
  active?: boolean;
  available: boolean;
}

export interface AdminMetric {
  id: string;
  label: string;
  value: string;
  growth: string;
  comparison: string;
  icon: "sellers" | "products" | "orders" | "sales";
}

export interface AdminSalesPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface AdminSalesSummary {
  totalRevenue: number;
  orders: number;
  averageTicket: number;
  conversionRate: number;
}

export interface AdminCategorySale {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface AdminFeaturedSeller {
  id: string;
  name: string;
  status: string;
  products: number;
  orders: number;
  commission: number;
  rating: number;
}

export interface AdminRecentOrder {
  id: string;
  code: string;
  customer: string;
  seller: string;
  amount: number;
  status: string;
  payment: string;
  delivery: string;
}

export interface AdminFinancialItem {
  id: string;
  label: string;
  value: number;
  tone?: "default" | "success" | "warning";
}

export interface AdminAlert {
  id: string;
  title: string;
  detail: string;
  severity: "warning" | "danger" | "info";
}

export interface AdminPendingApproval {
  id: string;
  title: string;
  count: number;
  description: string;
}
