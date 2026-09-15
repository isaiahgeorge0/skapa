import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminRequestsPanel from "@/components/AdminRequestsPanel";
import Card from "@/components/Card";
import type { ProjectRequest } from "@/lib/project-request-status";

export default async function ProjectRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return null;

  const admin = createAdminClient();
  const { data: requests } = await admin
    .from("project_requests")
    .select(
      "id, project_id, client_id, title, description, status, admin_response, responded_at, created_at",
    )
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  return (
    <Card title="Client requests">
      <AdminRequestsPanel initialRequests={(requests ?? []) as ProjectRequest[]} />
    </Card>
  );
}
