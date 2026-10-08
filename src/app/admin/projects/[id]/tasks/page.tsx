import { createClient } from "@/lib/supabase/server";
import TasksChecklist from "@/components/TasksChecklist";
import { PROJECT_TASK_COLUMNS, type ProjectTask } from "@/lib/tasks";

export default async function ProjectTasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ task?: string }>;
}) {
  const { id } = await params;
  const { task } = await searchParams;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("name, phase, clients!client_id(name)")
    .eq("id", id)
    .single();

  const { data: tasks } = await supabase
    .from("project_tasks")
    .select(PROJECT_TASK_COLUMNS)
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  const clientRelation = project?.clients as { name: string } | { name: string }[] | null | undefined;
  const clientName = Array.isArray(clientRelation)
    ? clientRelation[0]?.name
    : clientRelation?.name;

  return (
    <TasksChecklist
      projectId={id}
      currentPhase={project?.phase ?? "onboarding"}
      initialTasks={(tasks ?? []) as unknown as ProjectTask[]}
      openTaskId={task}
      projectName={project?.name}
      clientName={clientName ?? null}
    />
  );
}
