# Paridade PDF — backlog de telas faltantes

Referência visual: `MarketPlace potala (1) (1).pdf` em Downloads do usuário (não versionado).

Esta etapa entrega a **base visual estável** das rotas existentes. As telas abaixo **não** foram implementadas nesta entrega.

## Área do vendedor

| Tela | Ref. PDF | Rota sugerida | Componentes reutilizáveis | Fonte dos dados demo | Dependências | Critérios de aceite |
| --- | --- | --- | --- | --- | --- | --- |
| Dashboard | Painel vendedor / overview | `/loja/dashboard` | Metric cards, Recharts (`SalesPerformanceChart`), `FadeIn` | Seed filtrado por `sellerId` | Auth role `seller`, `SellerShell` | Métricas derivadas; sem chrome do marketplace admin |
| Pedidos | Lista pedidos seller | `/loja/pedidos` | `AdminDataTable`, filtros, status badges | Orders do seller no LocalAdminRepository | RBAC seller | Só pedidos próprios; transições válidas |
| Produtos | Catálogo seller | `/loja/produtos` | `ProductsView` adaptado | `products` do seller | Upload demo | Listagem + estoque + status |
| Novo produto | Formulário cadastro | `/loja/produtos/novo` | Form + `AdminModal` | LocalAdminRepository | Validação | Rascunho / envio para revisão |
| Detalhe produto | Ficha produto | `/loja/produtos/[id]` | Detail panel | `products` | — | Histórico de moderação demonstrativo |
| Entregas | Logística seller | `/loja/entregas` | Shipments table | `shipments` | Correios demo | Rastreio e status |
| Financeiro | Extrato / saldo | `/loja/financeiro` | `FinanceRevenueChart`, tabelas | transactions / payouts | — | Saldo e comissões do seller |
| Configurações da loja | Settings loja | `/loja/configuracoes` | Tabs (Radix) | settings subset | — | Identidade, frete, horários |
| Cupons | Cupons seller | `/loja/cupons` | Coupons CRUD | coupons | — | Criar / ativar / desativar |
| Estoque | Inventário | `/loja/estoque` | Tabela densa | `products.stock` | — | Ajuste em lote com toast |
| Avaliações | Reviews | `/loja/avaliacoes` | Cards + reply | seed reviews | — | Responder (demo) |
| Loja pública | Vitrine vendedor | `/vendedor/[slug]` | Product cards, Embla | seller + products | SEO | Layout alinhado ao PDF |

## Conta do comprador

| Tela | Ref. PDF | Rota sugerida | Componentes reutilizáveis | Fonte dos dados demo | Dependências | Critérios de aceite |
| --- | --- | --- | --- | --- | --- | --- |
| Histórico de compras | Conta — pedidos | `/minha-conta/pedidos` | Lista compacta + filtros | orders da conta (localStorage) | Auth customer | Paginação / empty state |
| Detalhe do pedido | Conta — detalhe | `/minha-conta/pedidos/[id]` | Timeline + itens | order detail | — | Status, itens, totais |
| Devoluções e reembolsos | Conta — devoluções | `/minha-conta/devolucoes` | Form + badges | seed returns | — | Solicitação demonstrativa |
| Avaliação de produto | Conta — avaliações | `/minha-conta/avaliacoes` | Star icons (Lucide) | pending reviews | — | Enviar nota com toast |
| Endereços | Conta — endereços | `/minha-conta/enderecos` | CRUD cards | addresses | — | CRUD local persistente |
| Favoritos | Conta — favoritos | `/minha-conta/favoritos` | Embla carousel | favorites | — | Remover / adicionar |
| Central de ajuda | Conta — ajuda | `/minha-conta/ajuda` | FAQ Accordion (Radix) | conteúdo estático | — | Busca + teclado |

## Notas de implementação futura

- Criar `SellerShell` separado do `AdminShell` (não misturar chrome).
- Reutilizar selectors/repository ou `SellerDataProvider` derivado.
- Produção exige backend, RBAC e auditoria — manter avisos demonstrativos.
- Priorizar após estabilização visual das rotas já existentes.
