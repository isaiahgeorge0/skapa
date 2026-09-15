"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isProjectRequestStatus,
  type ProjectRequest,
} from "@/lib/project-request-status";

type ActionResult =
  | { success: true; request?: ProjectRequest }
  | { success: false; error: string };

const REQUEST_SELECT =
  "id, project_id, client_id, title, description, status, admin_response, responded_at, created_at";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null as null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, client_id")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, user, profile };
}

async function clientCanAccessProject(
  clientId: string,
  projectId: string,
): Promise<boolean> {
  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("id, client_id")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return false;
  if (project.client_id === clientId) return true;
  const { data: link } = await admin
    .from("project_clients")
    .select("project_id")
    .eq("project_id", projectId)
    .eq("client_id", clientId)
    .maybeSingle();
  return Boolean(link);
}

export async function submitProjectRequest(
  projectId: string,
  title: string,
  description: string,
): Promise<ActionResult> {
  const { user, profile } = await requireUser();
  if (!user) return { success: false, error: "You must be signed in." };
  if (!profile?.client_id) {
    return { success: false, error: "Your account is not linked to a client." };
  }

  const trimmedTitle = title.trim();
  if (!trimmedTitle) return { success: false, error: "Add a short title for the request." };
  if (trimmedTitle.length > 120) {
    return { success: false, error: "Keep the title under 120 characters." };
  }

  const allowed = await clientCanAccessProject(profile.client_id, projectId);
  if (!allowed) {
    return { success: false, error: "You do not have access to this project." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("project_requests")
    .insert({
      project_id: projectId,
      client_id: profile.client_id,
      title: trimmedTitle,
      description: description.trim() || null,
      status: "new",
    })
    .select(REQUEST_SELECT)
    .single();

  if (error || !data) {
    console.error("submitProjectRequest:", error);
    return { success: false, error: "Could not send the request. Try again." };
  }

  return { success: true, request: data as ProjectRequest };
}

export async function updateProjectRequestStatus(
  requestId: string,
  status: string,
  adminResponse: string,
): Promise<ActionResult> {
  const { user, profile } = await requireUser();
  if (!user) return { success: false, error: "You must be signed in." };
  if (profile?.role !== "admin") {
    return { success: false, error: "Only admin can update requests." };
  }

  if (!isProjectRequestStatus(status)) {
    return {
      success: false,
      error: `Invalid status "${status}". Use new, in review, accepted, declined, or completed.`,
    };
  }

  const payload: Record<string, unknown> = { status };
  const response = adminResponse.trim();
  if (response) {
    payload.admin_response = response;
    payload.responded_at = new Date().toISOString();
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("project_requests")
    .update(payload)
    .eq("id", requestId)
    .select(REQUEST_SELECT)
    .single();

  if (error || !data) {
    console.error("updateProjectRequestStatus:", error);
    const detail = error?.message?.trim();
    return {
      success: false,
      error: detail
        ? `Could not update the request: ${detail}`
        : "Could not update the request. Try again.",
    };
  }

  return { success: true, request: data as ProjectRequest };
}
