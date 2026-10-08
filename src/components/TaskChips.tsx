import {
  dueLabel,
  taskUrgency,
  type ProjectTask,
  type TaskAssignee,
} from "@/lib/tasks";

export type TaskTone = "admin" | "portal";

const chipBase =
  "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]";

function accentOutline(tone: TaskTone) {
  return tone === "portal"
    ? "border-portal-accent text-portal-accent"
    : "border-brand-pink text-brand-pink";
}

/**
 * Who owns the task. Skapa-side is neutral; client-side gets the accent outline.
 * Clients see their own tasks as "You"; admins see "Client" (or "Waiting on client").
 */
export function AssigneeChip({
  assignee,
  viewerRole,
  tone,
  clientLabel,
}: {
  assignee: TaskAssignee;
  viewerRole: "admin" | "client";
  tone: TaskTone;
  clientLabel?: string;
}) {
  if (assignee === "admin") {
    return (
      <span className={`${chipBase} border-neutral-200 text-neutral-500`}>Skapa</span>
    );
  }
  const label = clientLabel ?? (viewerRole === "client" ? "You" : "Client");
  return <span className={`${chipBase} ${accentOutline(tone)}`}>{label}</span>;
}

export function DueChip({
  task,
  today,
  tone,
}: {
  task: Pick<ProjectTask, "is_complete" | "due_date">;
  today: string;
  tone: TaskTone;
}) {
  const label = dueLabel(task, today);
  if (!label) return null;
  const urgency = taskUrgency(task, today);
  const colour =
    urgency === "overdue"
      ? "border-red-200 bg-red-50 text-red-700"
      : urgency === "due_soon"
        ? accentOutline(tone)
        : "border-neutral-200 text-neutral-500";
  return <span className={`${chipBase} ${colour}`}>{label}</span>;
}

export function HighPriorityMarker({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.1em] text-black ${className}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-black" />
      High priority
    </span>
  );
}
