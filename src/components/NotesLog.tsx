"use client";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

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
    } else if (error) {
      console.error("Failed to add note:", error);
    }
  }

  return (
    <div>
      <p className="mb-4 font-mono text-[11px] text-neutral-400">
        Private. Never visible to the client.
      </p>

      <form onSubmit={addNote} className="mb-5 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add an internal note…"
          className="flex-1 border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={saving || !body.trim()}
          className="bg-black px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {notes.length === 0 ? (
        <p className="font-mono text-sm text-neutral-400">No internal notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="border-l-2 border-neutral-200 pl-3">
              <p className="whitespace-pre-wrap font-sans text-sm text-neutral-700">
                {n.body}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                {new Date(n.created_at).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
