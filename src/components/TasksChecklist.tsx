"use client";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/Card";
import Modal from "@/components/Modal";

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

  async function deleteTask(id: string) {
    const previous = tasks;
    setTasks((curr) => curr.filter((t) => t.id !== id));
    const { error } = await supabase.from("project_tasks").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete task:", error);
      setTasks(previous);
    }
  }

  if (!canManage) {
    return (
      <div>
        {phaseTasks.length === 0 ? (
          <p className="text-sm text-neutral-400">No tasks for this phase yet.</p>
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
      {phaseTasks.length === 0 ? (
        <p className="mb-4 font-mono text-sm text-neutral-400">
          No tasks for this phase yet.
        </p>
      ) : (
        <ul className="space-y-1">
          {phaseTasks.map((task) => (
            <li
              key={task.id}
              className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-50"
            >
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
                onClick={() => deleteTask(task.id)}
                className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
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
    </Card>
  );
}
