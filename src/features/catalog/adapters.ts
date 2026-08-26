/**
 * Adapters entre o catálogo estático da vitrine (`marketplace.ts`) e
 * o banco demonstrativo administrativo (`AdminProduct`).
 *
 * Limitações (sem backend):
 * - Páginas SSG `/produto/[slug]` usam o catálogo estático.
 * - Produtos criados apenas em localStorage pelo admin/vendedor não são
 *   resolvidos em Server Components até existir API.
 * - Não há sincronização de produção entre as duas fontes.
 */

import { PRODUCTS } from "@/data/marketplace";
import type { AdminDemoDb, AdminProduct, Seller } from "@/features/admin/domain/types";
import type { Product } from "@/types/marketplace";

const CATALOG_BY_SLUG = new Map(PRODUCTS.map((product) => [product.slug, product]));

/** Mapa explícito id admin → slug da vitrine (paridade visual). */
export const ADMIN_TO_CATALOG_SLUG: Record<string, string> = {
  "prd-1": "japamala",
  "prd-2": "ametista-premium",
  "prd-3": "palo-santo",
  "prd-4": "poder-do-agora",
  "prd-5": "quartzo-transparente",
  "prd-6": "kit-limpeza-energetica",
  "prd-7": "oleo-lavanda",
  "prd-8": "curso-meditacao",
};

export function resolveCatalogSlug(product: AdminProduct): string {
  if (product.slug?.trim()) return product.slug.trim();
  return (
    ADMIN_TO_CATALOG_SLUG[product.id] ??
    product.title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

export function enrichAdminProductFromCatalog(
  product: AdminProduct,
): AdminProduct {
  const slug = resolveCatalogSlug(product);
  const catalog = CATALOG_BY_SLUG.get(slug);
  if (!catalog) {
    return {
      ...product,
      slug,
      imageAlt: product.imageAlt ?? product.title,
    };
  }

  return {
    ...product,
    slug,
    imageSrc: catalog.imageSrc,
    imageAlt: catalog.imageAlt,
    gallery:
      catalog.images?.map((image) => ({ src: image.src, alt: image.alt })) ??
      product.gallery,
    description: product.description || catalog.description || catalog.name,
  };
}

export function adminProductToStorefront(
  product: AdminProduct,
  seller?: Seller,
): Product | null {
  if (product.status !== "active") return null;
  const enriched = enrichAdminProductFromCatalog(product);
  const slug = resolveCatalogSlug(enriched);
  const catalog = CATALOG_BY_SLUG.get(slug);

  return {
    id: enriched.id,
    slug,
    name: enriched.title,
    category: catalog?.category ?? "Marketplace",
    categoryId: enriched.categoryId,
    price: enriched.priceCents / 100,
    rating: catalog?.rating ?? seller?.rating ?? 4.8,
    reviewCount: catalog?.reviewCount ?? 12,
    imageSrc: enriched.imageSrc,
    imageAlt: enriched.imageAlt ?? enriched.title,
    action: "cart",
    featured: enriched.featured,
    description: enriched.description,
    stock: enriched.stock,
    seller: seller
      ? { name: seller.name, rating: seller.rating }
      : catalog?.seller,
    images: enriched.gallery ?? catalog?.images,
    characteristics: Object.entries(enriched.attributes).map(([label, value]) => ({
      label,
      value,
    })),
  };
}

export function listActiveStorefrontFromAdmin(db: AdminDemoDb): Product[] {
  const sellers = new Map(db.sellers.map((seller) => [seller.id, seller]));
  return db.products
    .map((product) =>
      adminProductToStorefront(product, sellers.get(product.sellerId)),
    )
    .filter((product): product is Product => Boolean(product));
}

/**
 * Fallback SSG: catálogo estático. Use para generateStaticParams e PDPs.
 * Dados apenas em localStorage não entram aqui.
 */
export function getStaticCatalogProduct(slug: string): Product | undefined {
  return CATALOG_BY_SLUG.get(slug);
}
