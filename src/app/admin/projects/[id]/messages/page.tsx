import { createClient } from "@/lib/supabase/server";
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

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, sender_role, body, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  return (
    <Card title="Messages">
      <MessagesPanel
        projectId={id}
        currentUserId={user!.id}
        viewerRole="admin"
        initialMessages={messages ?? []}
      />
    </Card>
  );
}
