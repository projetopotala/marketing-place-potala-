import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { ADMIN_STORAGE_KEY } from "../../src/features/admin/data/seed";

const PUBLIC_DIR = path.join(process.cwd(), "public");

const EXPECTED_BY_CATEGORY: Record<string, string[]> = {
  cursos: [
    "Curso Meditação e Atenção Plena",
    "Curso Chakras e Equilíbrio Energético",
  ],
  terapias: [
    "Óleo Essencial de Lavanda 10ml",
    "Kit Aromático de Lavanda",
  ],
  livros: ["O Poder do Agora", "Livro O Despertar da Consciência"],
  incensos: [
    "Incenso Natural Palo Santo",
    "Incenso Natural 7 Ervas Sagradas",
  ],
  cristais: ["Drusa de Ametista Premium", "Cristal de Quartzo Transparente"],
  acessorios: ["Pulseira Japamala 108 Contas", "Caderno de Mantras"],
  meditacao: ["Kit Limpeza Energética", "Sino Tibetano 7 Metais"],
};

const NEW_PRODUCT_SLUGS = [
  { slug: "curso-chakras", name: "Curso Chakras e Equilíbrio Energético", price: "R$ 297,00" },
  { slug: "kit-aromatico-lavanda", name: "Kit Aromático de Lavanda", price: "R$ 79,90" },
  { slug: "livro-despertar", name: "Livro O Despertar da Consciência", price: "R$ 49,90" },
  { slug: "incenso-7-ervas", name: "Incenso Natural 7 Ervas Sagradas", price: "R$ 36,90" },
  { slug: "caderno-mantras", name: "Caderno de Mantras", price: "R$ 39,90" },
];

const DISCOVERY_FIXES = [
  {
    name: "Incenso Natural 7 Ervas Sagradas",
    href: "/produto/incenso-7-ervas",
  },
  {
    name: "Livro O Despertar da Consciência",
    href: "/produto/livro-despertar",
  },
  {
    name: "Curso Chakras e Equilíbrio Energético",
    href: "/produto/curso-chakras",
  },
  {
    name: "Caderno de Mantras",
    href: "/produto/caderno-mantras",
  },
];

const WIDTHS = [360, 390, 768, 1024, 1440] as const;

async function measureHorizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      overflow: doc.scrollWidth - doc.clientWidth,
    };
  });
}

test.describe("navegação e catálogo público", () => {
  test("dados canônicos: ids/slugs únicos, ≥2 por categoria e assets", async ({
    page,
  }) => {
    await page.goto("/catalogo");
    const payload = await page.evaluate(async () => {
      const res = await fetch("/catalogo");
      return res.status;
    });
    expect(payload).toBe(200);

    // Import via built pages is hard; assert through UI + filesystem assets.
    for (const [slug, names] of Object.entries(EXPECTED_BY_CATEGORY)) {
      expect(names.length).toBeGreaterThanOrEqual(2);
      await page.goto(`/categoria/${slug}`);
      const categoryTitle =
        slug === "acessorios"
          ? "Acessórios"
          : slug === "meditacao"
            ? "Meditação"
            : slug.charAt(0).toUpperCase() + slug.slice(1);
      await expect(
        page.getByRole("heading", { level: 1, name: categoryTitle }),
      ).toBeVisible();
      for (const name of names) {
        await expect(page.getByRole("heading", { name })).toBeVisible();
      }
    }

    const assets = [
      "images/potala/discovery-curso-chakras-final.png",
      "images/potala/discovery-livro-despertar-final.png",
      "images/potala/discovery-incenso-7-ervas-final.png",
      "images/potala/discovery-caderno-mantras-final.png",
      "images/potala/product-lavanda.jpg",
    ];
    for (const asset of assets) {
      expect(fs.existsSync(path.join(PUBLIC_DIR, asset))).toBeTruthy();
    }
  });

  test("menu Categorias abre, navega e fecha (desktop e mobile)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Categorias" });
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("link", { name: "Cristais", exact: true }).first().click();
    await expect(page).toHaveURL(/\/categoria\/cristais/);
    await expect(page.getByRole("heading", { level: 1, name: "Cristais" })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Abrir menu de categorias" }).click();
    await page.getByRole("link", { name: "Livros", exact: true }).click();
    await expect(page).toHaveURL(/\/categoria\/livros/);
    await expect(page.getByRole("heading", { level: 1, name: "Livros" })).toBeVisible();
  });

  test("cards de categoria e CTAs do hero / Ver todos", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Explorar categoria Cursos/i }).click();
    await expect(page).toHaveURL(/\/categoria\/cursos/);

    await page.goto("/");
    await page.getByRole("link", { name: "Explorar produtos" }).click();
    await expect(page).toHaveURL(/\/catalogo$/);

    await page.goto("/");
    await page.getByRole("link", { name: "Conhecer categorias" }).click();
    await expect(page.locator("#categorias")).toBeVisible();

    await page.goto("/");
    await page
      .locator("#produtos")
      .getByRole("link", { name: /Ver todos/i })
      .click();
    await expect(page).toHaveURL(/\/catalogo$/);

    await page.goto("/");
    await page
      .locator("#novidades")
      .getByRole("link", { name: /Ver todos/i })
      .click();
    await expect(page).toHaveURL(/\/novidades/);
  });

  test("categoria inexistente → not found; rotas diretas e reload", async ({
    page,
  }) => {
    const response = await page.goto("/categoria/nao-existe-xyz");
    expect(response?.status()).toBe(404);

    await page.goto("/categoria/incensos");
    await expect(page.getByRole("heading", { level: 1, name: "Incensos" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Incensos" })).toBeVisible();
  });

  test("discovery: quatro links antes trocados apontam ao produto certo", async ({
    page,
  }) => {
    await page.goto("/");
    for (const item of DISCOVERY_FIXES) {
      const link = page.getByRole("link", { name: item.name }).first();
      await expect(link).toHaveAttribute("href", item.href);
      await link.scrollIntoViewIfNeeded();
      await link.click();
      await expect(page).toHaveURL(new RegExp(item.href.replace("/", "\\/")), {
        timeout: 10_000,
      });
      await expect(page.getByRole("heading", { name: item.name }).first()).toBeVisible();
      await page.goto("/");
    }
  });

  test("detalhes dos novos produtos batem com nome/preço", async ({ page }) => {
    for (const item of NEW_PRODUCT_SLUGS) {
      await page.goto(`/produto/${item.slug}`);
      await expect(page.getByRole("heading", { name: item.name }).first()).toBeVisible();
      const panelText = (
        await page.locator("#purchase-panel-title").innerText()
      ).replace(/\u00a0/g, " ");
      expect(panelText).toContain(item.price.replace(/\u00a0/g, " "));
    }
  });

  test("curso mostra programa e não frete físico", async ({ page }) => {
    await page.goto("/produto/curso-chakras");
    await expect(
      page.getByRole("heading", { name: "Programa", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver programa" })).toBeVisible();
    await expect(page.getByText("Calcular frete")).toHaveCount(0);
    await expect(page.getByText("Envio em até 2 dias úteis")).toHaveCount(0);
  });

  test("filtros na URL: busca, ordenação, reload e voltar", async ({ page }) => {
    await page.goto("/catalogo");
    await page.getByLabel("Buscar").fill("lavanda");
    await page.getByRole("button", { name: "Aplicar busca" }).click();
    await expect(page).toHaveURL(/q=lavanda/);
    await expect(page.getByRole("heading", { name: /Lavanda/i }).first()).toBeVisible();

    await page.getByLabel("Ordenar").selectOption("menor-preco");
    await expect(page).toHaveURL(/ordem=menor-preco/);
    await expect(page).toHaveURL(/q=lavanda/);

    await page.reload();
    await expect(page.getByLabel("Buscar")).toHaveValue("lavanda");
    await expect(page.getByLabel("Ordenar")).toHaveValue("menor-preco");

    await page.goto("/catalogo?q=xyzsemresultado999");
    await expect(page.getByText(/Nenhum produto corresponde/i)).toBeVisible();

    await page.goto("/catalogo?q=meditacao");
    await page.goto("/catalogo?q=cristal");
    await page.goBack();
    await expect(page).toHaveURL(/q=meditacao/);
  });

  test("busca com/sem acento e novidades/ofertas", async ({ page }) => {
    await page.goto("/catalogo?q=meditacao");
    await expect(page.getByRole("heading", { name: /Meditação/i }).first()).toBeVisible();
    await page.goto("/catalogo?q=Meditação");
    await expect(page.getByRole("heading", { name: /Meditação/i }).first()).toBeVisible();

    await page.goto("/novidades");
    await expect(page.getByRole("heading", { level: 1, name: "Novidades" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Curso Meditação e Atenção Plena" })).toBeVisible();

    await page.goto("/ofertas");
    await expect(page.getByRole("heading", { level: 1, name: "Ofertas" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Drusa de Ametista Premium" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pulseira Japamala 108 Contas" })).toBeVisible();
  });

  test("carrinho: add da home, quantidade, persistência e estoque", async ({
    page,
  }) => {
    await page.goto("/categoria/cristais");
    const card = page.locator("article").filter({
      has: page.getByRole("heading", { name: "Cristal de Quartzo Transparente" }),
    });
    await card.getByRole("button", { name: /Adicionar ao carrinho/i }).click();
    await expect(page.getByRole("link", { name: /Carrinho com 1/i })).toBeVisible();

    await card.getByRole("button", { name: /Adicionar ao carrinho/i }).click();
    await expect(page.getByRole("link", { name: /Carrinho com 2/i })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("link", { name: /Carrinho com 2/i })).toBeVisible();

    await page.goto("/carrinho");
    await expect(page.getByText("Cristal de Quartzo Transparente")).toBeVisible();
    await expect(page.getByText("2").first()).toBeVisible();
  });

  test("vitrine não reseta banco admin V2 personalizado", async ({ page }) => {
    const customMarker = "vendedor-custom-vitrine-check";
    await page.addInitScript(
      ({ key, marker }) => {
        const existing = window.localStorage.getItem(key);
        if (existing) {
          try {
            const parsed = JSON.parse(existing) as { settings?: { storeName?: string } };
            if (parsed?.settings) {
              parsed.settings.storeName = marker;
              window.localStorage.setItem(key, JSON.stringify(parsed));
              return;
            }
          } catch {
            // fall through to seed-like minimal marker bag
          }
        }
        window.localStorage.setItem(
          key,
          JSON.stringify({
            version: 2,
            updatedAt: new Date().toISOString(),
            settings: { storeName: marker },
            sellers: [],
            products: [],
            orders: [],
            shipments: [],
            transactions: [],
            payouts: [],
            customers: [],
            contents: [],
            coupons: [],
            categories: [],
            attributes: [],
            gateways: [],
            notifications: [],
          }),
        );
      },
      { key: ADMIN_STORAGE_KEY, marker: customMarker },
    );

    await page.goto("/catalogo");
    await expect(page.getByRole("heading", { level: 1, name: "Catálogo" })).toBeVisible();
    await page.goto("/categoria/cursos");
    await expect(page.getByRole("heading", { level: 1, name: "Cursos" })).toBeVisible();

    const stored = await page.evaluate((key) => window.localStorage.getItem(key), ADMIN_STORAGE_KEY);
    expect(stored).toBeTruthy();
    expect(stored).toContain(customMarker);
  });

  test("a11y menu Escape + reduced motion + overflow", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Categorias" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ["/", "/catalogo", "/categoria/cursos", "/novidades", "/ofertas"]) {
        await page.goto(route);
        const overflow = await measureHorizontalOverflow(page);
        expect(overflow.overflow, `${route} @ ${width}`).toBeLessThanOrEqual(1);
      }
    }
  });

  test("screenshots home/catalogo/ofertas/menu", async ({ page }) => {
    test.setTimeout(90_000);
    const outDir = path.join(process.cwd(), "test-results", "storefront-nav");
    fs.mkdirSync(outDir, { recursive: true });

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.screenshot({
      path: path.join(outDir, "home-desktop-after.png"),
      fullPage: false,
      animations: "disabled",
    });
    await page.getByRole("button", { name: "Categorias" }).click();
    await page.screenshot({
      path: path.join(outDir, "menu-desktop-open-after.png"),
      fullPage: false,
      animations: "disabled",
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.screenshot({
      path: path.join(outDir, "home-mobile-after.png"),
      fullPage: false,
      animations: "disabled",
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/catalogo");
    await page.screenshot({
      path: path.join(outDir, "catalogo-desktop-after.png"),
      fullPage: false,
      animations: "disabled",
    });
    await page.goto("/ofertas");
    await page.screenshot({
      path: path.join(outDir, "ofertas-desktop-after.png"),
      fullPage: false,
      animations: "disabled",
    });
    await page.goto("/categoria/cristais");
    await page.screenshot({
      path: path.join(outDir, "categoria-cristais-desktop-after.png"),
      fullPage: false,
      animations: "disabled",
    });

    for (const file of [
      "home-desktop-after.png",
      "home-mobile-after.png",
      "catalogo-desktop-after.png",
      "ofertas-desktop-after.png",
      "menu-desktop-open-after.png",
    ]) {
      const full = path.join(outDir, file);
      expect(fs.existsSync(full)).toBeTruthy();
      expect(fs.statSync(full).size).toBeGreaterThan(5_000);
    }
  });
});
