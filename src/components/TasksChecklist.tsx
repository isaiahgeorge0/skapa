"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import TaskDetailModal, { TaskFieldsEditor } from "@/components/TaskDetailModal";
import { AssigneeChip, DueChip, HighPriorityMarker } from "@/components/TaskChips";
import { deleteProjectTasks } from "@/app/actions/admin-deletes";
import { updateTaskCompletion } from "@/lib/task-mutations";
import {
  PROJECT_TASK_COLUMNS,
  londonToday,
  sortByImportance,
  type ProjectTask,
  type TaskAssignee,
  type TaskPriority,
} from "@/lib/tasks";

function TickIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
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

export default function TasksChecklist({
  projectId,
  currentPhase,
  initialTasks,
  canManage = true,
  openTaskId,
  projectName,
  clientName,
}: {
  projectId: string;
  currentPhase: string;
  initialTasks: ProjectTask[];
  canManage?: boolean;
  /** Deep-link (?task=) — opens this task's modal on mount, whatever its phase. */
  openTaskId?: string;
  projectName?: string | null;
  clientName?: string | null;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const viewerRole = canManage ? "admin" : "client";
  const tone = canManage ? "admin" : "portal";
  const today = londonToday();

  const [tasks, setTasks] = useState<ProjectTask[]>(initialTasks);
  const [openId, setOpenId] = useState<string | null>(() =>
    openTaskId && initialTasks.some((t) => t.id === openTaskId) ? openTaskId : null,
  );
  const [noteCounts, setNoteCounts] = useState<Record<string, number>>({});
  const [toggleError, setToggleError] = useState<{ taskId: string; message: string } | null>(
    null,
  );

  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState<TaskAssignee>("admin");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("normal");
  const [newDescription, setNewDescription] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Server refreshes (router.refresh) replace the list.
  const [prevInitialTasks, setPrevInitialTasks] = useState(initialTasks);
  if (initialTasks !== prevInitialTasks) {
    setPrevInitialTasks(initialTasks);
    setTasks(initialTasks);
  }

  // A new ?task= target while the page stays mounted.
  const [prevOpenTaskId, setPrevOpenTaskId] = useState(openTaskId);
  if (openTaskId !== prevOpenTaskId) {
    setPrevOpenTaskId(openTaskId);
    if (openTaskId && initialTasks.some((t) => t.id === openTaskId)) {
      setOpenId(openTaskId);
    }
  }

  const taskIdsKey = tasks
    .map((t) => t.id)
    .sort()
    .join(",");

  useEffect(() => {
    const ids = taskIdsKey ? taskIdsKey.split(",") : [];
    if (ids.length === 0) return;
    let cancelled = false;
    void supabase
      .from("task_comments")
      .select("task_id")
      .in("task_id", ids)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Failed to load note counts:", error);
          return;
        }
        const counts: Record<string, number> = {};
        for (const row of data ?? []) {
          counts[row.task_id] = (counts[row.task_id] ?? 0) + 1;
        }
        setNoteCounts(counts);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, taskIdsKey]);

  const phaseTasks = useMemo(
    () =>
      sortByImportance(
        tasks.filter((t) => t.phase === currentPhase),
        today,
      ),
    [tasks, currentPhase, today],
  );
  const openTask = openId ? tasks.find((t) => t.id === openId) ?? null : null;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allPhaseSelected =
    phaseTasks.length > 0 && phaseTasks.every((t) => selectedSet.has(t.id));

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function toggleSelected(taskId: string) {
    setSelectedIds((curr) =>
      curr.includes(taskId)
        ? curr.filter((id) => id !== taskId)
        : [...curr, taskId],
    );
  }

  function toggleAllPhase() {
    const phaseIds = phaseTasks.map((t) => t.id);
    if (allPhaseSelected) {
      const phaseIdSet = new Set(phaseIds);
      setSelectedIds((curr) => curr.filter((id) => !phaseIdSet.has(id)));
      return;
    }
    setSelectedIds((curr) => [...new Set([...curr, ...phaseIds])]);
  }

  function openDeleteModal(ids: string[]) {
    setDeleteTargetIds(ids);
    setDeleteError(null);
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setDeleteModalOpen(false);
    setDeleteTargetIds([]);
    setDeleteError(null);
    setDeleting(false);
  }

  async function confirmDelete() {
    const ids = deleteTargetIds;
    if (ids.length === 0) return;

    setDeleting(true);
    setDeleteError(null);

    const previous = tasks;
    const idsSet = new Set(ids);
    setTasks((curr) => curr.filter((t) => !idsSet.has(t.id)));
    setSelectedIds((curr) => curr.filter((id) => !idsSet.has(id)));

    const result = await deleteProjectTasks(ids);
    setDeleting(false);

    if (!result.success) {
      setTasks(previous);
      setDeleteError(result.error);
      setSelectedIds(ids);
      return;
    }

    closeDeleteModal();
  }

  function deleteTask(id: string) {
    openDeleteModal([id]);
  }

  function applyTaskChange(updated: ProjectTask) {
    setTasks((curr) => curr.map((t) => (t.id === updated.id ? updated : t)));
    if (!canManage) router.refresh();
  }

  async function toggleTask(task: ProjectTask) {
    setToggleError(null);
    setTasks((curr) =>
      curr.map((t) => (t.id === task.id ? { ...t, is_complete: !t.is_complete } : t)),
    );
    const result = await updateTaskCompletion(supabase, task.id, !task.is_complete);
    if (!result.ok) {
      setTasks((curr) => curr.map((t) => (t.id === task.id ? task : t)));
      setToggleError({ taskId: task.id, message: result.error });
      return;
    }
    applyTaskChange(result.task);
  }

  function resetAddForm() {
    setNewTitle("");
    setNewAssignee("admin");
    setNewDueDate("");
    setNewPriority("normal");
    setNewDescription("");
    setAddError(null);
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setAdding(true);
    setAddError(null);
    const { data, error } = await supabase
      .from("project_tasks")
      .insert({
        project_id: projectId,
        phase: currentPhase,
        title,
        assignee: newAssignee,
        due_date: newDueDate || null,
        priority: newPriority,
        description: newDescription.trim() || null,
      })
      .select(PROJECT_TASK_COLUMNS)
      .single();
    setAdding(false);
    if (error || !data) {
      console.error("Failed to add task:", error);
      setAddError("Couldn't add the task. Try again.");
      return;
    }
    setTasks((curr) => [...curr, data as unknown as ProjectTask]);
    resetAddForm();
    setAddOpen(false);
  }

  function renderMeta(task: ProjectTask) {
    const notes = noteCounts[task.id] ?? 0;
    return (
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <AssigneeChip assignee={task.assignee} viewerRole={viewerRole} tone={tone} />
        <DueChip task={task} today={today} tone={tone} />
        {task.priority === "high" && !task.is_complete ? <HighPriorityMarker /> : null}
        {notes > 0 ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-400">
            {notes} {notes === 1 ? "note" : "notes"}
          </span>
        ) : null}
      </div>
    );
  }

  function renderTitle(task: ProjectTask, sizeClass: string) {
    return (
      <button
        type="button"
        onClick={() => setOpenId(task.id)}
        className={`block text-left ${sizeClass} underline-offset-4 hover:underline hover:decoration-dotted ${
          task.is_complete ? "text-neutral-400 line-through" : "text-black"
        }`}
      >
        {task.title}
      </button>
    );
  }

  function renderToggleError(task: ProjectTask) {
    if (toggleError?.taskId !== task.id) return null;
    return (
      <p className="mt-1.5 font-mono text-[11px] text-red-600" role="alert">
        {toggleError.message}
      </p>
    );
  }

  const detailModal = openTask ? (
    <TaskDetailModal
      task={openTask}
      projectName={projectName}
      viewerRole={viewerRole}
      clientName={clientName}
      onClose={() => setOpenId(null)}
      onTaskChange={applyTaskChange}
      onCommentCountChange={(taskId, count) =>
        setNoteCounts((curr) => (curr[taskId] === count ? curr : { ...curr, [taskId]: count }))
      }
    />
  ) : null;

  if (!canManage) {
    return (
      <div>
        {phaseTasks.length === 0 ? (
          <div className="surface-raised-soft px-6 py-6 md:px-7 md:py-7">
            <p className="font-serif text-lg text-black">No checklist items yet.</p>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-neutral-500">
              As this phase gets going, we&apos;ll add clear actions here so you can
              see what&apos;s needed from you, and what we&apos;re working through.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {phaseTasks.map((task) => (
              <li key={task.id} className="flex items-start gap-3 py-2">
                {task.assignee === "client" ? (
                  <button
                    type="button"
                    onClick={() => toggleTask(task)}
                    aria-label={task.is_complete ? "Mark incomplete" : "Mark complete"}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      task.is_complete
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 hover:border-neutral-500"
                    }`}
                  >
                    {task.is_complete && <TickIcon />}
                  </button>
                ) : (
                  <span
                    role="img"
                    aria-label={task.is_complete ? "Done by Skapa" : "Skapa is on this"}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      task.is_complete
                        ? "border-neutral-300 bg-neutral-300 text-white"
                        : "border-dashed border-neutral-300"
                    }`}
                  >
                    {task.is_complete && <TickIcon />}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  {renderTitle(task, "text-sm")}
                  {renderMeta(task)}
                  {renderToggleError(task)}
                </div>
              </li>
            ))}
          </ul>
        )}
        {detailModal}
      </div>
    );
  }

  const deleteModalTitle =
    deleteTargetIds.length === 1 ? "Remove task" : "Remove tasks";

  return (
    <Card
      title="Tasks"
      action={
        <button
          onClick={() => setAddOpen(true)}
          className="bg-black px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
        >
          + Add task
        </button>
      }
    >
      {selectedIds.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">
            {selectedIds.length} selected
          </p>
          <button
            type="button"
            onClick={() => openDeleteModal(selectedIds)}
            className="border border-red-200 bg-red-50 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-red-700 transition-colors hover:border-red-400"
          >
            Delete
          </button>
        </div>
      )}

      {phaseTasks.length === 0 ? (
        <p className="mb-4 font-mono text-sm text-neutral-400">
          No tasks for this phase yet.
        </p>
      ) : (
        <>
          <div className="mb-2 flex items-center gap-2 px-2">
            <input
              type="checkbox"
              aria-label="Select all tasks in this phase"
              checked={allPhaseSelected}
              onChange={toggleAllPhase}
            />
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              Select all
            </span>
          </div>
          <ul className="space-y-1">
            {phaseTasks.map((task) => (
              <li
                key={task.id}
                className="group flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  aria-label={`Select ${task.title}`}
                  checked={selectedSet.has(task.id)}
                  onChange={() => toggleSelected(task.id)}
                  className="mt-1 shrink-0"
                />
                <button
                  type="button"
                  onClick={() => toggleTask(task)}
                  aria-label={task.is_complete ? "Mark incomplete" : "Mark complete"}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    task.is_complete
                      ? "border-brand-pink bg-brand-pink text-white"
                      : "border-neutral-300 hover:border-neutral-500"
                  }`}
                >
                  {task.is_complete && <TickIcon />}
                </button>
                <div className="min-w-0 flex-1">
                  {renderTitle(task, "font-sans text-sm")}
                  {renderMeta(task)}
                  {renderToggleError(task)}
                </div>
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-400 opacity-0 transition-opacity hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setAddError(null);
        }}
        title="Add task"
      >
        <form onSubmit={addTask} className="space-y-5">
          <div>
            <label
              htmlFor="new-task-title"
              className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500"
            >
              Task
            </label>
            <input
              id="new-task-title"
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Draft homepage wireframe"
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <TaskFieldsEditor
            assignee={newAssignee}
            onAssigneeChange={setNewAssignee}
            dueDate={newDueDate}
            onDueDateChange={setNewDueDate}
            priority={newPriority}
            onPriorityChange={setNewPriority}
            description={newDescription}
            onDescriptionChange={setNewDescription}
          />
          {addError ? (
            <p className="font-mono text-xs text-red-600" role="alert">
              {addError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={adding || !newTitle.trim()}
            className="bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {adding ? "Adding…" : "Add task"}
          </button>
        </form>
      </Modal>

      <Modal open={deleteModalOpen} onClose={closeDeleteModal} title={deleteModalTitle}>
        {deleting ? (
          <p className="text-sm text-neutral-500">Removing…</p>
        ) : (
          <div className="space-y-5">
            <p className="font-mono text-sm text-neutral-800">
              Remove {deleteTargetIds.length}{" "}
              {deleteTargetIds.length === 1 ? "task" : "tasks"}? This can&apos;t
              be undone.
            </p>
            {deleteError ? (
              <p className="font-mono text-xs text-red-600" role="alert">
                {deleteError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                {deleteModalTitle}
              </button>
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="border border-neutral-300 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-700 hover:border-black disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {detailModal}
    </Card>
  );
}
