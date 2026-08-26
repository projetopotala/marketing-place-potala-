# Inventário e otimização de imagens Potala

## Estado atual (`public/images/potala`)

Fotografias PNG “final” pesam ~1,3–2,9 MB cada (filosofia, produtos, discovery, categorias, hero). Logos e meios de pagamento já são PNG leves e devem permanecer PNG.

## Estratégia (sem apagar originais)

1. Next.js já está configurado com `images.formats: ["image/avif", "image/webp"]` — o otimizador serve formatos modernos em runtime para `<Image>`.
2. Manter PNG/JPG originais no repositório até geração offline de variantes.
3. Script sugerido (executar localmente quando desejado):

```powershell
# Exemplo com sharp-cli (instalar sob demanda):
# npx --yes sharp-cli -i public/images/potala/hero-bg-v2.png -o public/images/potala/optimized/hero-bg-v2.webp --webp
```

4. Não converter `logo-mark.png` nem `pay-*.png` para WebP com perda de transparência/nitidez.
5. Preferir `next/image` com `sizes` correto; CSS background apenas para decoração (newsletter/hero overlay).

## Prioridade de compressão offline

1. `philosophy-buddha-final.png`
2. Discovery set (`discovery-*-final.png`)
3. Product finals (`product-*-final.png`)
4. Category finals
5. `hero-bg-v2.png` (manter composição; apenas comprimir)
6. `newsletter-bg-final.png`
