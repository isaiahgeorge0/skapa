import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import PhaseTracker, { type Phase } from "@/components/PhaseTracker";
import EditableDetails from "@/components/EditableDetails";
import AssignedClients from "@/components/AssignedClients";
import Card from "@/components/Card";
import ProjectAlertsRow from "@/components/ProjectAlertsRow";
import OverviewPreviewCard from "@/components/OverviewPreviewCard";
import { buildAdminProjectAlerts } from "@/lib/project-alerts";
import { PHASES } from "@/lib/project-phases";
import type { ProjectRequest } from "@/lib/project-request-status";

const PHASE_LABELS = Object.fromEntries(
  PHASES.map((p) => [p.key, p.label]),
) as Record<string, string>;

const REQUEST_STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_review: "In review",
  accepted: "Accepted",
  declined: "Declined",
  completed: "Completed",
};

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, name, service_type, phase, target_completion_date, client_id, clients!client_id(id, name, email)",
    )
    .eq("id", id)
    .single();

  if (!project) return null;

  const [
    { data: additionalRows },
    { data: allClients },
    { data: messages },
    { data: documents },
    { data: requests },
  ] = await Promise.all([
    supabase.from("project_clients").select("clients(id, name, email)").eq("project_id", id),
    supabase.from("clients").select("id, name, email").order("name"),
    supabase
      .from("messages")
      .select("id, sender_id, sender_role, body, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("documents")
      .select("id, type, status, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    admin
      .from("project_requests")
      .select(
        "id, project_id, client_id, title, description, status, admin_response, responded_at, created_at",
      )
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
  ]);

  // Chronological for alert "last message" check
  const { data: allMessagesAsc } = await supabase
    .from("messages")
    .select("sender_role, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  const client = (
    project as unknown as {
      clients: { id: string; name: string; email: string | null } | null;
    }
  ).clients;

  const additionalClients = (additionalRows ?? []).flatMap((row) => {
    const linked = row.clients as
      | { id: string; name: string; email: string | null }
      | { id: string; name: string; email: string | null }[]
      | null;
    if (!linked) return [];
    return Array.isArray(linked) ? linked : [linked];
  });

  const requestList = (requests ?? []) as ProjectRequest[];
  const alerts = buildAdminProjectAlerts({
    projectId: id,
    requests: requestList,
    documents: documents ?? [],
    messages: allMessagesAsc ?? [],
    targetCompletionDate: project.target_completion_date,
  });

  const recentMessages = (messages ?? []).map((m) => ({
    id: m.id,
    title: m.body.length > 90 ? `${m.body.slice(0, 90)}…` : m.body,
    meta: `${m.sender_role === "admin" ? "skapa" : "Client"} · ${formatShortDate(m.created_at)}`,
  }));

  const recentRequests = requestList.slice(0, 3).map((r) => ({
    id: r.id,
    title: r.title,
    meta: `${REQUEST_STATUS_LABELS[r.status] ?? r.status} · ${formatShortDate(r.created_at)}`,
  }));

  const messageCount = (allMessagesAsc ?? []).length;
  const requestCount = requestList.length;

  return (
    <div className="space-y-6">
      <ProjectAlertsRow alerts={alerts} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OverviewPreviewCard
          title="Messages"
          countLabel={
            messageCount === 1 ? "1 message" : `${messageCount} messages`
          }
          href={`/admin/projects/${id}/messages`}
          items={recentMessages}
          empty="No messages on this project yet."
        />
        <OverviewPreviewCard
          title="Requests"
          countLabel={
            requestCount === 1 ? "1 request" : `${requestCount} requests`
          }
          href={`/admin/projects/${id}/requests`}
          items={recentRequests}
          empty="No client requests yet."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card title="Phase">
          <PhaseTracker projectId={project.id} initialPhase={project.phase as Phase} />
        </Card>

        <div className="space-y-6">
          {client && (
            <Card title="Client">
              <AssignedClients
                projectId={project.id}
                primaryClient={client}
                initialAdditionalClients={additionalClients}
                allClients={allClients ?? []}
              />
            </Card>
          )}
          <Card title="Details">
            <EditableDetails
              projectId={project.id}
              initialName={project.name}
              initialServiceType={project.service_type}
              initialTargetDate={project.target_completion_date}
              currentPhaseLabel={PHASE_LABELS[project.phase] ?? project.phase}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
