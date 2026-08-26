import { expect, test, type Page } from "@playwright/test";
import { DEMO_SESSION_STORAGE_KEY } from "../../src/types/auth";

const PUBLIC_ROUTES = [
  "/",
  "/acesso",
  "/carrinho",
  "/checkout",
  "/produto/japamala",
] as const;

async function waitForAccessHydration(page: Page) {
  await page.goto("/acesso");
  await expect(page.locator('[data-access-hydrated="true"]')).toBeVisible({
    timeout: 15_000,
  });
}

async function fillDemoLogin(page: Page, email: string) {
  await waitForAccessHydration(page);
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.locator('input[type="password"]').fill("demo123");
  await page.getByLabel("Lembrar de mim").check();
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function seedDemoSession(
  page: Page,
  role: "admin" | "customer",
) {
  const session = {
    userId: role === "admin" ? "demo-admin" : "demo-customer",
    email: role === "admin" ? "admin@potala.demo" : "cliente@potala.demo",
    name: role === "admin" ? "Administrador Potala" : "Cliente Potala",
    role,
    remember: true,
    signedInAt: new Date().toISOString(),
  };

  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
    },
    { key: DEMO_SESSION_STORAGE_KEY, value: JSON.stringify(session) },
  );
}

test.describe("rotas públicas", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`abre ${route} sem overflow horizontal`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("body")).toBeVisible();
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      expect(overflow).toBeFalsy();
    });
  }
});

test.describe("área autenticada (demo)", () => {
  test("login admin redireciona para /admin", async ({ page }) => {
    await fillDemoLogin(page, "admin@potala.demo");
    await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /Painel/i })).toBeVisible();
  });

  test("rotas admin principais respondem", async ({ page }) => {
    await seedDemoSession(page, "admin");

    for (const route of [
      "/admin",
      "/admin/vendedores",
      "/admin/produtos",
      "/admin/pedidos",
      "/admin/financeiro",
    ]) {
      await page.goto(route);
      await expect(page.locator("body")).toBeVisible();
      await expect(page).toHaveURL(new RegExp(route.replace(/\//g, "\\/")));
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      expect(overflow).toBeFalsy();
    }
  });

  test("minha-conta com cliente", async ({ page }) => {
    await seedDemoSession(page, "customer");
    await page.goto("/minha-conta");
    await expect(page).toHaveURL(/\/minha-conta/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /Olá|conta|Bem/i })).toBeVisible();
  });
});
