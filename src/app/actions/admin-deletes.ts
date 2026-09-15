"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DOCUMENT_SIGNED_DATA_DELETE_MESSAGE,
  PROJECT_SIGNED_DATA_DELETE_MESSAGE,
} from "@/lib/admin-delete-messages";
import { revalidateDocumentPaths } from "@/lib/revalidate-documents";

type ActionResult<T = void> =
  | ({ success: true } & (T extends void ? object : { data: T }))
  | { success: false; error: string };

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

function looksLikeSignedDataBlock(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("permanent evidence") ||
    lower.includes("cannot be modified or deleted") ||
    lower.includes("submitted field values") ||
    lower.includes("signature evidence")
  );
}

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
      error: "Only admins can delete this." as string,
    };
  }

  return { supabase, user, error: null as string | null };
}

function revalidateProjectSurfaces(projectId: string) {
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}/messages`);
  revalidatePath(`/admin/projects/${projectId}/requests`);
  revalidatePath(`/admin/projects/${projectId}/tasks`);
  revalidatePath(`/admin/projects/${projectId}/notes`);
  revalidatePath(`/admin/projects/${projectId}/documents`);
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}/messages`);
  revalidatePath(`/portal/projects/${projectId}/requests`);
  revalidatePath(`/portal/projects/${projectId}/documents`);
  revalidateDocumentPaths(projectId);
}

/** Delete documents that have zero field values. Removes storage files too. */
export async function deleteDocuments(
  documentIds: string[],
): Promise<ActionResult<{ deletedIds: string[] }>> {
  const ids = uniqueIds(documentIds);
  if (ids.length === 0) return { success: true, data: { deletedIds: [] } };

  const { error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const db = createAdminClient();

  const { data: docs, error: loadError } = await db
    .from("documents")
    .select("id, project_id, file_url")
    .in("id", ids);

  if (loadError) return { success: false, error: loadError.message };
  if (!docs || docs.length === 0) {
    return { success: true, data: { deletedIds: [] } };
  }

  const { count: valueCount, error: countError } = await db
    .from("document_field_values")
    .select("id", { count: "exact", head: true })
    .in("document_id", docs.map((d) => d.id));

  if (countError) return { success: false, error: countError.message };

  if ((valueCount ?? 0) > 0) {
    return { success: false, error: DOCUMENT_SIGNED_DATA_DELETE_MESSAGE };
  }

  // Whole-document signatures (no field placements) also count as signed data.
  const { data: signedDocs } = await db
    .from("documents")
    .select("id")
    .in(
      "id",
      docs.map((d) => d.id),
    )
    .not("signed_at", "is", null);

  if ((signedDocs ?? []).length > 0) {
    return { success: false, error: DOCUMENT_SIGNED_DATA_DELETE_MESSAGE };
  }

  const storagePaths = docs
    .map((d) => d.file_url)
    .filter((path): path is string => Boolean(path?.trim()));

  const { error: deleteError } = await db.from("documents").delete().in(
    "id",
    docs.map((d) => d.id),
  );

  if (deleteError) {
    if (looksLikeSignedDataBlock(deleteError.message)) {
      return { success: false, error: DOCUMENT_SIGNED_DATA_DELETE_MESSAGE };
    }
    return { success: false, error: deleteError.message };
  }

  if (storagePaths.length > 0) {
    const { error: storageError } = await db.storage
      .from("documents")
      .remove(storagePaths);
    if (storageError) {
      console.error("Document rows deleted but storage cleanup failed:", storageError);
    }
  }

  const projectIds = [...new Set(docs.map((d) => d.project_id))];
  for (const projectId of projectIds) {
    revalidateProjectSurfaces(projectId);
  }

  return { success: true, data: { deletedIds: docs.map((d) => d.id) } };
}

export async function deleteMessages(
  messageIds: string[],
): Promise<ActionResult<{ deletedIds: string[] }>> {
  const ids = uniqueIds(messageIds);
  if (ids.length === 0) return { success: true, data: { deletedIds: [] } };

  const { error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const db = createAdminClient();
  const { data: rows, error: loadError } = await db
    .from("messages")
    .select("id, project_id")
    .in("id", ids);

  if (loadError) return { success: false, error: loadError.message };
  if (!rows || rows.length === 0) {
    return { success: true, data: { deletedIds: [] } };
  }

  const { error } = await db
    .from("messages")
    .delete()
    .in(
      "id",
      rows.map((r) => r.id),
    );

  if (error) return { success: false, error: error.message };

  for (const projectId of [...new Set(rows.map((r) => r.project_id))]) {
    revalidateProjectSurfaces(projectId);
  }

  return { success: true, data: { deletedIds: rows.map((r) => r.id) } };
}

export async function deleteProjectRequests(
  requestIds: string[],
): Promise<ActionResult<{ deletedIds: string[] }>> {
  const ids = uniqueIds(requestIds);
  if (ids.length === 0) return { success: true, data: { deletedIds: [] } };

  const { error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const db = createAdminClient();
  const { data: rows, error: loadError } = await db
    .from("project_requests")
    .select("id, project_id")
    .in("id", ids);

  if (loadError) return { success: false, error: loadError.message };
  if (!rows || rows.length === 0) {
    return { success: true, data: { deletedIds: [] } };
  }

  const { error } = await db
    .from("project_requests")
    .delete()
    .in(
      "id",
      rows.map((r) => r.id),
    );

  if (error) return { success: false, error: error.message };

  for (const projectId of [...new Set(rows.map((r) => r.project_id))]) {
    revalidateProjectSurfaces(projectId);
  }

  return { success: true, data: { deletedIds: rows.map((r) => r.id) } };
}

export async function deleteProjectTasks(
  taskIds: string[],
): Promise<ActionResult<{ deletedIds: string[] }>> {
  const ids = uniqueIds(taskIds);
  if (ids.length === 0) return { success: true, data: { deletedIds: [] } };

  const { error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const db = createAdminClient();
  const { data: rows, error: loadError } = await db
    .from("project_tasks")
    .select("id, project_id")
    .in("id", ids);

  if (loadError) return { success: false, error: loadError.message };
  if (!rows || rows.length === 0) {
    return { success: true, data: { deletedIds: [] } };
  }

  const { error } = await db
    .from("project_tasks")
    .delete()
    .in(
      "id",
      rows.map((r) => r.id),
    );

  if (error) return { success: false, error: error.message };

  for (const projectId of [...new Set(rows.map((r) => r.project_id))]) {
    revalidateProjectSurfaces(projectId);
  }

  return { success: true, data: { deletedIds: rows.map((r) => r.id) } };
}

export async function deleteProjectNotes(
  noteIds: string[],
): Promise<ActionResult<{ deletedIds: string[] }>> {
  const ids = uniqueIds(noteIds);
  if (ids.length === 0) return { success: true, data: { deletedIds: [] } };

  const { error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const db = createAdminClient();
  const { data: rows, error: loadError } = await db
    .from("project_notes")
    .select("id, project_id")
    .in("id", ids);

  if (loadError) return { success: false, error: loadError.message };
  if (!rows || rows.length === 0) {
    return { success: true, data: { deletedIds: [] } };
  }

  const { error } = await db
    .from("project_notes")
    .delete()
    .in(
      "id",
      rows.map((r) => r.id),
    );

  if (error) return { success: false, error: error.message };

  for (const projectId of [...new Set(rows.map((r) => r.project_id))]) {
    revalidateProjectSurfaces(projectId);
  }

  return { success: true, data: { deletedIds: rows.map((r) => r.id) } };
}

export async function deleteProjects(
  projectIds: string[],
): Promise<ActionResult<{ deletedIds: string[] }>> {
  const ids = uniqueIds(projectIds);
  if (ids.length === 0) return { success: true, data: { deletedIds: [] } };

  const { error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const db = createAdminClient();

  // Pre-check for documents with field values or whole-doc signatures —
  // cascading delete would hit the field-value immutability trigger.
  const { data: docs } = await db
    .from("documents")
    .select("id, project_id, signed_at")
    .in("project_id", ids);

  const docIds = (docs ?? []).map((d) => d.id);
  if (docIds.length > 0) {
    const { count } = await db
      .from("document_field_values")
      .select("id", { count: "exact", head: true })
      .in("document_id", docIds);

    if ((count ?? 0) > 0 || (docs ?? []).some((d) => d.signed_at)) {
      return { success: false, error: PROJECT_SIGNED_DATA_DELETE_MESSAGE };
    }
  }

  const { data: docsWithFiles } = await db
    .from("documents")
    .select("id, file_url")
    .in("project_id", ids);

  const uniquePaths = [
    ...new Set(
      (docsWithFiles ?? [])
        .map((d) => d.file_url)
        .filter((path): path is string => Boolean(path?.trim())),
    ),
  ];

  const { error } = await db.from("projects").delete().in("id", ids);

  if (error) {
    if (looksLikeSignedDataBlock(error.message)) {
      return { success: false, error: PROJECT_SIGNED_DATA_DELETE_MESSAGE };
    }
    return { success: false, error: error.message };
  }

  if (uniquePaths.length > 0) {
    const { error: storageError } = await db.storage
      .from("documents")
      .remove(uniquePaths);
    if (storageError) {
      console.error("Projects deleted but storage cleanup failed:", storageError);
    }
  }

  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  revalidatePath("/portal");
  for (const projectId of ids) {
    revalidateProjectSurfaces(projectId);
  }

  return { success: true, data: { deletedIds: ids } };
}
