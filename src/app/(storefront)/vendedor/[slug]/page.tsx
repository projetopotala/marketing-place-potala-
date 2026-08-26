import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SellerStorefrontView } from "@/components/storefront/SellerStorefrontView";
import { createAdminSeed } from "@/features/admin/data/seed";
import {
  listActiveStorefrontFromAdmin,
} from "@/features/catalog/adapters";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function resolveSeller(slug: string) {
  const db = createAdminSeed();
  return db.sellers.find((seller) => seller.slug === slug) ?? null;
}

/**
 * Vitrine pública do vendedor.
 * Usa o seed administrativo (SSG). Produtos só em localStorage não aparecem aqui
 * sem backend — ver `features/catalog/adapters.ts`.
 */
export function generateStaticParams() {
  return createAdminSeed()
    .sellers.filter((seller) => Boolean(seller.slug))
    .map((seller) => ({ slug: seller.slug as string }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seller = resolveSeller(slug);
  if (!seller) {
    return { title: "Loja não encontrada | Instituto Potala" };
  }

  return {
    title: `${seller.name} | Instituto Potala Marketplace`,
    description:
      seller.description ??
      `Conheça os produtos da loja ${seller.name} no Instituto Potala.`,
  };
}

export default async function SellerPublicStorePage({ params }: PageProps) {
  const { slug } = await params;
  const db = createAdminSeed();
  const seller = db.sellers.find((item) => item.slug === slug);
  if (!seller) notFound();

  const products = listActiveStorefrontFromAdmin(db).filter((product) => {
    const source = db.products.find((item) => item.id === product.id);
    return source?.sellerId === seller.id;
  });

  const featured = products.filter((product) => product.featured).slice(0, 4);
  const categories = [
    ...new Set(
      products
        .map((product) => product.category)
        .filter((category): category is string => Boolean(category)),
    ),
  ];

  return (
    <SellerStorefrontView
      sellerName={seller.name}
      sellerDescription={
        seller.description ??
        "Loja parceira do Instituto Potala com produtos selecionados."
      }
      sellerRating={seller.rating}
      coverImageSrc={
        seller.coverImageSrc ?? "/images/potala/hero-bg-v2.png"
      }
      categories={categories}
      products={products}
      featured={featured}
    />
  );
}
