/** Project task + task note helpers. Due dates are date-only strings (YYYY-MM-DD). */

export type TaskAssignee = "admin" | "client";
export type TaskPriority = "low" | "normal" | "high";
export type TaskUrgency = "overdue" | "due_soon" | "upcoming" | "none";

export type ProjectTask = {
  id: string;
  project_id: string;
  title: string;
  is_complete: boolean;
  /** null = project-wide task, not tied to a phase. */
  phase: string | null;
  assignee: TaskAssignee;
  due_date: string | null;
  priority: TaskPriority;
  description: string | null;
  completed_at: string | null;
  updated_at: string | null;
  created_at: string;
};

export type TaskComment = {
  id: string;
  task_id: string;
  author_id: string | null;
  author_role: TaskAssignee;
  body: string;
  created_at: string;
};

export const PROJECT_TASK_COLUMNS =
  "id, project_id, title, is_complete, phase, assignee, due_date, priority, description, completed_at, updated_at, created_at";

export const TASK_COMMENT_MAX_LENGTH = 4000;

/** Window (in days, counting today) that counts as "due soon". */
const DUE_SOON_DAYS = 7;

const DAY_MS = 86_400_000;

/** Today's date in Europe/London as YYYY-MM-DD. */
export function londonToday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function dateOnlyToUtcMs(value: string): number {
  const [y, m, d] = value.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Whole days from `today` to `due` (negative = in the past). Both YYYY-MM-DD. */
export function daysUntil(due: string, today: string): number {
  return Math.round((dateOnlyToUtcMs(due) - dateOnlyToUtcMs(today)) / DAY_MS);
}

type UrgencyInput = Pick<ProjectTask, "is_complete" | "due_date">;

export function taskUrgency(task: UrgencyInput, today: string): TaskUrgency {
  if (task.is_complete || !task.due_date) return "none";
  if (task.due_date < today) return "overdue";
  return daysUntil(task.due_date, today) < DUE_SOON_DAYS ? "due_soon" : "upcoming";
}

/** en-GB short date for a date-only string, without local-timezone drift. */
export function formatDueDate(due: string, today?: string): string {
  const sameYear = !today || due.slice(0, 4) === today.slice(0, 4);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatToParts(new Date(dateOnlyToUtcMs(due)));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const label = `${get("weekday")} ${get("day")} ${get("month")}`;
  return sameYear ? label : `${label} ${get("year")}`;
}

export function dueLabel(task: UrgencyInput, today: string): string | null {
  if (task.is_complete || !task.due_date) return null;
  const days = daysUntil(task.due_date, today);
  if (days < 0) {
    const late = Math.abs(days);
    return `Overdue by ${late} ${late === 1 ? "day" : "days"}`;
  }
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due ${formatDueDate(task.due_date, today)}`;
}

type SortableTask = Pick<
  ProjectTask,
  "is_complete" | "due_date" | "priority" | "created_at"
>;

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, normal: 1, low: 2 };

function importanceBucket(task: SortableTask, today: string): number {
  if (task.is_complete) return 5;
  const urgency = taskUrgency(task, today);
  if (urgency === "overdue") return 0;
  if (urgency === "due_soon") return 1;
  if (task.priority === "high") return 2;
  if (task.due_date) return 3;
  return 4;
}

function compareDueDates(a: string | null, b: string | null): number {
  if (a && b) return a < b ? -1 : a > b ? 1 : 0;
  if (a) return -1;
  if (b) return 1;
  return 0;
}

/**
 * Open tasks: overdue (oldest first) → due soon (soonest first) → high priority
 * without an imminent date → later due dates → undated (by priority, then age).
 * Completed tasks always sort last.
 */
export function compareByImportance(
  a: SortableTask,
  b: SortableTask,
  today: string,
): number {
  const bucketDiff = importanceBucket(a, today) - importanceBucket(b, today);
  if (bucketDiff !== 0) return bucketDiff;

  const byDue = compareDueDates(a.due_date, b.due_date);
  if (byDue !== 0) return byDue;

  const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (byPriority !== 0) return byPriority;

  return a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0;
}

export function sortByImportance<T extends SortableTask>(tasks: T[], today: string): T[] {
  return [...tasks].sort((a, b) => compareByImportance(a, b, today));
}

/** "just now", "5m ago", "3h ago", "2d ago", then an en-GB date. */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
  });
}

export function formatNoteTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
