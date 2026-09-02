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
import { parsePendingCheckoutOperation } from "../../src/data/cart";
import { parseCurrentOrderSummary } from "../../src/lib/parseCurrentOrderSummary";

const ORDER_STORAGE_KEY = "potala-marketplace-last-order-v1";
const CART_STORAGE_KEY = "potala-marketplace-cart-v1";
const PENDING_STORAGE_KEY = "potala-marketplace-checkout-pending-v1";
const TX_STORAGE_KEY = "potala-marketplace-checkout-tx-v1";

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
  await page.getByLabel("CEP", { exact: true }).fill("01310100");
  await page.getByLabel("Rua", { exact: true }).fill("Rua Augusta");
  await page.getByLabel("Número", { exact: true }).fill("1500");
  await page.getByLabel("Complemento", { exact: true }).fill("Sala 12");
  await page.getByLabel("Bairro", { exact: true }).fill("Consolação");
  await page.getByLabel("Cidade", { exact: true }).fill("São Paulo");
  await page.getByLabel("Estado (UF)", { exact: true }).fill("sp");
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
      }, CART_STORAGE_KEY),
    )
    .toBeGreaterThan(0);
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Finalizar pedido" })).toBeVisible({
    timeout: 10_000,
  });
}

async function waitForCustomerAccountHydrated(page: Page) {
  await page.goto("/minha-conta/pedidos");
  await expect(page.getByRole("heading", { name: /Meus pedidos/i }).first()).toBeVisible({
    timeout: 15_000,
  });

  await expect
    .poll(async () =>
      page.evaluate((storagePrefix) => {
        const key = Object.keys(window.localStorage).find((item) =>
          item.startsWith(storagePrefix),
        );
        if (!key) return null;
        try {
          const db = JSON.parse(window.localStorage.getItem(key) ?? "null") as {
            userId?: string;
            orders?: Array<{ code: string }>;
          } | null;
          if (!db?.userId || !Array.isArray(db.orders)) return null;
          const codes = db.orders.map((order) => order.code);
          return {
            key,
            userId: db.userId,
            orderCount: db.orders.length,
            hasSeed42: codes.includes("POT-2026-0042"),
            hasSeed38: codes.includes("POT-2026-0038"),
          };
        } catch {
          return null;
        }
      }, CUSTOMER_ACCOUNT_STORAGE_KEY),
    )
    .toMatchObject({
      userId: "demo-customer",
      hasSeed42: true,
      hasSeed38: true,
    });
}

async function readAccountSnapshot(page: Page) {
  return page.evaluate((storagePrefix) => {
    const key = Object.keys(window.localStorage).find((item) =>
      item.startsWith(storagePrefix),
    );
    if (!key) return null;
    const db = JSON.parse(window.localStorage.getItem(key) ?? "null") as {
      userId: string;
      orders: Array<{
        code: string;
        checkoutTransactionId?: string;
        addressLabel?: string;
        city?: string;
        state?: string;
      }>;
    } | null;
    if (!db) return null;
    return {
      key,
      userId: db.userId,
      totalOrders: db.orders.length,
      codes: db.orders.map((order) => order.code),
      orders: db.orders,
    };
  }, CUSTOMER_ACCOUNT_STORAGE_KEY);
}

async function readPendingOperation(page: Page) {
  return page.evaluate((pendingKey) => {
    const raw = window.sessionStorage.getItem(pendingKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
        version: 1;
        userId: string | null;
        cartFingerprint: string;
        order: { orderId: string; checkoutTransactionId: string };
      };
    } catch {
      return null;
    }
  }, PENDING_STORAGE_KEY);
}

async function readSuccessOrderCode(page: Page) {
  return page
    .locator("strong")
    .filter({ hasText: /^POT-/ })
    .first()
    .innerText();
}

test.describe("checkout autenticação e histórico", () => {
  test("duas compras consecutivas geram pedidos distintos e persistem", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await seedSession(page, "customer");
    await waitForCustomerAccountHydrated(page);

    const hydratedBefore = await readAccountSnapshot(page);
    expect(hydratedBefore?.key).toBeTruthy();
    expect(hydratedBefore?.userId).toBe("demo-customer");
    expect(hydratedBefore?.codes).toEqual(
      expect.arrayContaining(["POT-2026-0042", "POT-2026-0038"]),
    );
    const seedOrderCount = hydratedBefore?.totalOrders ?? 0;
    expect(seedOrderCount).toBeGreaterThanOrEqual(2);

    await addJapamalaAndOpenCheckout(page);
    await fillCheckoutForm(page);
    await page.getByRole("button", { name: "Finalizar pedido" }).click();

    await expect(page).toHaveURL(/\/checkout\/sucesso/);
    await expect(
      page.getByRole("heading", { name: /Pedido realizado com sucesso/i }),
    ).toBeVisible();
    await expect(page.getByText("Disponível em breve")).toHaveCount(0);

    const orderCode1 = await readSuccessOrderCode(page);
    const confirmation1 = await page.evaluate((orderKey) => {
      const raw = window.sessionStorage.getItem(orderKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        orderId: string;
        checkoutTransactionId?: string;
      };
      return parsed;
    }, ORDER_STORAGE_KEY);
    expect(confirmation1?.orderId).toBe(orderCode1);
    expect(confirmation1?.checkoutTransactionId).toBeTruthy();

    await page.getByRole("link", { name: "Ver meus pedidos" }).click();
    await expect(page).toHaveURL(/\/minha-conta\/pedidos/);
    await expect(page.getByRole("link", { name: orderCode1 }).last()).toBeVisible();

    const afterFirst = await readAccountSnapshot(page);
    expect(afterFirst?.codes).toEqual(
      expect.arrayContaining(["POT-2026-0042", "POT-2026-0038", orderCode1]),
    );
    const order1 = afterFirst?.orders.find((item) => item.code === orderCode1);
    expect(order1?.checkoutTransactionId).toBe(
      confirmation1?.checkoutTransactionId,
    );
    expect(order1?.addressLabel).toContain("Rua Augusta");
    expect(order1?.city).toBe("São Paulo");
    expect(order1?.state).toBe("SP");

    await addJapamalaAndOpenCheckout(page);
    await fillCheckoutForm(page);
    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await expect(page).toHaveURL(/\/checkout\/sucesso/);

    const orderCode2 = await readSuccessOrderCode(page);
    expect(orderCode2).not.toBe(orderCode1);

    const confirmation2 = await page.evaluate((orderKey) => {
      const raw = window.sessionStorage.getItem(orderKey);
      if (!raw) return null;
      return JSON.parse(raw) as {
        orderId: string;
        checkoutTransactionId?: string;
      };
    }, ORDER_STORAGE_KEY);
    expect(confirmation2?.orderId).toBe(orderCode2);
    expect(confirmation2?.checkoutTransactionId).toBeTruthy();
    expect(confirmation2?.checkoutTransactionId).not.toBe(
      confirmation1?.checkoutTransactionId,
    );

    await page.goto("/minha-conta/pedidos");
    await expect(page.getByRole("link", { name: orderCode1 }).last()).toBeVisible();
    await expect(page.getByRole("link", { name: orderCode2 }).last()).toBeVisible();

    await page.reload();
    await expect(page.getByRole("link", { name: orderCode1 }).last()).toBeVisible();
    await expect(page.getByRole("link", { name: orderCode2 }).last()).toBeVisible();

    const afterSecond = await readAccountSnapshot(page);
    expect(afterSecond?.codes).toEqual(
      expect.arrayContaining([
        "POT-2026-0042",
        "POT-2026-0038",
        orderCode1,
        orderCode2,
      ]),
    );
    expect(afterSecond?.totalOrders).toBe(seedOrderCount + 2);
    const tx1 = afterSecond?.orders.find((o) => o.code === orderCode1)
      ?.checkoutTransactionId;
    const tx2 = afterSecond?.orders.find((o) => o.code === orderCode2)
      ?.checkoutTransactionId;
    expect(tx1).toBeTruthy();
    expect(tx2).toBeTruthy();
    expect(tx1).not.toBe(tx2);
  });

  test("retry da mesma operação reutiliza orderId canônico e confirmação", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await seedSession(page, "customer");
    await waitForCustomerAccountHydrated(page);
    await addJapamalaAndOpenCheckout(page);
    await fillCheckoutForm(page);

    await page.evaluate((orderKey) => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function patched(
        this: Storage,
        key: string,
        value: string,
      ) {
        if (this === window.sessionStorage && key === orderKey) {
          Storage.prototype.setItem = original;
          throw new DOMException("QuotaExceededError");
        }
        return original.call(this, key, value);
      };
    }, ORDER_STORAGE_KEY);

    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(
      page.getByText(/Não foi possível guardar a confirmação/i),
    ).toBeVisible();

    const midState = await page.evaluate(
      ({ storagePrefix, pendingKey, cartKey, txKey }) => {
        const key = Object.keys(window.localStorage).find((item) =>
          item.startsWith(storagePrefix),
        );
        const db = key
          ? (JSON.parse(window.localStorage.getItem(key) ?? "null") as {
              orders: Array<{ code: string; checkoutTransactionId?: string }>;
            } | null)
          : null;
        const cart = JSON.parse(
          window.localStorage.getItem(cartKey) ?? "[]",
        ) as unknown[];
        const pendingRaw = window.sessionStorage.getItem(pendingKey);
        const pending = pendingRaw
          ? (JSON.parse(pendingRaw) as {
              order: { orderId: string; checkoutTransactionId: string };
            })
          : null;
        return {
          orderCount: db?.orders.length ?? 0,
          latestCode: db?.orders[0]?.code ?? null,
          latestTx: db?.orders[0]?.checkoutTransactionId ?? null,
          cartCount: Array.isArray(cart) ? cart.length : 0,
          pending,
          tx: window.sessionStorage.getItem(txKey),
          orderConfirmation: window.sessionStorage.getItem(
            "potala-marketplace-last-order-v1",
          ),
        };
      },
      {
        storagePrefix: CUSTOMER_ACCOUNT_STORAGE_KEY,
        pendingKey: PENDING_STORAGE_KEY,
        cartKey: CART_STORAGE_KEY,
        txKey: TX_STORAGE_KEY,
      },
    );

    expect(midState.cartCount).toBeGreaterThan(0);
    expect(midState.pending).not.toBeNull();
    expect(midState.pending?.order.orderId).toBe(midState.latestCode);
    expect(midState.pending?.order.checkoutTransactionId).toBe(midState.latestTx);
    expect(midState.orderConfirmation).toBeNull();
    // CHECKOUT_PENDING_STORAGE_KEY é a fonte da tx; chave legada pode estar ausente.

    const canonicalOrderId = midState.latestCode;
    const canonicalTx = midState.latestTx;
    const ordersAfterFirstAttempt = midState.orderCount;
    expect(canonicalOrderId).toBeTruthy();
    expect(canonicalTx).toBeTruthy();

    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await expect(page).toHaveURL(/\/checkout\/sucesso/);

    const successCode = await readSuccessOrderCode(page);
    expect(successCode).toBe(canonicalOrderId);

    const afterRetry = await page.evaluate(
      ({ storagePrefix, pendingKey, orderKey, txKey, previousCount }) => {
        const key = Object.keys(window.localStorage).find((item) =>
          item.startsWith(storagePrefix),
        );
        const db = key
          ? (JSON.parse(window.localStorage.getItem(key) ?? "null") as {
              orders: Array<{ code: string; checkoutTransactionId?: string }>;
            } | null)
          : null;
        const confirmation = window.sessionStorage.getItem(orderKey);
        const parsed = confirmation
          ? (JSON.parse(confirmation) as {
              orderId: string;
              checkoutTransactionId?: string;
            })
          : null;
        return {
          orderCount: db?.orders.length ?? 0,
          previousCount,
          pendingCleared: window.sessionStorage.getItem(pendingKey) == null,
          txCleared: window.sessionStorage.getItem(txKey) == null,
          confirmation: parsed,
          byTx: db?.orders.reduce<Record<string, number>>((acc, order) => {
            if (order.checkoutTransactionId) {
              acc[order.checkoutTransactionId] =
                (acc[order.checkoutTransactionId] ?? 0) + 1;
            }
            return acc;
          }, {}),
        };
      },
      {
        storagePrefix: CUSTOMER_ACCOUNT_STORAGE_KEY,
        pendingKey: PENDING_STORAGE_KEY,
        orderKey: ORDER_STORAGE_KEY,
        txKey: TX_STORAGE_KEY,
        previousCount: ordersAfterFirstAttempt,
      },
    );

    expect(afterRetry.orderCount).toBe(ordersAfterFirstAttempt);
    expect(afterRetry.pendingCleared).toBe(true);
    expect(afterRetry.txCleared).toBe(true);
    expect(afterRetry.confirmation?.orderId).toBe(canonicalOrderId);
    expect(afterRetry.confirmation?.checkoutTransactionId).toBe(canonicalTx);
    expect(
      Object.values(afterRetry.byTx ?? {}).every((count) => count === 1),
    ).toBe(true);
  });

  test("falha de persistência na conta mantém carrinho e operação recuperável", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await seedSession(page, "customer");
    await waitForCustomerAccountHydrated(page);
    const before = await readAccountSnapshot(page);
    const ordersBefore = before?.totalOrders ?? 0;

    await addJapamalaAndOpenCheckout(page);
    await fillCheckoutForm(page);

    await page.evaluate((storagePrefix) => {
      const original = Storage.prototype.setItem;
      let armed = false;
      (
        window as unknown as {
          __potalaArmAccountWriteFail?: () => void;
          __potalaDisarmAccountWriteFail?: () => void;
        }
      ).__potalaArmAccountWriteFail = () => {
        armed = true;
      };
      (
        window as unknown as {
          __potalaDisarmAccountWriteFail?: () => void;
        }
      ).__potalaDisarmAccountWriteFail = () => {
        armed = false;
        Storage.prototype.setItem = original;
      };
      Storage.prototype.setItem = function patched(
        this: Storage,
        key: string,
        value: string,
      ) {
        if (
          armed &&
          this === window.localStorage &&
          String(key).startsWith(storagePrefix)
        ) {
          throw new DOMException("QuotaExceededError");
        }
        return original.call(this, key, value);
      };
    }, CUSTOMER_ACCOUNT_STORAGE_KEY);

    await page.evaluate(() => {
      (
        window as unknown as { __potalaArmAccountWriteFail?: () => void }
      ).__potalaArmAccountWriteFail?.();
    });

    await page.getByRole("button", { name: "Finalizar pedido" }).click();

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByText(/Não foi possível salvar o pedido/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Pedido realizado com sucesso/i }),
    ).toHaveCount(0);

    const mid = await page.evaluate(
      ({ storagePrefix, cartKey, pendingKey }) => {
        const key = Object.keys(window.localStorage).find((item) =>
          item.startsWith(storagePrefix),
        );
        const db = key
          ? (JSON.parse(window.localStorage.getItem(key) ?? "null") as {
              orders: unknown[];
            } | null)
          : null;
        const cart = JSON.parse(
          window.localStorage.getItem(cartKey) ?? "[]",
        ) as unknown[];
        return {
          orderCount: db?.orders.length ?? 0,
          cartCount: Array.isArray(cart) ? cart.length : 0,
          pending: window.sessionStorage.getItem(pendingKey),
        };
      },
      {
        storagePrefix: CUSTOMER_ACCOUNT_STORAGE_KEY,
        cartKey: CART_STORAGE_KEY,
        pendingKey: PENDING_STORAGE_KEY,
      },
    );

    expect(mid.orderCount).toBe(ordersBefore);
    expect(mid.cartCount).toBeGreaterThan(0);
    expect(mid.pending).toBeTruthy();
    await expect(page.getByRole("button", { name: "Finalizar pedido" })).toBeEnabled();

    const pendingBeforeRetry = await readPendingOperation(page);
    expect(pendingBeforeRetry?.order.orderId).toBeTruthy();

    await page.evaluate(() => {
      (
        window as unknown as { __potalaDisarmAccountWriteFail?: () => void }
      ).__potalaDisarmAccountWriteFail?.();
    });

    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await expect(page).toHaveURL(/\/checkout\/sucesso/);
    const successCode = await readSuccessOrderCode(page);
    expect(successCode).toBe(pendingBeforeRetry?.order.orderId);
  });

  test("colisão artificial de orderId retorna conflito sem apagar pedido", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await seedSession(page, "customer");
    await waitForCustomerAccountHydrated(page);
    await addJapamalaAndOpenCheckout(page);
    await fillCheckoutForm(page);

    const before = await readAccountSnapshot(page);
    const seedOrder = before?.orders.find((o) => o.code === "POT-2026-0042");
    expect(seedOrder).toBeTruthy();

    await page.evaluate(
      ({ pendingKey, txKey, cartKey }) => {
        const cart = JSON.parse(
          window.localStorage.getItem(cartKey) ?? "[]",
        ) as Array<{
          productId: string;
          quantity: number;
          unitPrice: number;
          slug: string;
          name: string;
          imageSrc: string;
        }>;
        const fingerprint = cart
          .map(
            (item) =>
              `${item.productId}:${item.quantity}:${Number(item.unitPrice).toFixed(2)}`,
          )
          .sort()
          .join("|");
        const tx = crypto.randomUUID();
        const pending = {
          version: 1 as const,
          userId: "demo-customer",
          cartFingerprint: fingerprint,
          order: {
            orderId: "POT-2026-0042",
            checkoutTransactionId: tx,
            items: cart.map((item) => ({
              productId: item.productId,
              slug: item.slug,
              name: item.name,
              imageSrc: item.imageSrc,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: Number((item.unitPrice * item.quantity).toFixed(2)),
            })),
            subtotal: 10,
            shippingOption: "economic",
            shippingLabel: "Econômica",
            shippingCost: 18.9,
            total: 28.9,
            paymentMethod: "pix",
            paymentLabel: "Pix",
            customerName: "Cliente Teste E2E",
            customerEmail: "cliente@potala.demo",
            customerPhone: "11999998888",
            shippingAddress: {
              cep: "01310100",
              street: "Rua Augusta",
              number: "1500",
              neighborhood: "Consolação",
              city: "São Paulo",
              state: "SP",
            },
            createdAt: new Date().toISOString(),
          },
        };
        window.sessionStorage.setItem(pendingKey, JSON.stringify(pending));
        window.sessionStorage.setItem(txKey, tx);
      },
      {
        pendingKey: PENDING_STORAGE_KEY,
        txKey: TX_STORAGE_KEY,
        cartKey: CART_STORAGE_KEY,
      },
    );

    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByText(/Conflito de identidade/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Pedido realizado com sucesso/i }),
    ).toHaveCount(0);

    const after = await readAccountSnapshot(page);
    expect(after?.totalOrders).toBe(before?.totalOrders);
    expect(after?.codes.filter((c) => c === "POT-2026-0042")).toHaveLength(1);
    const cartCount = await page.evaluate((cartKey) => {
      const raw = window.localStorage.getItem(cartKey);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      return Array.isArray(parsed) ? parsed.length : 0;
    }, CART_STORAGE_KEY);
    expect(cartCount).toBeGreaterThan(0);
    const pendingStill = await readPendingOperation(page);
    expect(pendingStill?.order.orderId).toBe("POT-2026-0042");
  });

  test("reconciliação: remove item confirmado e preserva produto novo", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await seedSession(page, "customer");
    await waitForCustomerAccountHydrated(page);
    await addJapamalaAndOpenCheckout(page);
    await fillCheckoutForm(page);

    await page.evaluate((orderKey) => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function patched(
        this: Storage,
        key: string,
        value: string,
      ) {
        if (this === window.sessionStorage && key === orderKey) {
          Storage.prototype.setItem = original;
          throw new DOMException("QuotaExceededError");
        }
        return original.call(this, key, value);
      };
    }, ORDER_STORAGE_KEY);

    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await expect(
      page.getByText(/Não foi possível guardar a confirmação/i),
    ).toBeVisible();

    const pending = await readPendingOperation(page);
    expect(pending?.order.orderId).toBeTruthy();

    await page.goto("/produto/palo-santo");
    await page.getByRole("button", { name: /Adicionar ao carrinho/i }).click();
    await expect
      .poll(async () =>
        page.evaluate((cartKey) => {
          const parsed = JSON.parse(
            window.localStorage.getItem(cartKey) ?? "[]",
          ) as Array<{ productId: string; quantity: number }>;
          return Array.isArray(parsed) ? parsed.length : 0;
        }, CART_STORAGE_KEY),
      )
      .toBe(2);

    await page.goto("/checkout");
    await fillCheckoutForm(page);
    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await expect(page).toHaveURL(/\/checkout\/sucesso/);
    expect(await readSuccessOrderCode(page)).toBe(pending?.order.orderId);

    const cartAfter = await page.evaluate((cartKey) => {
      return JSON.parse(window.localStorage.getItem(cartKey) ?? "[]") as Array<{
        productId: string;
        quantity: number;
      }>;
    }, CART_STORAGE_KEY);

    expect(cartAfter.map((item) => item.productId).sort()).toEqual([
      "palo-santo",
    ]);
    expect(cartAfter[0]?.quantity).toBe(1);
  });

  test("reconciliação: reduz quantidade quando o usuário aumentou o item confirmado", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await seedSession(page, "customer");
    await waitForCustomerAccountHydrated(page);
    await addJapamalaAndOpenCheckout(page);
    await fillCheckoutForm(page);

    await page.evaluate((orderKey) => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function patched(
        this: Storage,
        key: string,
        value: string,
      ) {
        if (this === window.sessionStorage && key === orderKey) {
          Storage.prototype.setItem = original;
          throw new DOMException("QuotaExceededError");
        }
        return original.call(this, key, value);
      };
    }, ORDER_STORAGE_KEY);

    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await expect(
      page.getByText(/Não foi possível guardar a confirmação/i),
    ).toBeVisible();

    await page.evaluate((cartKey) => {
      const cart = JSON.parse(
        window.localStorage.getItem(cartKey) ?? "[]",
      ) as Array<{ productId: string; quantity: number }>;
      const next = cart.map((item) =>
        item.productId === "japamala" ? { ...item, quantity: 2 } : item,
      );
      window.localStorage.setItem(cartKey, JSON.stringify(next));
    }, CART_STORAGE_KEY);

    await page.reload();
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    await expect
      .poll(async () =>
        page.evaluate((cartKey) => {
          const cart = JSON.parse(
            window.localStorage.getItem(cartKey) ?? "[]",
          ) as Array<{ productId: string; quantity: number }>;
          return cart.find((item) => item.productId === "japamala")?.quantity ?? 0;
        }, CART_STORAGE_KEY),
      )
      .toBe(2);

    await fillCheckoutForm(page);
    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await expect(page).toHaveURL(/\/checkout\/sucesso/);

    const cartAfter = await page.evaluate((cartKey) => {
      return JSON.parse(window.localStorage.getItem(cartKey) ?? "[]") as Array<{
        productId: string;
        quantity: number;
      }>;
    }, CART_STORAGE_KEY);

    expect(cartAfter).toHaveLength(1);
    expect(cartAfter[0]?.productId).toBe("japamala");
    expect(cartAfter[0]?.quantity).toBe(1);
  });

  test("parser rejeita pendência inválida (shippingAddress, item, qty, pagamento, total)", async () => {
    const baseOrder = {
      orderId: "POT-2026-valid",
      checkoutTransactionId: "tx-valid",
      items: [
        {
          productId: "japamala",
          slug: "japamala",
          name: "Japamala",
          imageSrc: "/img.png",
          quantity: 1,
          unitPrice: 10,
          lineTotal: 10,
        },
      ],
      subtotal: 10,
      shippingOption: "economic",
      shippingLabel: "Econômica",
      shippingCost: 18.9,
      total: 28.9,
      paymentMethod: "pix",
      paymentLabel: "Pix",
      customerName: "Cliente",
      customerEmail: "a@b.com",
      customerPhone: "11999999999",
      shippingAddress: {
        cep: "01310100",
        street: "Rua",
        number: "1",
        neighborhood: "Bairro",
        city: "São Paulo",
        state: "SP",
      },
      createdAt: new Date().toISOString(),
    };

    const wrap = (order: unknown) =>
      JSON.stringify({
        version: 1,
        userId: "demo-customer",
        cartFingerprint: "x",
        order,
      });

    expect(
      parsePendingCheckoutOperation(
        wrap({ ...baseOrder, shippingAddress: undefined }),
      ),
    ).toBeNull();
    expect(parseCurrentOrderSummary({ ...baseOrder, shippingAddress: undefined })).toBeNull();

    expect(
      parsePendingCheckoutOperation(
        wrap({
          ...baseOrder,
          items: [{ ...baseOrder.items[0], quantity: 0 }],
        }),
      ),
    ).toBeNull();

    expect(
      parsePendingCheckoutOperation(
        wrap({
          ...baseOrder,
          items: [{ ...baseOrder.items[0], unitPrice: Number.NaN }],
        }),
      ),
    ).toBeNull();

    expect(
      parsePendingCheckoutOperation(
        wrap({ ...baseOrder, paymentMethod: "bitcoin" }),
      ),
    ).toBeNull();

    expect(
      parsePendingCheckoutOperation(wrap({ ...baseOrder, total: -1 })),
    ).toBeNull();

    expect(
      parsePendingCheckoutOperation(
        wrap({ ...baseOrder, items: "not-an-array" }),
      ),
    ).toBeNull();

    expect(parsePendingCheckoutOperation(wrap(baseOrder))).not.toBeNull();
  });

  test("pendência sem shippingAddress é ignorada e não quebra o checkout", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await seedSession(page, "customer");
    await waitForCustomerAccountHydrated(page);
    await addJapamalaAndOpenCheckout(page);
    await fillCheckoutForm(page);

    await page.evaluate((pendingKey) => {
      window.sessionStorage.setItem(
        pendingKey,
        JSON.stringify({
          version: 1,
          userId: "demo-customer",
          cartFingerprint: "stale",
          order: {
            orderId: "POT-2099-invalid-pending",
            checkoutTransactionId: "tx-invalid",
            items: [
              {
                productId: "japamala",
                slug: "japamala",
                name: "Japamala",
                imageSrc: "/x.png",
                quantity: 1,
                unitPrice: 10,
                lineTotal: 10,
              },
            ],
            subtotal: 10,
            shippingOption: "economic",
            shippingLabel: "Econômica",
            shippingCost: 18.9,
            total: 28.9,
            paymentMethod: "pix",
            paymentLabel: "Pix",
            customerName: "Cliente",
            customerEmail: "a@b.com",
            customerPhone: "11999999999",
            createdAt: new Date().toISOString(),
          },
        }),
      );
    }, PENDING_STORAGE_KEY);

    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await expect(page).toHaveURL(/\/checkout\/sucesso/);
    const code = await readSuccessOrderCode(page);
    expect(code).not.toBe("POT-2099-invalid-pending");
  });

  test("falha ao limpar pendência após confirmação não reutiliza o pedido", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await seedSession(page, "customer");
    await waitForCustomerAccountHydrated(page);
    await addJapamalaAndOpenCheckout(page);
    await fillCheckoutForm(page);

    await page.evaluate((pendingKey) => {
      const originalRemove = Storage.prototype.removeItem;
      Storage.prototype.removeItem = function patched(
        this: Storage,
        key: string,
      ) {
        if (this === window.sessionStorage && key === pendingKey) {
          throw new DOMException("QuotaExceededError");
        }
        return originalRemove.call(this, key);
      };
    }, PENDING_STORAGE_KEY);

    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await expect(page).toHaveURL(/\/checkout\/sucesso/);
    const firstCode = await readSuccessOrderCode(page);
    const firstConfirmation = await page.evaluate((orderKey) => {
      const raw = window.sessionStorage.getItem(orderKey);
      return raw
        ? (JSON.parse(raw) as {
            orderId: string;
            checkoutTransactionId: string;
          })
        : null;
    }, ORDER_STORAGE_KEY);
    expect(firstConfirmation?.orderId).toBe(firstCode);

    const stalePending = await readPendingOperation(page);
    expect(stalePending?.order.orderId).toBe(firstCode);
    expect(stalePending?.order.checkoutTransactionId).toBe(
      firstConfirmation?.checkoutTransactionId,
    );

    await page.evaluate(() => {
      // restaura removeItem nativo para a próxima compra
      const desc = Object.getOwnPropertyDescriptor(Storage.prototype, "removeItem");
      if (desc && typeof desc.value === "function") {
        // patch permanece; a próxima compra deve detectar pendência já confirmada
      }
    });

    await addJapamalaAndOpenCheckout(page);
    await fillCheckoutForm(page);
    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await expect(page).toHaveURL(/\/checkout\/sucesso/);
    const secondCode = await readSuccessOrderCode(page);
    expect(secondCode).not.toBe(firstCode);

    const secondConfirmation = await page.evaluate((orderKey) => {
      const raw = window.sessionStorage.getItem(orderKey);
      return raw
        ? (JSON.parse(raw) as {
            orderId: string;
            checkoutTransactionId: string;
          })
        : null;
    }, ORDER_STORAGE_KEY);
    expect(secondConfirmation?.checkoutTransactionId).not.toBe(
      firstConfirmation?.checkoutTransactionId,
    );
  });

  test("pendência de outro usuário não é reaproveitada silenciosamente", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await seedSession(page, "customer");
    await waitForCustomerAccountHydrated(page);
    await addJapamalaAndOpenCheckout(page);
    await fillCheckoutForm(page);

    await page.evaluate((pendingKey) => {
      window.sessionStorage.setItem(
        pendingKey,
        JSON.stringify({
          version: 1,
          userId: "outro-usuario",
          cartFingerprint: "x",
          order: {
            orderId: "POT-2099-should-not-reuse",
            checkoutTransactionId: "tx-should-not-reuse",
            items: [
              {
                productId: "japamala",
                slug: "japamala",
                name: "Japamala",
                imageSrc: "/x.png",
                quantity: 1,
                unitPrice: 10,
                lineTotal: 10,
              },
            ],
            subtotal: 10,
            shippingOption: "economic",
            shippingLabel: "Econômica",
            shippingCost: 18.9,
            total: 28.9,
            paymentMethod: "pix",
            paymentLabel: "Pix",
            customerName: "Outro",
            customerEmail: "outro@demo",
            customerPhone: "11999999999",
            shippingAddress: {
              cep: "01310100",
              street: "Rua",
              number: "1",
              neighborhood: "Bairro",
              city: "São Paulo",
              state: "SP",
            },
            createdAt: new Date().toISOString(),
          },
        }),
      );
    }, PENDING_STORAGE_KEY);

    await page.getByRole("button", { name: "Finalizar pedido" }).click();
    await expect(page).toHaveURL(/\/checkout\/sucesso/);
    const code = await readSuccessOrderCode(page);
    expect(code).not.toBe("POT-2099-should-not-reuse");
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
