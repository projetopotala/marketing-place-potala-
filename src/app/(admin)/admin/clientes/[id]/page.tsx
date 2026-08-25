import { CustomerDetailView } from "@/components/admin/modules/CustomerDetailView";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerDetailView id={id} />;
}
