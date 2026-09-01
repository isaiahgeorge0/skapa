"use server";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

type SignDocumentResult = { success: true } | { success: false; error: string };

export async function signDocument(
  documentId: string,
  signatureName: string,
  fileHash: string,
): Promise<SignDocumentResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to sign a document." };
  }

  if (!signatureName.trim()) {
    return { success: false, error: "Type your full name to sign." };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("id, status")
    .eq("id", documentId)
    .single();

  if (fetchError || !doc) {
    return { success: false, error: "Document not found or you don't have access to it." };
  }

  if (doc.status === "signed") {
    return { success: false, error: "This document has already been signed." };
  }

  const { error: updateError } = await supabase
    .from("documents")
    .update({
      status: "signed",
      signature_name: signatureName.trim(),
      signed_by: user.id,
      signed_at: new Date().toISOString(),
      signature_hash: fileHash,
      signer_ip: ip,
      signer_user_agent: userAgent,
    })
    .eq("id", documentId);

  if (updateError) {
    console.error("Failed to record signature:", updateError);
    return { success: false, error: "Something went wrong recording the signature. Try again." };
  }

  // Log this as an audit event too, not just a field on the document —
  // this is what lets the audit trail show a real history over time.
  await supabase.from("document_events").insert({
    document_id: documentId,
    event_type: "signed",
    actor_id: user.id,
    actor_role: "client",
    detail: `Signed by ${signatureName.trim()}`,
  });

  return { success: true };
}
