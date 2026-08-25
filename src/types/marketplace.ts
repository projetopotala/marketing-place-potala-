export type ProductBadge = "Mais vendido" | "Novo" | "Oferta";

export type ProductAction = "cart" | "details";

export interface NavCategory {
  id: string;
  label: string;
  href: string;
  hasMenu?: boolean;
}

export interface CategoryHighlight {
  id: string;
  name: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number;
  rating: number;
  reviewCount: number;
  imageSrc: string;
  imageAlt: string;
  badge?: ProductBadge;
  action: ProductAction;
  featured?: boolean;
  popular?: boolean;
  isNew?: boolean;
}

export interface CompactProduct {
  id: string;
  name: string;
  imageSrc: string;
  price: number;
  rating: number;
  reviewCount: number;
  href: string;
}

export interface PhilosophyPillar {
  id: string;
  title: string;
  description: string;
  icon: "products" | "knowledge" | "healing" | "community";
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  avatarSrc: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface ContactInfo {
  phone: string;
  email: string;
  hours: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  imageSrc: string;
}
