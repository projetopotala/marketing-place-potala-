import { TransactionDetailView } from "@/components/admin/modules/TransactionDetailView";

export default async function AdminTransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransactionDetailView id={id} />;
}
