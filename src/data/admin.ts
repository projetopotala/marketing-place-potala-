import type {
  AdminAlert,
  AdminCategorySale,
  AdminFeaturedSeller,
  AdminFinancialItem,
  AdminMetric,
  AdminNavItem,
  AdminPendingApproval,
  AdminRecentOrder,
  AdminSalesPoint,
  AdminSalesSummary,
} from "@/types/admin";

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: "dashboard", label: "Dashboard", active: true, available: true },
  { id: "vendedores", label: "Vendedores", available: false },
  { id: "produtos", label: "Produtos", available: false },
  { id: "pedidos", label: "Pedidos", available: false },
  { id: "entregas", label: "Entregas", available: false },
  { id: "financeiro", label: "Financeiro", available: false },
  { id: "clientes", label: "Clientes", available: false },
  { id: "conteudos", label: "Conteúdos / Cursos", available: false },
  { id: "relatorios", label: "Relatórios", available: false },
  { id: "configuracoes", label: "Configurações", available: false },
];

export const ADMIN_METRICS: AdminMetric[] = [
  {
    id: "sellers",
    label: "Vendedores Ativos",
    value: "245",
    growth: "+12,5%",
    comparison: "vs. mês anterior",
    icon: "sellers",
  },
  {
    id: "products",
    label: "Produtos Cadastrados",
    value: "3.942",
    growth: "+8,1%",
    comparison: "vs. mês anterior",
    icon: "products",
  },
  {
    id: "orders",
    label: "Pedidos Hoje",
    value: "156",
    growth: "+15,3%",
    comparison: "vs. ontem",
    icon: "orders",
  },
  {
    id: "sales",
    label: "Vendas do Mês",
    value: "1.248",
    growth: "+18,7%",
    comparison: "vs. mês anterior",
    icon: "sales",
  },
];

export const ADMIN_SALES_POINTS: AdminSalesPoint[] = [
  { label: "01 Ago", revenue: 14200, orders: 28 },
  { label: "05 Ago", revenue: 16800, orders: 34 },
  { label: "10 Ago", revenue: 19500, orders: 41 },
  { label: "15 Ago", revenue: 22100, orders: 47 },
  { label: "20 Ago", revenue: 24800, orders: 52 },
  { label: "25 Ago", revenue: 27600, orders: 58 },
  { label: "30 Ago", revenue: 31200, orders: 64 },
];

export const ADMIN_SALES_SUMMARY: AdminSalesSummary = {
  totalRevenue: 587623.45,
  orders: 1248,
  averageTicket: 471.22,
  conversionRate: 2.84,
};

export const ADMIN_CATEGORY_SALES: AdminCategorySale[] = [
  { id: "cursos", label: "Cursos", value: 186400, color: "#d5a64f" },
  { id: "cristais", label: "Cristais", value: 142300, color: "#65b96e" },
  { id: "livros", label: "Livros", value: 98400, color: "#6ea8d8" },
  { id: "incensos", label: "Incensos", value: 87200, color: "#c95c57" },
  { id: "acessorios", label: "Acessórios", value: 73323.45, color: "#9b7ed8" },
];

export const ADMIN_FEATURED_SELLERS: AdminFeaturedSeller[] = [
  {
    id: "s1",
    name: "Casa das Ervas Sagradas",
    status: "Ativo",
    products: 86,
    orders: 214,
    commission: 12.5,
    rating: 4.9,
  },
  {
    id: "s2",
    name: "Cristais do Himalaia",
    status: "Ativo",
    products: 64,
    orders: 178,
    commission: 11,
    rating: 4.8,
  },
  {
    id: "s3",
    name: "Livraria Consciência",
    status: "Ativo",
    products: 132,
    orders: 156,
    commission: 10,
    rating: 4.7,
  },
  {
    id: "s4",
    name: "Templo do Silêncio",
    status: "Em análise",
    products: 41,
    orders: 62,
    commission: 12,
    rating: 4.6,
  },
];

export const ADMIN_RECENT_ORDERS: AdminRecentOrder[] = [
  {
    id: "o1",
    code: "POT-2026-1184",
    customer: "Ana Beatriz",
    seller: "Casa das Ervas",
    amount: 189.9,
    status: "Pago",
    payment: "Pix",
    delivery: "Em trânsito",
  },
  {
    id: "o2",
    code: "POT-2026-1183",
    customer: "Rafael Mendes",
    seller: "Cristais do Himalaia",
    amount: 329.5,
    status: "Pago",
    payment: "Cartão",
    delivery: "Separando",
  },
  {
    id: "o3",
    code: "POT-2026-1182",
    customer: "Lúcia Ferreira",
    seller: "Livraria Consciência",
    amount: 97.8,
    status: "Aguardando",
    payment: "Boleto",
    delivery: "Pendente",
  },
  {
    id: "o4",
    code: "POT-2026-1181",
    customer: "Helena Prado",
    seller: "Templo do Silêncio",
    amount: 249.0,
    status: "Pago",
    payment: "Pix",
    delivery: "Entregue",
  },
];

export const ADMIN_FINANCIAL_SUMMARY: AdminFinancialItem[] = [
  { id: "gross", label: "Receita Bruta", value: 587623.45 },
  { id: "commission", label: "Comissões", value: 68420.18, tone: "warning" },
  {
    id: "payout",
    label: "Repasse a Vendedores",
    value: 419203.27,
  },
  { id: "ticket", label: "Ticket Médio", value: 471.22 },
  {
    id: "balance",
    label: "Saldo Disponível",
    value: 100000,
    tone: "success",
  },
];

export const ADMIN_ALERTS: AdminAlert[] = [
  {
    id: "a1",
    title: "7 entregas atrasadas",
    detail: "Pedidos com prazo ultrapassado em mais de 24h.",
    severity: "danger",
  },
  {
    id: "a2",
    title: "12 vendedores pendentes",
    detail: "Cadastros aguardando revisão documental.",
    severity: "warning",
  },
  {
    id: "a3",
    title: "5 pagamentos em análise",
    detail: "Transferências com divergência de valor.",
    severity: "info",
  },
];

export const ADMIN_PENDING_APPROVALS: AdminPendingApproval[] = [
  {
    id: "p1",
    title: "Novos vendedores",
    count: 8,
    description: "Solicitações de abertura de loja",
  },
  {
    id: "p2",
    title: "Novos produtos",
    count: 23,
    description: "Itens aguardando moderação",
  },
  {
    id: "p3",
    title: "Solicitações de conteúdo",
    count: 4,
    description: "Cursos e publicações para revisão",
  },
];
