"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TaskDetailModal from "@/components/TaskDetailModal";
import { DueChip, HighPriorityMarker } from "@/components/TaskChips";
import type { UpcomingTaskRow } from "@/components/UpcomingTasksPanel";
import { sortByImportance, taskUrgency, type ProjectTask } from "@/lib/tasks";

export type AttentionSignature = {
  id: string;
  project_id: string;
  project_name: string | null;
  title: string;
};

type AttentionItem =
  | { kind: "task"; task: UpcomingTaskRow }
  | { kind: "signature"; signature: AttentionSignature };

const typeLabelClass =
  "font-mono text-[10px] uppercase tracking-[0.14em] text-portal-accent";

export default function PortalAttentionList({
  tasks,
  signatures,
  today,
  clientName,
}: {
  /** Open, client-assigned tasks across the client's projects. */
  tasks: UpcomingTaskRow[];
  signatures: AttentionSignature[];
  today: string;
  clientName?: string | null;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(tasks);
  const [prevTasks, setPrevTasks] = useState(tasks);
  const [openTask, setOpenTask] = useState<UpcomingTaskRow | null>(null);

  // Server refreshes (router.refresh) replace the rows.
  if (tasks !== prevTasks) {
    setPrevTasks(tasks);
    setRows(tasks);
  }

  // Signatures are urgent: they rank alongside overdue tasks, ahead of everything due soon.
  const items = useMemo<AttentionItem[]>(() => {
    const open = sortByImportance(
      rows.filter((t) => !t.is_complete),
      today,
    );
    const overdue = open.filter((t) => taskUrgency(t, today) === "overdue");
    const rest = open.filter((t) => taskUrgency(t, today) !== "overdue");
    return [
      ...overdue.map((task) => ({ kind: "task" as const, task })),
      ...signatures.map((signature) => ({ kind: "signature" as const, signature })),
      ...rest.map((task) => ({ kind: "task" as const, task })),
    ];
  }, [rows, signatures, today]);

  function handleTaskChange(updated: ProjectTask) {
    setRows((curr) => curr.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    setOpenTask((curr) => (curr && curr.id === updated.id ? { ...curr, ...updated } : curr));
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <p className="font-serif text-lg italic text-neutral-500">You&apos;re all caught up.</p>
    );
  }

  return (
    <>
      <ul className="surface-raised divide-y divide-black/[0.05] border-l-4 border-portal-accent">
        {items.map((item) => {
          if (item.kind === "signature") {
            const { signature } = item;
            return (
              <li
                key={`sig-${signature.id}`}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6"
              >
                <div className="min-w-0">
                  <p className={typeLabelClass}>Signature</p>
                  <p className="mt-1 break-words font-serif text-lg leading-snug text-black">
                    {signature.title}
                  </p>
                  {signature.project_name ? (
                    <p className="mt-1 font-mono text-[11px] text-neutral-500">
                      {signature.project_name}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/portal/projects/${signature.project_id}/documents?sign=${signature.id}`}
                  className="shrink-0 self-start bg-portal-accent px-5 py-2.5 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90 sm:self-auto"
                >
                  Review &amp; sign
                </Link>
              </li>
            );
          }

          const { task } = item;
          return (
            <li
              key={`task-${task.id}`}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6"
            >
              <div className="min-w-0">
                <p className={typeLabelClass}>Task</p>
                <p className="mt-1 break-words font-serif text-lg leading-snug text-black">
                  {task.title}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {task.project_name ? (
                    <span className="mr-1 font-mono text-[11px] text-neutral-500">
                      {task.project_name}
                    </span>
                  ) : null}
                  <DueChip task={task} today={today} tone="portal" />
                  {task.priority === "high" ? <HighPriorityMarker /> : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenTask(task)}
                className="shrink-0 self-start border border-portal-accent px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-portal-accent transition-opacity hover:opacity-80 sm:self-auto"
              >
                Open
              </button>
            </li>
          );
        })}
      </ul>

      {openTask ? (
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
