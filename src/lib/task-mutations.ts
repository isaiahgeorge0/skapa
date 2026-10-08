import type { SupabaseClient } from "@supabase/supabase-js";
import { PROJECT_TASK_COLUMNS, type ProjectTask } from "@/lib/tasks";

export type TaskMutationResult =
  | { ok: true; task: ProjectTask }
  | { ok: false; error: string };

/**
 * Tick / untick a task. RLS silently filters a disallowed update to zero rows
 * (no error), so an empty result is treated as a failure.
 */
export async function updateTaskCompletion(
  supabase: SupabaseClient,
  taskId: string,
  isComplete: boolean,
): Promise<TaskMutationResult> {
  const { data, error } = await supabase
    .from("project_tasks")
    .update({ is_complete: isComplete })
    .eq("id", taskId)
    .select(PROJECT_TASK_COLUMNS);

  if (error) {
    console.error("Failed to update task completion:", error);
    return { ok: false, error: "Couldn't update this task. Try again." };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: "You can't change this task." };
  }
  return { ok: true, task: data[0] as unknown as ProjectTask };
}
