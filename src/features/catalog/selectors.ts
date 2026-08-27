/**
 * Seletores puros do catálogo público (fonte: PRODUCTS em marketplace.ts).
 * Não leem localStorage administrativo.
 */

import { PRODUCTS } from "@/data/marketplace";
import {
  getCatalogCategory,
  isCatalogCategoryId,
  type CatalogCategoryId,
} from "@/features/catalog/categories";
import { textIncludes } from "@/lib/normalizeText";
import type { CompactProduct, Product } from "@/types/marketplace";

export const PRODUCT_SORT_ORDERS = [
  "relevancia",
  "menor-preco",
  "maior-preco",
  "nome",
] as const;

export type ProductSortOrder = (typeof PRODUCT_SORT_ORDERS)[number];

export const CATALOG_COLLECTIONS = ["mais-procurados"] as const;

export type CatalogCollectionId = (typeof CATALOG_COLLECTIONS)[number];

/** Coleção editorial demonstrativa — não são métricas reais de analytics. */
export const MOST_SEARCHED_PRODUCT_IDS = [
  "incenso-7-ervas",
  "quartzo",
  "livro-despertar",
  "lavanda",
] as const;

/** Cards de “Novidades” na home — IDs canônicos, não cópias manuais de preço. */
export const DISCOVERY_NEW_ARRIVAL_IDS = [
  "curso-chakras",
  "kit-limpeza",
  "caderno-mantras",
  "sino-tibetano",
] as const;

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function listProductsByCategory(categoryId: string): Product[] {
  if (!isCatalogCategoryId(categoryId)) return [];
  return PRODUCTS.filter((product) => product.categoryId === categoryId);
}

export function countProductsByCategory(categoryId: CatalogCategoryId): number {
  return listProductsByCategory(categoryId).length;
}

export function filterProductsByQuery(
  products: readonly Product[],
  query: string,
): Product[] {
  const q = query.trim();
  if (!q) return [...products];

  return products.filter(
    (product) =>
      textIncludes(product.name, q) ||
      textIncludes(product.category, q) ||
      textIncludes(product.description ?? "", q) ||
      textIncludes(product.longDescription ?? "", q) ||
      textIncludes(product.slug, q),
  );
}

export function isOnOffer(product: Product): boolean {
  return (
    typeof product.originalPrice === "number" &&
    Number.isFinite(product.originalPrice) &&
    product.originalPrice > product.price &&
    Number.isFinite(product.price) &&
    product.price > 0
  );
}

export function getDiscountPercent(product: Product): number | null {
  if (!isOnOffer(product) || product.originalPrice == null) return null;
  return Math.round(
    (1 - product.price / product.originalPrice) * 100,
  );
}

export function getOfferProducts(
  products: readonly Product[] = PRODUCTS,
): Product[] {
  return products.filter(isOnOffer);
}

export function getNewArrivalProducts(
  products: readonly Product[] = PRODUCTS,
): Product[] {
  return products.filter((product) => product.isNew === true);
}

export function parseProductSortOrder(
  value: string | string[] | undefined,
): ProductSortOrder {
  const raw = Array.isArray(value) ? value[0] : value;
  if (
    raw &&
    (PRODUCT_SORT_ORDERS as readonly string[]).includes(raw)
  ) {
    return raw as ProductSortOrder;
  }
  return "relevancia";
}

export function parseCatalogCollection(
  value: string | string[] | undefined,
): CatalogCollectionId | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (
    raw &&
    (CATALOG_COLLECTIONS as readonly string[]).includes(raw)
  ) {
    return raw as CatalogCollectionId;
  }
  return undefined;
}

export function parseCategoryFilter(
  value: string | string[] | undefined,
): CatalogCategoryId | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && isCatalogCategoryId(raw)) return raw;
  return undefined;
}

export function parseSearchQuery(
  value: string | string[] | undefined,
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
}

/** Ordem editorial padrão = ordem do array PRODUCTS (ou da coleção). */
export function sortProducts(
  products: readonly Product[],
  order: ProductSortOrder,
): Product[] {
  const list = [...products];

  switch (order) {
    case "menor-preco":
      return list.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, "pt-BR"));
    case "maior-preco":
      return list.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name, "pt-BR"));
    case "nome":
      return list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    case "relevancia":
    default:
      return list;
  }
}

export function toCompactProduct(product: Product): CompactProduct {
  return {
    id: product.id,
    name: product.name,
    imageSrc: product.imageSrc,
    price: product.price,
    rating: product.rating,
    reviewCount: product.reviewCount,
    href: `/produto/${product.slug}`,
  };
}

export function resolveProductsByIds(
  ids: readonly string[],
): Product[] {
  const result: Product[] = [];
  for (const id of ids) {
    const product = getProductById(id);
    if (product) result.push(product);
  }
  return result;
}

export function getMostSearchedProducts(): CompactProduct[] {
  return resolveProductsByIds(MOST_SEARCHED_PRODUCT_IDS).map(toCompactProduct);
}

export function getDiscoveryNewArrivalProducts(): CompactProduct[] {
  return resolveProductsByIds(DISCOVERY_NEW_ARRIVAL_IDS).map(toCompactProduct);
}

export function getCollectionProducts(
  collection: CatalogCollectionId,
): Product[] {
  switch (collection) {
    case "mais-procurados":
      return resolveProductsByIds(MOST_SEARCHED_PRODUCT_IDS);
    default:
      return [];
  }
}

export function getCollectionLabel(collection: CatalogCollectionId): string {
  switch (collection) {
    case "mais-procurados":
      return "Mais procurados";
    default:
      return "Coleção";
  }
}

export interface CatalogQueryInput {
  q?: string;
  ordem?: string;
  categoria?: string;
  colecao?: string;
}

export interface ResolvedCatalogQuery {
  query: string;
  order: ProductSortOrder;
  categoryId?: CatalogCategoryId;
  collection?: CatalogCollectionId;
  products: Product[];
}

/**
 * Resolve listagem do catálogo geral a partir de parâmetros de URL.
 * Valores desconhecidos são ignorados sem quebrar a página.
 */
export function resolveCatalogListing(
  input: CatalogQueryInput,
  baseProducts: readonly Product[] = PRODUCTS,
): ResolvedCatalogQuery {
  const query = parseSearchQuery(input.q);
  const order = parseProductSortOrder(input.ordem);
  const categoryId = parseCategoryFilter(input.categoria);
  const collection = parseCatalogCollection(input.colecao);

  let products: Product[];

  if (collection) {
    products = getCollectionProducts(collection);
  } else if (categoryId) {
    products = listProductsByCategory(categoryId);
  } else {
    products = [...baseProducts];
  }

  products = filterProductsByQuery(products, query);
  products = sortProducts(products, order);

  return { query, order, categoryId, collection, products };
}

export function buildCatalogSearchParams(input: {
  q?: string;
  ordem?: ProductSortOrder;
  categoria?: string;
  colecao?: string;
}): URLSearchParams {
  const params = new URLSearchParams();
  const q = input.q?.trim();
  if (q) params.set("q", q);
  if (input.ordem && input.ordem !== "relevancia") {
    params.set("ordem", input.ordem);
  }
  if (input.categoria && isCatalogCategoryId(input.categoria)) {
    params.set("categoria", input.categoria);
  }
  if (
    input.colecao &&
    (CATALOG_COLLECTIONS as readonly string[]).includes(input.colecao)
  ) {
    params.set("colecao", input.colecao);
  }
  return params;
}

export function catalogHref(input: {
  pathname?: string;
  q?: string;
  ordem?: ProductSortOrder;
  categoria?: string;
  colecao?: string;
}): string {
  const pathname = input.pathname ?? "/catalogo";
  const params = buildCatalogSearchParams(input);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function categoryBreadcrumbHref(categoryId: string): string {
  const category = getCatalogCategory(categoryId);
  return category?.href ?? "/catalogo";
}

export function isCourseProduct(product: Product): boolean {
  return product.modality === "course" || product.action === "details";
}
