"use client";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import { deleteProjectTasks } from "@/app/actions/admin-deletes";

type Task = { id: string; title: string; is_complete: boolean; phase: string };

export default function TasksChecklist({
  projectId,
  currentPhase,
  initialTasks,
  canManage = true,
}: {
  projectId: string;
  currentPhase: string;
  initialTasks: Task[];
  canManage?: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const phaseTasks = tasks.filter((t) => t.phase === currentPhase);

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

  async function toggleTask(task: Task) {
    const previous = tasks;
    setTasks((curr) =>
      curr.map((t) => (t.id === task.id ? { ...t, is_complete: !t.is_complete } : t)),
    );
    const { error } = await supabase
      .from("project_tasks")
      .update({ is_complete: !task.is_complete })
      .eq("id", task.id);
    if (error) {
      console.error("Failed to toggle task:", error);
      setTasks(previous);
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("project_tasks")
      .insert({ project_id: projectId, phase: currentPhase, title })
      .select()
      .single();
    setAdding(false);
    if (!error && data) {
      setTasks((curr) => [...curr, data as Task]);
      setNewTitle("");
      setAddOpen(false);
    } else if (error) {
      console.error("Failed to add task:", error);
    }
  }

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
              <li
                key={task.id}
                className="flex items-center gap-3 py-2"
              >
                <button
                  onClick={() => toggleTask(task)}
                  aria-label={task.is_complete ? "Mark incomplete" : "Mark complete"}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    task.is_complete
                      ? "border-black bg-black text-white"
                      : "border-neutral-300 hover:border-neutral-500"
                  }`}
                >
                  {task.is_complete && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                      <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    task.is_complete ? "text-neutral-400 line-through" : "text-black"
                  }`}
                >
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        )}
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
                className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  aria-label={`Select ${task.title}`}
                  checked={selectedSet.has(task.id)}
                  onChange={() => toggleSelected(task.id)}
                  className="shrink-0"
                />
                <button
                  onClick={() => toggleTask(task)}
                  aria-label={task.is_complete ? "Mark incomplete" : "Mark complete"}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    task.is_complete
                      ? "border-brand-pink bg-brand-pink text-white"
                      : "border-neutral-300 hover:border-neutral-500"
                  }`}
                >
                  {task.is_complete && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                      <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className={`flex-1 font-sans text-sm ${task.is_complete ? "text-neutral-400 line-through" : "text-black"}`}>
                  {task.title}
                </span>
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add task">
        <form onSubmit={addTask} className="space-y-4">
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              Task
            </label>
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Draft homepage wireframe"
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
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
    </Card>
  );
}
