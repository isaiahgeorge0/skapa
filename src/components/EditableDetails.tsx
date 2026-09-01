"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const SERVICE_TYPES = ["brand", "creative", "digital", "social"] as const;

export default function EditableDetails({
  projectId,
  initialName,
  initialServiceType,
  initialTargetDate,
  currentPhaseLabel,
}: {
  projectId: string;
  initialName: string;
  initialServiceType: string;
  initialTargetDate: string | null;
  currentPhaseLabel: string;
}) {
  const [supabase] = useState(() => createClient());
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [serviceType, setServiceType] = useState(initialServiceType);
  const [targetDate, setTargetDate] = useState(initialTargetDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) {
      setError("Project name can't be empty.");
      return;
    }
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        name: name.trim(),
        service_type: serviceType,
        target_completion_date: targetDate || null,
      })
      .eq("id", projectId);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setEditing(false);
    // Project name may have changed. The header above this card won't
    // reflect it without a refresh, since it's rendered server-side.
    window.location.reload();
  }

  if (!editing) {
    return (
      <div>
        <dl className="space-y-4 font-mono text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-widest text-neutral-400">
              Service type
            </dt>
            <dd className="mt-1 capitalize text-black">{serviceType}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-widest text-neutral-400">
              Current phase
            </dt>
            <dd className="mt-1 text-black">{currentPhaseLabel}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-widest text-neutral-400">
              Target date
            </dt>
            <dd className="mt-1 text-black">
              {targetDate
                ? new Date(targetDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Not set"}
            </dd>
          </div>
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
          Project name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          Service type
        </label>
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="w-full border border-neutral-300 px-3 py-2 text-sm"
        >
          {SERVICE_TYPES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          Target date
        </label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
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
            setServiceType(initialServiceType);
            setTargetDate(initialTargetDate ?? "");
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
