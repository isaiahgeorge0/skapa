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
const rowClass =
  "flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-white/60 sm:px-6";
const rowCueClass =
  "hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-portal-accent sm:inline";

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
      <p className="border-t border-black/[0.06] px-4 py-4 font-serif text-lg italic text-neutral-500 sm:px-6">
        You&apos;re all caught up.
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-black/[0.06] border-t border-black/[0.06]">
        {items.map((item) => {
          if (item.kind === "signature") {
            const { signature } = item;
            return (
              <li key={`sig-${signature.id}`}>
                <Link
                  href={`/portal/projects/${signature.project_id}/documents?sign=${signature.id}`}
                  className={rowClass}
                >
                  <span className="min-w-0">
                    <span className={`block ${typeLabelClass}`}>Signature</span>
                    <span className="mt-1 block break-words font-serif text-base leading-snug text-black">
                      {signature.title}
                    </span>
                    {signature.project_name ? (
                      <span className="mt-1 block font-mono text-[11px] text-neutral-500">
                        {signature.project_name}
                      </span>
                    ) : null}
                  </span>
                  <span aria-hidden="true" className={rowCueClass}>
                    Review &amp; sign →
                  </span>
                </Link>
              </li>
            );
          }

          const { task } = item;
          return (
            <li key={`task-${task.id}`}>
              <button type="button" onClick={() => setOpenTask(task)} className={rowClass}>
                <span className="min-w-0">
                  <span className={`block ${typeLabelClass}`}>Task</span>
                  <span className="mt-1 block break-words font-serif text-base leading-snug text-black">
                    {task.title}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {task.project_name ? (
                      <span className="mr-1 font-mono text-[11px] text-neutral-500">
                        {task.project_name}
                      </span>
                    ) : null}
                    <DueChip task={task} today={today} tone="portal" />
                    {task.priority === "high" ? <HighPriorityMarker /> : null}
                  </span>
                </span>
                <span aria-hidden="true" className={rowCueClass}>
                  Open →
                </span>
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
