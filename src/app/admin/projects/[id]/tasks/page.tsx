import { createClient } from "@/lib/supabase/server";
import TasksChecklist from "@/components/TasksChecklist";
import Card from "@/components/Card";

export default async function ProjectTasksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("phase")
    .eq("id", id)
    .single();

  const { data: tasks } = await supabase
    .from("project_tasks")
    .select("id, title, is_complete, phase")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  return (
    <Card title="Tasks">
      <TasksChecklist
        projectId={id}
        currentPhase={project?.phase ?? "onboarding"}
        initialTasks={tasks ?? []}
      />
    </Card>
  );
}
