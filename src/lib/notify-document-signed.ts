import { createAdminClient } from "@/lib/supabase/admin";
import {
  formatSignedDate,
  portalDocumentsUrl,
  sendDocumentSignedConfirmationEmail,
} from "@/lib/email";

/**
 * Email every client signer (not admin/supplier) when a document is fully signed.
 * Works for field-based queues and whole-document flows (no document_signers rows).
 */
export async function notifyDocumentSignedConfirmations(
  documentId: string,
  signedAt: string,
): Promise<void> {
  const db = createAdminClient();

  const { data: document } = await db
    .from("documents")
    .select("id, type, project_id, projects(name, client_id)")
    .eq("id", documentId)
    .single();

  if (!document) return;

  const projectData = document.projects as
    | { name: string; client_id: string | null }
    | { name: string; client_id: string | null }[]
    | null;
  const project = Array.isArray(projectData) ? projectData[0] : projectData;

  const { data: signers } = await db
    .from("document_signers")
    .select("role, client_id")
    .eq("document_id", documentId);

  const clientIds = new Set<string>();
  for (const signer of signers ?? []) {
    if (signer.role === "client" && signer.client_id) {
      clientIds.add(signer.client_id);
    }
  }

  // Whole-document signing has no signer queue — confirm the project client.
  if (clientIds.size === 0 && project?.client_id) {
    clientIds.add(project.client_id);
  }

  if (clientIds.size === 0) return;

  const { data: clients } = await db
    .from("clients")
    .select("id, name, email")
    .in("id", [...clientIds]);

  const documentName = String(document.type);
  const projectName = project?.name ?? "your project";
  const signedDate = formatSignedDate(signedAt);
  const portalUrl = portalDocumentsUrl(document.project_id);

  await Promise.all(
    (clients ?? []).map(async (client) => {
      if (!client.email) return;
      const result = await sendDocumentSignedConfirmationEmail({
        to: client.email,
        clientName: client.name ?? "there",
        documentName,
        projectName,
        signedDate,
        portalUrl,
      });
      if (!result.success) {
        console.error(
          `Document signed confirmation failed for ${client.email}:`,
          result.error,
        );
      }
    }),
  );
}
