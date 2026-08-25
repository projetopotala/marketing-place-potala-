import { SellerDetailView } from "@/components/admin/modules/SellerDetailView";

export default async function AdminSellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SellerDetailView id={id} />;
}
