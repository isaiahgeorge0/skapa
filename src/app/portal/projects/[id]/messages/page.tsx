import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import MessagesPanel from "@/components/MessagesPanel";
import PortalSection from "@/components/PortalSection";

export const dynamic = "force-dynamic";

export default async function PortalProjectMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select("id, client_id")
    .eq("id", id)
    .single();
  if (!project) notFound();

  const [{ data: messages }, { data: client }] = await Promise.all([
    supabase
      .from("messages")
      .select("id, sender_id, sender_role, body, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: true }),
    project.client_id
      ? createAdminClient()
          .from("clients")
          .select("name")
          .eq("id", project.client_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <PortalSection
      title="Messages"
      intro={
        <p className="text-sm text-neutral-500">Notes between you and skapa.</p>
      }
    >
      <MessagesPanel
        projectId={project.id}
        currentUserId={user!.id}
        viewerRole="client"
        initialMessages={messages ?? []}
        clientName={client?.name?.trim() || "Client"}
        studioName="skapa Creative"
        usePortalAccent
      />
    </PortalSection>
  );
}
