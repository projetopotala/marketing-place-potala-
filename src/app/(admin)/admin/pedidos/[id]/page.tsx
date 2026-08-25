import { OrderDetailView } from "@/components/admin/modules/OrderDetailView";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailView id={id} />;
}
