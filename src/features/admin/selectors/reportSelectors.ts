import type { AdminDemoDb, ReportKind } from "@/features/admin/domain/types";
import { inRange } from "@/features/admin/utils/dates";
import { formatMoney } from "@/features/admin/utils/currency";
import {
  CONTENT_STATUS_LABEL,
  CUSTOMER_STATUS_LABEL,
  ORDER_STATUS_LABEL,
  PRODUCT_STATUS_LABEL,
  SELLER_STATUS_LABEL,
  SHIPMENT_STATUS_LABEL,
} from "@/features/admin/domain/status";

export function buildReport(
  db: AdminDemoDb,
  kind: ReportKind,
  from?: string,
  to?: string,
): { headers: string[]; rows: string[][]; summary: Array<{ label: string; value: string }> } {
  switch (kind) {
    case "sellers": {
      const items = db.sellers.filter((s) => inRange(s.createdAt, from, to));
      return {
        headers: ["Nome", "Status", "Cidade", "Comissão", "Avaliação"],
        rows: items.map((s) => [
          s.name,
          SELLER_STATUS_LABEL[s.status],
          `${s.city}/${s.state}`,
          `${s.commissionPercent}%`,
          String(s.rating),
        ]),
        summary: [
          { label: "Total", value: String(items.length) },
          {
            label: "Ativos",
            value: String(items.filter((s) => s.status === "active").length),
          },
        ],
      };
    }
    case "products": {
      const items = db.products.filter((p) => inRange(p.createdAt, from, to));
      return {
        headers: ["Produto", "Status", "Estoque", "Preço"],
        rows: items.map((p) => [
          p.title,
          PRODUCT_STATUS_LABEL[p.status],
          String(p.stock),
          formatMoney(p.priceCents),
        ]),
        summary: [
          { label: "Total", value: String(items.length) },
          {
            label: "Ativos",
            value: String(items.filter((p) => p.status === "active").length),
          },
        ],
      };
    }
    case "orders":
    case "sales": {
      const items = db.orders.filter((o) => inRange(o.createdAt, from, to));
      return {
        headers: ["Código", "Status", "Total", "Pagamento"],
        rows: items.map((o) => [
          o.code,
          ORDER_STATUS_LABEL[o.status],
          formatMoney(o.totalCents),
          o.paymentMethod,
        ]),
        summary: [
          { label: "Pedidos", value: String(items.length) },
          {
            label: "Receita",
            value: formatMoney(
              items
                .filter((o) => !["cancelled", "refunded"].includes(o.status))
                .reduce((sum, o) => sum + o.totalCents, 0),
            ),
          },
        ],
      };
    }
    case "customers": {
      const items = db.customers.filter((c) => inRange(c.createdAt, from, to));
      return {
        headers: ["Nome", "E-mail", "Status", "Cidade"],
        rows: items.map((c) => [
          c.name,
          c.email,
          CUSTOMER_STATUS_LABEL[c.status],
          `${c.city}/${c.state}`,
        ]),
        summary: [{ label: "Total", value: String(items.length) }],
      };
    }
    case "shipments": {
      const items = db.shipments.filter((s) => inRange(s.createdAt, from, to));
      return {
        headers: ["Pedido", "Transportadora", "Status", "Rastreio"],
        rows: items.map((s) => [
          db.orders.find((o) => o.id === s.orderId)?.code ?? s.orderId,
          s.carrier,
          SHIPMENT_STATUS_LABEL[s.status],
          s.trackingCode || "—",
        ]),
        summary: [
          { label: "Total", value: String(items.length) },
          {
            label: "Atrasadas",
            value: String(items.filter((s) => s.delayed).length),
          },
        ],
      };
    }
    case "finance": {
      const items = db.transactions.filter((t) => inRange(t.createdAt, from, to));
      return {
        headers: ["ID", "Bruto", "Comissão", "Líquido", "Status"],
        rows: items.map((t) => [
          t.id,
          formatMoney(t.grossCents),
          formatMoney(t.commissionCents),
          formatMoney(t.netCents),
          t.paymentStatus,
        ]),
        summary: [
          {
            label: "Bruto",
            value: formatMoney(
              items
                .filter((t) => t.paymentStatus === "approved")
                .reduce((sum, t) => sum + t.grossCents, 0),
            ),
          },
        ],
      };
    }
    case "contents": {
      const items = db.contents.filter((c) => inRange(c.createdAt, from, to));
      return {
        headers: ["Título", "Instrutor", "Status", "Alunos"],
        rows: items.map((c) => [
          c.title,
          c.instructor,
          CONTENT_STATUS_LABEL[c.status],
          String(c.students),
        ]),
        summary: [{ label: "Total", value: String(items.length) }],
      };
    }
    default:
      return { headers: [], rows: [], summary: [] };
  }
}
