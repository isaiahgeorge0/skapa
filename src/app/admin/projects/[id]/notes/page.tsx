import { createClient } from "@/lib/supabase/server";
import NotesLog from "@/components/NotesLog";
import Card from "@/components/Card";

export default async function ProjectNotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: notes } = await supabase
    .from("project_notes")
    .select("id, body, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  return (
    <Card title="Internal notes">
      <NotesLog projectId={id} initialNotes={notes ?? []} />
    </Card>
  );
}
