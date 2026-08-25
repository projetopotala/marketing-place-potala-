import { ProductDetailView } from "@/components/admin/modules/ProductDetailView";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailView id={id} />;
}
