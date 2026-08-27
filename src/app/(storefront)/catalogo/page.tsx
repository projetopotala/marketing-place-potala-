import { CatalogListing } from "@/components/catalog/CatalogListing";
import {
  getCollectionLabel,
  parseCatalogCollection,
  parseCategoryFilter,
  parseProductSortOrder,
  parseSearchQuery,
  resolveCatalogListing,
} from "@/features/catalog/selectors";
import { getCatalogCategory } from "@/features/catalog/categories";

export const metadata = {
  title: "Catálogo | Instituto Potala Marketplace",
  description:
    "Explore o catálogo demonstrativo do Instituto Potala Marketplace.",
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const resolved = resolveCatalogListing({
    q: parseSearchQuery(params.q),
    ordem: parseProductSortOrder(params.ordem),
    categoria: parseCategoryFilter(params.categoria),
    colecao: parseCatalogCollection(params.colecao),
  });

  const collection = resolved.collection;
  const category = resolved.categoryId
    ? getCatalogCategory(resolved.categoryId)
    : undefined;

  const title = collection
    ? getCollectionLabel(collection)
    : category
      ? category.name
      : "Catálogo";

  const description = collection
    ? "Seleção editorial demonstrativa — não representa métricas reais de procura."
    : category
      ? category.description
      : "Todos os produtos públicos demonstrativos do Instituto Potala.";

  return (
    <CatalogListing
      title={title}
      description={description}
      products={resolved.products}
      breadcrumb={[
        { label: "Início", href: "/" },
        { label: "Catálogo", href: "/catalogo" },
        ...(collection
          ? [{ label: getCollectionLabel(collection) }]
          : category
            ? [{ label: category.name }]
            : []),
      ]}
      currentQuery={resolved.query}
      currentOrder={resolved.order}
      currentCategoryId={resolved.categoryId}
      lockedCollection={collection}
      showCategoryFilter={!collection}
      emptyActionHref="/catalogo"
    />
  );
}
