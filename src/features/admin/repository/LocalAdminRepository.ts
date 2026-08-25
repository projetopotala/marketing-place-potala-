import { canTransitionOrder } from "@/features/admin/domain/status";
import type {
  AdminDemoDb,
  AdminProduct,
  AdminTimelineEvent,
  Category,
  ContentStatus,
  Coupon,
  CourseContent,
  CustomerStatus,
  MarketplaceSettings,
  OrderStatus,
  PaymentStatus,
  Payout,
  ProductStatus,
  Seller,
  SellerStatus,
  Shipment,
  ShipmentStatus,
} from "@/features/admin/domain/types";
import { createAdminSeed } from "@/features/admin/data/seed";
import { nowIso } from "@/features/admin/utils/dates";
import type { AdminRepository } from "./AdminRepository";

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function timeline(
  label: string,
  detail?: string,
): AdminTimelineEvent {
  return {
    id: uid("ev"),
    at: nowIso(),
    label,
    detail,
    actor: "admin@potala.demo",
  };
}

function touch(db: AdminDemoDb): AdminDemoDb {
  return { ...db, updatedAt: nowIso() };
}

export class LocalAdminRepository implements AdminRepository {
  private db: AdminDemoDb;

  constructor(initial?: AdminDemoDb) {
    this.db = initial ?? createAdminSeed();
  }

  getDb(): AdminDemoDb {
    return this.db;
  }

  setDb(db: AdminDemoDb): void {
    this.db = db;
  }

  resetDemoData(): AdminDemoDb {
    this.db = createAdminSeed();
    return this.db;
  }

  createSeller(
    input: Omit<Seller, "id" | "createdAt" | "updatedAt" | "timeline" | "rating">,
  ): AdminDemoDb {
    const stamp = nowIso();
    const seller: Seller = {
      ...input,
      id: uid("sel"),
      rating: 0,
      createdAt: stamp,
      updatedAt: stamp,
      timeline: [timeline("Vendedor criado")],
    };
    this.db = touch({ ...this.db, sellers: [seller, ...this.db.sellers] });
    return this.db;
  }

  updateSeller(id: string, patch: Partial<Seller>): AdminDemoDb {
    this.db = touch({
      ...this.db,
      sellers: this.db.sellers.map((seller) =>
        seller.id === id
          ? {
              ...seller,
              ...patch,
              id: seller.id,
              updatedAt: nowIso(),
              timeline: [
                timeline("Vendedor atualizado"),
                ...seller.timeline,
              ],
            }
          : seller,
      ),
    });
    return this.db;
  }

  changeSellerStatus(
    id: string,
    status: SellerStatus,
    note?: string,
  ): AdminDemoDb {
    return this.updateSeller(id, {
      status,
      notes: note ?? this.db.sellers.find((s) => s.id === id)?.notes ?? "",
      timeline: [
        timeline(`Status: ${status}`, note),
        ...(this.db.sellers.find((s) => s.id === id)?.timeline ?? []),
      ],
    });
  }

  updateSellerCommission(id: string, commissionPercent: number): AdminDemoDb {
    return this.updateSeller(id, { commissionPercent });
  }

  createProduct(
    input: Omit<AdminProduct, "id" | "createdAt" | "updatedAt" | "timeline">,
  ): AdminDemoDb {
    const stamp = nowIso();
    const product: AdminProduct = {
      ...input,
      id: uid("prd"),
      createdAt: stamp,
      updatedAt: stamp,
      timeline: [timeline("Produto criado")],
    };
    this.db = touch({ ...this.db, products: [product, ...this.db.products] });
    return this.db;
  }

  updateProduct(id: string, patch: Partial<AdminProduct>): AdminDemoDb {
    this.db = touch({
      ...this.db,
      products: this.db.products.map((product) =>
        product.id === id
          ? {
              ...product,
              ...patch,
              id: product.id,
              updatedAt: nowIso(),
              timeline: [
                timeline("Produto atualizado"),
                ...product.timeline,
              ],
            }
          : product,
      ),
    });
    return this.db;
  }

  changeProductStatus(
    id: string,
    status: ProductStatus,
    note?: string,
  ): AdminDemoDb {
    return this.updateProduct(id, {
      status,
      moderationNote: note,
      timeline: [
        timeline(`Status: ${status}`, note),
        ...(this.db.products.find((p) => p.id === id)?.timeline ?? []),
      ],
    });
  }

  updateProductStock(id: string, stock: number): AdminDemoDb {
    return this.updateProduct(id, { stock: Math.max(0, Math.floor(stock)) });
  }

  updateOrderStatus(id: string, status: OrderStatus): AdminDemoDb {
    const order = this.db.orders.find((item) => item.id === id);
    if (!order) return this.db;
    if (!canTransitionOrder(order.status, status)) {
      throw new Error(
        `Transição inválida de ${order.status} para ${status}.`,
      );
    }

    const paymentStatus: PaymentStatus =
      status === "paid"
        ? "approved"
        : status === "refunded"
          ? "refunded"
          : status === "cancelled" && order.paymentStatus === "pending"
            ? "declined"
            : order.paymentStatus;

    this.db = touch({
      ...this.db,
      orders: this.db.orders.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              paymentStatus,
              updatedAt: nowIso(),
              timeline: [timeline(`Pedido: ${status}`), ...item.timeline],
            }
          : item,
      ),
      transactions: this.db.transactions.map((txn) =>
        txn.orderId === id
          ? {
              ...txn,
              paymentStatus,
              timeline: [
                timeline(`Pagamento: ${paymentStatus}`),
                ...txn.timeline,
              ],
            }
          : txn,
      ),
    });
    return this.db;
  }

  updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
  ): AdminDemoDb {
    this.db = touch({
      ...this.db,
      orders: this.db.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              paymentStatus,
              status:
                paymentStatus === "approved" && order.status === "pending_payment"
                  ? "paid"
                  : paymentStatus === "refunded"
                    ? "refunded"
                    : order.status,
              updatedAt: nowIso(),
              timeline: [
                timeline(`Pagamento: ${paymentStatus}`),
                ...order.timeline,
              ],
            }
          : order,
      ),
      transactions: this.db.transactions.map((txn) =>
        txn.orderId === orderId
          ? {
              ...txn,
              paymentStatus,
              timeline: [
                timeline(`Pagamento: ${paymentStatus}`),
                ...txn.timeline,
              ],
            }
          : txn,
      ),
    });
    return this.db;
  }

  createShipment(
    input: Omit<Shipment, "id" | "createdAt" | "updatedAt">,
  ): AdminDemoDb {
    const stamp = nowIso();
    const shipment: Shipment = {
      ...input,
      id: uid("shp"),
      createdAt: stamp,
      updatedAt: stamp,
    };
    this.db = touch({
      ...this.db,
      shipments: [shipment, ...this.db.shipments],
    });
    return this.db;
  }

  updateShipmentStatus(
    id: string,
    status: ShipmentStatus,
    patch?: Partial<
      Pick<Shipment, "trackingCode" | "carrier" | "delayed" | "eta">
    >,
  ): AdminDemoDb {
    this.db = touch({
      ...this.db,
      shipments: this.db.shipments.map((shipment) =>
        shipment.id === id
          ? {
              ...shipment,
              ...patch,
              status,
              delayed: status === "delayed" ? true : (patch?.delayed ?? shipment.delayed),
              updatedAt: nowIso(),
            }
          : shipment,
      ),
    });
    return this.db;
  }

  createPayout(input: Omit<Payout, "id" | "createdAt" | "paidAt">): AdminDemoDb {
    const payout: Payout = {
      ...input,
      id: uid("pay"),
      createdAt: nowIso(),
    };
    this.db = touch({ ...this.db, payouts: [payout, ...this.db.payouts] });
    return this.db;
  }

  updatePayoutStatus(id: string, status: Payout["status"]): AdminDemoDb {
    this.db = touch({
      ...this.db,
      payouts: this.db.payouts.map((payout) =>
        payout.id === id
          ? {
              ...payout,
              status,
              paidAt: status === "paid" ? nowIso() : payout.paidAt,
            }
          : payout,
      ),
    });
    return this.db;
  }

  changeCustomerStatus(
    id: string,
    status: CustomerStatus,
    note?: string,
  ): AdminDemoDb {
    this.db = touch({
      ...this.db,
      customers: this.db.customers.map((customer) =>
        customer.id === id
          ? {
              ...customer,
              status,
              notes: note ?? customer.notes,
              updatedAt: nowIso(),
              timeline: [
                timeline(`Cliente: ${status}`, note),
                ...customer.timeline,
              ],
            }
          : customer,
      ),
    });
    return this.db;
  }

  updateCustomer(
    id: string,
    patch: Partial<Pick<AdminDemoDb["customers"][number], "notes" | "tags">>,
  ): AdminDemoDb {
    this.db = touch({
      ...this.db,
      customers: this.db.customers.map((customer) =>
        customer.id === id
          ? {
              ...customer,
              ...patch,
              updatedAt: nowIso(),
              timeline: [
                timeline("Cliente atualizado"),
                ...customer.timeline,
              ],
            }
          : customer,
      ),
    });
    return this.db;
  }

  createContent(
    input: Omit<CourseContent, "id" | "createdAt" | "updatedAt" | "timeline">,
  ): AdminDemoDb {
    const stamp = nowIso();
    const content: CourseContent = {
      ...input,
      id: uid("cnt"),
      createdAt: stamp,
      updatedAt: stamp,
      timeline: [timeline("Conteúdo criado")],
    };
    this.db = touch({ ...this.db, contents: [content, ...this.db.contents] });
    return this.db;
  }

  updateContent(id: string, patch: Partial<CourseContent>): AdminDemoDb {
    this.db = touch({
      ...this.db,
      contents: this.db.contents.map((content) =>
        content.id === id
          ? {
              ...content,
              ...patch,
              id: content.id,
              updatedAt: nowIso(),
              timeline: [
                timeline("Conteúdo atualizado"),
                ...content.timeline,
              ],
            }
          : content,
      ),
    });
    return this.db;
  }

  changeContentStatus(
    id: string,
    status: ContentStatus,
    note?: string,
  ): AdminDemoDb {
    return this.updateContent(id, {
      status,
      moderationNote: note,
      timeline: [
        timeline(`Status: ${status}`, note),
        ...(this.db.contents.find((c) => c.id === id)?.timeline ?? []),
      ],
    });
  }

  createCoupon(
    input: Omit<
      Coupon,
      "id" | "createdAt" | "updatedAt" | "usageCount" | "revenueCents"
    >,
  ): AdminDemoDb {
    const stamp = nowIso();
    const coupon: Coupon = {
      ...input,
      id: uid("cpn"),
      usageCount: 0,
      revenueCents: 0,
      createdAt: stamp,
      updatedAt: stamp,
    };
    this.db = touch({ ...this.db, coupons: [coupon, ...this.db.coupons] });
    return this.db;
  }

  updateCoupon(id: string, patch: Partial<Coupon>): AdminDemoDb {
    this.db = touch({
      ...this.db,
      coupons: this.db.coupons.map((coupon) =>
        coupon.id === id
          ? { ...coupon, ...patch, id: coupon.id, updatedAt: nowIso() }
          : coupon,
      ),
    });
    return this.db;
  }

  deleteCoupon(id: string): AdminDemoDb {
    this.db = touch({
      ...this.db,
      coupons: this.db.coupons.filter((coupon) => coupon.id !== id),
    });
    return this.db;
  }

  createCategory(
    input: Omit<Category, "id" | "createdAt" | "updatedAt">,
  ): AdminDemoDb {
    const stamp = nowIso();
    const category: Category = {
      ...input,
      id: uid("cat"),
      createdAt: stamp,
      updatedAt: stamp,
    };
    this.db = touch({
      ...this.db,
      categories: [category, ...this.db.categories],
    });
    return this.db;
  }

  updateCategory(id: string, patch: Partial<Category>): AdminDemoDb {
    this.db = touch({
      ...this.db,
      categories: this.db.categories.map((category) =>
        category.id === id
          ? { ...category, ...patch, id: category.id, updatedAt: nowIso() }
          : category,
      ),
    });
    return this.db;
  }

  deactivateCategory(id: string): AdminDemoDb {
    const inUse = this.db.products.some((product) => product.categoryId === id);
    if (inUse) {
      return this.updateCategory(id, { status: "inactive" });
    }
    return this.updateCategory(id, { status: "inactive" });
  }

  createAttribute(
    input: Omit<
      AdminDemoDb["attributes"][number],
      "id" | "createdAt" | "updatedAt"
    >,
  ): AdminDemoDb {
    const stamp = nowIso();
    this.db = touch({
      ...this.db,
      attributes: [
        { ...input, id: uid("attr"), createdAt: stamp, updatedAt: stamp },
        ...this.db.attributes,
      ],
    });
    return this.db;
  }

  updateAttribute(
    id: string,
    patch: Partial<AdminDemoDb["attributes"][number]>,
  ): AdminDemoDb {
    this.db = touch({
      ...this.db,
      attributes: this.db.attributes.map((attribute) =>
        attribute.id === id
          ? { ...attribute, ...patch, id: attribute.id, updatedAt: nowIso() }
          : attribute,
      ),
    });
    return this.db;
  }

  saveSettings(settings: MarketplaceSettings): AdminDemoDb {
    this.db = touch({ ...this.db, settings });
    return this.db;
  }

  toggleGateway(id: string): AdminDemoDb {
    this.db = touch({
      ...this.db,
      gateways: this.db.gateways.map((gateway) =>
        gateway.id === id
          ? {
              ...gateway,
              status:
                gateway.status === "connected" ? "disconnected" : "connected",
            }
          : gateway,
      ),
    });
    return this.db;
  }

  refundTransaction(id: string): AdminDemoDb {
    const txn = this.db.transactions.find((item) => item.id === id);
    if (!txn) return this.db;
    this.updatePaymentStatus(txn.orderId, "refunded");
    return this.db;
  }
}
