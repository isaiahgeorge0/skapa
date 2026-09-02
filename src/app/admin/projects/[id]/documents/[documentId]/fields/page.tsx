import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DocumentFieldEditor from "@/components/DocumentFieldEditor";
import {
  listDocumentSigners,
  syncDocumentSigners,
} from "@/app/actions/document-signers";
import type { DocumentField } from "@/lib/documents";

type ClientRef = { id: string; name: string };

function unwrapClient(
  linked: ClientRef | ClientRef[] | null | undefined,
): ClientRef | null {
  if (!linked) return null;
  return Array.isArray(linked) ? (linked[0] ?? null) : linked;
}

export default async function DocumentFieldsPage({
  params,
}: {
  params: Promise<{ id: string; documentId: string }>;
}) {
  const { id: projectId, documentId } = await params;
  const supabase = await createClient();

  const { data: document } = await supabase
    .from("documents")
    .select("id, type, file_url, file_mime_type, project_id, created_at, status")
    .eq("id", documentId)
    .eq("project_id", projectId)
    .single();

  if (!document) notFound();

  if (document.file_mime_type !== "application/pdf") {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="mb-2 font-serif text-2xl text-black">PDF required for field placement</h2>
        <p className="mb-4 font-mono text-sm leading-relaxed text-neutral-600">
          Signature, date, and text fields can only be placed on PDF documents with a fixed page
          layout. This file was detected as{" "}
          <span className="text-black">{document.file_mime_type ?? "unknown"}</span>.
        </p>
        <Link
          href={`/admin/projects/${projectId}/documents`}
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600 underline decoration-dotted hover:text-black"
        >
          Back to documents
        </Link>
      </div>
    );
  }

  const [
    { data: fields },
    { data: pdfDocuments },
    { data: project },
    { data: additionalRows },
  ] = await Promise.all([
    supabase
      .from("document_fields")
      .select("*")
      .eq("document_id", documentId)
      .order("page_number")
      .order("id"),
    supabase
      .from("documents")
      .select("id, type, created_at, projects(name)")
      .eq("file_mime_type", "application/pdf")
      .neq("id", documentId)
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id, client_id, clients!client_id(id, name)")
      .eq("id", projectId)
      .single(),
    supabase
      .from("project_clients")
      .select("clients(id, name)")
      .eq("project_id", projectId),
  ]);

  const primaryClient = unwrapClient(
    (project as { clients?: ClientRef | ClientRef[] | null } | null)?.clients,
  );

  const additionalClients = (additionalRows ?? [])
    .map((row) => unwrapClient(row.clients as ClientRef | ClientRef[] | null))
    .filter((client): client is ClientRef => Boolean(client));

  const projectClients = [
    ...(primaryClient ? [primaryClient] : []),
    ...additionalClients.filter((client) => client.id !== primaryClient?.id),
  ];

  const copySourceDocuments = (pdfDocuments ?? []).map((doc) => {
    const projectData = doc.projects as { name: string } | { name: string }[] | null;
    const projectName = Array.isArray(projectData)
      ? projectData[0]?.name
      : projectData?.name;
    const date = new Date(doc.created_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return {
      id: doc.id,
      label: `${projectName ?? "Project"} · ${doc.type} · ${date}`,
    };
  });

  const normalizedFields = ((fields ?? []) as DocumentField[]).map((field) => ({
    ...field,
    assigned_to_role:
      field.assigned_to_role === "admin" || field.assigned_to_role === "client"
        ? field.assigned_to_role
        : null,
    assigned_to_client_id: field.assigned_to_client_id ?? null,
  }));

  await syncDocumentSigners(documentId);
  const signersResult = await listDocumentSigners(documentId);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/admin/projects/${projectId}/documents`}
            className="mb-3 inline-block font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-black"
          >
            ← Documents
          </Link>
          <h2 className="font-serif text-3xl capitalize text-black">{document.type}</h2>
          <p className="mt-2 font-mono text-xs text-neutral-500">
            Place signature, date, and text fields on this PDF before sending it to the client.
          </p>
        </div>
      </div>

      <DocumentFieldEditor
        projectId={projectId}
        documentId={documentId}
        fileUrl={document.file_url}
        initialFields={normalizedFields}
        copySourceDocuments={copySourceDocuments}
        projectClients={projectClients}
        initialSigners={signersResult.success ? signersResult.data : []}
        documentStatus={document.status}
      />
    </div>
  );
}
