# Paridade PDF — backlog

Referência visual: PDF do cliente (não versionado).

## Entregue nesta onda

### Storefront
- [x] Links absolutos `/#…` no header/footer/categorias
- [x] Busca funcional com `CommandDialog` + `normalizeText`
- [x] Redes sociais como placeholders quando sem URL oficial
- [x] Adapters admin ↔ catálogo (`slug`, `imageAlt`, galeria)

### Vendedor
- [x] Role `seller` + conta `vendedor@potala.demo` (`sel-1`)
- [x] `SellerAuthGuard`, `SellerShell`, `SellerSidebar`, `SellerTopbar`
- [x] Rotas `/loja/*` (dashboard, pedidos, produtos, entregas, financeiro, cupons, estoque, avaliações, configurações)
- [x] Isolamento por `sellerId`
- [x] `/vendedor/[slug]` pública com metadados e 404
- [x] `/loja/dashboard` → redirect `/loja`

### Conta do comprador
- [x] Chrome compartilhado + item ativo via `usePathname`
- [x] Rotas: pedidos, detalhe, devoluções, avaliações, endereços, favoritos, cupons, configurações, ajuda
- [x] Persistência versionada `potala-customer-account-v1:<userId>`
- [x] Favoritos sincronizados com `ProductCard`
- [x] Checkout autenticado alimenta histórico local

### Qualidade
- [x] Testes Playwright ampliados (`tests/e2e/parity-flows.spec.ts`)
- [x] README real do projeto

## Pendente / parcial (depende de backend ou assets)

- [ ] Upload real de imagens do vendedor
- [ ] Cupons exclusivos por seller (hoje lista marketplace)
- [ ] Avaliações detalhadas com moderação no painel seller
- [ ] Sincronização SSG ↔ localStorage (produtos novos na vitrine)
- [ ] URLs oficiais de redes sociais
- [ ] Conversão WebP completa do pacote de imagens (~42 MB) com validação visual item a item
- [ ] Accordion Radix dedicado na ajuda (hoje usa `<details>` acessível)
- [ ] Galeria Japamala: validar ângulos reais se houver novas fotos aprovadas

## Notas

- Chrome do seller é separado do admin.
- Dinheiro admin em centavos; conta do cliente usa reais do checkout demo.
- Produção exige API, cookies httpOnly e RBAC no servidor.
