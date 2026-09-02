"use server";

import { createClient } from "@/lib/supabase/server";
import { syncDocumentSigners } from "@/app/actions/document-signers";
import type {
  DocumentField,
  DocumentFieldAssigneeRole,
  DocumentFieldType,
} from "@/lib/documents";

type ActionResult<T = void> =
  | ({ success: true } & (T extends void ? object : { data: T }))
  | { success: false; error: string };

const FIELD_TYPES: DocumentFieldType[] = ["signature", "date", "text"];
const ASSIGNEE_ROLES: DocumentFieldAssigneeRole[] = ["admin", "client"];

function normalizeAssignee(
  role: DocumentFieldAssigneeRole | null | undefined,
  clientId: string | null | undefined,
): { assigned_to_role: DocumentFieldAssigneeRole | null; assigned_to_client_id: string | null } {
  if (role === null || role === undefined) {
    return { assigned_to_role: null, assigned_to_client_id: null };
  }
  if (role === "admin") {
    return { assigned_to_role: "admin", assigned_to_client_id: null };
  }
  return {
    assigned_to_role: "client",
    assigned_to_client_id: clientId ?? null,
  };
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, error: "You must be signed in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { supabase, user: null, error: "Only admins can manage document fields." };
  }

  return { supabase, user, error: null };
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function validateFieldPayload(payload: {
  field_type: string;
  page_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
}): string | null {
  if (!FIELD_TYPES.includes(payload.field_type as DocumentFieldType)) {
    return "Invalid field type.";
  }
  if (!Number.isInteger(payload.page_number) || payload.page_number < 1) {
    return "Page number must be at least 1.";
  }
  for (const key of ["x", "y", "width", "height"] as const) {
    const value = payload[key];
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      return `${key} must be a percentage between 0 and 100.`;
    }
  }
  if (payload.width <= 0 || payload.height <= 0) {
    return "Width and height must be greater than 0.";
  }
  return null;
}

async function getPdfDocument(supabase: Awaited<ReturnType<typeof createClient>>, documentId: string) {
  const { data: document, error } = await supabase
    .from("documents")
    .select("id, project_id, file_mime_type")
    .eq("id", documentId)
    .single();

  if (error || !document) {
    return { document: null, error: "Document not found." };
  }

  if (document.file_mime_type !== "application/pdf") {
    return {
      document: null,
      error: "Field placement is only available for PDF documents.",
    };
  }

  return { document, error: null };
}

export async function createDocumentField(
  documentId: string,
  payload: {
    field_type: DocumentFieldType;
    page_number: number;
    x: number;
    y: number;
    width: number;
    height: number;
    required?: boolean;
    assigned_to_role?: DocumentFieldAssigneeRole | null;
    assigned_to_client_id?: string | null;
  },
): Promise<ActionResult<DocumentField>> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const validationError = validateFieldPayload({
    ...payload,
    required: payload.required ?? true,
  });
  if (validationError) return { success: false, error: validationError };

  if (
    payload.assigned_to_role !== undefined &&
    payload.assigned_to_role !== null &&
    !ASSIGNEE_ROLES.includes(payload.assigned_to_role)
  ) {
    return { success: false, error: "Invalid assignee role." };
  }

  const { document, error: docError } = await getPdfDocument(supabase, documentId);
  if (docError || !document) return { success: false, error: docError ?? "Document not found." };

  // New fields stay unassigned until the admin explicitly picks someone.
  const assignee = normalizeAssignee(
    payload.assigned_to_role === undefined ? null : payload.assigned_to_role,
    payload.assigned_to_client_id,
  );

  const { data, error } = await supabase
    .from("document_fields")
    .insert({
      document_id: documentId,
      field_type: payload.field_type,
      page_number: payload.page_number,
      x: clampPercent(payload.x),
      y: clampPercent(payload.y),
      width: clampPercent(payload.width),
      height: clampPercent(payload.height),
      required: payload.required ?? true,
      assigned_to_role: assignee.assigned_to_role,
      assigned_to_client_id: assignee.assigned_to_client_id,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("Failed to create document field:", error);
    return { success: false, error: "Failed to create field." };
  }

  await syncDocumentSigners(documentId);

  return { success: true, data: data as DocumentField };
}

export async function updateDocumentField(
  fieldId: string,
  payload: {
    page_number?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    required?: boolean;
    assigned_to_role?: DocumentFieldAssigneeRole | null;
    assigned_to_client_id?: string | null;
  },
): Promise<ActionResult<DocumentField>> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const { data: existing, error: fetchError } = await supabase
    .from("document_fields")
    .select("*")
    .eq("id", fieldId)
    .single();

  if (fetchError || !existing) {
    return { success: false, error: "Field not found." };
  }

  const { error: docError } = await getPdfDocument(supabase, existing.document_id);
  if (docError) {
    return { success: false, error: docError };
  }

  const updatePayload: Record<string, number | boolean | string | null> = {};

  if (payload.page_number !== undefined) {
    if (!Number.isInteger(payload.page_number) || payload.page_number < 1) {
      return { success: false, error: "Page number must be at least 1." };
    }
    updatePayload.page_number = payload.page_number;
  }

  for (const key of ["x", "y", "width", "height"] as const) {
    const value = payload[key];
    if (value !== undefined) {
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        return { success: false, error: `${key} must be a percentage between 0 and 100.` };
      }
      updatePayload[key] = clampPercent(value);
    }
  }

  if (payload.required !== undefined) {
    updatePayload.required = payload.required;
  }

  if (payload.assigned_to_role !== undefined || payload.assigned_to_client_id !== undefined) {
    if (
      payload.assigned_to_role !== undefined &&
      payload.assigned_to_role !== null &&
      !ASSIGNEE_ROLES.includes(payload.assigned_to_role)
    ) {
      return { success: false, error: "Invalid assignee role." };
    }

    // Use !== undefined so an explicit null (unassigned) is preserved —
    // `??` would incorrectly fall back to the existing role.
    const assignee = normalizeAssignee(
      payload.assigned_to_role !== undefined
        ? payload.assigned_to_role
        : (existing.assigned_to_role as DocumentFieldAssigneeRole | null),
      payload.assigned_to_client_id !== undefined
        ? payload.assigned_to_client_id
        : existing.assigned_to_client_id,
    );
    updatePayload.assigned_to_role = assignee.assigned_to_role;
    updatePayload.assigned_to_client_id = assignee.assigned_to_client_id;
  }

  if (Object.keys(updatePayload).length === 0) {
    return { success: false, error: "Nothing to update." };
  }

  const { data, error } = await supabase
    .from("document_fields")
    .update(updatePayload)
    .eq("id", fieldId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Failed to update document field:", error);
    return { success: false, error: "Failed to update field." };
  }

  if (payload.assigned_to_role !== undefined || payload.assigned_to_client_id !== undefined) {
    await syncDocumentSigners(existing.document_id);
  }

  return { success: true, data: data as DocumentField };
}

export async function deleteDocumentField(fieldId: string): Promise<ActionResult> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const { data: existing } = await supabase
    .from("document_fields")
    .select("document_id")
    .eq("id", fieldId)
    .single();

  const { error } = await supabase.from("document_fields").delete().eq("id", fieldId);

  if (error) {
    console.error("Failed to delete document field:", error);
    return { success: false, error: "Failed to delete field." };
  }

  if (existing?.document_id) {
    await syncDocumentSigners(existing.document_id);
  }

  return { success: true };
}

export async function copyDocumentFields(
  sourceDocumentId: string,
  targetDocumentId: string,
): Promise<ActionResult<{ count: number }>> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  if (sourceDocumentId === targetDocumentId) {
    return { success: false, error: "Choose a different document to copy from." };
  }

  const { document: targetDocument, error: targetError } = await getPdfDocument(
    supabase,
    targetDocumentId,
  );
  if (targetError || !targetDocument) {
    return { success: false, error: targetError ?? "Target document not found." };
  }

  const { document: sourceDocument, error: sourceError } = await getPdfDocument(
    supabase,
    sourceDocumentId,
  );
  if (sourceError || !sourceDocument) {
    return { success: false, error: sourceError ?? "Source document not found." };
  }

  const { data: sourceFields, error: fieldsError } = await supabase
    .from("document_fields")
    .select(
      "field_type, page_number, x, y, width, height, required, assigned_to_role, assigned_to_client_id",
    )
    .eq("document_id", sourceDocumentId);

  if (fieldsError) {
    console.error("Failed to load source fields:", fieldsError);
    return { success: false, error: "Failed to load source fields." };
  }

  if (!sourceFields?.length) {
    return { success: false, error: "The selected document has no fields to copy." };
  }

  const { error: deleteError } = await supabase
    .from("document_fields")
    .delete()
    .eq("document_id", targetDocumentId);

  if (deleteError) {
    console.error("Failed to clear target fields:", deleteError);
    return { success: false, error: "Failed to replace existing fields." };
  }

  const { error: insertError } = await supabase.from("document_fields").insert(
    sourceFields.map((field) => ({
      document_id: targetDocumentId,
      field_type: field.field_type,
      page_number: field.page_number,
      x: field.x,
      y: field.y,
      width: field.width,
      height: field.height,
      required: field.required,
      assigned_to_role: field.assigned_to_role ?? null,
      assigned_to_client_id: field.assigned_to_client_id ?? null,
    })),
  );

  if (insertError) {
    console.error("Failed to copy fields:", insertError);
    return { success: false, error: "Failed to copy fields." };
  }

  await syncDocumentSigners(targetDocumentId);

  return { success: true, data: { count: sourceFields.length } };
}
