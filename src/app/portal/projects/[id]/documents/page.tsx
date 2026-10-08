import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DocumentsPanel from "@/components/DocumentsPanel";
import PortalPageHeader from "@/components/PortalPageHeader";

export const dynamic = "force-dynamic";

const ACTIVE_SIGNING_STATUSES = ["sent", "viewed", "partially_signed"];

export default async function PortalProjectDocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ open?: string; sign?: string }>;
}) {
  const { id } = await params;
  const { open, sign } = await searchParams;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", id)
    .single();
  if (!project) notFound();

  const { data: documents } = await supabase
    .from("documents")
    .select(
      "id, type, file_url, file_mime_type, status, created_at, requires_signature",
    )
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const documentList = documents ?? [];
  const awaitingSignature = await countAwaitingMySignature(
    supabase,
    documentList.filter(
      (d) => d.requires_signature && ACTIVE_SIGNING_STATUSES.includes(d.status),
    ),
  );

  return (
    <>
      <PortalPageHeader
        eyebrow={project.name}
        title="Documents"
        intro="Everything we've shared with you, and anything waiting on your signature."
        meta={
          documentList.length > 0 ? (
            <>
              <span>
                {documentList.length} {documentList.length === 1 ? "document" : "documents"}
              </span>
              {awaitingSignature > 0 ? (
                <>
                  <span aria-hidden="true" className="text-neutral-300">
                    ·
                  </span>
                  <span className="text-portal-accent">
                    {awaitingSignature} awaiting your signature
                  </span>
                </>
              ) : null}
            </>
          ) : undefined
        }
      />
      <DocumentsPanel
        projectId={project.id}
        initialDocuments={documentList}
        canManage={false}
        autoOpenDocumentId={open ?? sign ?? null}
      />
    </>
  );
}

/**
 * Same rule as DocumentsPanel's "ready for you": whole-document signatures (no fields)
 * wait on the client while sent/viewed; field-based ones when the client's signer is next.
 */
async function countAwaitingMySignature(
  supabase: Awaited<ReturnType<typeof createClient>>,
  activeDocs: { id: string; status: string }[],
) {
  if (activeDocs.length === 0) return 0;
  const ids = activeDocs.map((d) => d.id);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const [{ data: profile }, { data: fields }, { data: signers }] = await Promise.all([
    supabase.from("profiles").select("client_id").eq("id", user.id).single(),
    supabase.from("document_fields").select("document_id").in("document_id", ids),
    supabase
      .from("document_signers")
      .select("document_id, role, client_id")
      .in("document_id", ids)
      .eq("status", "sent"),
  ]);

  const withFields = new Set((fields ?? []).map((f) => f.document_id));
  return activeDocs.filter((doc) => {
    if (!withFields.has(doc.id)) return doc.status === "sent" || doc.status === "viewed";
    const active = (signers ?? []).find((s) => s.document_id === doc.id);
    return active?.role === "client" && active.client_id === profile?.client_id;
  }).length;
}
