"use server";

import { createClient } from "@/lib/supabase/server";
import { detectFileMimeType } from "@/lib/detect-file-type";
import {
  defaultRequiresSignature,
  isDocumentType,
  type DocumentType,
} from "@/lib/document-types";

type UploadDocumentResult =
  | {
      success: true;
      document: {
        id: string;
        type: DocumentType;
        file_url: string;
        status: string;
        created_at: string;
        file_mime_type: string | null;
        requires_signature: boolean;
      };
    }
  | { success: false; error: string };

function parseRequiresSignature(
  raw: FormDataEntryValue | null,
  docType: DocumentType,
): boolean {
  if (typeof raw !== "string") {
    return defaultRequiresSignature(docType);
  }
  const normalized = raw.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "on") return true;
  if (normalized === "false" || normalized === "0" || normalized === "off") return false;
  return defaultRequiresSignature(docType);
}

export async function uploadDocument(formData: FormData): Promise<UploadDocumentResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to upload documents." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Only admins can upload documents." };
  }

  const projectId = formData.get("projectId");
  const docType = formData.get("type");
  const file = formData.get("file");

  if (typeof projectId !== "string" || !projectId) {
    return { success: false, error: "Project is required." };
  }

  if (typeof docType !== "string" || !isDocumentType(docType)) {
    return { success: false, error: "Invalid document type." };
  }

  if (!(file instanceof File)) {
    return { success: false, error: "A file is required." };
  }

  const requiresSignature = parseRequiresSignature(
    formData.get("requiresSignature"),
    docType,
  );

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  if (bytes.length === 0) {
    return { success: false, error: "The file is empty." };
  }

  const fileMimeType = await detectFileMimeType(bytes);

  const originalName = file.name.replace(/[^\w.\-() ]+/g, "_") || "document";
  const path = `${projectId}/${Date.now()}-${originalName}`;

  const { error: uploadError } = await supabase.storage.from("documents").upload(path, bytes, {
    contentType: fileMimeType ?? "application/octet-stream",
    upsert: false,
  });

  if (uploadError) {
    console.error("Document upload failed:", uploadError);
    return { success: false, error: uploadError.message };
  }

  const { data, error: insertError } = await supabase
    .from("documents")
    .insert({
      project_id: projectId,
      type: docType,
      file_url: path,
      status: "draft",
      file_mime_type: fileMimeType,
      requires_signature: requiresSignature,
    })
    .select(
      "id, type, file_url, status, created_at, file_mime_type, requires_signature",
    )
    .single();

  if (insertError || !data) {
    console.error("Document record insert failed:", insertError);
    await supabase.storage.from("documents").remove([path]);
    return {
      success: false,
      error: insertError?.message ?? "Upload succeeded but the record failed to save.",
    };
  }

  return {
    success: true,
    document: {
      ...data,
      type: data.type as DocumentType,
      requires_signature: Boolean(data.requires_signature),
    },
  };
}
