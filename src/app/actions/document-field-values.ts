"use server";

import { createClient } from "@/lib/supabase/server";
import { advanceSigningQueue } from "@/app/actions/document-signers";
import {
  fieldBelongsToSigner,
  type DocumentField,
  type DocumentSigner,
} from "@/lib/documents";

type ActionResult<T = void> =
  | ({ success: true } & (T extends void ? object : { data: T }))
  | { success: false; error: string };

async function getViewerContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null, error: "You must be signed in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, client_id, full_name")
    .eq("id", user.id)
    .single();

  return { supabase, user, profile, error: null };
}

async function getPrimaryClientId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("projects")
    .select("client_id")
    .eq("id", projectId)
    .single();
  return (data?.client_id as string | null) ?? null;
}

async function getActiveSignerForViewer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  documentId: string,
  profile: { role: string | null; client_id: string | null },
): Promise<{ signer: DocumentSigner | null; error: string | null }> {
  const { data: signers, error } = await supabase
    .from("document_signers")
    .select("*")
    .eq("document_id", documentId)
    .order("order_index", { ascending: true });

  if (error) return { signer: null, error: "Failed to load signing queue." };

  const match = (signers ?? []).find((signer) => {
    if (profile.role === "admin") return signer.role === "admin";
    return (
      signer.role === "client" &&
      signer.client_id === profile.client_id
    );
  });

  if (!match) {
    return { signer: null, error: "You are not a signer on this document." };
  }

  return { signer: match as DocumentSigner, error: null };
}

export async function saveDocumentFieldValue(
  documentFieldId: string,
  value: string,
): Promise<ActionResult<{ fieldId: string; value: string }>> {
  const { supabase, user, profile, error: authError } = await getViewerContext();
  if (authError || !user || !profile) {
    return { success: false, error: authError ?? "Unauthorized" };
  }

  if (!value.trim()) {
    return { success: false, error: "A value is required." };
  }

  const { data: field, error: fieldError } = await supabase
    .from("document_fields")
    .select("*")
    .eq("id", documentFieldId)
    .single();

  if (fieldError || !field) {
    return { success: false, error: "Field not found." };
  }

  const { data: document } = await supabase
    .from("documents")
    .select("id, project_id, status")
    .eq("id", field.document_id)
    .single();

  if (!document) return { success: false, error: "Document not found." };

  if (!["sent", "viewed", "partially_signed"].includes(document.status)) {
    return { success: false, error: "This document is not open for signing." };
  }

  const { signer, error: signerError } = await getActiveSignerForViewer(
    supabase,
    document.id,
    profile,
  );
  if (signerError || !signer) {
    return { success: false, error: signerError ?? "Not a signer." };
  }

  if (signer.status !== "sent") {
    return {
      success: false,
      error: "It is not your turn to fill this document yet.",
    };
  }

  const primaryClientId = await getPrimaryClientId(supabase, document.project_id);
  if (
    !fieldBelongsToSigner(
      field as DocumentField,
      { role: signer.role, client_id: signer.client_id },
      primaryClientId,
    )
  ) {
    return { success: false, error: "This field is not assigned to you." };
  }

  const { data: existing } = await supabase
    .from("document_field_values")
    .select("id")
    .eq("document_field_id", documentFieldId)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "This field has already been filled." };
  }

  const { error: insertError } = await supabase.from("document_field_values").insert({
    document_field_id: documentFieldId,
    value: value.trim(),
    filled_by: user.id,
  });

  if (insertError) {
    console.error("Failed to save field value:", insertError);
    return { success: false, error: "Failed to save field value." };
  }

  return {
    success: true,
    data: { fieldId: documentFieldId, value: value.trim() },
  };
}

export async function completeSignerTurn(
  documentId: string,
): Promise<
  ActionResult<{ documentStatus: string; nextSignerName: string | null }>
> {
  const { supabase, user, profile, error: authError } = await getViewerContext();
  if (authError || !user || !profile) {
    return { success: false, error: authError ?? "Unauthorized" };
  }

  const { data: document } = await supabase
    .from("documents")
    .select("id, project_id, status")
    .eq("id", documentId)
    .single();

  if (!document) return { success: false, error: "Document not found." };

  const { signer, error: signerError } = await getActiveSignerForViewer(
    supabase,
    documentId,
    profile,
  );
  if (signerError || !signer) {
    return { success: false, error: signerError ?? "Not a signer." };
  }

  if (signer.status !== "sent") {
    return { success: false, error: "It is not your turn to complete this document." };
  }

  const primaryClientId = await getPrimaryClientId(supabase, document.project_id);

  const { data: fields } = await supabase
    .from("document_fields")
    .select("*")
    .eq("document_id", documentId);

  const myFields = ((fields ?? []) as DocumentField[]).filter((field) =>
    fieldBelongsToSigner(
      field,
      { role: signer.role, client_id: signer.client_id },
      primaryClientId,
    ),
  );

  const required = myFields.filter((field) => field.required);
  if (required.length === 0 && myFields.length === 0) {
    return { success: false, error: "You have no fields to complete on this document." };
  }

  const { data: values } = await supabase
    .from("document_field_values")
    .select("document_field_id")
    .in(
      "document_field_id",
      myFields.map((field) => field.id),
    );

  const filled = new Set((values ?? []).map((row) => row.document_field_id as string));
  const missing = required.filter((field) => !filled.has(field.id));
  if (missing.length > 0) {
    return {
      success: false,
      error: `Complete all required fields first (${missing.length} remaining).`,
    };
  }

  return advanceSigningQueue(documentId, signer.id);
}
