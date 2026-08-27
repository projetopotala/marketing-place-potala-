# Instituto Potala Marketplace

Frontend demonstrativo do marketplace espiritual do Instituto Potala: vitrine pública, checkout, conta do comprador, painel do vendedor e painel administrativo.

Este repositório **não** inclui backend de produção. Autenticação, pedidos, estoque e financeiro usam persistência local (`localStorage` / `sessionStorage`) apenas para demonstração.

## Stack

- Next.js 16.3.2 (App Router)
- React 19 + TypeScript strict
- Tailwind CSS v4 + CSS Modules
- shadcn/ui (Radix) — componentes acessíveis sob identidade Potala
- Lucide React, Motion, Recharts, Embla Carousel
- Playwright (E2E)

## Estrutura de pastas

```
src/app/(storefront)/   # Home, produto, carrinho, checkout, acesso, vitrine /vendedor
src/app/(account)/      # Minha conta e sub-rotas
src/app/(admin)/admin/  # Painel administrativo
src/app/(seller)/loja/  # Painel do vendedor
src/components/         # UI por domínio (storefront, account, admin, seller)
src/features/admin/     # Domínio, seed, repository e selectors admin
src/features/seller/    # Selectors filtrados por sellerId
src/features/account/   # Persistência demonstrativa do comprador
src/features/catalog/   # Adapters admin ↔ vitrine
src/data/               # Catálogo estático SSG e conteúdo editorial
src/styles/             # Tokens TypeScript
tests/e2e/              # Playwright
docs/                   # Backlog e notas de paridade
```

## Rotas principais

| Área | Rotas |
| --- | --- |
| Storefront | `/`, `/produto/[slug]`, `/carrinho`, `/checkout`, `/checkout/sucesso`, `/acesso`, `/vendedor/[slug]` |
| Conta | `/minha-conta`, `/pedidos`, `/pedidos/[id]`, `/devolucoes`, `/avaliacoes`, `/enderecos`, `/favoritos`, `/cupons`, `/configuracoes`, `/ajuda` |
| Vendedor | `/loja`, `/loja/pedidos`, `/loja/produtos`, `/loja/entregas`, `/loja/financeiro`, `/loja/cupons`, `/loja/estoque`, `/loja/avaliacoes`, `/loja/configuracoes` |
| Admin | `/admin` e módulos (vendedores, produtos, pedidos, financeiro, etc.) |

`/loja/dashboard` redireciona para `/loja`.

## Contas demonstrativas

| Papel | E-mail | Destino |
| --- | --- | --- |
| Admin | `admin@potala.demo` | `/admin` |
| Vendedor | `vendedor@potala.demo` | `/loja` (`sellerId` = `sel-1`) |
| Cliente | qualquer outro e-mail | `/minha-conta` |

Senha: qualquer valor com pelo menos 6 caracteres no formulário demo.

## Scripts

```bash
npm run dev          # desenvolvimento
npm run lint         # ESLint
npm run build        # build de produção
npm run start        # servir build
npm run test:e2e     # build + Playwright (porta 3100)
```

## Armazenamento local

| Chave | Uso |
| --- | --- |
| `potala-demo-session-v1` | Sessão autenticada demo |
| `potala-demo-user-v1` | Perfil cadastrado demo |
| `potala-admin-demo-db-v2` | Banco admin/seller (atual) |
| `potala-admin-demo-db-v1` | Legado — migrado automaticamente para V2 na hidratação |
| `potala-customer-account-v1:<userId>` | Pedidos, endereços, favoritos, etc. do cliente |
| Carrinho / pedido | chaves em `src/data/cart.ts` |

Na abertura do painel admin/vendedor, o app procura a chave V2; se não houver, tenta V1, migra para `version: 2`, grava V2 e remove V1. Se nenhuma chave for válida, usa o seed V2 em memória (sem gravar automaticamente um seed sobre storage irrecuperável).

## Limitações sem backend

- Produtos criados só no `localStorage` **não** entram em páginas SSG (`/produto/[slug]`, `/vendedor/[slug]`).
- Não há sincronização multi-dispositivo nem autenticação segura.
- Uploads de imagem, gateways e e-mail são simulados.
- Redes sociais sem URL oficial permanecem como placeholders não navegáveis.

## Arquitetura por papel

- **Admin**: `AdminShell` + `LocalAdminRepository` (fonte canônica demo de sellers/produtos/pedidos).
- **Seller**: `SellerShell` próprio; selectors filtrados por `sellerId`; mesmas mutações do repository admin.
- **Customer**: `AccountChrome` + `AccountDataProvider`; checkout autenticado acrescenta pedido ao histórico local.

Adapters em `src/features/catalog/adapters.ts` alinham seed admin aos slugs/imagens da vitrine sem reescrita destrutiva.

## Como executar

1. `npm install`
2. `npm run dev`
3. Abrir `http://localhost:3000`

## Qualidade

Antes de liberar mudanças:

```bash
npm run lint
npm run build
npm run test:e2e
```

Consulte `docs/pdf-parity-backlog.md` para o status da paridade com o PDF do cliente.
