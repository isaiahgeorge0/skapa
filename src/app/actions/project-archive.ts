"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult =
  | { success: true; archivedAt: string | null }
  | { success: false; error: string };

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." as string };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only admins can archive projects." as string };
  }

  return { error: null as string | null };
}

function revalidateArchiveSurfaces(projectIds: string[]) {
  revalidatePath("/admin/projects");
  for (const projectId of projectIds) {
    revalidatePath(`/admin/projects/${projectId}`);
  }
}

async function setProjectsArchived(
  projectIds: string[],
  archived: boolean,
): Promise<ActionResult> {
  const ids = uniqueIds(projectIds);
  if (ids.length === 0) {
    return { success: true, archivedAt: archived ? new Date().toISOString() : null };
  }

  const auth = await requireAdmin();
  if (auth.error) return { success: false, error: auth.error };

  const archivedAt = archived ? new Date().toISOString() : null;
  const db = createAdminClient();

  const { error } = await db
    .from("projects")
    .update({ archived_at: archivedAt })
    .in("id", ids);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateArchiveSurfaces(ids);
  return { success: true, archivedAt };
}

/** Soft-hide projects from the default admin list. Does not touch documents or portal access. */
export async function archiveProjects(
  projectIds: string[],
): Promise<ActionResult> {
  return setProjectsArchived(projectIds, true);
}

/** Restore projects to the default admin list. */
export async function unarchiveProjects(
  projectIds: string[],
): Promise<ActionResult> {
  return setProjectsArchived(projectIds, false);
}
