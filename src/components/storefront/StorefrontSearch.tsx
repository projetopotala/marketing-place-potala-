"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FEATURED_CATEGORIES, PRODUCTS } from "@/data/marketplace";
import { catalogHref } from "@/features/catalog/selectors";
import { textIncludes } from "@/lib/normalizeText";
import { SearchIcon } from "@/components/storefront/icons";

interface StoreSearchHit {
  id: string;
  label: string;
  meta: string;
  href: string;
  group: "Produtos" | "Categorias" | "Ações";
}

function searchStorefront(query: string): StoreSearchHit[] {
  const q = query.trim();
  if (!q) return [];

  const products = PRODUCTS.filter(
    (product) =>
      textIncludes(product.name, q) ||
      textIncludes(product.category, q) ||
      textIncludes(product.description ?? "", q) ||
      textIncludes(product.slug, q),
  )
    .slice(0, 8)
    .map((product) => ({
      id: product.id,
      label: product.name,
      meta: product.category,
      href: `/produto/${product.slug}`,
      group: "Produtos" as const,
    }));

  const categories = FEATURED_CATEGORIES.filter((category) =>
    textIncludes(category.name, q),
  )
    .slice(0, 5)
    .map((category) => ({
      id: category.id,
      label: category.name,
      meta: "Categoria",
      href: category.href,
      group: "Categorias" as const,
    }));

  const actions: StoreSearchHit[] = [
    {
      id: "see-all-results",
      label: `Ver todos os resultados para “${q}”`,
      meta: "Catálogo",
      href: catalogHref({ q }),
      group: "Ações",
    },
  ];

  return [...products, ...categories, ...actions];
}

export function StorefrontSearch() {
  const router = useRouter();
  const searchId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchStorefront(query), [query]);
  const hasQuery = query.trim().length > 0;
  const productHits = results.filter((item) => item.group === "Produtos");
  const categoryHits = results.filter((item) => item.group === "Categorias");
  const actionHits = results.filter((item) => item.group === "Ações");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        const target = event.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();
        const typing =
          tag === "input" ||
          tag === "textarea" ||
          tag === "select" ||
          target?.isContentEditable;
        if (typing && !open) return;
        event.preventDefault();
        setOpen((current) => !current);
        if (open) setQuery("");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery("");
  }

  function openResult(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <div className="relative w-full">
        <button
          ref={triggerRef}
          id={searchId}
          type="button"
          className="potala-input flex w-full items-center pr-12 text-left text-potala-muted"
          aria-label="Abrir busca da loja"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => {
            setQuery("");
            setOpen(true);
          }}
        >
          <span className="truncate">Buscar produtos, cursos, livros...</span>
        </button>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-potala-gold">
          <SearchIcon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Busca da loja"
        description="Busque produtos, cursos e categorias do Instituto Potala."
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Buscar produtos, cursos, livros..."
            aria-label="Termo da busca da loja"
          />
          <CommandList>
            <CommandEmpty>
              {hasQuery
                ? `Nenhum resultado para “${query.trim()}”.`
                : "Digite para buscar produtos, cursos e categorias."}
            </CommandEmpty>

            {productHits.length > 0 ? (
              <CommandGroup heading="Produtos">
                {productHits.map((item) => (
                  <CommandItem
                    key={`product-${item.id}`}
                    value={`product:${item.id}:${item.label}`}
                    onSelect={() => openResult(item.href)}
                  >
                    <Search className="size-4 opacity-60" aria-hidden="true" />
                    <span className="flex min-w-0 flex-col">
                      <span>{item.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.meta}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {categoryHits.length > 0 ? (
              <CommandGroup heading="Categorias">
                {categoryHits.map((item) => (
                  <CommandItem
                    key={`category-${item.id}`}
                    value={`category:${item.id}:${item.label}`}
                    onSelect={() => openResult(item.href)}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span>{item.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.meta}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {hasQuery && actionHits.length > 0 ? (
              <CommandGroup heading="Catálogo">
                {actionHits.map((item) => (
                  <CommandItem
                    key={`action-${item.id}`}
                    value={`action:${item.id}:${item.label}`}
                    onSelect={() => openResult(item.href)}
                  >
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
