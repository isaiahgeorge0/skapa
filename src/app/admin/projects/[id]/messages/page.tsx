import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import MessagesPanel from "@/components/MessagesPanel";
import Card from "@/components/Card";

export default async function ProjectMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: messages }, { data: project }] = await Promise.all([
    supabase
      .from("messages")
      .select("id, sender_id, sender_role, body, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("projects").select("client_id").eq("id", id).maybeSingle(),
  ]);

  let clientName = "Client";
  if (project?.client_id) {
    const admin = createAdminClient();
    const { data: client } = await admin
      .from("clients")
      .select("name")
      .eq("id", project.client_id)
      .maybeSingle();
    if (client?.name?.trim()) clientName = client.name.trim();
  }

  return (
    <Card title="Messages">
      <MessagesPanel
        projectId={id}
        currentUserId={user!.id}
        viewerRole="admin"
        initialMessages={messages ?? []}
        clientName={clientName}
        studioName="skapa Creative"
      />
    </Card>
  );
}
