/**
 * Migração segura do banco admin em localStorage (V1 → V2).
 * Função pura: preserva dados personalizados e completa ausências pelo seed.
 * Registro inválido em coleção obrigatória invalida o banco inteiro (retorna null).
 * V1 e V2 exigem a mesma estrutura de coleções na raiz.
 */

import type {
  AdminDemoDb,
  AdminOrder,
  AdminProduct,
  AdminTimelineEvent,
  Customer,
  CustomerStatus,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Seller,
  SellerStatus,
  ProductStatus,
} from "@/features/admin/domain/types";
import { createAdminSeed } from "@/features/admin/data/seed";

/** Paths legados — apenas no mapa de migração, nunca no seed ativo. */
const BROKEN_IMAGE_SRC: Record<string, string> = {
  "/images/potala/product-poder-do-agora-final.png":
    "/images/potala/product-livro-agora-final.png",
  "/images/potala/product-quartzo-final.png":
    "/images/potala/product-quartzo.jpg",
};

const SELLER_STATUSES = new Set<string>([
  "pending",
  "active",
  "suspended",
  "rejected",
]);

const PRODUCT_STATUSES = new Set<string>([
  "draft",
  "review",
  "active",
  "rejected",
  "inactive",
]);

const ORDER_STATUSES = new Set<string>([
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

const PAYMENT_STATUSES = new Set<string>([
  "pending",
  "approved",
  "declined",
  "refunded",
  "chargeback",
]);

const PAYMENT_METHODS = new Set<string>(["pix", "card", "boleto"]);

const CUSTOMER_STATUSES = new Set<string>(["active", "blocked"]);

/** Coleções obrigatórias na raiz — iguais em V1 e V2. */
const REQUIRED_COLLECTIONS = [
  "sellers",
  "products",
  "orders",
  "shipments",
  "transactions",
  "payouts",
  "customers",
  "contents",
  "coupons",
  "categories",
  "attributes",
  "gateways",
  "notifications",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasRequiredCollections(value: Record<string, unknown>): boolean {
  return REQUIRED_COLLECTIONS.every((key) => Array.isArray(value[key]));
}

/**
 * Estrutura raiz reconhecida: version 1|2, 13 coleções como array,
 * settings objeto e updatedAt string. Ausência ou tipo errado → rejeição.
 */
function isRecognizedRoot(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  if (value.version !== 1 && value.version !== 2) return false;
  if (!hasRequiredCollections(value)) return false;
  if (!isRecord(value.settings)) return false;
  if (typeof value.updatedAt !== "string") return false;
  return true;
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function resolveImageSrc(src: string | undefined, fallback: string): string {
  if (!src) return fallback;
  return BROKEN_IMAGE_SRC[src] ?? src;
}

function slugifyTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Valida cada item de uma coleção obrigatória.
 * Qualquer entrada inválida (null, string, sem identidade, campos obrigatórios
 * irrecuperáveis) invalida o banco inteiro.
 * Array vazio válido é preservado. Ausência / tipo incorreto → null.
 */
function mapRequiredCollection<T>(
  raw: unknown,
  migrateOne: (item: Record<string, unknown>) => T | null,
): T[] | null {
  if (!Array.isArray(raw)) return null;
  const result: T[] = [];
  for (const item of raw) {
    if (!isRecord(item)) return null;
    const migrated = migrateOne(item);
    if (migrated === null) return null;
    result.push(migrated);
  }
  return result;
}

function requireId(item: Record<string, unknown>): string | null {
  return asNonEmptyString(item.id) ?? null;
}

function migrateSeller(
  stored: Record<string, unknown>,
  seedById: Map<string, Seller>,
): Seller | null {
  const id = requireId(stored);
  if (!id) return null;

  const seed = seedById.get(id);
  const name = asNonEmptyString(stored.name) ?? seed?.name;
  const email = asString(stored.email) ?? seed?.email;
  const phone = asString(stored.phone) ?? seed?.phone;
  const city = asString(stored.city) ?? seed?.city;
  const state = asString(stored.state) ?? seed?.state;
  const category = asString(stored.category) ?? seed?.category;
  const statusRaw = asString(stored.status) ?? seed?.status;
  const commissionPercent = asFiniteNumber(stored.commissionPercent);
  const rating = asFiniteNumber(stored.rating) ?? seed?.rating;
  const documentLabel = asString(stored.documentLabel) ?? seed?.documentLabel;
  const notes = asString(stored.notes) ?? seed?.notes;
  const createdAt = asString(stored.createdAt) ?? seed?.createdAt;
  const updatedAt = asString(stored.updatedAt) ?? seed?.updatedAt;

  if (
    name === undefined ||
    email === undefined ||
    phone === undefined ||
    city === undefined ||
    state === undefined ||
    category === undefined ||
    statusRaw === undefined ||
    !SELLER_STATUSES.has(statusRaw) ||
    commissionPercent === undefined ||
    rating === undefined ||
    documentLabel === undefined ||
    notes === undefined ||
    createdAt === undefined ||
    updatedAt === undefined
  ) {
    return null;
  }

  const coverFromStored = asString(stored.coverImageSrc);

  return {
    id,
    name,
    email,
    phone,
    city,
    state,
    category,
    status: statusRaw as SellerStatus,
    commissionPercent,
    rating,
    documentLabel,
    notes,
    createdAt,
    updatedAt,
    slug: asString(stored.slug) ?? seed?.slug,
    description: asString(stored.description) ?? seed?.description,
    coverImageSrc: resolveImageSrc(
      coverFromStored ?? seed?.coverImageSrc,
      seed?.coverImageSrc ?? "/images/potala/hero-bg-v2.png",
    ),
    timeline: Array.isArray(stored.timeline)
      ? (stored.timeline as Seller["timeline"])
      : (seed?.timeline ?? []),
  };
}

function migrateProduct(
  stored: Record<string, unknown>,
  seedById: Map<string, AdminProduct>,
): AdminProduct | null {
  const id = requireId(stored);
  if (!id) return null;

  const seed = seedById.get(id);
  const title = asNonEmptyString(stored.title) ?? seed?.title;
  const sellerId = asString(stored.sellerId) ?? seed?.sellerId;
  const categoryId = asString(stored.categoryId) ?? seed?.categoryId;
  const priceCents = asFiniteNumber(stored.priceCents);
  const stock = asFiniteNumber(stored.stock);
  const statusRaw = asString(stored.status) ?? seed?.status;
  const featured = asBoolean(stored.featured) ?? seed?.featured;
  const description = asString(stored.description) ?? seed?.description;
  const imageSrcRaw = asString(stored.imageSrc) ?? seed?.imageSrc;
  const createdAt = asString(stored.createdAt) ?? seed?.createdAt;
  const updatedAt = asString(stored.updatedAt) ?? seed?.updatedAt;

  if (
    title === undefined ||
    sellerId === undefined ||
    categoryId === undefined ||
    priceCents === undefined ||
    stock === undefined ||
    statusRaw === undefined ||
    !PRODUCT_STATUSES.has(statusRaw) ||
    featured === undefined ||
    description === undefined ||
    imageSrcRaw === undefined ||
    createdAt === undefined ||
    updatedAt === undefined
  ) {
    return null;
  }

  const slugStored = asNonEmptyString(stored.slug);
  const imageSrc = resolveImageSrc(
    imageSrcRaw,
    seed?.imageSrc ?? "/images/potala/logo-mark.png",
  );

  return {
    id,
    title,
    sellerId,
    categoryId,
    priceCents,
    stock,
    status: statusRaw as ProductStatus,
    featured,
    description,
    imageSrc,
    createdAt,
    updatedAt,
    slug: slugStored || seed?.slug || slugifyTitle(title),
    imageAlt: asString(stored.imageAlt) ?? seed?.imageAlt ?? title,
    gallery: Array.isArray(stored.gallery)
      ? (stored.gallery as AdminProduct["gallery"])
      : seed?.gallery,
    attributes: isRecord(stored.attributes)
      ? (stored.attributes as Record<string, string>)
      : (seed?.attributes ?? {}),
    moderationNote:
      asString(stored.moderationNote) ?? seed?.moderationNote,
    timeline: Array.isArray(stored.timeline)
      ? (stored.timeline as AdminProduct["timeline"])
      : (seed?.timeline ?? []),
  };
}

function parseOptionalString(
  value: unknown,
): string | undefined | null {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  return null;
}

function parseStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") return null;
    result.push(item);
  }
  return result;
}

function migrateTimelineEvent(
  stored: Record<string, unknown>,
): AdminTimelineEvent | null {
  const id = asNonEmptyString(stored.id);
  const at = asString(stored.at);
  const label = asString(stored.label);
  if (id === undefined || at === undefined || label === undefined) {
    return null;
  }

  const detail = parseOptionalString(stored.detail);
  if (detail === null) return null;
  const actor = parseOptionalString(stored.actor);
  if (actor === null) return null;

  const event: AdminTimelineEvent = { id, at, label };
  if (detail !== undefined) event.detail = detail;
  if (actor !== undefined) event.actor = actor;
  return event;
}

function migrateTimeline(raw: unknown): AdminTimelineEvent[] | null {
  if (!Array.isArray(raw)) return null;
  const result: AdminTimelineEvent[] = [];
  for (const item of raw) {
    if (!isRecord(item)) return null;
    const event = migrateTimelineEvent(item);
    if (event === null) return null;
    result.push(event);
  }
  return result;
}

function migrateOrderItem(stored: Record<string, unknown>): OrderItem | null {
  const productId = asString(stored.productId);
  const title = asString(stored.title);
  const quantity = asFiniteNumber(stored.quantity);
  const unitPriceCents = asFiniteNumber(stored.unitPriceCents);
  if (
    productId === undefined ||
    title === undefined ||
    quantity === undefined ||
    unitPriceCents === undefined
  ) {
    return null;
  }
  return { productId, title, quantity, unitPriceCents };
}

function migrateOrderItems(raw: unknown): OrderItem[] | null {
  if (!Array.isArray(raw)) return null;
  const result: OrderItem[] = [];
  for (const item of raw) {
    if (!isRecord(item)) return null;
    const migrated = migrateOrderItem(item);
    if (migrated === null) return null;
    result.push(migrated);
  }
  return result;
}

function migrateOrder(stored: Record<string, unknown>): AdminOrder | null {
  const id = requireId(stored);
  if (!id) return null;

  const code = asString(stored.code);
  const customerId = asString(stored.customerId);
  const sellerId = asString(stored.sellerId);
  const statusRaw = asString(stored.status);
  const paymentStatusRaw = asString(stored.paymentStatus);
  const paymentMethodRaw = asString(stored.paymentMethod);
  const subtotalCents = asFiniteNumber(stored.subtotalCents);
  const shippingCents = asFiniteNumber(stored.shippingCents);
  const discountCents = asFiniteNumber(stored.discountCents);
  const totalCents = asFiniteNumber(stored.totalCents);
  const addressLabel = asString(stored.addressLabel);
  const city = asString(stored.city);
  const state = asString(stored.state);
  const notes = asString(stored.notes);
  const createdAt = asString(stored.createdAt);
  const updatedAt = asString(stored.updatedAt);
  const items = migrateOrderItems(stored.items);
  const timeline = migrateTimeline(stored.timeline);

  if (
    code === undefined ||
    customerId === undefined ||
    sellerId === undefined ||
    statusRaw === undefined ||
    !ORDER_STATUSES.has(statusRaw) ||
    paymentStatusRaw === undefined ||
    !PAYMENT_STATUSES.has(paymentStatusRaw) ||
    paymentMethodRaw === undefined ||
    !PAYMENT_METHODS.has(paymentMethodRaw) ||
    subtotalCents === undefined ||
    shippingCents === undefined ||
    discountCents === undefined ||
    totalCents === undefined ||
    addressLabel === undefined ||
    city === undefined ||
    state === undefined ||
    notes === undefined ||
    createdAt === undefined ||
    updatedAt === undefined ||
    items === null ||
    timeline === null
  ) {
    return null;
  }

  return {
    id,
    code,
    customerId,
    sellerId,
    items,
    status: statusRaw as OrderStatus,
    paymentStatus: paymentStatusRaw as PaymentStatus,
    paymentMethod: paymentMethodRaw as AdminOrder["paymentMethod"],
    subtotalCents,
    shippingCents,
    discountCents,
    totalCents,
    addressLabel,
    city,
    state,
    notes,
    createdAt,
    updatedAt,
    timeline,
  };
}

function migrateCustomer(stored: Record<string, unknown>): Customer | null {
  const id = requireId(stored);
  if (!id) return null;

  const name = asString(stored.name);
  const email = asString(stored.email);
  const phone = asString(stored.phone);
  const city = asString(stored.city);
  const state = asString(stored.state);
  const statusRaw = asString(stored.status);
  const notes = asString(stored.notes);
  const createdAt = asString(stored.createdAt);
  const updatedAt = asString(stored.updatedAt);
  const tags = parseStringArray(stored.tags);
  const preferredProducts = parseStringArray(stored.preferredProducts);
  const timeline = migrateTimeline(stored.timeline);

  if (
    name === undefined ||
    email === undefined ||
    phone === undefined ||
    city === undefined ||
    state === undefined ||
    statusRaw === undefined ||
    !CUSTOMER_STATUSES.has(statusRaw) ||
    notes === undefined ||
    createdAt === undefined ||
    updatedAt === undefined ||
    tags === null ||
    preferredProducts === null ||
    timeline === null
  ) {
    return null;
  }

  return {
    id,
    name,
    email,
    phone,
    city,
    state,
    status: statusRaw as CustomerStatus,
    tags,
    notes,
    preferredProducts,
    createdAt,
    updatedAt,
    timeline,
  };
}

/** Entidade genérica com id — usada em coleções ainda sem validador específico. */
function migrateEntityWithId<T extends { id: string }>(
  stored: Record<string, unknown>,
): T | null {
  const id = requireId(stored);
  if (!id) return null;
  return { ...(stored as unknown as T), id };
}

function buildMigratedDb(value: Record<string, unknown>): AdminDemoDb | null {
  const seed = createAdminSeed();
  const seedSellers = new Map(seed.sellers.map((item) => [item.id, item]));
  const seedProducts = new Map(seed.products.map((item) => [item.id, item]));

  const sellers = mapRequiredCollection(value.sellers, (item) =>
    migrateSeller(item, seedSellers),
  );
  if (sellers === null) return null;

  const products = mapRequiredCollection(value.products, (item) =>
    migrateProduct(item, seedProducts),
  );
  if (products === null) return null;

  const orders = mapRequiredCollection(value.orders, (item) =>
    migrateOrder(item),
  );
  if (orders === null) return null;

  const customers = mapRequiredCollection(value.customers, (item) =>
    migrateCustomer(item),
  );
  if (customers === null) return null;

  const shipments = mapRequiredCollection(value.shipments, (item) =>
    migrateEntityWithId<AdminDemoDb["shipments"][number]>(item),
  );
  if (shipments === null) return null;

  const transactions = mapRequiredCollection(value.transactions, (item) =>
    migrateEntityWithId<AdminDemoDb["transactions"][number]>(item),
  );
  if (transactions === null) return null;

  const payouts = mapRequiredCollection(value.payouts, (item) =>
    migrateEntityWithId<AdminDemoDb["payouts"][number]>(item),
  );
  if (payouts === null) return null;

  const contents = mapRequiredCollection(value.contents, (item) =>
    migrateEntityWithId<AdminDemoDb["contents"][number]>(item),
  );
  if (contents === null) return null;

  const coupons = mapRequiredCollection(value.coupons, (item) =>
    migrateEntityWithId<AdminDemoDb["coupons"][number]>(item),
  );
  if (coupons === null) return null;

  const categories = mapRequiredCollection(value.categories, (item) =>
    migrateEntityWithId<AdminDemoDb["categories"][number]>(item),
  );
  if (categories === null) return null;

  const attributes = mapRequiredCollection(value.attributes, (item) =>
    migrateEntityWithId<AdminDemoDb["attributes"][number]>(item),
  );
  if (attributes === null) return null;

  const gateways = mapRequiredCollection(value.gateways, (item) =>
    migrateEntityWithId<AdminDemoDb["gateways"][number]>(item),
  );
  if (gateways === null) return null;

  const notifications = mapRequiredCollection(value.notifications, (item) =>
    migrateEntityWithId<AdminDemoDb["notifications"][number]>(item),
  );
  if (notifications === null) return null;

  // settings já validado como objeto na raiz; merge só completa campos internos.
  const settings = {
    ...seed.settings,
    ...(value.settings as object),
  } as AdminDemoDb["settings"];

  return {
    version: 2,
    sellers,
    products,
    orders,
    shipments,
    transactions,
    payouts,
    customers,
    contents,
    coupons,
    categories,
    attributes,
    gateways,
    settings,
    notifications,
    updatedAt: value.updatedAt as string,
  };
}

/**
 * Aceita unknown e retorna AdminDemoDb V2 ou null.
 * V1 (version === 1) e V2 (version === 2) exigem a mesma estrutura na raiz.
 * Não muta a entrada. Dados inválidos → null (sem filtrar e seguir).
 */
export function migrateAdminDemoDb(value: unknown): AdminDemoDb | null {
  if (!isRecognizedRoot(value)) {
    return null;
  }
  try {
    return buildMigratedDb(value);
  } catch {
    return null;
  }
}
