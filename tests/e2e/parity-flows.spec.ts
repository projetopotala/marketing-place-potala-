import { expect, test, type Page } from "@playwright/test";
import {
  DEMO_SESSION_STORAGE_KEY,
  SELLER_DEMO_EMAIL,
  SELLER_DEMO_ID,
} from "../../src/types/auth";
import { createAdminSeed } from "../../src/features/admin/data/seed";

const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
] as const;

const ADMIN_ROUTES = [
  "/admin",
  "/admin/vendedores",
  "/admin/produtos",
  "/admin/pedidos",
  "/admin/entregas",
  "/admin/financeiro",
  "/admin/cupons",
  "/admin/catalogo",
  "/admin/clientes",
  "/admin/conteudos",
  "/admin/relatorios",
  "/admin/configuracoes",
] as const;

async function clearBrowserStorage(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

async function seedSession(
  page: Page,
  role: "admin" | "customer" | "seller",
) {
  const session = {
    userId:
      role === "admin"
        ? "demo-admin"
        : role === "seller"
          ? "demo-seller"
          : "demo-customer",
    email:
      role === "admin"
        ? "admin@potala.demo"
        : role === "seller"
          ? SELLER_DEMO_EMAIL
          : "cliente@potala.demo",
    name:
      role === "admin"
        ? "Administrador Potala"
        : role === "seller"
          ? "Vendedor Demo"
          : "Cliente Potala",
    role,
    remember: true,
    signedInAt: new Date().toISOString(),
    sellerId: role === "seller" ? SELLER_DEMO_ID : undefined,
  };

  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.localStorage.setItem(key, value);
    },
    { key: DEMO_SESSION_STORAGE_KEY, value: JSON.stringify(session) },
  );
}

async function waitForAccessHydration(page: Page) {
  await page.goto("/acesso");
  await expect(page.locator('[data-access-hydrated="true"]')).toBeVisible({
    timeout: 15_000,
  });
}

test.describe("storefront busca e âncoras", () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserStorage(page);
  });

  test("busca da loja abre CommandDialog e navega para produto", async ({
    page,
  }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Abrir busca da loja" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Busca da loja" });
    await expect(dialog).toBeVisible();
    const input = page.getByRole("combobox", { name: "Termo da busca da loja" });
    await input.fill("japamala");
    const option = dialog.getByRole("option").first();
    await expect(option).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/produto\//);
  });

  test("links absolutos para seções da home e rotas de catálogo", async ({
    page,
  }) => {
    await page.goto("/carrinho");
    await expect(page.locator('a[href="/catalogo"]').first()).toHaveAttribute(
      "href",
      "/catalogo",
    );

    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "Conhecer categorias" }),
    ).toHaveAttribute("href", "/#categorias");
    await page.goto("/#categorias");
    await expect(page.locator("#categorias")).toBeVisible();
  });
});

test.describe("vendedor /loja", () => {
  test("login vendedor redireciona para /loja", async ({ page }) => {
    await clearBrowserStorage(page);
    await waitForAccessHydration(page);
    await page.getByLabel("E-mail", { exact: true }).fill(SELLER_DEMO_EMAIL);
    await page.locator('input[type="password"]').fill("demo123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/loja$/, { timeout: 15_000 });
  });

  test("protege /loja sem sessão", async ({ page }) => {
    await clearBrowserStorage(page);
    await page.goto("/loja");
    await expect(page).toHaveURL(/\/acesso/, { timeout: 15_000 });
  });

  test("isolamento sellerId em pedido alheio", async ({ page }) => {
    await seedSession(page, "seller");
    const otherOrder = createAdminSeed().orders.find(
      (order) => order.sellerId !== SELLER_DEMO_ID,
    );
    if (!otherOrder) {
      test.skip();
      return;
    }
    await page.goto(`/loja/pedidos/${otherOrder.id}`);
    await expect(page.getByRole("heading", { name: /indisponível/i })).toBeVisible();
  });

  test("lista e edita produto do vendedor", async ({ page }) => {
    await seedSession(page, "seller");
    await page.goto("/loja/produtos");
    await expect(page.getByRole("heading", { name: "Produtos" })).toBeVisible();
    const firstProduct = page.locator("table a").first();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/loja\/produtos\//);
    await page.getByLabel("Estoque").fill("12");
    await page.getByRole("button", { name: /Salvar alterações/i }).click();
    await expect(page.getByText(/atualizado/i)).toBeVisible();
  });

  test("cria rascunho de produto", async ({ page }) => {
    await seedSession(page, "seller");
    await page.goto("/loja/produtos/novo");
    await page.getByLabel("Título").fill("Kit Ritual Demo");
    await page.getByLabel("Preço (R$)").fill("49.9");
    await page.getByLabel("Estoque").fill("3");
    await page.getByRole("button", { name: /Salvar rascunho/i }).click();
    await expect(page).toHaveURL(/\/loja\/produtos\//, { timeout: 15_000 });
  });

  test("muda estoque na tela dedicada", async ({ page }) => {
    await seedSession(page, "seller");
    await page.goto("/loja/estoque");
    const input = page.locator('input[id^="stk-"]').first();
    await input.fill("7");
    await page.getByRole("button", { name: "Salvar" }).first().click();
    await expect(page.getByText(/Estoque atualizado/i)).toBeVisible();
  });

  test("pedidos do vendedor", async ({ page }) => {
    await seedSession(page, "seller");
    await page.goto("/loja/pedidos");
    await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible();
  });
});

test.describe("conta do cliente", () => {
  test("rotas principais da conta", async ({ page }) => {
    await seedSession(page, "customer");
    for (const route of [
      "/minha-conta",
      "/minha-conta/pedidos",
      "/minha-conta/enderecos",
      "/minha-conta/favoritos",
      "/minha-conta/avaliacoes",
      "/minha-conta/devolucoes",
      "/minha-conta/ajuda",
    ]) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(route.replace(/\//g, "\\/")));
    }
  });

  test("histórico de pedidos lista seed", async ({ page }) => {
    await seedSession(page, "customer");
    await page.goto("/minha-conta/pedidos");
    await expect(
      page.getByRole("link", { name: /POT-2026-0042/ }).last(),
    ).toBeVisible();
  });

  test("endereço CRUD básico", async ({ page }) => {
    await seedSession(page, "customer");
    await page.goto("/minha-conta/enderecos");
    await page.getByLabel("Rótulo").fill("Temporário");
    await page.getByLabel("Destinatário").fill("Cliente Demo");
    await page.getByLabel("Rua").fill("Rua Teste");
    await page.getByLabel("Número").fill("10");
    await page.getByLabel("Bairro").fill("Centro");
    await page.getByLabel("Cidade").fill("São Paulo");
    await page.getByLabel("UF").fill("SP");
    await page.getByLabel("CEP").fill("01000-000");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText(/Endereço adicionado/i)).toBeVisible();
  });

  test("favorito remover na conta", async ({ page }) => {
    await seedSession(page, "customer");
    await page.goto("/minha-conta/favoritos");
    const remove = page.getByRole("button", { name: "Remover" }).first();
    if (await remove.count()) {
      await remove.click();
    }
    await expect(page.getByRole("heading", { name: "Favoritos" })).toBeVisible();
  });

  test("avaliação pendente", async ({ page }) => {
    await seedSession(page, "customer");
    await page.goto("/minha-conta/avaliacoes");
    await expect(page.getByRole("heading", { name: "Avaliações" })).toBeVisible();
  });

  test("devolução de pedido entregue", async ({ page }) => {
    await seedSession(page, "customer");
    await page.goto("/minha-conta/devolucoes");
    await page.getByLabel("Pedido entregue").selectOption({ index: 1 });
    const checkbox = page.getByRole("checkbox").first();
    await checkbox.check();
    await page.getByLabel("Motivo").fill("Produto danificado");
    await page.getByLabel("Descrição").fill("Embalagem aberta no recebimento.");
    await page.getByRole("button", { name: /Enviar solicitação/i }).click();
    await expect(page.getByText(/Solicitação registrada/i)).toBeVisible();
  });
});

test.describe("admin rotas e viewports", () => {
  test("todas as rotas admin principais", async ({ page }) => {
    await seedSession(page, "admin");
    for (const route of ADMIN_ROUTES) {
      await page.goto(route);
      await expect(page.locator("body")).toBeVisible();
      await expect(page).toHaveURL(new RegExp(route.replace(/\//g, "\\/")));
    }
  });

  for (const viewport of VIEWPORTS) {
    test(`sem overflow horizontal em ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await clearBrowserStorage(page);
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(overflow).toBeFalsy();
    });
  }
});
