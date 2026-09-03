"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { NAV_CATEGORIES } from "@/data/marketplace";
import { HEADER_CATEGORIES } from "@/features/catalog/categories";
import { ChevronDownIcon } from "@/components/storefront/icons";

interface CategoryNavigationProps {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

function isActiveHref(pathname: string, href: string): boolean {
  if (href.startsWith("/#")) return false;
  if (href === "/catalogo") {
    return pathname === "/catalogo" || pathname.startsWith("/categoria/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CategoryNavigation({
  variant = "desktop",
  onNavigate,
}: CategoryNavigationProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [menuOpen]);

  const topLinks = NAV_CATEGORIES.filter((item) => !item.hasMenu);

  if (variant === "mobile") {
    return (
      <nav
        aria-label="Categorias móveis"
        className="max-h-[min(70vh,32rem)] overflow-y-auto border-t border-potala-border bg-potala-bg-secondary"
      >
        <ul className="potala-wide-container flex flex-col py-2">
          <li>
            <p className="px-2 pb-1 pt-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-potala-gold">
              Categorias
            </p>
          </li>
          <li>
            <Link
              href="/catalogo"
              className="block rounded-md px-2 py-3 text-potala-text transition hover:bg-potala-panel hover:text-potala-gold"
              onClick={onNavigate}
              aria-current={pathname === "/catalogo" ? "page" : undefined}
            >
              Ver todos os produtos
            </Link>
          </li>
          {HEADER_CATEGORIES.map((category) => {
            const active = pathname === category.href;
            return (
              <li key={category.id}>
                <Link
                  href={category.href}
                  className={`block rounded-md px-2 py-3 transition hover:bg-potala-panel hover:text-potala-gold ${
                    active ? "bg-potala-panel text-potala-gold" : "text-potala-text"
                  }`}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                >
                  {category.name}
                </Link>
              </li>
            );
          })}
          <li>
            <span aria-hidden="true" className="mx-2 my-2 block h-px bg-potala-border" />
          </li>
          {topLinks
            .filter((item) => !HEADER_CATEGORIES.some((c) => c.id === item.id))
            .map((item) => {
              const active = isActiveHref(pathname, item.href);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`block rounded-md px-2 py-3 transition hover:bg-potala-panel hover:text-potala-gold ${
                      active ? "bg-potala-panel text-potala-gold" : "text-potala-text"
                    }`}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Categorias"
      className="hidden border-y border-potala-border xl:block"
    >
      <ul className="potala-wide-container flex h-[3.25rem] items-center justify-between gap-2 text-[0.95rem] text-potala-text">
        <li className="relative shrink-0">
          <button
            ref={triggerRef}
            type="button"
            className="inline-flex min-h-11 items-center gap-1 rounded-sm px-1 py-2 transition hover:text-potala-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-potala-gold"
            aria-expanded={menuOpen}
            aria-controls={panelId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            Categorias
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          <div
            ref={panelRef}
            id={panelId}
            hidden={!menuOpen}
            className="absolute left-0 top-full z-50 mt-1 min-w-[16rem] max-h-[min(70vh,24rem)] overflow-y-auto rounded-md border border-potala-border bg-potala-bg-secondary p-2 shadow-[0_12px_28px_rgb(3_17_38_/_35%)]"
          >
            {menuOpen ? (
              <ul className="flex flex-col">
                <li>
                  <Link
                    href="/catalogo"
                    className="block rounded-md px-3 py-2.5 text-potala-text transition hover:bg-potala-panel hover:text-potala-gold"
                    onClick={() => setMenuOpen(false)}
                    aria-current={pathname === "/catalogo" ? "page" : undefined}
                  >
                    Ver todos os produtos
                  </Link>
                </li>
                {HEADER_CATEGORIES.map((category) => {
                  const active = pathname === category.href;
                  return (
                    <li key={category.id}>
                      <Link
                        href={category.href}
                        className={`block rounded-md px-3 py-2.5 transition hover:bg-potala-panel hover:text-potala-gold ${
                          active ? "bg-potala-panel text-potala-gold" : "text-potala-text"
                        }`}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                      >
                        {category.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </li>

        {topLinks.map((item) => {
          const active = isActiveHref(pathname, item.href);
          return (
            <li key={item.id} className="shrink-0">
              <Link
                href={item.href}
                className={`inline-flex min-h-11 items-center rounded-sm px-1 py-2 transition hover:text-potala-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-potala-gold ${
                  active ? "text-potala-gold" : ""
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
