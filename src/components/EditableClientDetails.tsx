"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EditableClientDetails({
  clientId,
  initialName,
  initialEmail,
  initialCompany,
}: {
  clientId: string;
  initialName: string;
  initialEmail: string | null;
  initialCompany: string | null;
}) {
  const [supabase] = useState(() => createClient());
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [company, setCompany] = useState(initialCompany ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) {
      setError("Name can't be empty.");
      return;
    }
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("clients")
      .update({
        name: name.trim(),
        email: email.trim() || null,
        company: company.trim() || null,
      })
      .eq("id", clientId);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setEditing(false);
    window.location.reload();
  }

  if (!editing) {
    return (
      <div>
        <dl className="grid grid-cols-[120px_1fr] gap-y-3 font-mono text-sm">
          <dt className="text-neutral-500">Email</dt>
          <dd className="text-black">{email || "–"}</dd>
          <dt className="text-neutral-500">Company</dt>
          <dd className="text-black">{company || "–"}</dd>
        </dl>
        <button
          onClick={() => setEditing(true)}
          className="mt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 underline decoration-dotted hover:text-black"
        >
          Edit details
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          Company
        </label>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="font-mono text-xs text-red-600">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          onClick={save}
          disabled={saving}
          className="bg-black px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setName(initialName);
            setEmail(initialEmail ?? "");
            setCompany(initialCompany ?? "");
            setError(null);
          }}
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 hover:text-black"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
