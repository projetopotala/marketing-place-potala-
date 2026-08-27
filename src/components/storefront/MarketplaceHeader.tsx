"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/storefront/BrandLogo";
import { CategoryNavigation } from "@/components/storefront/CategoryNavigation";
import { StorefrontSearch } from "@/components/storefront/StorefrontSearch";
import { AccountHeaderLink } from "@/components/account/AccountHeaderLink";
import { useCart } from "@/context/CartContext";
import {
  CartIcon,
  CloseIcon,
  MenuIcon,
} from "@/components/storefront/icons";

export function MarketplaceHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, isReady } = useCart();
  const menuId = "mobile-category-menu";
  const cartCount = isReady ? totalItems : 0;

  return (
    <header
      id="topo"
      className="sticky top-0 z-40 border-b border-potala-border bg-potala-bg/95 backdrop-blur"
    >
      <div className="potala-wide-container grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 py-4 md:grid-cols-[minmax(220px,285px)_minmax(0,1fr)_auto] md:gap-x-8 md:py-5 lg:min-h-[106px]">
        <Link href="/" className="min-w-0 justify-self-start">
          <BrandLogo />
        </Link>

        <div className="flex items-center gap-2 justify-self-end md:col-start-3 md:gap-0">
          <AccountHeaderLink />

          <span
            aria-hidden="true"
            className="mx-3 hidden h-9 w-px bg-potala-border md:block"
          />

          <Link
            href="/carrinho"
            className="relative inline-flex items-center gap-2.5 px-1 py-1 text-potala-text transition hover:text-potala-gold md:px-2"
            aria-label={
              cartCount === 0
                ? "Carrinho vazio"
                : `Carrinho com ${cartCount} ${cartCount === 1 ? "item" : "itens"}`
            }
          >
            <span className="relative">
              <CartIcon className="h-7 w-7 text-potala-gold" />
              {cartCount > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-potala-gold px-1 text-[0.65rem] font-semibold leading-none text-potala-bg">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </span>
            <span className="hidden text-sm font-medium lg:inline">Carrinho</span>
          </Link>

          <button
            type="button"
            className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-[var(--potala-radius-button)] border border-potala-border text-potala-gold xl:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Fechar menu de categorias" : "Abrir menu de categorias"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        <div
          role="search"
          className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1 md:max-w-[690px] md:justify-self-stretch lg:w-full lg:max-w-[690px] lg:justify-self-center"
        >
          <StorefrontSearch />
        </div>
      </div>

      <CategoryNavigation />

      <div id={menuId} className="xl:hidden" hidden={!menuOpen}>
        {menuOpen ? (
          <CategoryNavigation
            variant="mobile"
            onNavigate={() => setMenuOpen(false)}
          />
        ) : null}
      </div>
    </header>
  );
}
