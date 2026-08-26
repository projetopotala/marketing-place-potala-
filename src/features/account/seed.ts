import { PRODUCTS } from "@/data/marketplace";
import type {
  CustomerAccountDb,
  CustomerAddress,
  CustomerFavorite,
  CustomerOrder,
  CustomerReview,
} from "@/features/account/domain";

function now() {
  return new Date().toISOString();
}

export function createCustomerAccountSeed(userId: string): CustomerAccountDb {
  const stamp = now();
  const favorites: CustomerFavorite[] = PRODUCTS.filter((product) =>
    ["japamala", "ametista-premium", "palo-santo", "poder-do-agora"].includes(
      product.slug,
    ),
  ).map((product) => ({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    imageSrc: product.imageSrc,
    price: product.price,
    addedAt: stamp,
  }));

  const addresses: CustomerAddress[] = [
    {
      id: "caddr-1",
      label: "Casa",
      recipient: "Cliente Potala",
      street: "Rua das Flores",
      number: "120",
      complement: "Apto 42",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      cep: "01310-100",
      isDefault: true,
    },
    {
      id: "caddr-2",
      label: "Trabalho",
      recipient: "Cliente Potala",
      street: "Av. Paulista",
      number: "1000",
      complement: "Sala 801",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      cep: "01310-200",
      isDefault: false,
    },
  ];

  const orders: CustomerOrder[] = [
    {
      id: "cord-1",
      code: "POT-2026-0042",
      status: "delivered",
      createdAt: "2026-08-18T14:00:00.000Z",
      updatedAt: "2026-08-22T11:00:00.000Z",
      items: [
        {
          productId: "japamala",
          slug: "japamala",
          name: "Japamala Tradicional",
          imageSrc: PRODUCTS.find((p) => p.slug === "japamala")?.imageSrc ?? "",
          quantity: 1,
          unitPrice: 89.9,
          lineTotal: 89.9,
        },
        {
          productId: "palo-santo",
          slug: "palo-santo",
          name: "Palo Santo",
          imageSrc:
            PRODUCTS.find((p) => p.slug === "palo-santo")?.imageSrc ?? "",
          quantity: 1,
          unitPrice: 79.9,
          lineTotal: 79.9,
        },
      ],
      subtotal: 169.8,
      shippingCost: 0,
      shippingLabel: "Frete padrão",
      discount: 0,
      total: 169.8,
      paymentMethod: "pix",
      paymentLabel: "Pix",
      addressLabel: "Rua das Flores, 120",
      city: "São Paulo",
      state: "SP",
      timeline: [
        {
          id: "t1",
          at: "2026-08-18T14:00:00.000Z",
          label: "Pedido realizado",
        },
        {
          id: "t2",
          at: "2026-08-19T10:00:00.000Z",
          label: "Pago",
        },
        {
          id: "t3",
          at: "2026-08-20T09:00:00.000Z",
          label: "Enviado",
        },
        {
          id: "t4",
          at: "2026-08-22T11:00:00.000Z",
          label: "Entregue",
        },
      ],
    },
    {
      id: "cord-2",
      code: "POT-2026-0038",
      status: "shipped",
      createdAt: "2026-08-02T16:30:00.000Z",
      updatedAt: "2026-08-04T12:00:00.000Z",
      items: [
        {
          productId: "ametista-premium",
          slug: "ametista-premium",
          name: "Ametista Premium",
          imageSrc:
            PRODUCTS.find((p) => p.slug === "ametista-premium")?.imageSrc ??
            "",
          quantity: 1,
          unitPrice: 129.9,
          lineTotal: 129.9,
        },
      ],
      subtotal: 129.9,
      shippingCost: 18,
      shippingLabel: "Econômico",
      discount: 0,
      total: 147.9,
      paymentMethod: "card",
      paymentLabel: "Cartão",
      addressLabel: "Av. Paulista, 1000",
      city: "São Paulo",
      state: "SP",
      timeline: [
        {
          id: "t1",
          at: "2026-08-02T16:30:00.000Z",
          label: "Pedido realizado",
        },
        {
          id: "t2",
          at: "2026-08-03T09:00:00.000Z",
          label: "Em separação",
        },
        {
          id: "t3",
          at: "2026-08-04T12:00:00.000Z",
          label: "Enviado",
        },
      ],
    },
  ];

  const reviews: CustomerReview[] = [
    {
      id: "crev-pending-1",
      orderId: "cord-1",
      productId: "japamala",
      productName: "Japamala Tradicional",
      productSlug: "japamala",
      rating: 0,
      comment: "",
      status: "pending",
      createdAt: stamp,
      updatedAt: stamp,
    },
  ];

  return {
    version: 1,
    userId,
    orders,
    addresses,
    favorites,
    reviews,
    returns: [],
    tickets: [],
    updatedAt: stamp,
  };
}

export function isCustomerAccountDb(value: unknown): value is CustomerAccountDb {
  if (!value || typeof value !== "object") return false;
  const db = value as Record<string, unknown>;
  return (
    db.version === 1 &&
    typeof db.userId === "string" &&
    Array.isArray(db.orders) &&
    Array.isArray(db.addresses) &&
    Array.isArray(db.favorites) &&
    Array.isArray(db.reviews) &&
    Array.isArray(db.returns) &&
    Array.isArray(db.tickets)
  );
}
