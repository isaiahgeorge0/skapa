"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TaskDetailModal from "@/components/TaskDetailModal";
import { DueChip, HighPriorityMarker } from "@/components/TaskChips";
import type { ProjectTask } from "@/lib/tasks";

function TickIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden="true">
      <path
        d="M2 6l2.5 2.5L10 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Portal overview "What we're working on": Skapa-side open tasks plus a collapsed
 * completed list. Also owns the ?task= deep link for any task on the project, so
 * it stays mounted (rendering only the modal) when both lists are empty.
 */
export default function PortalWorkingOn({
  openTasks,
  completedTasks,
  allTasks,
  openTaskId,
  projectName,
  clientName,
  today,
}: {
  openTasks: ProjectTask[];
  completedTasks: ProjectTask[];
  allTasks: ProjectTask[];
  openTaskId?: string;
  projectName?: string | null;
  clientName?: string | null;
  today: string;
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(() =>
    openTaskId && allTasks.some((t) => t.id === openTaskId) ? openTaskId : null,
  );
  const [updated, setUpdated] = useState<Record<string, ProjectTask>>({});

  const [prevOpenTaskId, setPrevOpenTaskId] = useState(openTaskId);
  if (openTaskId !== prevOpenTaskId) {
    setPrevOpenTaskId(openTaskId);
    if (openTaskId && allTasks.some((t) => t.id === openTaskId)) setOpenId(openTaskId);
  }

  const openTask = openId
    ? (updated[openId] ?? allTasks.find((t) => t.id === openId) ?? null)
    : null;

  function handleTaskChange(task: ProjectTask) {
    setUpdated((curr) => ({ ...curr, [task.id]: task }));
    router.refresh();
  }

  function renderRow(task: ProjectTask) {
    const done = task.is_complete;
    return (
      <li key={task.id}>
        <button
          type="button"
          onClick={() => setOpenId(task.id)}
          className="group flex min-h-11 w-full items-start gap-3 py-2.5 text-left"
        >
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
              done
                ? "border-neutral-300 bg-neutral-300 text-white"
                : "border-dashed border-neutral-300"
            }`}
          >
            {done ? <TickIcon /> : null}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={`block break-words font-serif text-base leading-snug group-hover:underline group-hover:decoration-dotted group-hover:underline-offset-4 ${
                done ? "text-neutral-400 line-through" : "text-black"
              }`}
            >
              {task.title}
            </span>
            {!done && (task.due_date || task.priority === "high") ? (
              <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <DueChip task={task} today={today} tone="portal" />
                {task.priority === "high" ? <HighPriorityMarker /> : null}
              </span>
            ) : null}
          </span>
        </button>
      </li>
    );
  }

  const hasContent = openTasks.length > 0 || completedTasks.length > 0;

  return (
    <>
      {hasContent ? (
        <div>
          {openTasks.length > 0 ? (
            <ul className="divide-y divide-black/[0.04]">{openTasks.map(renderRow)}</ul>
          ) : null}
          {completedTasks.length > 0 ? (
            <details
              className={`group ${openTasks.length > 0 ? "mt-2 border-t border-black/[0.06] pt-1" : ""}`}
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500 hover:text-black [&::-webkit-details-marker]:hidden">
                Completed ({completedTasks.length})
                <span aria-hidden="true" className="transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <ul className="divide-y divide-black/[0.04]">{completedTasks.map(renderRow)}</ul>
            </details>
          ) : null}
        </div>
      ) : null}

      {openTask ? (
        <TaskDetailModal
          task={openTask}
          projectName={projectName}
          viewerRole="client"
          clientName={clientName}
          onClose={() => setOpenId(null)}
          onTaskChange={handleTaskChange}
        />
      ) : null}
    </>
  );
}
