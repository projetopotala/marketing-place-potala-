import type { AdminDemoDb } from "@/features/admin/domain/types";
import { isSameDay, isSameMonth } from "@/features/admin/utils/dates";
import { formatMoney, formatNumber } from "@/features/admin/utils/currency";

const CATEGORY_COLORS = [
  "#d5a64f",
  "#65b96e",
  "#6ea8d8",
  "#c95c57",
  "#9b7ed8",
  "#e8c878",
];

export function selectDashboardMetrics(db: AdminDemoDb) {
  const activeSellers = db.sellers.filter((s) => s.status === "active").length;
  const products = db.products.length;
  const ordersToday = db.orders.filter((o) => isSameDay(o.createdAt)).length;
  const monthOrders = db.orders.filter(
    (o) =>
      isSameMonth(o.createdAt) &&
      !["cancelled", "refunded"].includes(o.status),
  );
  const monthSales = monthOrders.length;
  const revenueCents = db.transactions
    .filter((t) => t.paymentStatus === "approved")
    .reduce((sum, t) => sum + t.grossCents, 0);
  const shipmentsInProgress = db.shipments.filter((s) =>
    ["pending", "posted", "in_transit", "delayed"].includes(s.status),
  ).length;

  return [
    {
      id: "sellers",
      label: "Vendedores ativos",
      value: formatNumber(activeSellers),
      hint: `${db.sellers.filter((s) => s.status === "pending").length} pendentes`,
      icon: "sellers" as const,
    },
    {
      id: "products",
      label: "Produtos cadastrados",
      value: formatNumber(products),
      hint: `${db.products.filter((p) => p.status === "active").length} ativos`,
      icon: "products" as const,
    },
    {
      id: "orders-today",
      label: "Pedidos hoje",
      value: formatNumber(ordersToday),
      hint: "criados hoje",
      icon: "orders" as const,
    },
    {
      id: "sales-month",
      label: "Vendas do mês",
      value: formatNumber(monthSales),
      hint: "pedidos válidos",
      icon: "sales" as const,
    },
    {
      id: "revenue",
      label: "Receita total",
      value: formatMoney(revenueCents),
      hint: "pagamentos aprovados",
      icon: "sales" as const,
    },
    {
      id: "shipments",
      label: "Entregas em andamento",
      value: formatNumber(shipmentsInProgress),
      hint: `${db.shipments.filter((s) => s.delayed).length} atrasadas`,
      icon: "orders" as const,
    },
  ];
}

export function selectSalesPerformance(
  db: AdminDemoDb,
  days: number,
): Array<{ label: string; revenueCents: number; orders: number }> {
  const buckets = new Map<string, { revenueCents: number; orders: number }>();
  const now = new Date();

  for (let i = days - 1; i >= 0; i -= Math.max(1, Math.floor(days / 7))) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, { revenueCents: 0, orders: 0 });
  }

  // Ensure at least 7 points
  if (buckets.size < 7) {
    buckets.clear();
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      buckets.set(date.toISOString().slice(0, 10), {
        revenueCents: 0,
        orders: 0,
      });
    }
  }

  for (const order of db.orders) {
    const key = order.createdAt.slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    if (["cancelled", "refunded"].includes(order.status)) continue;
    bucket.orders += 1;
  }

  for (const txn of db.transactions) {
    if (txn.paymentStatus !== "approved") continue;
    const key = txn.createdAt.slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.revenueCents += txn.grossCents;
  }

  return Array.from(buckets.entries()).map(([iso, values]) => ({
    label: new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
    ...values,
  }));
}

export function selectCategorySales(db: AdminDemoDb) {
  const map = new Map<string, number>();
  for (const order of db.orders) {
    if (!["paid", "processing", "shipped", "delivered"].includes(order.status)) {
      continue;
    }
    for (const item of order.items) {
      const product = db.products.find((p) => p.id === item.productId);
      const category =
        db.categories.find((c) => c.id === product?.categoryId)?.name ??
        "Outros";
      map.set(
        category,
        (map.get(category) ?? 0) + item.unitPriceCents * item.quantity,
      );
    }
  }

  return Array.from(map.entries()).map(([label, value], index) => ({
    id: label,
    label,
    value,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));
}

export function selectFeaturedSellers(db: AdminDemoDb) {
  return db.sellers
    .filter((s) => s.status === "active" || s.status === "pending")
    .map((seller) => {
      const products = db.products.filter((p) => p.sellerId === seller.id).length;
      const orders = db.orders.filter((o) => o.sellerId === seller.id).length;
      return {
        id: seller.id,
        name: seller.name,
        status: seller.status,
        products,
        orders,
        commission: seller.commissionPercent,
        rating: seller.rating,
      };
    })
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);
}

export function selectRecentOrders(db: AdminDemoDb) {
  return [...db.orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6)
    .map((order) => ({
      id: order.id,
      code: order.code,
      customer:
        db.customers.find((c) => c.id === order.customerId)?.name ?? "—",
      seller: db.sellers.find((s) => s.id === order.sellerId)?.name ?? "—",
      amountCents: order.totalCents,
      status: order.status,
      payment: order.paymentMethod,
      delivery:
        db.shipments.find((s) => s.orderId === order.id)?.status ?? "—",
    }));
}

export function selectFinancialSummary(db: AdminDemoDb) {
  const approved = db.transactions.filter((t) => t.paymentStatus === "approved");
  const gross = approved.reduce((sum, t) => sum + t.grossCents, 0);
  const commissions = approved.reduce((sum, t) => sum + t.commissionCents, 0);
  const fees = approved.reduce((sum, t) => sum + t.feeCents, 0);
  const payoutsPaid = db.payouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountCents, 0);
  const payoutsPending = db.payouts
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + p.amountCents, 0);
  const ticket =
    approved.length > 0 ? Math.round(gross / approved.length) : 0;

  return [
    { id: "gross", label: "Receita Bruta", valueCents: gross },
    {
      id: "commission",
      label: "Comissões",
      valueCents: commissions,
      tone: "warning" as const,
    },
    {
      id: "payout",
      label: "Repasse a Vendedores",
      valueCents: payoutsPaid + payoutsPending,
    },
    { id: "ticket", label: "Ticket Médio", valueCents: ticket },
    {
      id: "balance",
      label: "Saldo Disponível",
      valueCents: Math.max(0, gross - commissions - fees - payoutsPaid),
      tone: "success" as const,
    },
  ];
}

export function selectPendingApprovals(db: AdminDemoDb) {
  return [
    {
      id: "sellers",
      title: "Novos vendedores",
      count: db.sellers.filter((s) => s.status === "pending").length,
      description: "Solicitações de abertura de loja",
      href: "/admin/vendedores?status=pending",
    },
    {
      id: "products",
      title: "Novos produtos",
      count: db.products.filter((p) => p.status === "review").length,
      description: "Itens aguardando moderação",
      href: "/admin/produtos?status=review",
    },
    {
      id: "contents",
      title: "Solicitações de conteúdo",
      count: db.contents.filter((c) => c.status === "review").length,
      description: "Cursos e publicações para revisão",
      href: "/admin/conteudos?status=review",
    },
  ];
}

export function selectAlerts(db: AdminDemoDb) {
  const delayed = db.shipments.filter((s) => s.delayed || s.status === "delayed")
    .length;
  const pendingSellers = db.sellers.filter((s) => s.status === "pending").length;
  const pendingPayments = db.orders.filter(
    (o) => o.paymentStatus === "pending",
  ).length;

  return [
    {
      id: "delayed",
      title: `${delayed} entregas atrasadas`,
      detail: "Pedidos com prazo ultrapassado.",
      severity: "danger" as const,
    },
    {
      id: "sellers",
      title: `${pendingSellers} vendedores pendentes`,
      detail: "Cadastros aguardando revisão documental.",
      severity: "warning" as const,
    },
    {
      id: "payments",
      title: `${pendingPayments} pagamentos em análise`,
      detail: "Pedidos aguardando confirmação.",
      severity: "info" as const,
    },
  ];
}

export function selectTopProducts(db: AdminDemoDb) {
  const counts = new Map<string, { title: string; qty: number; revenue: number }>();
  for (const order of db.orders) {
    if (["cancelled", "refunded"].includes(order.status)) continue;
    for (const item of order.items) {
      const current = counts.get(item.productId) ?? {
        title: item.title,
        qty: 0,
        revenue: 0,
      };
      current.qty += item.quantity;
      current.revenue += item.quantity * item.unitPriceCents;
      counts.set(item.productId, current);
    }
  }
  return Array.from(counts.entries())
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
}

export function globalSearch(db: AdminDemoDb, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      sellers: [],
      products: [],
      orders: [],
      customers: [],
      contents: [],
    };
  }

  return {
    sellers: db.sellers
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q),
      )
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        label: s.name,
        href: `/admin/vendedores/${s.id}`,
        meta: s.email,
      })),
    products: db.products
      .filter((p) => p.title.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        label: p.title,
        href: `/admin/produtos/${p.id}`,
        meta: p.status,
      })),
    orders: db.orders
      .filter(
        (o) =>
          o.code.toLowerCase().includes(q) ||
          (db.customers.find((c) => c.id === o.customerId)?.name ?? "")
            .toLowerCase()
            .includes(q),
      )
      .slice(0, 5)
      .map((o) => ({
        id: o.id,
        label: o.code,
        href: `/admin/pedidos/${o.id}`,
        meta: o.status,
      })),
    customers: db.customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q),
      )
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        label: c.name,
        href: `/admin/clientes/${c.id}`,
        meta: c.email,
      })),
    contents: db.contents
      .filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q),
      )
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        label: c.title,
        href: `/admin/conteudos/${c.id}`,
        meta: c.instructor,
      })),
  };
}
