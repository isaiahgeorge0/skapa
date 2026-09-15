"use client";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import { deleteProjectNotes } from "@/app/actions/admin-deletes";

type Note = { id: string; body: string; created_at: string };

export default function NotesLog({
  projectId,
  initialNotes,
}: {
  projectId: string;
  initialNotes: Note[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [addOpen, setAddOpen] = useState(false);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allVisibleSelected =
    notes.length > 0 && selectedIds.length === notes.length;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function toggleSelected(noteId: string) {
    setSelectedIds((curr) =>
      curr.includes(noteId)
        ? curr.filter((id) => id !== noteId)
        : [...curr, noteId],
    );
  }

  function toggleAll() {
    setSelectedIds(allVisibleSelected ? [] : notes.map((n) => n.id));
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

    const previous = notes;
    const idsSet = new Set(ids);
    setNotes((curr) => curr.filter((n) => !idsSet.has(n.id)));
    setSelectedIds((curr) => curr.filter((id) => !idsSet.has(id)));

    const result = await deleteProjectNotes(ids);
    setDeleting(false);

    if (!result.success) {
      setNotes(previous);
      setDeleteError(result.error);
      setSelectedIds(ids);
      return;
    }

    closeDeleteModal();
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || saving) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("project_notes")
      .insert({ project_id: projectId, author_id: user?.id, body: trimmed })
      .select()
      .single();

    setSaving(false);
    if (!error && data) {
      setNotes((curr) => [data as Note, ...curr]);
      setBody("");
      setAddOpen(false);
    } else if (error) {
      console.error("Failed to add note:", error);
    }
  }

  const deleteModalTitle =
    deleteTargetIds.length === 1 ? "Delete note" : "Delete notes";

  return (
    <Card
      title="Internal notes"
      action={
        <button
          onClick={() => setAddOpen(true)}
          className="bg-black px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
        >
          + Add note
        </button>
      }
    >
      <p className="mb-4 font-mono text-[11px] text-neutral-400">
        Private. Never visible to the client.
      </p>

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

      {notes.length === 0 ? (
        <p className="font-mono text-sm text-neutral-400">No internal notes yet.</p>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-2">
            <input
              type="checkbox"
              aria-label="Select all notes"
              checked={allVisibleSelected}
              onChange={toggleAll}
            />
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              Select all
            </span>
          </div>
          <ul className="space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="group flex gap-3 border-l-2 border-neutral-200 pl-3">
                <input
                  type="checkbox"
                  aria-label="Select note"
                  checked={selectedSet.has(n.id)}
                  onChange={() => toggleSelected(n.id)}
                  className="mt-1 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap font-sans text-sm text-neutral-700">{n.body}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                      {new Date(n.created_at).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <button
                      type="button"
                      onClick={() => openDeleteModal([n.id])}
                      className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 transition-colors hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add internal note">
        <form onSubmit={addNote} className="space-y-4">
          <textarea
            autoFocus
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Add an internal note…"
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={saving || !body.trim()}
            className="bg-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {saving ? "Adding…" : "Add note"}
          </button>
        </form>
      </Modal>

      <Modal open={deleteModalOpen} onClose={closeDeleteModal} title={deleteModalTitle}>
        {deleting ? (
          <p className="text-sm text-neutral-500">Deleting…</p>
        ) : (
          <div className="space-y-5">
            <p className="font-mono text-sm text-neutral-800">
              Delete {deleteTargetIds.length}{" "}
              {deleteTargetIds.length === 1 ? "note" : "notes"}? This can&apos;t
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
