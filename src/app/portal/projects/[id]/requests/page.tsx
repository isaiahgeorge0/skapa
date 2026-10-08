import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ClientRequestsPanel from "@/components/ClientRequestsPanel";
import PortalPageHeader from "@/components/PortalPageHeader";
import type { ProjectRequest } from "@/lib/project-request-status";

export const dynamic = "force-dynamic";

export default async function PortalProjectRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", id)
    .single();
  if (!project) notFound();

  const admin = createAdminClient();
  const { data: requests } = await admin
    .from("project_requests")
    .select(
      "id, project_id, client_id, title, description, status, admin_response, responded_at, created_at",
    )
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const requestCount = (requests ?? []).length;

  return (
    <>
      <PortalPageHeader
        eyebrow={project.name}
        title="Requests"
        intro="Ask for changes or extras without losing the thread."
        meta={
          requestCount > 0
            ? `${requestCount} ${requestCount === 1 ? "request" : "requests"}`
            : undefined
        }
      />
      <ClientRequestsPanel
        projectId={project.id}
        initialRequests={(requests ?? []) as ProjectRequest[]}
      />
    </>
  );
}
