"use client";

import { NAV_CATEGORIES } from "@/data/marketplace";
import { ChevronDownIcon } from "@/components/storefront/icons";

interface CategoryNavigationProps {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

export function CategoryNavigation({
  variant = "desktop",
  onNavigate,
}: CategoryNavigationProps) {
  if (variant === "mobile") {
    return (
      <nav
        aria-label="Categorias móveis"
        className="border-t border-potala-border bg-potala-bg-secondary"
      >
        <ul className="potala-wide-container flex flex-col py-2">
          {NAV_CATEGORIES.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                className="block rounded-md px-2 py-3 text-potala-text transition hover:bg-potala-panel hover:text-potala-gold"
                onClick={onNavigate}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Categorias"
      className="hidden border-y border-potala-border lg:block"
    >
      <ul className="potala-wide-container flex h-[3.25rem] items-center justify-between gap-3 text-[0.95rem] text-potala-text">
        {NAV_CATEGORIES.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={item.href}
              className="inline-flex items-center gap-1 rounded-sm py-2 transition hover:text-potala-gold"
            >
              {item.label}
              {item.hasMenu ? <ChevronDownIcon className="h-4 w-4" /> : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
