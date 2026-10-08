"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/Modal";
import { AssigneeChip, DueChip, HighPriorityMarker } from "@/components/TaskChips";
import { updateTaskCompletion } from "@/lib/task-mutations";
import {
  PROJECT_TASK_COLUMNS,
  TASK_COMMENT_MAX_LENGTH,
  formatNoteTime,
  londonToday,
  type ProjectTask,
  type TaskAssignee,
  type TaskComment,
  type TaskPriority,
} from "@/lib/tasks";

const COMMENT_COLUMNS = "id, task_id, author_id, author_role, body, created_at";

const labelClass =
  "mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500";

type PendingComment = TaskComment & { pending?: boolean };

export default function TaskDetailModal({
  task,
  projectName,
  viewerRole,
  onClose,
  onTaskChange,
  clientName,
  onCommentCountChange,
}: {
  task: ProjectTask;
  projectName?: string | null;
  viewerRole: "admin" | "client";
  onClose: () => void;
  onTaskChange: (task: ProjectTask) => void;
  /** Shown as the author of client notes (falls back to "Client"). */
  clientName?: string | null;
  onCommentCountChange?: (taskId: string, count: number) => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const isAdmin = viewerRole === "admin";
  const tone = isAdmin ? "admin" : "portal";
  const today = londonToday();

  const [userId, setUserId] = useState<string | null>(null);
  const [thread, setThread] = useState<{
    taskId: string;
    comments: PendingComment[];
    error: string | null;
  } | null>(null);
  const loadingComments = thread?.taskId !== task.id;
  const comments = thread && !loadingComments ? thread.comments : [];
  const commentsError = thread && !loadingComments ? thread.error : null;
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const [prevTaskId, setPrevTaskId] = useState(task.id);
  if (task.id !== prevTaskId) {
    setPrevTaskId(task.id);
    setEditing(false);
    setToggleError(null);
    setDraft("");
    setPostError(null);
  }

  function updateComments(update: (curr: PendingComment[]) => PendingComment[]) {
    setThread((curr) =>
      curr && curr.taskId === task.id ? { ...curr, comments: update(curr.comments) } : curr,
    );
  }

  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setUserId(data.user?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    const taskId = task.id;

    void supabase
      .from("task_comments")
      .select(COMMENT_COLUMNS)
      .eq("task_id", taskId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Failed to load task notes:", error);
          setThread({ taskId, comments: [], error: "Couldn't load notes." });
          return;
        }
        setThread({ taskId, comments: (data ?? []) as TaskComment[], error: null });
      });

    return () => {
      cancelled = true;
    };
  }, [supabase, task.id]);

  const savedCount = comments.filter((c) => !c.pending).length;
  useEffect(() => {
    if (!loadingComments) onCommentCountChange?.(task.id, savedCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCount, loadingComments, task.id]);

  function authorLabel(comment: TaskComment) {
    if (userId && comment.author_id === userId) return "You";
    if (comment.author_role === "admin") return "Skapa";
    return clientName?.trim() || "Client";
  }

  async function addNote() {
    const body = draft.trim();
    if (!body || posting) return;
    if (body.length > TASK_COMMENT_MAX_LENGTH) {
      setPostError(`Notes can be up to ${TASK_COMMENT_MAX_LENGTH} characters.`);
      return;
    }

    setPosting(true);
    setPostError(null);

    const authorId = userId ?? (await supabase.auth.getUser()).data.user?.id;
    if (!authorId) {
      setPosting(false);
      setPostError("You must be signed in to add a note.");
      return;
    }

    const countBefore = savedCount;
    const tempId = `pending-${Date.now()}`;
    const optimistic: PendingComment = {
      id: tempId,
      task_id: task.id,
      author_id: authorId,
      author_role: viewerRole,
      body,
      created_at: new Date().toISOString(),
      pending: true,
    };
    updateComments((curr) => [...curr, optimistic]);
    setDraft("");
    requestAnimationFrame(() => threadEndRef.current?.scrollIntoView({ block: "nearest" }));

    const { data, error } = await supabase
      .from("task_comments")
      .insert({ task_id: task.id, author_id: authorId, author_role: viewerRole, body })
      .select(COMMENT_COLUMNS)
      .single();

    setPosting(false);

    if (error || !data) {
      console.error("Failed to add task note:", error);
      updateComments((curr) => curr.filter((c) => c.id !== tempId));
      setDraft(body);
      setPostError("Couldn't add your note. Try again.");
      return;
    }

    updateComments((curr) => curr.map((c) => (c.id === tempId ? (data as TaskComment) : c)));
    onCommentCountChange?.(task.id, countBefore + 1);
  }

  async function toggleComplete() {
    setToggling(true);
    setToggleError(null);
    const result = await updateTaskCompletion(supabase, task.id, !task.is_complete);
    setToggling(false);
    if (!result.ok) {
      setToggleError(result.error);
      return;
    }
    onTaskChange(result.task);
  }

  const canClientToggle = !isAdmin && task.assignee === "client";
  const primaryButton = isAdmin
    ? "bg-black hover:opacity-80"
    : "bg-portal-accent hover:opacity-90";
  const trimmedLength = draft.trim().length;

  return (
    <Modal open onClose={onClose} title={projectName?.trim() || "Task"}>
      {editing && isAdmin ? (
        <TaskEditForm
          task={task}
          onCancel={() => setEditing(false)}
          onSaved={(updated) => {
            onTaskChange(updated);
            setEditing(false);
          }}
        />
      ) : (
        <div>
          <div className="flex items-start justify-between gap-4">
            <h2
              className={`font-serif text-2xl leading-tight tracking-tight ${
                task.is_complete ? "text-neutral-400 line-through" : "text-black"
              }`}
            >
              {task.title}
            </h2>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500 underline decoration-dotted hover:text-black"
              >
                Edit
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <AssigneeChip assignee={task.assignee} viewerRole={viewerRole} tone={tone} />
            <DueChip task={task} today={today} tone={tone} />
            {task.priority === "high" && !task.is_complete ? <HighPriorityMarker /> : null}
            {task.is_complete ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-400">
                Completed
              </span>
            ) : null}
          </div>

          {task.description?.trim() ? (
            <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
              {task.description}
            </p>
          ) : (
            <p className="mt-5 text-sm text-neutral-400">No extra detail.</p>
          )}

          {canClientToggle ? (
            <div className="mt-5">
              <button
                type="button"
                onClick={toggleComplete}
                disabled={toggling}
                className={`surface-control px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-opacity disabled:opacity-50 ${
                  task.is_complete
                    ? "border border-neutral-300 text-neutral-700 hover:border-black"
                    : `text-white ${primaryButton}`
                }`}
              >
                {toggling ? "Saving…" : task.is_complete ? "Mark incomplete" : "Mark complete"}
              </button>
              {toggleError ? (
                <p className="mt-2 font-mono text-xs text-red-600" role="alert">
                  {toggleError}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      <section className="mt-7 border-t border-neutral-100 pt-5">
        <p className={labelClass}>Notes</p>

        {loadingComments ? (
          <p className="font-mono text-xs text-neutral-400">Loading notes…</p>
        ) : commentsError ? (
          <p className="font-mono text-xs text-red-600">{commentsError}</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-neutral-400">
            No notes yet. Add one to ask a question or share an update.
          </p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className={comment.pending ? "opacity-60" : ""}>
                <p className="font-mono text-[11px] text-neutral-400">
                  <span className="uppercase tracking-[0.1em] text-neutral-600">
                    {authorLabel(comment)}
                  </span>
                  <span className="text-neutral-300"> · </span>
                  {comment.pending ? "Sending…" : formatNoteTime(comment.created_at)}
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-black">
                  {comment.body}
                </p>
              </li>
            ))}
          </ul>
        )}
        <div ref={threadEndRef} />

        <form
          className="mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            void addNote();
          }}
        >
          <label htmlFor={`task-note-${task.id}`} className="sr-only">
            Add a note
          </label>
          <textarea
            id={`task-note-${task.id}`}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (postError) setPostError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void addNote();
              }
            }}
            rows={3}
            maxLength={TASK_COMMENT_MAX_LENGTH}
            placeholder="Write a note…"
            className="surface-control w-full resize-y border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[10px] text-neutral-400">
              {draft.length > TASK_COMMENT_MAX_LENGTH - 400
                ? `${draft.length}/${TASK_COMMENT_MAX_LENGTH}`
                : "⌘/Ctrl + Enter to send"}
            </p>
            <button
              type="submit"
              disabled={posting || trimmedLength === 0}
              className={`surface-control px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity disabled:opacity-40 ${primaryButton}`}
            >
              {posting ? "Adding…" : "Add note"}
            </button>
          </div>
          {postError ? (
            <p className="mt-2 font-mono text-xs text-red-600" role="alert">
              {postError}
            </p>
          ) : null}
        </form>
      </section>
    </Modal>
  );
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex border border-neutral-300">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
              active ? "bg-black text-white" : "text-neutral-600 hover:text-black"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export const ASSIGNEE_OPTIONS: { value: TaskAssignee; label: string }[] = [
  { value: "admin", label: "Skapa" },
  { value: "client", label: "Client" },
];

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
];

export function TaskFieldsEditor({
  assignee,
  onAssigneeChange,
  dueDate,
  onDueDateChange,
  priority,
  onPriorityChange,
  description,
  onDescriptionChange,
}: {
  assignee: TaskAssignee;
  onAssigneeChange: (value: TaskAssignee) => void;
  dueDate: string;
  onDueDateChange: (value: string) => void;
  priority: TaskPriority;
  onPriorityChange: (value: TaskPriority) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}) {
  return (
    <>
      <div>
        <span className={labelClass}>Assigned to</span>
        <SegmentedControl
          label="Assigned to"
          value={assignee}
          options={ASSIGNEE_OPTIONS}
          onChange={onAssigneeChange}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="task-due-date">
          Due date
        </label>
        <div className="flex items-center gap-3">
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            className="border border-neutral-300 px-3 py-2 text-sm"
          />
          {dueDate ? (
            <button
              type="button"
              onClick={() => onDueDateChange("")}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500 underline decoration-dotted hover:text-black"
            >
              Clear
            </button>
          ) : (
            <span className="font-mono text-[11px] text-neutral-400">Optional</span>
          )}
        </div>
      </div>
      <div>
        <span className={labelClass}>Priority</span>
        <SegmentedControl
          label="Priority"
          value={priority}
          options={PRIORITY_OPTIONS}
          onChange={onPriorityChange}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="task-description">
          Description
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          placeholder="Optional — context, links, what done looks like."
          className="w-full resize-y border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
    </>
  );
}

function TaskEditForm({
  task,
  onCancel,
  onSaved,
}: {
  task: ProjectTask;
  onCancel: () => void;
  onSaved: (task: ProjectTask) => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [title, setTitle] = useState(task.title);
  const [assignee, setAssignee] = useState<TaskAssignee>(task.assignee);
  const [dueDate, setDueDate] = useState(task.due_date ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [description, setDescription] = useState(task.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Give the task a title.");
      return;
    }
    setSaving(true);
    setError(null);

    const { data, error: updateError } = await supabase
      .from("project_tasks")
      .update({
        title: trimmedTitle,
        assignee,
        due_date: dueDate || null,
        priority,
        description: description.trim() || null,
      })
      .eq("id", task.id)
      .select(PROJECT_TASK_COLUMNS)
      .single();

    setSaving(false);
    if (updateError || !data) {
      console.error("Failed to save task:", updateError);
      setError("Couldn't save changes. Try again.");
      return;
    }
    onSaved(data as unknown as ProjectTask);
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div>
        <label className={labelClass} htmlFor="task-title">
          Task
        </label>
        <input
          id="task-title"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <TaskFieldsEditor
        assignee={assignee}
        onAssigneeChange={setAssignee}
        dueDate={dueDate}
        onDueDateChange={setDueDate}
        priority={priority}
        onPriorityChange={setPriority}
        description={description}
        onDescriptionChange={setDescription}
      />
      {error ? (
        <p className="font-mono text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="border border-neutral-300 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-700 hover:border-black disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
