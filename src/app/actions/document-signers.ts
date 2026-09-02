"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDocumentReadyToSignEmail } from "@/lib/document-emails";
import {
  generateAndStoreCertificate,
  sha256Hex,
} from "@/lib/certificate-of-completion";
import type { DocumentSigner, DocumentSignerRole } from "@/lib/documents";
import { signerKey } from "@/lib/documents";

type ActionResult<T = void> =
  | ({ success: true } & (T extends void ? object : { data: T }))
  | { success: false; error: string };

type DesiredSigner = {
  role: DocumentSignerRole;
  client_id: string | null;
  label: string;
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, error: "You must be signed in." as string };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return {
      supabase,
      user: null,
      error: "Only admins can manage signing order." as string,
    };
  }

  return { supabase, user, error: null as string | null };
}

async function loadProjectClientOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
): Promise<{ primaryClientId: string | null; orderedClientIds: string[]; names: Map<string, string> }> {
  const { data: project } = await supabase
    .from("projects")
    .select("client_id, clients!client_id(id, name)")
    .eq("id", projectId)
    .single();

  const primaryClientId = (project?.client_id as string | null) ?? null;
  const names = new Map<string, string>();

  const primaryClient = project?.clients as
    | { id: string; name: string }
    | { id: string; name: string }[]
    | null;
  const primary =
    primaryClient == null
      ? null
      : Array.isArray(primaryClient)
        ? primaryClient[0]
        : primaryClient;
  if (primary) names.set(primary.id, primary.name);

  const { data: additionalRows } = await supabase
    .from("project_clients")
    .select("client_id, created_at, clients(id, name)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  const orderedClientIds: string[] = [];
  if (primaryClientId) orderedClientIds.push(primaryClientId);

  for (const row of additionalRows ?? []) {
    const linked = row.clients as
      | { id: string; name: string }
      | { id: string; name: string }[]
      | null;
    const client = linked == null ? null : Array.isArray(linked) ? linked[0] : linked;
    if (client) names.set(client.id, client.name);
    const clientId = (row.client_id as string) ?? client?.id;
    if (clientId && !orderedClientIds.includes(clientId)) {
      orderedClientIds.push(clientId);
    }
  }

  return { primaryClientId, orderedClientIds, names };
}

function deriveDesiredSigners(
  fields: {
    assigned_to_role: string | null;
    assigned_to_client_id: string | null;
  }[],
  primaryClientId: string | null,
  orderedClientIds: string[],
  names: Map<string, string>,
): DesiredSigner[] {
  const desired: DesiredSigner[] = [];
  const hasAdmin = fields.some((field) => field.assigned_to_role === "admin");
  if (hasAdmin) {
    desired.push({
      role: "admin",
      client_id: null,
      label: "Isaiah / Skapa (Supplier)",
    });
  }

  const clientIds = new Set<string>();
  for (const field of fields) {
    if (field.assigned_to_role !== "client") continue;
    const clientId = field.assigned_to_client_id ?? primaryClientId;
    if (clientId) clientIds.add(clientId);
  }

  for (const clientId of orderedClientIds) {
    if (!clientIds.has(clientId)) continue;
    desired.push({
      role: "client",
      client_id: clientId,
      label: names.get(clientId) ?? "Client",
    });
  }

  for (const clientId of clientIds) {
    if (orderedClientIds.includes(clientId)) continue;
    desired.push({
      role: "client",
      client_id: clientId,
      label: names.get(clientId) ?? "Client",
    });
  }

  return desired;
}

export async function syncDocumentSigners(
  documentId: string,
): Promise<ActionResult<DocumentSigner[]>> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("id, project_id, status")
    .eq("id", documentId)
    .single();

  if (docError || !document) {
    return { success: false, error: "Document not found." };
  }

  const { data: fields, error: fieldsError } = await supabase
    .from("document_fields")
    .select("assigned_to_role, assigned_to_client_id")
    .eq("document_id", documentId);

  if (fieldsError) {
    return { success: false, error: "Failed to load document fields." };
  }

  const { primaryClientId, orderedClientIds, names } = await loadProjectClientOrder(
    supabase,
    document.project_id,
  );

  const desired = deriveDesiredSigners(
    fields ?? [],
    primaryClientId,
    orderedClientIds,
    names,
  );

  const { data: existing, error: existingError } = await supabase
    .from("document_signers")
    .select("*")
    .eq("document_id", documentId)
    .order("order_index", { ascending: true });

  if (existingError) {
    return { success: false, error: "Failed to load signers." };
  }

  const existingByKey = new Map(
    (existing ?? []).map((signer) => [
      signerKey(signer.role as DocumentSignerRole, signer.client_id),
      signer,
    ]),
  );

  const routingLocked = !["draft"].includes(document.status);
  const nextRows: { role: DocumentSignerRole; client_id: string | null; order_index: number; status: string }[] =
    [];

  if (routingLocked) {
    // After send, keep existing order/status and only add newly required signers at the end.
    const kept = [...(existing ?? [])].sort(
      (a, b) => (a.order_index as number) - (b.order_index as number),
    );
    const keptKeys = new Set(
      kept.map((signer) =>
        signerKey(signer.role as DocumentSignerRole, signer.client_id),
      ),
    );

    for (const signer of kept) {
      const key = signerKey(signer.role as DocumentSignerRole, signer.client_id);
      const stillNeeded = desired.some(
        (item) => signerKey(item.role, item.client_id) === key,
      );
      if (stillNeeded) {
        nextRows.push({
          role: signer.role as DocumentSignerRole,
          client_id: signer.client_id,
          order_index: nextRows.length,
          status: signer.status,
        });
      }
    }

    for (const item of desired) {
      const key = signerKey(item.role, item.client_id);
      if (keptKeys.has(key)) continue;
      nextRows.push({
        role: item.role,
        client_id: item.client_id,
        order_index: nextRows.length,
        status: "pending",
      });
    }
  } else {
    // Draft: preserve relative order of still-needed signers, append new ones by default order.
    const preserved = (existing ?? [])
      .filter((signer) =>
        desired.some(
          (item) =>
            signerKey(item.role, item.client_id) ===
            signerKey(signer.role as DocumentSignerRole, signer.client_id),
        ),
      )
      .sort((a, b) => (a.order_index as number) - (b.order_index as number));

    const preservedKeys = new Set(
      preserved.map((signer) =>
        signerKey(signer.role as DocumentSignerRole, signer.client_id),
      ),
    );

    for (const signer of preserved) {
      nextRows.push({
        role: signer.role as DocumentSignerRole,
        client_id: signer.client_id,
        order_index: nextRows.length,
        status: "pending",
      });
    }

    for (const item of desired) {
      const key = signerKey(item.role, item.client_id);
      if (preservedKeys.has(key)) continue;
      nextRows.push({
        role: item.role,
        client_id: item.client_id,
        order_index: nextRows.length,
        status: "pending",
      });
    }

    // If nothing preserved yet, use pure default order from desired.
    if (preserved.length === 0) {
      nextRows.length = 0;
      desired.forEach((item, index) => {
        nextRows.push({
          role: item.role,
          client_id: item.client_id,
          order_index: index,
          status: "pending",
        });
      });
    }
  }

  // Replace rows while preserving ids/status where possible via delete+insert is simpler,
  // but loses signed history. Prefer upsert by matching keys for draft, and for locked
  // only insert missing / delete unused pending.
  const desiredKeys = new Set(nextRows.map((row) => signerKey(row.role, row.client_id)));

  for (const signer of existing ?? []) {
    const key = signerKey(signer.role as DocumentSignerRole, signer.client_id);
    if (!desiredKeys.has(key)) {
      if (routingLocked && signer.status !== "pending") continue;
      await supabase.from("document_signers").delete().eq("id", signer.id);
    }
  }

  for (const row of nextRows) {
    const key = signerKey(row.role, row.client_id);
    const current = existingByKey.get(key);
    if (current) {
      await supabase
        .from("document_signers")
        .update({
          order_index: row.order_index,
          ...(routingLocked ? {} : { status: "pending", signed_at: null, notified_at: null }),
        })
        .eq("id", current.id);
    } else {
      await supabase.from("document_signers").insert({
        document_id: documentId,
        role: row.role,
        client_id: row.client_id,
        order_index: row.order_index,
        status: row.status,
      });
    }
  }

  return listDocumentSigners(documentId);
}

export async function listDocumentSigners(
  documentId: string,
): Promise<ActionResult<DocumentSigner[]>> {
  const supabase = await createClient();
  const { data: document } = await supabase
    .from("documents")
    .select("project_id")
    .eq("id", documentId)
    .single();

  if (!document) return { success: false, error: "Document not found." };

  const { names } = await loadProjectClientOrder(supabase, document.project_id);

  const { data, error } = await supabase
    .from("document_signers")
    .select("*")
    .eq("document_id", documentId)
    .order("order_index", { ascending: true });

  if (error) return { success: false, error: "Failed to load signers." };

  const signers = (data ?? []).map((signer) => ({
    ...(signer as DocumentSigner),
    display_name:
      signer.role === "admin"
        ? "Isaiah / Skapa (Supplier)"
        : names.get(signer.client_id as string) ?? "Client",
  }));

  return { success: true, data: signers };
}

export async function reorderDocumentSigners(
  documentId: string,
  orderedSignerIds: string[],
): Promise<ActionResult<DocumentSigner[]>> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const { data: document } = await supabase
    .from("documents")
    .select("status")
    .eq("id", documentId)
    .single();

  if (!document) return { success: false, error: "Document not found." };
  if (document.status !== "draft") {
    return { success: false, error: "Signing order can only be changed before sending." };
  }

  const { data: existing } = await supabase
    .from("document_signers")
    .select("id")
    .eq("document_id", documentId);

  const existingIds = new Set((existing ?? []).map((row) => row.id as string));
  if (
    orderedSignerIds.length !== existingIds.size ||
    orderedSignerIds.some((id) => !existingIds.has(id))
  ) {
    return { success: false, error: "Invalid signer order." };
  }

  for (const [index, id] of orderedSignerIds.entries()) {
    const { error } = await supabase
      .from("document_signers")
      .update({ order_index: index })
      .eq("id", id)
      .eq("document_id", documentId);
    if (error) {
      console.error("Failed to reorder signer:", error);
      return { success: false, error: "Failed to update signing order." };
    }
  }

  return listDocumentSigners(documentId);
}

async function notifySigner(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  documentId: string,
  signer: {
    id: string;
    role: string;
    client_id: string | null;
  },
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .from("document_signers")
    .update({ status: "sent", notified_at: now })
    .eq("id", signer.id);

  if (signer.role !== "client" || !signer.client_id) return;

  const { data: document } = await db
    .from("documents")
    .select("id, type, project_id, projects(name)")
    .eq("id", documentId)
    .single();

  if (!document) return;

  const { data: client } = await db
    .from("clients")
    .select("id, name, email")
    .eq("id", signer.client_id)
    .single();

  if (!client?.email) return;

  const projectData = document.projects as { name: string } | { name: string }[] | null;
  const projectName = Array.isArray(projectData)
    ? projectData[0]?.name
    : projectData?.name;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skapa.uk";
  const signUrl = `${siteUrl}/portal/projects/${document.project_id}?document=${documentId}`;

  await sendDocumentReadyToSignEmail({
    to: client.email,
    documentName: String(document.type),
    projectName: projectName ?? "your project",
    signUrl,
  });
}

export async function sendDocumentForSigning(
  documentId: string,
): Promise<ActionResult<{ status: string }>> {
  const { supabase, user, error: authError } = await requireAdmin();
  if (authError || !user) return { success: false, error: authError ?? "Unauthorized" };

  const { data: fields, error: fieldsError } = await supabase
    .from("document_fields")
    .select("id, field_type, page_number, required, assigned_to_role")
    .eq("document_id", documentId);

  if (fieldsError) {
    return { success: false, error: "Failed to load document fields." };
  }

  const unassignedRequired = (fields ?? []).filter(
    (field) => field.required && !field.assigned_to_role,
  );

  if (unassignedRequired.length > 0) {
    const list = unassignedRequired
      .map((field) => {
        const type =
          field.field_type === "signature"
            ? "Signature"
            : field.field_type === "date"
              ? "Date"
              : "Text";
        return `${type} (page ${field.page_number})`;
      })
      .join(", ");
    return {
      success: false,
      error: `Assign every required field before sending. Unassigned: ${list}.`,
    };
  }

  const sync = await syncDocumentSigners(documentId);
  if (!sync.success) return sync;

  const signers = sync.data;
  if (signers.length === 0) {
    return {
      success: false,
      error: "Add and assign at least one signature field before sending.",
    };
  }

  // Reset queue to pending, then activate first signer.
  await supabase
    .from("document_signers")
    .update({ status: "pending", signed_at: null, notified_at: null })
    .eq("document_id", documentId);

  const first = [...signers].sort((a, b) => a.order_index - b.order_index)[0];
  await notifySigner(supabase, documentId, first);

  const { error: updateError } = await supabase
    .from("documents")
    .update({ status: "sent" })
    .eq("id", documentId);

  if (updateError) {
    return { success: false, error: "Failed to update document status." };
  }

  await supabase.from("document_events").insert({
    document_id: documentId,
    event_type: "sent",
    actor_id: user.id,
    actor_role: "admin",
    detail: `Sent for signing. First signer: ${first.display_name ?? first.role}`,
  });

  return { success: true, data: { status: "sent" } };
}

export async function advanceSigningQueue(
  documentId: string,
  completedSignerId: string,
): Promise<ActionResult<{ documentStatus: string; nextSignerName: string | null }>> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const actorRole = profile?.role === "admin" ? "admin" : "client";

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  const now = new Date().toISOString();

  const { error: completeError } = await supabase
    .from("document_signers")
    .update({
      status: "signed",
      signed_at: now,
      signer_ip: ip,
      signer_user_agent: userAgent,
    })
    .eq("id", completedSignerId)
    .eq("document_id", documentId);

  if (completeError) {
    console.error("Failed to mark signer complete with IP/UA:", completeError);
    return { success: false, error: "Failed to mark signer as complete." };
  }

  const { data: signers } = await supabase
    .from("document_signers")
    .select("*")
    .eq("document_id", documentId)
    .order("order_index", { ascending: true });

  const next = (signers ?? []).find((signer) => signer.status !== "signed");

  if (!next) {
    const { data: document } = await supabase
      .from("documents")
      .select("id, file_url, project_id, signature_hash")
      .eq("id", documentId)
      .single();

    let signatureHash = document?.signature_hash as string | null;
    if (document && !signatureHash) {
      const { data: fileBlob } = await admin.storage
        .from("documents")
        .download(document.file_url);
      if (fileBlob) {
        const bytes = new Uint8Array(await fileBlob.arrayBuffer());
        signatureHash = sha256Hex(bytes);
      }
    }

    // Do not write signer_ip / signer_user_agent onto documents —
    // each signer's IP/UA lives on their document_signers row.
    await supabase
      .from("documents")
      .update({
        status: "signed",
        signed_at: now,
        signed_by: user.id,
        ...(signatureHash ? { signature_hash: signatureHash } : {}),
      })
      .eq("id", documentId);

    await supabase.from("document_events").insert({
      document_id: documentId,
      event_type: "signed",
      actor_id: user.id,
      actor_role: actorRole,
      detail: "All signers completed",
    });

    // Generate once after the document is fully signed.
    const certificate = await generateAndStoreCertificate(documentId);
    if (!certificate.success) {
      console.error("Certificate generation failed:", certificate.error);
    }

    return { success: true, data: { documentStatus: "signed", nextSignerName: null } };
  }

  // Use service role for notify status update + email so clients can advance the queue.
  await notifySigner(admin, documentId, {
    id: next.id,
    role: next.role,
    client_id: next.client_id,
  });

  await supabase
    .from("documents")
    .update({ status: "partially_signed" })
    .eq("id", documentId);

  const list = await listDocumentSigners(documentId);
  const nextName =
    list.success
      ? (list.data.find((signer) => signer.id === next.id)?.display_name ?? next.role)
      : next.role;

  await supabase.from("document_events").insert({
    document_id: documentId,
    event_type: "status_changed",
    actor_id: user.id,
    actor_role: actorRole,
    detail: `Partially signed — waiting on ${nextName}`,
  });

  return {
    success: true,
    data: { documentStatus: "partially_signed", nextSignerName: nextName },
  };
}

export async function finishDocumentFieldEditing(
  documentId: string,
): Promise<
  ActionResult<{
    fieldCount: number;
    signingOrder: string[];
    summary: string;
  }>
> {
  const { supabase, user, error: authError } = await requireAdmin();
  if (authError || !user) return { success: false, error: authError ?? "Unauthorized" };

  const { data: fields, error: fieldsError } = await supabase
    .from("document_fields")
    .select("id, field_type, page_number, required, assigned_to_role")
    .eq("document_id", documentId);

  if (fieldsError) {
    return { success: false, error: "Failed to load document fields." };
  }

  const allFields = fields ?? [];
  const unassignedRequired = allFields.filter(
    (field) => field.required && !field.assigned_to_role,
  );

  if (unassignedRequired.length > 0) {
    const list = unassignedRequired
      .map((field) => {
        const type =
          field.field_type === "signature"
            ? "Signature"
            : field.field_type === "date"
              ? "Date"
              : "Text";
        return `${type} (page ${field.page_number})`;
      })
      .join(", ");
    return {
      success: false,
      error: `Assign every required field before finishing. Unassigned: ${list}.`,
    };
  }

  if (allFields.length === 0) {
    return {
      success: false,
      error: "Place at least one field before finishing.",
    };
  }

  const sync = await syncDocumentSigners(documentId);
  if (!sync.success) return sync;

  const signingOrder = sync.data.map(
    (signer) =>
      signer.display_name ??
      (signer.role === "admin" ? "Isaiah / Skapa (Supplier)" : "Client"),
  );

  const orderText =
    signingOrder.length > 0 ? signingOrder.join(" → ") : "No signers derived";

  return {
    success: true,
    data: {
      fieldCount: allFields.length,
      signingOrder,
      summary: `${allFields.length} field${allFields.length === 1 ? "" : "s"} placed. Signing order: ${orderText}.`,
    },
  };
}
