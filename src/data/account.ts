import { PRODUCTS } from "@/data/marketplace";
import type {
  AccountAddress,
  AccountCoupon,
  AccountFavorite,
  AccountMetric,
  AccountOrderSummary,
  AccountSidebarItem,
} from "@/types/account";

export const ACCOUNT_SIDEBAR_ITEMS: AccountSidebarItem[] = [
  { id: "resumo", label: "Resumo da Conta", href: "/minha-conta", available: true },
  { id: "pedidos", label: "Meus Pedidos", available: false },
  { id: "enderecos", label: "Endereços", available: false },
  { id: "pagamentos", label: "Formas de Pagamento", available: false },
  { id: "favoritos", label: "Favoritos", available: false },
  { id: "avaliacoes", label: "Avaliações", available: false },
  { id: "cupons", label: "Cupons", available: false },
  { id: "configuracoes", label: "Configurações", available: false },
];

export const ACCOUNT_METRICS: AccountMetric[] = [
  {
    id: "pedidos-recentes",
    label: "Pedidos recentes",
    value: "3",
    hint: "Últimos 90 dias",
  },
  {
    id: "cupons",
    label: "Cupons disponíveis",
    value: "2",
    hint: "Prontos para uso",
  },
  {
    id: "enderecos",
    label: "Endereços salvos",
    value: "2",
    hint: "Entrega e cobrança",
  },
  {
    id: "favoritos",
    label: "Favoritos",
    value: "4",
    hint: "Lista de desejos",
  },
  {
    id: "avaliacoes",
    label: "Avaliações pendentes",
    value: "1",
    hint: "Aguardando sua opinião",
  },
];

export const ACCOUNT_RECENT_ORDERS: AccountOrderSummary[] = [
  {
    id: "ord-1",
    code: "POT-2026-0042",
    date: "18/08/2026",
    status: "Entregue",
    total: 169.8,
    itemCount: 2,
  },
  {
    id: "ord-2",
    code: "POT-2026-0038",
    date: "02/08/2026",
    status: "Em trânsito",
    total: 129.9,
    itemCount: 1,
  },
  {
    id: "ord-3",
    code: "POT-2026-0029",
    date: "15/07/2026",
    status: "Entregue",
    total: 297,
    itemCount: 1,
  },
];

export const ACCOUNT_ACTIVE_COUPONS: AccountCoupon[] = [
  {
    id: "cp-1",
    code: "POTALA10",
    description: "10% em produtos selecionados",
    expiresAt: "30/09/2026",
  },
  {
    id: "cp-2",
    code: "FRETEGRATIS",
    description: "Frete grátis acima de R$ 199",
    expiresAt: "15/10/2026",
  },
];

export const ACCOUNT_ADDRESSES: AccountAddress[] = [
  {
    id: "addr-1",
    label: "Casa",
    line: "Rua das Flores, 120 — Apto 42",
    city: "São Paulo, SP · 01310-100",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Trabalho",
    line: "Av. Paulista, 1000 — Sala 801",
    city: "São Paulo, SP · 01310-200",
  },
];

export function getAccountFavorites(): AccountFavorite[] {
  return PRODUCTS.filter((product) =>
    ["japamala", "ametista-premium", "palo-santo", "poder-do-agora"].includes(
      product.slug,
    ),
  ).map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    imageSrc: product.imageSrc,
    price: product.price,
  }));
}

export const ACCOUNT_WELCOME_STATS = {
  memberSince: "Março de 2026",
  totalOrders: 6,
  totalSpent: 1248.5,
};
