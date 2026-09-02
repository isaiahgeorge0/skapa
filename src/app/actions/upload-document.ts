"use server";

import { createClient } from "@/lib/supabase/server";
import { detectFileMimeType } from "@/lib/detect-file-type";

type DocType = "proposal" | "agreement" | "welcome" | "invoice" | "other";

type UploadDocumentResult =
  | {
      success: true;
      document: {
        id: string;
        type: DocType;
        file_url: string;
        status: string;
        created_at: string;
        file_mime_type: string | null;
      };
    }
  | { success: false; error: string };

const DOC_TYPES: DocType[] = ["proposal", "agreement", "welcome", "invoice", "other"];

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

  if (typeof docType !== "string" || !DOC_TYPES.includes(docType as DocType)) {
    return { success: false, error: "Invalid document type." };
  }

  if (!(file instanceof File)) {
    return { success: false, error: "A file is required." };
  }

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
    })
    .select("id, type, file_url, status, created_at, file_mime_type")
    .single();

  if (insertError || !data) {
    console.error("Document record insert failed:", insertError);
    await supabase.storage.from("documents").remove([path]);
    return {
      success: false,
      error: insertError?.message ?? "Upload succeeded but the record failed to save.",
    };
  }

  return { success: true, document: data };
}
