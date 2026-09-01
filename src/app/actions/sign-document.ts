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

  // Capture these server-side, not from the browser — a client can lie
  // about its own IP/user-agent, but it can't fake what actually arrived
  // in the request headers.
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  // Confirm this document actually belongs to a project this user has
  // access to — RLS on the update below enforces this too, but checking
  // explicitly here gives a clean error message instead of a silent no-op.
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

  return { success: true };
}
