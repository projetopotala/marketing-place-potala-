"use client";

import { useId, useState } from "react";
import { BrandLogo } from "@/components/storefront/BrandLogo";
import { CategoryNavigation } from "@/components/storefront/CategoryNavigation";
import {
  CartIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/storefront/icons";

export function MarketplaceHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchId = useId();
  const menuId = "mobile-category-menu";

  return (
    <header
      id="topo"
      className="sticky top-0 z-40 border-b border-potala-border bg-potala-bg/95 backdrop-blur"
    >
      <div className="potala-wide-container grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 py-4 md:grid-cols-[minmax(220px,285px)_minmax(0,1fr)_auto] md:gap-x-8 md:py-5 lg:min-h-[106px]">
        <a href="#topo" className="min-w-0 justify-self-start">
          <BrandLogo />
        </a>

        <div className="flex items-center gap-2 justify-self-end md:col-start-3 md:gap-0">
          <button
            type="button"
            className="inline-flex items-center gap-3 px-1 py-1 text-left text-potala-text transition hover:text-potala-gold md:px-2"
            aria-label="Entrar ou acessar minha conta"
          >
            <UserIcon className="h-7 w-7 text-potala-gold" />
            <span className="hidden leading-tight md:block">
              <span className="block text-sm font-medium">Entrar</span>
              <span className="block text-xs text-potala-muted">Minha conta</span>
            </span>
          </button>

          <span
            aria-hidden="true"
            className="mx-3 hidden h-9 w-px bg-potala-border md:block"
          />

          <button
            type="button"
            className="relative inline-flex items-center gap-2.5 px-1 py-1 text-potala-text transition hover:text-potala-gold md:px-2"
            aria-label="Carrinho com 2 itens"
          >
            <span className="relative">
              <CartIcon className="h-7 w-7 text-potala-gold" />
              <span className="absolute -right-2 -top-2 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-potala-gold px-1 text-[0.65rem] font-semibold leading-none text-potala-bg">
                2
              </span>
            </span>
            <span className="hidden text-sm font-medium lg:inline">Carrinho</span>
          </button>

          <button
            type="button"
            className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-[var(--potala-radius-button)] border border-potala-border text-potala-gold lg:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Fechar menu de categorias" : "Abrir menu de categorias"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        <form
          className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1 md:max-w-[690px] md:justify-self-stretch lg:w-full lg:max-w-[690px] lg:justify-self-center"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor={searchId} className="sr-only">
            Buscar produtos, cursos, livros
          </label>
          <div className="relative">
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar produtos, cursos, livros..."
              className="potala-input pr-12"
              autoComplete="off"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-potala-gold">
              <SearchIcon className="h-5 w-5" />
            </span>
          </div>
        </form>
      </div>

      <CategoryNavigation />

      <div id={menuId} className="lg:hidden" hidden={!menuOpen}>
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
