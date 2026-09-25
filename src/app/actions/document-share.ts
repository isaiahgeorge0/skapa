"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateDocumentPaths } from "@/lib/revalidate-documents";
import {
  defaultRequiresSignature,
  isDocumentType,
  type DocumentType,
} from "@/lib/document-types";

type ActionResult<T = void> =
  | ({ success: true } & (T extends void ? object : { data: T }))
  | { success: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, error: "You must be signed in." as string };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { user: null, error: "Only admins can manage documents." as string };
  }

  return { user, error: null as string | null };
}

/** Share a non-signing document with the client (view/download only). */
export async function sendDocumentToClient(
  documentId: string,
): Promise<ActionResult<{ status: string }>> {
  const { user, error: authError } = await requireAdmin();
  if (authError || !user) return { success: false, error: authError ?? "Unauthorized" };

  const db = createAdminClient();

  const { data: document, error: docError } = await db
    .from("documents")
    .select("id, status, project_id, requires_signature")
    .eq("id", documentId)
    .single();

  if (docError || !document) {
    return { success: false, error: "Document not found." };
  }

  if (document.requires_signature) {
    return {
      success: false,
      error: "This document requires signatures — use Send for signing.",
    };
  }

  if (document.status === "voided") {
    return {
      success: false,
      error: "Voided documents can't be sent again. Upload a fresh document instead.",
    };
  }

  if (document.status !== "draft") {
    return {
      success: false,
      error: "Only draft documents can be sent to the client.",
    };
  }

  const { error: updateError } = await db
    .from("documents")
    .update({ status: "sent" })
    .eq("id", documentId);

  if (updateError) {
    return { success: false, error: "Failed to update document status." };
  }

  await db.from("document_events").insert({
    document_id: documentId,
    event_type: "sent",
    actor_id: user.id,
    actor_role: "admin",
    detail: "Shared with client (no signature required)",
  });

  revalidateDocumentPaths(document.project_id);
  return { success: true, data: { status: "sent" } };
}

/** Toggle requires_signature on drafts only. */
export async function setDocumentRequiresSignature(
  documentId: string,
  requiresSignature: boolean,
): Promise<ActionResult<{ requires_signature: boolean }>> {
  const { error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const db = createAdminClient();

  const { data: document, error: docError } = await db
    .from("documents")
    .select("id, status, project_id, requires_signature")
    .eq("id", documentId)
    .single();

  if (docError || !document) {
    return { success: false, error: "Document not found." };
  }

  if (document.status !== "draft") {
    return {
      success: false,
      error:
        "Signature requirement can only be changed while the document is still a draft. Upload a fresh file if you need a different path.",
    };
  }

  if (document.requires_signature === requiresSignature) {
    return { success: true, data: { requires_signature: requiresSignature } };
  }

  const { error: updateError } = await db
    .from("documents")
    .update({ requires_signature: requiresSignature })
    .eq("id", documentId)
    .eq("status", "draft");

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidateDocumentPaths(document.project_id);
  return { success: true, data: { requires_signature: requiresSignature } };
}

export function requiresSignatureDefaultForType(type: string): boolean {
  return isDocumentType(type) ? defaultRequiresSignature(type) : false;
}

export type { DocumentType };
