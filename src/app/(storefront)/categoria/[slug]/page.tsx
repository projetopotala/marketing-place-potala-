import { notFound } from "next/navigation";
import { CatalogListing } from "@/components/catalog/CatalogListing";
import {
  CATALOG_CATEGORIES,
  getCatalogCategory,
} from "@/features/catalog/categories";
import {
  filterProductsByQuery,
  listProductsByCategory,
  parseProductSortOrder,
  parseSearchQuery,
  sortProducts,
} from "@/features/catalog/selectors";

export function generateStaticParams() {
  return CATALOG_CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCatalogCategory(slug);
  if (!category) {
    return { title: "Categoria não encontrada | Instituto Potala Marketplace" };
  }
  return {
    title: `${category.name} | Instituto Potala Marketplace`,
    description: category.description,
  };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const category = getCatalogCategory(slug);
  if (!category) {
    notFound();
  }

  const sp = await searchParams;
  const query = parseSearchQuery(sp.q);
  const order = parseProductSortOrder(sp.ordem);
  let products = listProductsByCategory(category.id);
  products = filterProductsByQuery(products, query);
  products = sortProducts(products, order);

  return (
    <CatalogListing
      title={category.name}
      description={category.description}
      products={products}
      breadcrumb={[
        { label: "Início", href: "/" },
        { label: "Catálogo", href: "/catalogo" },
        { label: category.name },
      ]}
      currentQuery={query}
      currentOrder={order}
      currentCategoryId={category.id}
      lockedCategoryId={category.id}
      showCategoryFilter={false}
      emptyActionHref={category.href}
      emptyActionLabel={`Limpar filtros de ${category.name}`}
    />
  );
}
