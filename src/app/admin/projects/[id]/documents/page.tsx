import { createClient } from "@/lib/supabase/server";
import DocumentsPanel from "@/components/DocumentsPanel";
import Card from "@/components/Card";

export default async function ProjectDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from("documents")
    .select(
      "id, type, file_url, status, created_at, signature_name, signed_at, signature_hash, signer_ip, signer_user_agent",
    )
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  return (
    <Card title="Documents">
      <DocumentsPanel projectId={id} initialDocuments={documents ?? []} />
    </Card>
  );
}
