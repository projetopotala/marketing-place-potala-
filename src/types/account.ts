export interface AccountMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export interface AccountOrderSummary {
  id: string;
  code: string;
  date: string;
  status: string;
  total: number;
  itemCount: number;
}

export interface AccountCoupon {
  id: string;
  code: string;
  description: string;
  expiresAt: string;
}

export interface AccountAddress {
  id: string;
  label: string;
  line: string;
  city: string;
  isDefault?: boolean;
}

export interface AccountFavorite {
  id: string;
  slug: string;
  name: string;
  imageSrc: string;
  price: number;
}

export interface AccountSidebarItem {
  id: string;
  label: string;
  href?: string;
  available: boolean;
}
