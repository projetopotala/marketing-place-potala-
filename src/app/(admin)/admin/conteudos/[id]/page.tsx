import { ContentDetailView } from "@/components/admin/modules/ContentDetailView";

export default async function AdminContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContentDetailView id={id} />;
}
