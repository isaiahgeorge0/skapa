"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TaskDetailModal from "@/components/TaskDetailModal";
import { AssigneeChip, DueChip, HighPriorityMarker } from "@/components/TaskChips";
import type { ProjectTask } from "@/lib/tasks";

export type UpcomingTaskRow = ProjectTask & { project_name?: string | null };

/**
 * Pre-fetched, pre-sorted task rows. Admin rows link to the project's tasks tab
 * (?task=); client rows open the task modal in place.
 */
export default function UpcomingTasksPanel({
  tasks,
  viewerRole,
  today,
  emptyText = null,
  showProject = true,
  clientName,
}: {
  tasks: UpcomingTaskRow[];
  viewerRole: "admin" | "client";
  today: string;
  /** null hides the panel body entirely when there are no rows. */
  emptyText?: string | null;
  showProject?: boolean;
  clientName?: string | null;
}) {
  const router = useRouter();
  const isAdmin = viewerRole === "admin";
  const tone = isAdmin ? "admin" : "portal";
  const [rows, setRows] = useState(tasks);
  const [prevTasks, setPrevTasks] = useState(tasks);
  const [openTask, setOpenTask] = useState<UpcomingTaskRow | null>(null);

  // Server refreshes (router.refresh) replace the rows.
  if (tasks !== prevTasks) {
    setPrevTasks(tasks);
    setRows(tasks);
  }

  if (rows.length === 0) {
    return emptyText ? <p className="text-sm text-neutral-500">{emptyText}</p> : null;
  }

  function handleTaskChange(updated: ProjectTask) {
    setRows((curr) => curr.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    setOpenTask((curr) => (curr && curr.id === updated.id ? { ...curr, ...updated } : curr));
    router.refresh();
  }

  return (
    <>
      <ul className="surface-raised divide-y divide-black/[0.05]">
        {rows.map((task) => {
          const content = (
            <>
              <p
                className={`break-words font-serif text-base leading-snug ${
                  task.is_complete ? "text-neutral-400 line-through" : "text-black"
                }`}
              >
                {task.title}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {showProject && task.project_name ? (
                  <span className="mr-1 font-mono text-[11px] text-neutral-500">
                    {task.project_name}
                  </span>
                ) : null}
                <AssigneeChip
                  assignee={task.assignee}
                  viewerRole={viewerRole}
                  tone={tone}
                  clientLabel={isAdmin ? "Waiting on client" : undefined}
                />
                <DueChip task={task} today={today} tone={tone} />
                {task.priority === "high" && !task.is_complete ? <HighPriorityMarker /> : null}
              </div>
            </>
          );

          const rowClass =
            "block w-full px-5 py-4 text-left transition-colors hover:bg-black/[0.02] md:px-6";

          return (
            <li key={task.id}>
              {isAdmin ? (
                <Link
                  href={`/admin/projects/${task.project_id}/tasks?task=${task.id}`}
                  className={rowClass}
                >
                  {content}
                </Link>
              ) : (
                <button type="button" onClick={() => setOpenTask(task)} className={rowClass}>
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {openTask && !isAdmin ? (
        <TaskDetailModal
          task={openTask}
          projectName={openTask.project_name}
          viewerRole="client"
          clientName={clientName}
          onClose={() => setOpenTask(null)}
          onTaskChange={handleTaskChange}
        />
      ) : null}
    </>
  );
}
