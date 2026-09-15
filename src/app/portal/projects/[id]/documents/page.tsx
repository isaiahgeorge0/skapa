import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DocumentsPanel from "@/components/DocumentsPanel";

export const dynamic = "force-dynamic";

export default async function PortalProjectDocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sign?: string }>;
}) {
  const { id } = await params;
  const { sign } = await searchParams;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .single();
  if (!project) notFound();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, type, file_url, file_mime_type, status, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  return (
    <DocumentsPanel
      projectId={project.id}
      initialDocuments={documents ?? []}
      canManage={false}
      autoOpenDocumentId={sign ?? null}
    />
  );
}
