import type { AdminDemoDb, AdminOrder, AdminProduct } from "@/features/admin/domain/types";

export function selectSellerProducts(db: AdminDemoDb, sellerId: string): AdminProduct[] {
  return db.products.filter((product) => product.sellerId === sellerId);
}

export function selectSellerOrders(db: AdminDemoDb, sellerId: string): AdminOrder[] {
  return db.orders.filter((order) => order.sellerId === sellerId);
}

export function selectSellerShipments(db: AdminDemoDb, sellerId: string) {
  return db.shipments.filter((shipment) => shipment.sellerId === sellerId);
}

export function selectSellerTransactions(db: AdminDemoDb, sellerId: string) {
  return db.transactions.filter((tx) => tx.sellerId === sellerId);
}

export function selectSellerPayouts(db: AdminDemoDb, sellerId: string) {
  return db.payouts.filter((payout) => payout.sellerId === sellerId);
}

export function selectSellerCoupons(db: AdminDemoDb, _sellerId: string) {
  // Cupons do seed são de marketplace; a tela do vendedor lista o conjunto demonstrativo.
  void _sellerId;
  return db.coupons;
}

export function selectSellerDashboardMetrics(db: AdminDemoDb, sellerId: string) {
  const orders = selectSellerOrders(db, sellerId);
  const products = selectSellerProducts(db, sellerId);
  const transactions = selectSellerTransactions(db, sellerId);
  const payouts = selectSellerPayouts(db, sellerId);

  const salesCents = orders.reduce((sum, order) => sum + order.totalCents, 0);

  const availableBalanceCents = payouts
    .filter((payout) => payout.status === "paid" || payout.status === "pending")
    .reduce((sum, payout) => sum + payout.amountCents, 0);

  const paidLike = transactions.filter((tx) => tx.paymentStatus === "approved");
  const avgTicketCents =
    orders.length === 0 ? 0 : Math.round(salesCents / orders.length);

  return {
    salesCents,
    ordersCount: orders.length,
    avgTicketCents,
    availableBalanceCents,
    activeProducts: products.filter((product) => product.status === "active").length,
    lowStock: products.filter((product) => product.stock > 0 && product.stock <= 5)
      .length,
    recentOrders: [...orders]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
    topProducts: [...products]
      .filter((product) => product.status === "active")
      .slice(0, 5),
    paymentBreakdown: [
      {
        method: "Pix",
        value: paidLike.filter((tx) => tx.paymentMethod === "pix").length,
      },
      {
        method: "Cartão",
        value: paidLike.filter((tx) => tx.paymentMethod === "card").length,
      },
      {
        method: "Boleto",
        value: paidLike.filter((tx) => tx.paymentMethod === "boleto").length,
      },
    ],
  };
}

export function sellerOwnsProduct(
  db: AdminDemoDb,
  sellerId: string,
  productId: string,
): boolean {
  return db.products.some(
    (product) => product.id === productId && product.sellerId === sellerId,
  );
}

export function sellerOwnsOrder(
  db: AdminDemoDb,
  sellerId: string,
  orderId: string,
): boolean {
  return db.orders.some(
    (order) => order.id === orderId && order.sellerId === sellerId,
  );
}

export function buildSellerSalesSeries(
  orders: AdminOrder[],
): Array<{ label: string; revenueCents: number; orders: number }> {
  const buckets = new Map<string, { revenueCents: number; orders: number }>();

  for (const order of orders) {
    const day = order.createdAt.slice(0, 10);
    const current = buckets.get(day) ?? { revenueCents: 0, orders: 0 };
    current.revenueCents += order.totalCents;
    current.orders += 1;
    buckets.set(day, current);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([day, value]) => ({
      label: day.slice(5),
      revenueCents: value.revenueCents,
      orders: value.orders,
    }));
}
