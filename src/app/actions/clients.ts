"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export type ClientDeletionImpact = {
  clientId: string;
  clientName: string;
  primaryProjects: {
    id: string;
    name: string;
    documents: number;
    signedAgreements: number;
    tasks: number;
    messages: number;
    notes: number;
  }[];
  additionalProjectCount: number;
  totals: {
    projects: number;
    documents: number;
    signedAgreements: number;
    tasks: number;
    messages: number;
    notes: number;
  };
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: "Unauthorized" as const };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { supabase, error: "Unauthorized" as const };
  }

  return { supabase, error: null };
}

function uniqueIds(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export async function getClientDeletionImpacts(
  clientIds: string[],
): Promise<ActionResult<ClientDeletionImpact[]>> {
  const ids = uniqueIds(clientIds);
  if (ids.length === 0) {
    return { success: true, data: [] };
  }

  const { supabase, error: authError } = await requireAdmin();
  if (authError) {
    return { success: false, error: authError };
  }

  const [{ data: clients, error: clientsError }, { data: primaryProjects, error: projectsError }, { data: secondaryLinks, error: secondaryError }] =
    await Promise.all([
      supabase.from("clients").select("id, name").in("id", ids),
      supabase.from("projects").select("id, name, client_id").in("client_id", ids),
      supabase.from("project_clients").select("project_id, client_id").in("client_id", ids),
    ]);

  if (clientsError) return { success: false, error: clientsError.message };
  if (projectsError) return { success: false, error: projectsError.message };
  if (secondaryError) return { success: false, error: secondaryError.message };

  const projectIds = (primaryProjects ?? []).map((project) => project.id);

  const [documentsResult, tasksResult, messagesResult, notesResult] =
    projectIds.length > 0
      ? await Promise.all([
          supabase.from("documents").select("project_id, type, status").in("project_id", projectIds),
          supabase.from("project_tasks").select("project_id").in("project_id", projectIds),
          supabase.from("messages").select("project_id").in("project_id", projectIds),
          supabase.from("project_notes").select("project_id").in("project_id", projectIds),
        ])
      : [
          { data: [], error: null },
          { data: [], error: null },
          { data: [], error: null },
          { data: [], error: null },
        ];

  if (documentsResult.error) return { success: false, error: documentsResult.error.message };
  if (tasksResult.error) return { success: false, error: tasksResult.error.message };
  if (messagesResult.error) return { success: false, error: messagesResult.error.message };
  if (notesResult.error) return { success: false, error: notesResult.error.message };

  const documentsByProject = new Map<string, { documents: number; signedAgreements: number }>();
  for (const row of documentsResult.data ?? []) {
    const current = documentsByProject.get(row.project_id) ?? { documents: 0, signedAgreements: 0 };
    current.documents += 1;
    if (row.type === "agreement" && row.status === "signed") {
      current.signedAgreements += 1;
    }
    documentsByProject.set(row.project_id, current);
  }

  const tasksByProject = new Map<string, number>();
  for (const row of tasksResult.data ?? []) {
    tasksByProject.set(row.project_id, (tasksByProject.get(row.project_id) ?? 0) + 1);
  }

  const messagesByProject = new Map<string, number>();
  for (const row of messagesResult.data ?? []) {
    messagesByProject.set(row.project_id, (messagesByProject.get(row.project_id) ?? 0) + 1);
  }

  const notesByProject = new Map<string, number>();
  for (const row of notesResult.data ?? []) {
    notesByProject.set(row.project_id, (notesByProject.get(row.project_id) ?? 0) + 1);
  }

  const primaryProjectsByClient = new Map<string, ClientDeletionImpact["primaryProjects"]>();
  for (const project of primaryProjects ?? []) {
    primaryProjectsByClient.set(project.client_id, [
      ...(primaryProjectsByClient.get(project.client_id) ?? []),
      {
        id: project.id,
        name: project.name,
        documents: documentsByProject.get(project.id)?.documents ?? 0,
        signedAgreements: documentsByProject.get(project.id)?.signedAgreements ?? 0,
        tasks: tasksByProject.get(project.id) ?? 0,
        messages: messagesByProject.get(project.id) ?? 0,
        notes: notesByProject.get(project.id) ?? 0,
      },
    ]);
  }

  const additionalProjectCountByClient = new Map<string, number>();
  for (const link of secondaryLinks ?? []) {
    additionalProjectCountByClient.set(
      link.client_id,
      (additionalProjectCountByClient.get(link.client_id) ?? 0) + 1,
    );
  }

  const impacts = ids.flatMap((clientId) => {
    const client = (clients ?? []).find((entry) => entry.id === clientId);
    if (!client) return [];

    const projectBreakdown = primaryProjectsByClient.get(clientId) ?? [];
    return [
      {
        clientId,
        clientName: client.name,
        primaryProjects: projectBreakdown,
        additionalProjectCount: additionalProjectCountByClient.get(clientId) ?? 0,
        totals: projectBreakdown.reduce(
          (totals, project) => ({
            projects: totals.projects + 1,
            documents: totals.documents + project.documents,
            signedAgreements: totals.signedAgreements + project.signedAgreements,
            tasks: totals.tasks + project.tasks,
            messages: totals.messages + project.messages,
            notes: totals.notes + project.notes,
          }),
          {
            projects: 0,
            documents: 0,
            signedAgreements: 0,
            tasks: 0,
            messages: 0,
            notes: 0,
          },
        ),
      },
    ];
  });

  return { success: true, data: impacts };
}

export async function deleteClients(
  clientIds: string[],
  deletePrimaryProjects: boolean,
): Promise<ActionResult<{ deletedClientIds: string[] }>> {
  const ids = uniqueIds(clientIds);
  if (ids.length === 0) {
    return { success: true, data: { deletedClientIds: [] } };
  }

  const { supabase, error: authError } = await requireAdmin();
  if (authError) {
    return { success: false, error: authError };
  }

  const preview = await getClientDeletionImpacts(ids);
  if (!preview.success) {
    return preview;
  }

  const clientsWithPrimaryProjects = preview.data.filter((impact) => impact.totals.projects > 0);
  if (clientsWithPrimaryProjects.length > 0 && !deletePrimaryProjects) {
    return {
      success: false,
      error: "One or more clients still have primary projects. Delete those projects explicitly or reassign the project client first.",
    };
  }

  const primaryProjectIds = clientsWithPrimaryProjects.flatMap((impact) =>
    impact.primaryProjects.map((project) => project.id),
  );

  const linkedProjectIdsResult = await supabase
    .from("project_clients")
    .select("project_id")
    .in("client_id", ids);

  if (linkedProjectIdsResult.error) {
    return { success: false, error: linkedProjectIdsResult.error.message };
  }

  const linkedProjectIds = [...new Set((linkedProjectIdsResult.data ?? []).map((row) => row.project_id))];

  const { error: unlinkProfilesError } = await supabase
    .from("profiles")
    .update({ client_id: null })
    .in("client_id", ids);

  if (unlinkProfilesError) {
    return { success: false, error: unlinkProfilesError.message };
  }

  const { error: deleteInvitesError } = await supabase
    .from("client_invites")
    .delete()
    .in("client_id", ids);

  if (deleteInvitesError) {
    return { success: false, error: deleteInvitesError.message };
  }

  const { error: removeSecondaryLinksError } = await supabase
    .from("project_clients")
    .delete()
    .in("client_id", ids);

  if (removeSecondaryLinksError) {
    return { success: false, error: removeSecondaryLinksError.message };
  }

  if (primaryProjectIds.length > 0) {
    const { error: deleteProjectsError } = await supabase
      .from("projects")
      .delete()
      .in("id", primaryProjectIds);

    if (deleteProjectsError) {
      return { success: false, error: deleteProjectsError.message };
    }
  }

  const { error: deleteClientsError } = await supabase.from("clients").delete().in("id", ids);
  if (deleteClientsError) {
    return { success: false, error: deleteClientsError.message };
  }

  revalidatePath("/admin/clients");
  revalidatePath("/admin/projects");

  for (const clientId of ids) {
    revalidatePath(`/admin/clients/${clientId}`);
  }

  for (const projectId of [...new Set([...primaryProjectIds, ...linkedProjectIds])]) {
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/admin/projects/${projectId}/access`);
  }

  return { success: true, data: { deletedClientIds: ids } };
}

export async function addClientsToProject(
  clientIds: string[],
  projectId: string,
): Promise<ActionResult<{ addedClientIds: string[] }>> {
  const ids = uniqueIds(clientIds);
  if (ids.length === 0) {
    return { success: true, data: { addedClientIds: [] } };
  }

  if (!projectId.trim()) {
    return { success: false, error: "Choose a project first." };
  }

  const { supabase, error: authError } = await requireAdmin();
  if (authError) {
    return { success: false, error: authError };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, client_id")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return { success: false, error: projectError?.message ?? "Project not found." };
  }

  const rows = ids
    .filter((clientId) => clientId !== project.client_id)
    .map((clientId) => ({ project_id: projectId, client_id: clientId }));

  if (rows.length === 0) {
    return { success: true, data: { addedClientIds: [] } };
  }

  const { error: insertError } = await supabase
    .from("project_clients")
    .upsert(rows, { onConflict: "project_id,client_id", ignoreDuplicates: true });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}/access`);

  return {
    success: true,
    data: { addedClientIds: rows.map((row) => row.client_id) },
  };
}
