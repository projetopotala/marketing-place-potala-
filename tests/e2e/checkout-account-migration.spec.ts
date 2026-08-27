import { expect, test, type Page } from "@playwright/test";
import {
  DEMO_SESSION_STORAGE_KEY,
  SELLER_DEMO_EMAIL,
  SELLER_DEMO_ID,
} from "../../src/types/auth";
import {
  ADMIN_STORAGE_KEY,
  ADMIN_STORAGE_KEY_V1,
  createAdminSeed,
} from "../../src/features/admin/data/seed";
import { migrateAdminDemoDb } from "../../src/features/admin/data/migrateAdminDemoDb";
import { CUSTOMER_ACCOUNT_STORAGE_KEY } from "../../src/features/account/domain";

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
      const boot = "__potala_e2e_boot";
      if (window.localStorage.getItem(boot) !== "1") {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.localStorage.setItem(boot, "1");
      }
      window.localStorage.setItem(key, value);
    },
    { key: DEMO_SESSION_STORAGE_KEY, value: JSON.stringify(session) },
  );
}

async function fillCheckoutForm(page: Page) {
  await page.getByLabel("Nome completo").fill("Cliente Teste E2E");
  await page.getByLabel("E-mail").fill("cliente@potala.demo");
  await page.getByLabel("Telefone").fill("11999998888");
  await page.getByLabel("CEP").fill("01310100");
  await page.getByLabel("Rua").fill("Rua Augusta");
  await page.getByLabel("Número").fill("1500");
  await page.getByLabel("Complemento").fill("Sala 12");
  await page.getByLabel("Bairro").fill("Consolação");
  await page.getByLabel("Cidade").fill("São Paulo");
  await page.getByLabel("Estado (UF)").fill("sp");
}

async function addJapamalaAndOpenCheckout(page: Page) {
  await page.goto("/produto/japamala");
  await page.getByRole("button", { name: /Adicionar ao carrinho/i }).click();
  await expect
    .poll(async () =>
      page.evaluate((cartKey) => {
        const raw = window.localStorage.getItem(cartKey);
        if (!raw) return 0;
        try {
          const parsed = JSON.parse(raw) as unknown;
          return Array.isArray(parsed) ? parsed.length : 0;
        } catch {
          return 0;
        }
      }, "potala-marketplace-cart-v1"),
    )
    .toBeGreaterThan(0);
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Finalizar pedido" })).toBeVisible({
    timeout: 10_000,
  });
}

test.describe("checkout autenticação e histórico", () => {
  test("cliente autenticado: endereço no histórico e sem duplicação", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Math.random = () => 0.5;
    });
    await seedSession(page, "customer");

    await addJapamalaAndOpenCheckout(page);
    await fillCheckoutForm(page);
    await page.getByRole("button", { name: "Finalizar pedido" }).click();

    await expect(page).toHaveURL(/\/checkout\/sucesso/);
    await expect(
      page.getByRole("heading", { name: /Pedido realizado com sucesso/i }),
    ).toBeVisible();
    await expect(page.getByText("Disponível em breve")).toHaveCount(0);

    const orderCode = await page
      .locator("strong")
      .filter({ hasText: /^POT-/ })
      .first()
      .innerText();

    await page.getByRole("link", { name: "Ver meus pedidos" }).click();
    await expect(page).toHaveURL(/\/minha-conta\/pedidos/);
    await expect(page.getByRole("link", { name: orderCode }).last()).toBeVisible();

    const accountSnapshot = await page.evaluate(
      ({ storagePrefix, code }) => {
        const key = Object.keys(window.localStorage).find((item) =>
          item.startsWith(storagePrefix),
        );
        if (!key) return null;
        const db = JSON.parse(window.localStorage.getItem(key) ?? "null") as {
          orders: Array<{
            code: string;
            addressLabel: string;
            city: string;
            state: string;
          }>;
        } | null;
        if (!db) return null;
        const matches = db.orders.filter((order) => order.code === code);
        return {
          key,
          count: matches.length,
          order: matches[0] ?? null,
        };
      },
      { storagePrefix: CUSTOMER_ACCOUNT_STORAGE_KEY, code: orderCode },
    );

    expect(accountSnapshot).not.toBeNull();
    expect(accountSnapshot?.count).toBe(1);
    expect(accountSnapshot?.order?.addressLabel).toContain("Rua Augusta");
    expect(accountSnapshot?.order?.addressLabel).toContain("1500");
    expect(accountSnapshot?.order?.addressLabel).toContain("Sala 12");
    expect(accountSnapshot?.order?.city).toBe("São Paulo");
    expect(accountSnapshot?.order?.state).toBe("SP");

    // Segundo checkout com o mesmo orderId (Math.random fixo) não duplica.
    await addJapamalaAndOpenCheckout(page);
    await fillCheckoutForm(page);
    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await expect(page).toHaveURL(/\/checkout\/sucesso/);

    const afterSecond = await page.evaluate(
      ({ storagePrefix, code }) => {
        const key = Object.keys(window.localStorage).find((item) =>
          item.startsWith(storagePrefix),
        );
        if (!key) return 0;
        const db = JSON.parse(window.localStorage.getItem(key) ?? "null") as {
          orders: Array<{ code: string }>;
        } | null;
        return db?.orders.filter((order) => order.code === code).length ?? 0;
      },
      { storagePrefix: CUSTOMER_ACCOUNT_STORAGE_KEY, code: orderCode },
    );

    expect(afterSecond).toBe(1);
  });

  test("visitante: link Entrar para acompanhar sem ‘em breve’", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const boot = "__potala_e2e_boot";
      if (window.localStorage.getItem(boot) !== "1") {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.localStorage.setItem(boot, "1");
      }
    });

    await addJapamalaAndOpenCheckout(page);
    await fillCheckoutForm(page);
    await page.getByRole("button", { name: "Finalizar pedido" }).click();

    await expect(page).toHaveURL(/\/checkout\/sucesso/);
    await expect(
      page.getByRole("link", { name: "Entrar para acompanhar" }),
    ).toHaveAttribute("href", "/acesso");
    await expect(page.getByText("Disponível em breve")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Ver meus pedidos" })).toHaveCount(
      0,
    );
  });
});

function adminSessionValue() {
  return JSON.stringify({
    userId: "demo-admin",
    email: "admin@potala.demo",
    name: "Administrador Potala",
    role: "admin",
    remember: true,
    signedInAt: new Date().toISOString(),
  });
}

function buildCustomV1Db() {
  const seed = createAdminSeed();
  const legacyProduct = {
    ...seed.products[0],
    id: "prd-custom-e2e",
    title: "Produto Customizado E2E",
    slug: undefined,
    imageSrc: "/images/potala/product-poder-do-agora-final.png",
    imageAlt: undefined,
    gallery: undefined,
  };
  return {
    ...seed,
    version: 1 as const,
    products: [legacyProduct, ...seed.products.slice(1)],
  };
}

async function trackUnhandledPageErrors(page: Page) {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });
  await page.addInitScript(() => {
    window.addEventListener("unhandledrejection", (event) => {
      const bag = ((window as unknown as { __potala_unhandled?: string[] })
        .__potala_unhandled ??= []);
      bag.push(String(event.reason));
    });
  });
  return {
    pageErrors,
    async unhandledRejections() {
      return page.evaluate(
        () =>
          (window as unknown as { __potala_unhandled?: string[] })
            .__potala_unhandled ?? [],
      );
    },
  };
}

test.describe("migração admin V1 → V2", () => {
  test("migra V1, preserva customização e corrige assets", async ({ page }) => {
    const v1Db = buildCustomV1Db();
    const errors = await trackUnhandledPageErrors(page);

    await page.addInitScript(
      ({ sessionKey, sessionValue, v1Key, v1Value, v2Key }) => {
        const boot = "__potala_e2e_boot";
        if (window.localStorage.getItem(boot) !== "1") {
          window.localStorage.clear();
          window.sessionStorage.clear();
          window.localStorage.setItem(boot, "1");
        }
        window.localStorage.setItem(sessionKey, sessionValue);
        window.localStorage.setItem(v1Key, v1Value);
        window.localStorage.removeItem(v2Key);
      },
      {
        sessionKey: DEMO_SESSION_STORAGE_KEY,
        sessionValue: adminSessionValue(),
        v1Key: ADMIN_STORAGE_KEY_V1,
        v1Value: JSON.stringify(v1Db),
        v2Key: ADMIN_STORAGE_KEY,
      },
    );

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /Painel/i })).toBeVisible({
      timeout: 15_000,
    });

    const migrated = await page.evaluate(
      ({ v1Key, v2Key, productId }) => {
        const v2Raw = window.localStorage.getItem(v2Key);
        const v1Raw = window.localStorage.getItem(v1Key);
        if (!v2Raw) {
          return { ok: false as const, reason: "missing-v2" };
        }
        const db = JSON.parse(v2Raw) as {
          version: number;
          products: Array<{
            id: string;
            title: string;
            slug?: string;
            imageSrc: string;
            imageAlt?: string;
          }>;
        };
        const product = db.products.find((item) => item.id === productId);
        return {
          ok: true as const,
          version: db.version,
          v1Gone: v1Raw === null,
          product,
        };
      },
      {
        v1Key: ADMIN_STORAGE_KEY_V1,
        v2Key: ADMIN_STORAGE_KEY,
        productId: "prd-custom-e2e",
      },
    );

    expect(migrated.ok).toBeTruthy();
    if (!migrated.ok) return;

    expect(migrated.version).toBe(2);
    expect(migrated.v1Gone).toBeTruthy();
    expect(migrated.product?.title).toBe("Produto Customizado E2E");
    expect(migrated.product?.slug).toBeTruthy();
    expect(migrated.product?.imageSrc).toBe(
      "/images/potala/product-livro-agora-final.png",
    );
    expect(migrated.product?.imageAlt).toBeTruthy();
    expect(errors.pageErrors).toEqual([]);
    expect(await errors.unhandledRejections()).toEqual([]);
  });

  test("A: falha ao gravar V2 mantém V1 e dados carregados", async ({
    page,
  }) => {
    const v1Db = buildCustomV1Db();
    const v1Value = JSON.stringify(v1Db);
    const errors = await trackUnhandledPageErrors(page);

    await page.addInitScript(
      ({ sessionKey, sessionValue, v1Key, v1Value, v2Key }) => {
        const boot = "__potala_e2e_boot";
        if (window.localStorage.getItem(boot) !== "1") {
          window.localStorage.clear();
          window.sessionStorage.clear();
          window.localStorage.setItem(boot, "1");
        }
        window.localStorage.setItem(sessionKey, sessionValue);
        window.localStorage.setItem(v1Key, v1Value);
        window.localStorage.removeItem(v2Key);

        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key, value) {
          if (key === v2Key) {
            throw new Error("e2e-simulated-setItem-v2");
          }
          return originalSetItem.call(this, key, value);
        };
      },
      {
        sessionKey: DEMO_SESSION_STORAGE_KEY,
        sessionValue: adminSessionValue(),
        v1Key: ADMIN_STORAGE_KEY_V1,
        v1Value,
        v2Key: ADMIN_STORAGE_KEY,
      },
    );

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /Painel/i })).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/admin/produtos");
    await expect(
      page.getByText("Produto Customizado E2E").first(),
    ).toBeAttached({ timeout: 15_000 });

    const storage = await page.evaluate(
      ({ v1Key, v2Key, expectedV1 }) => ({
        v1Raw: window.localStorage.getItem(v1Key),
        v2Raw: window.localStorage.getItem(v2Key),
        v1Intact: window.localStorage.getItem(v1Key) === expectedV1,
      }),
      {
        v1Key: ADMIN_STORAGE_KEY_V1,
        v2Key: ADMIN_STORAGE_KEY,
        expectedV1: v1Value,
      },
    );

    expect(storage.v2Raw).toBeNull();
    expect(storage.v1Intact).toBeTruthy();
    expect(errors.pageErrors).toEqual([]);
    expect(await errors.unhandledRejections()).toEqual([]);
  });

  test("B: falha ao remover V1 após gravar V2", async ({ page }) => {
    const v1Db = buildCustomV1Db();
    const v1Value = JSON.stringify(v1Db);
    const errors = await trackUnhandledPageErrors(page);

    await page.addInitScript(
      ({ sessionKey, sessionValue, v1Key, v1Value, v2Key }) => {
        const boot = "__potala_e2e_boot";
        if (window.localStorage.getItem(boot) !== "1") {
          window.localStorage.clear();
          window.sessionStorage.clear();
          window.localStorage.setItem(boot, "1");
        }
        window.localStorage.setItem(sessionKey, sessionValue);
        window.localStorage.setItem(v1Key, v1Value);
        window.localStorage.removeItem(v2Key);

        const originalRemoveItem = Storage.prototype.removeItem;
        Storage.prototype.removeItem = function (key) {
          if (key === v1Key) {
            throw new Error("e2e-simulated-removeItem-v1");
          }
          return originalRemoveItem.call(this, key);
        };
      },
      {
        sessionKey: DEMO_SESSION_STORAGE_KEY,
        sessionValue: adminSessionValue(),
        v1Key: ADMIN_STORAGE_KEY_V1,
        v1Value,
        v2Key: ADMIN_STORAGE_KEY,
      },
    );

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /Painel/i })).toBeVisible({
      timeout: 15_000,
    });

    const storage = await page.evaluate(
      ({ v1Key, v2Key, productId, expectedV1 }) => {
        const v2Raw = window.localStorage.getItem(v2Key);
        const v1Raw = window.localStorage.getItem(v1Key);
        if (!v2Raw) {
          return { ok: false as const, reason: "missing-v2" };
        }
        const db = JSON.parse(v2Raw) as {
          version: number;
          products: Array<{ id: string; title: string }>;
        };
        return {
          ok: true as const,
          version: db.version,
          v1Preserved: v1Raw === expectedV1,
          productTitle: db.products.find((item) => item.id === productId)?.title,
        };
      },
      {
        v1Key: ADMIN_STORAGE_KEY_V1,
        v2Key: ADMIN_STORAGE_KEY,
        productId: "prd-custom-e2e",
        expectedV1: v1Value,
      },
    );

    expect(storage.ok).toBeTruthy();
    if (!storage.ok) return;
    expect(storage.version).toBe(2);
    expect(storage.v1Preserved).toBeTruthy();
    expect(storage.productTitle).toBe("Produto Customizado E2E");
    expect(errors.pageErrors).toEqual([]);
    expect(await errors.unhandledRejections()).toEqual([]);
  });

  test("C: erro ao migrar V2 recupera V1 válida", async ({ page }) => {
    const v1Db = buildCustomV1Db();
    const v1Value = JSON.stringify(v1Db);
    const seed = createAdminSeed();
    const badV2 = {
      ...seed,
      version: 2,
      sellers: [null],
    };
    const badV2Value = JSON.stringify(badV2);

    expect(migrateAdminDemoDb(JSON.parse(badV2Value))).toBeNull();

    const errors = await trackUnhandledPageErrors(page);

    await page.addInitScript(
      ({ sessionKey, sessionValue, v1Key, v1Value, v2Key, v2Value }) => {
        const boot = "__potala_e2e_boot";
        if (window.localStorage.getItem(boot) !== "1") {
          window.localStorage.clear();
          window.sessionStorage.clear();
          window.localStorage.setItem(boot, "1");
        }
        window.localStorage.setItem(sessionKey, sessionValue);
        window.localStorage.setItem(v1Key, v1Value);
        window.localStorage.setItem(v2Key, v2Value);
      },
      {
        sessionKey: DEMO_SESSION_STORAGE_KEY,
        sessionValue: adminSessionValue(),
        v1Key: ADMIN_STORAGE_KEY_V1,
        v1Value,
        v2Key: ADMIN_STORAGE_KEY,
        v2Value: badV2Value,
      },
    );

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /Painel/i })).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/admin/produtos");
    await expect(
      page.getByText("Produto Customizado E2E").first(),
    ).toBeAttached({ timeout: 15_000 });

    const storage = await page.evaluate(
      ({ v1Key, v2Key, productId }) => {
        const v2Raw = window.localStorage.getItem(v2Key);
        const v1Raw = window.localStorage.getItem(v1Key);
        const db = v2Raw
          ? (JSON.parse(v2Raw) as {
              version: number;
              sellers: Array<{ id: string }>;
              products: Array<{ id: string; title: string }>;
            })
          : null;
        return {
          v1Gone: v1Raw === null,
          version: db?.version ?? null,
          productTitle: db?.products.find((item) => item.id === productId)
            ?.title,
          sellerCount: db?.sellers.length ?? 0,
        };
      },
      {
        v1Key: ADMIN_STORAGE_KEY_V1,
        v2Key: ADMIN_STORAGE_KEY,
        productId: "prd-custom-e2e",
      },
    );

    // V1 foi a fonte: após gravação V2 bem-sucedida, V1 deve ser removida.
    expect(storage.v1Gone).toBeTruthy();
    expect(storage.version).toBe(2);
    expect(storage.productTitle).toBe("Produto Customizado E2E");
    expect(storage.sellerCount).toBe(createAdminSeed().sellers.length);
    expect(errors.pageErrors).toEqual([]);
    expect(await errors.unhandledRejections()).toEqual([]);
  });

  test("E: coleção com null/string invalida o banco; legado só sem campos novos migra", async ({
    page,
  }) => {
    const seed = createAdminSeed();
    const corrupted = {
      ...seed,
      version: 2 as const,
      products: [null, "invalid", ...seed.products],
    };
    expect(migrateAdminDemoDb(corrupted)).toBeNull();

    const seedProduct = seed.products[0];
    expect(seedProduct).toBeTruthy();
    const legacyProduct = {
      ...seedProduct,
      title: "Produto Legado Campos Novos",
      slug: undefined,
      imageAlt: undefined,
      gallery: undefined,
      description: undefined,
      imageSrc: "/images/potala/product-quartzo-final.png",
      attributes: undefined,
    };
    const legacyDb = {
      ...seed,
      version: 1 as const,
      products: [legacyProduct, ...seed.products.slice(1)],
    };
    const legacyMigrated = migrateAdminDemoDb(legacyDb);
    expect(legacyMigrated).not.toBeNull();
    const legacyItem = legacyMigrated?.products.find(
      (item) => item.id === seedProduct?.id,
    );
    expect(legacyItem?.title).toBe("Produto Legado Campos Novos");
    expect(legacyItem?.slug).toBeTruthy();
    expect(legacyItem?.imageAlt).toBeTruthy();
    expect(legacyItem?.imageSrc).toBe("/images/potala/product-quartzo.jpg");
    expect(legacyItem?.description).toBe(seedProduct?.description);
    expect(legacyItem?.attributes).toEqual(seedProduct?.attributes ?? {});

    const corruptedValue = JSON.stringify(corrupted);
    const errors = await trackUnhandledPageErrors(page);

    await page.addInitScript(
      ({ sessionKey, sessionValue, v1Key, v2Key, v2Value }) => {
        const boot = "__potala_e2e_boot";
        if (window.localStorage.getItem(boot) !== "1") {
          window.localStorage.clear();
          window.sessionStorage.clear();
          window.localStorage.setItem(boot, "1");
        }
        window.localStorage.setItem(sessionKey, sessionValue);
        window.localStorage.removeItem(v1Key);
        window.localStorage.setItem(v2Key, v2Value);
      },
      {
        sessionKey: DEMO_SESSION_STORAGE_KEY,
        sessionValue: adminSessionValue(),
        v1Key: ADMIN_STORAGE_KEY_V1,
        v2Key: ADMIN_STORAGE_KEY,
        v2Value: corruptedValue,
      },
    );

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /Painel/i })).toBeVisible({
      timeout: 15_000,
    });

    const storage = await page.evaluate(
      ({ v2Key, expectedV2 }) => ({
        v2Intact: window.localStorage.getItem(v2Key) === expectedV2,
      }),
      { v2Key: ADMIN_STORAGE_KEY, expectedV2: corruptedValue },
    );

    expect(storage.v2Intact).toBeTruthy();
    expect(errors.pageErrors).toEqual([]);
    expect(await errors.unhandledRejections()).toEqual([]);
  });

  test("coleções vazias válidas, sem mutação e idempotência", async () => {
    const seed = createAdminSeed();
    const emptyCollectionsDb = {
      ...seed,
      version: 2 as const,
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
    };
    const emptyMigrated = migrateAdminDemoDb(emptyCollectionsDb);
    expect(emptyMigrated).not.toBeNull();
    expect(emptyMigrated?.sellers).toEqual([]);
    expect(emptyMigrated?.products).toEqual([]);
    expect(emptyMigrated?.orders).toEqual([]);
    expect(emptyMigrated?.shipments).toEqual([]);
    expect(emptyMigrated?.transactions).toEqual([]);
    expect(emptyMigrated?.payouts).toEqual([]);
    expect(emptyMigrated?.customers).toEqual([]);
    expect(emptyMigrated?.contents).toEqual([]);
    expect(emptyMigrated?.coupons).toEqual([]);
    expect(emptyMigrated?.categories).toEqual([]);
    expect(emptyMigrated?.attributes).toEqual([]);
    expect(emptyMigrated?.gateways).toEqual([]);
    expect(emptyMigrated?.notifications).toEqual([]);

    const custom = buildCustomV1Db();
    const snapshot = JSON.parse(JSON.stringify(custom)) as unknown;
    const first = migrateAdminDemoDb(custom);
    expect(custom).toEqual(snapshot);
    expect(first).not.toBeNull();
    expect(first?.products.some((item) => item.id === "prd-custom-e2e")).toBe(
      true,
    );

    const second = migrateAdminDemoDb(first);
    expect(second).toEqual(first);
  });

  test("sem fallback de preço/estoque/comissão nem reposição de coleções pelo seed", async () => {
    const seed = createAdminSeed();
    const seedProduct = seed.products[0];
    const seedSeller = seed.sellers[0];
    expect(seedProduct).toBeTruthy();
    expect(seedSeller).toBeTruthy();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        products: [{ ...seedProduct, priceCents: "1990" }],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        products: [{ ...seedProduct, priceCents: undefined }],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        products: [{ ...seedProduct, stock: null }],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        sellers: [{ ...seedSeller, commissionPercent: "12" }],
      }),
    ).toBeNull();

    const customPrice = (seedProduct?.priceCents ?? 0) + 777;
    const customStock = (seedProduct?.stock ?? 0) + 11;
    const customCommission = (seedSeller?.commissionPercent ?? 0) + 3;
    const preserved = migrateAdminDemoDb({
      ...seed,
      version: 2,
      products: [
        { ...seedProduct, priceCents: customPrice, stock: customStock },
        ...seed.products.slice(1),
      ],
      sellers: [
        { ...seedSeller, commissionPercent: customCommission },
        ...seed.sellers.slice(1),
      ],
    });
    expect(preserved).not.toBeNull();
    const preservedProduct = preserved?.products.find(
      (item) => item.id === seedProduct?.id,
    );
    const preservedSeller = preserved?.sellers.find(
      (item) => item.id === seedSeller?.id,
    );
    expect(preservedProduct?.priceCents).toBe(customPrice);
    expect(preservedProduct?.stock).toBe(customStock);
    expect(preservedSeller?.commissionPercent).toBe(customCommission);
    expect(preservedProduct?.priceCents).not.toBe(seedProduct?.priceCents);
    expect(preservedSeller?.commissionPercent).not.toBe(
      seedSeller?.commissionPercent,
    );

    const { transactions: _t, ...v2WithoutTransactions } = seed;
    expect(
      migrateAdminDemoDb({ ...v2WithoutTransactions, version: 2 }),
    ).toBeNull();

    const { payouts: _p, shipments: _s, ...v2WithoutFinance } = seed;
    expect(
      migrateAdminDemoDb({ ...v2WithoutFinance, version: 2 }),
    ).toBeNull();

    const v1CoreOnly = {
      version: 1 as const,
      sellers: seed.sellers,
      products: seed.products,
      orders: seed.orders,
      customers: seed.customers,
    };
    expect(migrateAdminDemoDb(v1CoreOnly)).toBeNull();
  });

  test("estrutura raiz V1/V2: coleções, settings, updatedAt e version", async () => {
    const seed = createAdminSeed();
    const requiredCollections = [
      "sellers",
      "products",
      "orders",
      "shipments",
      "transactions",
      "payouts",
      "customers",
      "contents",
      "coupons",
      "categories",
      "attributes",
      "gateways",
      "notifications",
    ] as const;

    const v1Complete = { ...seed, version: 1 as const };
    const fromV1 = migrateAdminDemoDb(v1Complete);
    expect(fromV1).not.toBeNull();
    expect(fromV1?.version).toBe(2);
    expect(fromV1?.updatedAt).toBe(seed.updatedAt);
    expect(fromV1?.products.map((item) => item.id)).toEqual(
      seed.products.map((item) => item.id),
    );

    const v2Complete = migrateAdminDemoDb({ ...seed, version: 2 as const });
    expect(v2Complete).not.toBeNull();
    expect(v2Complete?.version).toBe(2);

    for (const version of [1, 2] as const) {
      for (const key of requiredCollections) {
        const { [key]: _removed, ...rest } = { ...seed, version };
        expect(migrateAdminDemoDb(rest)).toBeNull();
      }
    }

    const allEmpty = {
      ...seed,
      version: 2 as const,
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
    };
    const emptyOk = migrateAdminDemoDb(allEmpty);
    expect(emptyOk).not.toBeNull();
    for (const key of requiredCollections) {
      expect(emptyOk?.[key]).toEqual([]);
    }

    expect(
      migrateAdminDemoDb({ ...seed, version: 2, settings: undefined }),
    ).toBeNull();
    expect(
      migrateAdminDemoDb({ ...seed, version: 2, settings: null }),
    ).toBeNull();
    expect(
      migrateAdminDemoDb({ ...seed, version: 2, settings: [] }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({ ...seed, version: 2, updatedAt: undefined }),
    ).toBeNull();
    expect(
      migrateAdminDemoDb({ ...seed, version: 2, updatedAt: 123 }),
    ).toBeNull();

    const { version: _v, ...withoutVersion } = seed;
    expect(migrateAdminDemoDb(withoutVersion)).toBeNull();
    expect(migrateAdminDemoDb({ ...seed, version: 3 })).toBeNull();
    expect(migrateAdminDemoDb({ ...seed, version: "2" })).toBeNull();
  });

  test("validação interna de orders e customers", async () => {
    const seed = createAdminSeed();
    const validOrder = seed.orders[0];
    const validCustomer = seed.customers[0];
    expect(validOrder).toBeTruthy();
    expect(validCustomer).toBeTruthy();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        orders: [{ id: "pedido-incompleto" }],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        customers: [{ id: "cliente-incompleto" }],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        orders: [{ ...validOrder, code: 123 }],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        orders: [{ ...validOrder, totalCents: undefined }],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        orders: [{ ...validOrder, status: "desconhecido" }],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        orders: [{ ...validOrder, paymentMethod: "paypal" }],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        orders: [{ ...validOrder, items: [null] }],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        orders: [
          {
            ...validOrder,
            items: [{ productId: "prd-1", title: "X" }],
          },
        ],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        orders: [
          {
            ...validOrder,
            items: [
              {
                productId: "prd-1",
                title: "X",
                quantity: "2",
                unitPriceCents: 100,
              },
            ],
          },
        ],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        customers: [{ ...validCustomer, tags: ["ok", 1] }],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        customers: [{ ...validCustomer, preferredProducts: [null] }],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        orders: [
          {
            ...validOrder,
            timeline: [{ id: "ev-x", at: "2026-01-01T00:00:00.000Z" }],
          },
        ],
      }),
    ).toBeNull();

    expect(
      migrateAdminDemoDb({
        ...seed,
        version: 2,
        customers: [
          {
            ...validCustomer,
            timeline: [null],
          },
        ],
      }),
    ).toBeNull();

    const customNotes = "nota personalizada e2e";
    const customTag = "vip-e2e";
    const preserved = migrateAdminDemoDb({
      ...seed,
      version: 2,
      orders: [
        {
          ...validOrder,
          notes: customNotes,
          items: [],
          timeline: [],
        },
        ...seed.orders.slice(1),
      ],
      customers: [
        {
          ...validCustomer,
          tags: [customTag],
          preferredProducts: [],
          notes: "",
          timeline: [
            {
              id: "ev-custom",
              at: "2026-01-02T00:00:00.000Z",
              label: "Atualizado",
            },
          ],
        },
        ...seed.customers.slice(1),
      ],
    });
    expect(preserved).not.toBeNull();
    expect(preserved?.orders[0]?.notes).toBe(customNotes);
    expect(preserved?.orders[0]?.items).toEqual([]);
    expect(preserved?.orders[0]?.timeline).toEqual([]);
    expect(preserved?.customers[0]?.tags).toEqual([customTag]);
    expect(preserved?.customers[0]?.preferredProducts).toEqual([]);
    expect(preserved?.customers[0]?.notes).toBe("");
    expect(preserved?.customers[0]?.timeline).toEqual([
      {
        id: "ev-custom",
        at: "2026-01-02T00:00:00.000Z",
        label: "Atualizado",
      },
    ]);

    const input = {
      ...seed,
      version: 2 as const,
      customers: [
        {
          ...validCustomer,
          tags: ["a"],
          preferredProducts: ["b"],
        },
        ...seed.customers.slice(1),
      ],
    };
    const snapshot = JSON.parse(JSON.stringify(input)) as unknown;
    const first = migrateAdminDemoDb(input);
    expect(input).toEqual(snapshot);
    expect(first).not.toBeNull();
    const second = migrateAdminDemoDb(first);
    expect(second).toEqual(first);
  });

  test("D: nenhuma versão aproveitável usa seed em memória", async ({
    page,
  }) => {
    const invalidV2 = JSON.stringify({ version: 2, broken: true });
    const invalidV1 = JSON.stringify({ version: 1, broken: true });
    const seedProductId = createAdminSeed().products[0]?.id;
    const errors = await trackUnhandledPageErrors(page);

    await page.addInitScript(
      ({ sessionKey, sessionValue, v1Key, v1Value, v2Key, v2Value }) => {
        const boot = "__potala_e2e_boot";
        if (window.localStorage.getItem(boot) !== "1") {
          window.localStorage.clear();
          window.sessionStorage.clear();
          window.localStorage.setItem(boot, "1");
        }
        window.localStorage.setItem(sessionKey, sessionValue);
        window.localStorage.setItem(v1Key, v1Value);
        window.localStorage.setItem(v2Key, v2Value);
      },
      {
        sessionKey: DEMO_SESSION_STORAGE_KEY,
        sessionValue: adminSessionValue(),
        v1Key: ADMIN_STORAGE_KEY_V1,
        v1Value: invalidV1,
        v2Key: ADMIN_STORAGE_KEY,
        v2Value: invalidV2,
      },
    );

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /Painel/i })).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/admin/produtos");
    await expect(page.getByRole("heading", { name: /Produtos/i })).toBeVisible({
      timeout: 15_000,
    });
    if (seedProductId) {
      await expect(
        page.locator(`a[href="/admin/produtos/${seedProductId}"]`).first(),
      ).toBeAttached({ timeout: 15_000 });
    }

    const storage = await page.evaluate(
      ({ v1Key, v2Key, expectedV1, expectedV2 }) => ({
        v1Raw: window.localStorage.getItem(v1Key),
        v2Raw: window.localStorage.getItem(v2Key),
        v1Intact: window.localStorage.getItem(v1Key) === expectedV1,
        v2Intact: window.localStorage.getItem(v2Key) === expectedV2,
      }),
      {
        v1Key: ADMIN_STORAGE_KEY_V1,
        v2Key: ADMIN_STORAGE_KEY,
        expectedV1: invalidV1,
        expectedV2: invalidV2,
      },
    );

    expect(storage.v1Intact).toBeTruthy();
    expect(storage.v2Intact).toBeTruthy();
    expect(errors.pageErrors).toEqual([]);
    expect(await errors.unhandledRejections()).toEqual([]);
  });
});
