import type {
  AdminDemoDb,
  AdminProduct,
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

export interface AdminRepository {
  getDb(): AdminDemoDb;
  setDb(db: AdminDemoDb): void;
  resetDemoData(): AdminDemoDb;
  createSeller(
    input: Omit<Seller, "id" | "createdAt" | "updatedAt" | "timeline" | "rating">,
  ): AdminDemoDb;
  updateSeller(id: string, patch: Partial<Seller>): AdminDemoDb;
  changeSellerStatus(id: string, status: SellerStatus, note?: string): AdminDemoDb;
  updateSellerCommission(id: string, commissionPercent: number): AdminDemoDb;
  createProduct(
    input: Omit<AdminProduct, "id" | "createdAt" | "updatedAt" | "timeline">,
  ): AdminDemoDb;
  updateProduct(id: string, patch: Partial<AdminProduct>): AdminDemoDb;
  changeProductStatus(
    id: string,
    status: ProductStatus,
    note?: string,
  ): AdminDemoDb;
  updateProductStock(id: string, stock: number): AdminDemoDb;
  updateOrderStatus(id: string, status: OrderStatus): AdminDemoDb;
  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): AdminDemoDb;
  createShipment(
    input: Omit<Shipment, "id" | "createdAt" | "updatedAt">,
  ): AdminDemoDb;
  updateShipmentStatus(
    id: string,
    status: ShipmentStatus,
    patch?: Partial<Pick<Shipment, "trackingCode" | "carrier" | "delayed" | "eta">>,
  ): AdminDemoDb;
  createPayout(
    input: Omit<Payout, "id" | "createdAt" | "paidAt">,
  ): AdminDemoDb;
  updatePayoutStatus(id: string, status: Payout["status"]): AdminDemoDb;
  changeCustomerStatus(
    id: string,
    status: CustomerStatus,
    note?: string,
  ): AdminDemoDb;
  updateCustomer(
    id: string,
    patch: Partial<Pick<AdminDemoDb["customers"][number], "notes" | "tags">>,
  ): AdminDemoDb;
  createContent(
    input: Omit<CourseContent, "id" | "createdAt" | "updatedAt" | "timeline">,
  ): AdminDemoDb;
  updateContent(id: string, patch: Partial<CourseContent>): AdminDemoDb;
  changeContentStatus(
    id: string,
    status: ContentStatus,
    note?: string,
  ): AdminDemoDb;
  createCoupon(
    input: Omit<Coupon, "id" | "createdAt" | "updatedAt" | "usageCount" | "revenueCents">,
  ): AdminDemoDb;
  updateCoupon(id: string, patch: Partial<Coupon>): AdminDemoDb;
  deleteCoupon(id: string): AdminDemoDb;
  createCategory(
    input: Omit<Category, "id" | "createdAt" | "updatedAt">,
  ): AdminDemoDb;
  updateCategory(id: string, patch: Partial<Category>): AdminDemoDb;
  deactivateCategory(id: string): AdminDemoDb;
  createAttribute(
    input: Omit<AdminDemoDb["attributes"][number], "id" | "createdAt" | "updatedAt">,
  ): AdminDemoDb;
  updateAttribute(
    id: string,
    patch: Partial<AdminDemoDb["attributes"][number]>,
  ): AdminDemoDb;
  saveSettings(settings: MarketplaceSettings): AdminDemoDb;
  toggleGateway(id: string): AdminDemoDb;
  refundTransaction(id: string): AdminDemoDb;
}
