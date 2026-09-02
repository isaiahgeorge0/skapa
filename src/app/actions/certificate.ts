"use server";

import { createClient } from "@/lib/supabase/server";
import {
  certificateStoragePath,
  generateAndStoreCertificate,
} from "@/lib/certificate-of-completion";

type ActionResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function getCertificateDownloadUrl(
  documentId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in." };
  }

  const { data: document, error } = await supabase
    .from("documents")
    .select("id, project_id, status")
    .eq("id", documentId)
    .single();

  if (error || !document) {
    return { success: false, error: "Document not found or you don't have access." };
  }

  if (document.status !== "signed") {
    return { success: false, error: "Certificate is only available after signing is complete." };
  }

  const path = certificateStoragePath(document.project_id, documentId);

  // If missing (e.g. legacy signed doc), generate once now.
  const { data: listed } = await supabase.storage
    .from("documents")
    .list(`${document.project_id}/certificates`, {
      search: `${documentId}-certificate`,
    });

  const exists = listed?.some((file) => file.name === `${documentId}-certificate.pdf`);
  if (!exists) {
    const generated = await generateAndStoreCertificate(documentId);
    if (!generated.success) {
      return { success: false, error: generated.error };
    }
  }

  const { data, error: signError } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, 120);

  if (signError || !data?.signedUrl) {
    return { success: false, error: "Couldn't create a download link for the certificate." };
  }

  return { success: true, url: data.signedUrl };
}
